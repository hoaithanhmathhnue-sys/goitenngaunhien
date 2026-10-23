import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playBoom, playSuspense, playCheer } from '../lib/audio';

const POTIONS = [
  { icon: '🧪', color: 'from-emerald-400 to-green-700', glow: 'shadow-[0_0_20px_#34d399]' },
  { icon: '⚗️', color: 'from-fuchsia-400 to-purple-700', glow: 'shadow-[0_0_20px_#e879f9]' },
  { icon: '🧫', color: 'from-cyan-400 to-blue-700', glow: 'shadow-[0_0_20px_#22d3ee]' },
  { icon: '🌡️', color: 'from-amber-400 to-red-700', glow: 'shadow-[0_0_20px_#fbbf24]' },
];

type Phase = 'idle' | 'bubbling' | 'reacting' | 'done';

export default function SecretLabGame({ students, onWinner }: GameProps) {
  const [flasks, setFlasks] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setFlasks(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setActiveIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleMix = () => {
    if ((phase !== 'idle' && phase !== 'done') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setFlasks(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('bubbling');
    playSuspense();

    const total = 15;
    let step = 0;

    const bubble = () => {
      if (step < total) {
        setActiveIdx(step % selected.length);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(bubble, 110 + step * 15));
      } else {
        setActiveIdx(winIdx);
        setPhase('reacting');
        playBoom();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('done');
            playCheer();
            onWinner(selected[winIdx]);
          }, 700)
        );
      }
    };

    bubble();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🧪 Phòng thí nghiệm bí mật — Bình hóa chất sủi bọt phát nổ tiết lộ tên học sinh!
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 border-4 border-emerald-400/50 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {flasks.map((name, i) => {
            const p = POTIONS[i % POTIONS.length];
            const isBubbling = activeIdx === i;
            const isExploded = winnerIdx === i && (phase === 'reacting' || phase === 'done');

            return (
              <div
                key={i}
                className={`rounded-2xl p-4 min-h-[130px] flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                  isExploded
                    ? `bg-gradient-to-br ${p.color} border-white scale-110 z-20 ${p.glow}`
                    : isBubbling
                    ? 'bg-teal-900/70 border-emerald-300 scale-105'
                    : 'bg-slate-900/80 border-slate-700'
                }`}
              >
                <div className={`text-4xl mb-2 ${isBubbling ? 'animate-bounce' : ''}`}>
                  {isExploded ? '💨✨🧪' : p.icon}
                </div>
                <span className="text-xs md:text-sm font-black text-white text-center">
                  {isExploded ? name : `Mẫu thử #${i + 1}`}
                </span>
                {isBubbling && !isExploded && (
                  <span className="text-[10px] text-emerald-300 font-mono mt-1">🫧 Sủi bọt...</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleMix}
        disabled={phase === 'bubbling' || phase === 'reacting'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 via-fuchsia-500 to-purple-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🧪 PHA CHẾ HÓA CHẤT' : phase === 'done' ? '🧪 THÍ NGHIỆM MỚI' : '🫧 ĐANG PHẢN ỨNG...'}
      </button>
    </div>
  );
}
