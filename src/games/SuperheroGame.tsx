import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playCheer, playSuspense } from '../lib/audio';

type Phase = 'idle' | 'scanning' | 'rescuing' | 'rescued';

export default function SuperheroGame({ students, onWinner }: GameProps) {
  const [pods, setPods] = useState<string[]>([]);
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
    setPods(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setActiveIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleRescue = () => {
    if ((phase !== 'idle' && phase !== 'rescued') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setPods(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('scanning');
    playSuspense();

    const steps = 15;
    let step = 0;

    const tick = () => {
      if (step < steps) {
        setActiveIdx(step % selected.length);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(tick, 110 + step * 15));
      } else {
        setActiveIdx(winIdx);
        setPhase('rescuing');
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('rescued');
            playCheer();
            onWinner(selected[winIdx]);
          }, 800)
        );
      }
    };

    tick();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🦸 Siêu anh hùng giải cứu một học sinh khỏi ô năng lượng và trao nhiệm vụ!
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-950 border-4 border-sky-400/50 shadow-[0_0_40px_rgba(56,189,248,0.25)]">
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className={`text-5xl md:text-6xl ${phase === 'rescuing' ? 'animate-bounce' : ''}`}>🦸‍♂️</span>
          <div className="text-left">
            <div className="text-xs font-mono uppercase tracking-widest text-sky-300">Liên Minh Bảo Vệ Trái Đất</div>
            <div className="text-sm md:text-base font-black text-yellow-300">
              {phase === 'rescued' && winnerIdx !== null ? `Đã giải cứu: ${pods[winnerIdx]}!` : 'Đang dò tìm tín hiệu cầu cứu...'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {pods.map((name, i) => {
            const isScanning = activeIdx === i;
            const isSaved = winnerIdx === i && phase === 'rescued';

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                  isSaved
                    ? 'bg-gradient-to-br from-sky-400 via-emerald-400 to-yellow-300 border-white scale-110 shadow-[0_0_30px_#38bdf8] z-20'
                    : isScanning
                    ? 'bg-sky-900/80 border-yellow-300 scale-105 shadow-[0_0_15px_#fde047]'
                    : 'bg-slate-900/80 border-sky-500/30 opacity-80'
                }`}
              >
                <span className="text-3xl mb-1">{isSaved ? '🌟' : isScanning ? '⚡' : '🛡️'}</span>
                <span className={`text-xs md:text-sm font-black truncate w-full ${isSaved ? 'text-slate-950' : 'text-sky-100'}`}>
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleRescue}
        disabled={phase === 'scanning' || phase === 'rescuing'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🦸 PHÓNG NĂNG LƯỢNG GIẢI CỨU' : phase === 'rescued' ? '🦸 GIẢI CỨU LƯỢT MỚI' : '⚡ ĐANG GIẢI CỨU...'}
      </button>
    </div>
  );
}
