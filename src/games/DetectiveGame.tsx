import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playSuspense, playCheer } from '../lib/audio';

type Phase = 'idle' | 'investigating' | 'solved';

export default function DetectiveGame({ students, onWinner }: GameProps) {
  const [suspects, setSuspects] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [lensIdx, setLensIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setSuspects(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setLensIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleInvestigate = () => {
    if ((phase !== 'idle' && phase !== 'solved') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setSuspects(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('investigating');
    playSuspense();

    const total = 16;
    let step = 0;

    const scan = () => {
      if (step < total) {
        setLensIdx(step % selected.length);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(scan, 120 + step * 16));
      } else {
        setLensIdx(winIdx);
        setPhase('solved');
        playCheer();
        onWinner(selected[winIdx]);
      }
    };

    scan();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🕵️ Thám tử soi kính lúp qua các hồ sơ manh mối để tìm ra danh tính bí ẩn!
      </p>

      <div className="w-full max-w-3xl p-6 md:p-8 rounded-3xl bg-gradient-to-b from-slate-950 via-stone-900 to-neutral-950 border-4 border-amber-500/40 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {suspects.map((name, i) => {
            const isInspected = lensIdx === i;
            const isFound = winnerIdx === i && phase === 'solved';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-4 min-h-[120px] flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                  isFound
                    ? 'bg-amber-200 text-slate-950 border-yellow-400 scale-110 z-20 shadow-[0_0_35px_rgba(251,191,36,0.9)]'
                    : isInspected
                    ? 'bg-amber-950/90 text-amber-100 border-amber-300 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                    : 'bg-neutral-900/90 text-neutral-500 border-neutral-800 opacity-50'
                }`}
              >
                {isInspected && (
                  <div className="absolute -top-3 -right-3 text-3xl drop-shadow-[0_0_10px_gold] animate-bounce">
                    🔍
                  </div>
                )}
                <span className="text-3xl mb-2">{isFound ? '🕵️‍♂️✨' : '📁'}</span>
                <span className="text-xs md:text-sm font-black text-center">
                  {isInspected || isFound ? name : `Hồ sơ #0${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleInvestigate}
        disabled={phase === 'investigating'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-amber-500 via-yellow-600 to-orange-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🔍 SOI KÍNH LÚP ĐIỀU TRA' : phase === 'solved' ? '🔍 ĐIỀU TRA HỒ SƠ MỚI' : '🕵️ ĐANG TRUY TÌM...'}
      </button>
    </div>
  );
}
