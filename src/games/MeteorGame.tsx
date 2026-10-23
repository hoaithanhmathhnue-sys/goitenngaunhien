import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playBoom, playCheer } from '../lib/audio';

type Phase = 'idle' | 'tracking' | 'falling' | 'impact';

export default function MeteorGame({ students, onWinner }: GameProps) {
  const [craters, setCraters] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [aimIdx, setAimIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setCraters(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setAimIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleStrike = () => {
    if ((phase !== 'idle' && phase !== 'impact') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setCraters(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('tracking');

    const total = 14;
    let step = 0;

    const scan = () => {
      if (step < total) {
        setAimIdx(step % selected.length);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(scan, 110 + step * 15));
      } else {
        setAimIdx(winIdx);
        setPhase('falling');
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('impact');
            playBoom();
            setTimeout(() => playCheer(), 300);
            onWinner(selected[winIdx]);
          }, 700)
        );
      }
    };

    scan();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        ☄️ Thiên thạch rực lửa lao xuống bề mặt hành tinh và lộ diện tên học sinh!
      </p>

      <div
        className={`relative w-full max-w-3xl p-6 md:p-8 rounded-3xl bg-gradient-to-b from-slate-950 via-red-950/80 to-stone-900 border-4 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)] overflow-hidden ${
          phase === 'impact' ? 'animate-[shake_0.3s_ease-in-out]' : ''
        }`}
      >
        {/* Falling Meteor Visual */}
        {phase === 'falling' && (
          <div className="text-center text-6xl animate-bounce mb-4 drop-shadow-[0_0_25px_#ef4444]">
            ☄️
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {craters.map((name, i) => {
            const isAimed = aimIdx === i;
            const isHit = winnerIdx === i && phase === 'impact';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-4 min-h-[110px] flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                  isHit
                    ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 border-white scale-110 z-20 shadow-[0_0_35px_#ef4444]'
                    : isAimed
                    ? 'bg-red-900/60 border-red-400 scale-105 shadow-[0_0_15px_#f87171]'
                    : 'bg-stone-900/80 border-stone-700'
                }`}
              >
                <span className="text-3xl mb-1">
                  {isHit ? '💥' : isAimed ? '🎯' : '🪨'}
                </span>
                <span className={`text-xs md:text-sm font-black text-center ${isHit ? 'text-slate-950' : 'text-stone-200'}`}>
                  {isHit ? name : `Vùng #${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleStrike}
        disabled={phase === 'tracking' || phase === 'falling'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '☄️ GỌI THIÊN THẠCH' : phase === 'impact' ? '☄️ GỌI THIÊN THẠCH MỚI' : '☄️ ĐANG RƠI...'}
      </button>
    </div>
  );
}
