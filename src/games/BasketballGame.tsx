import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playCoin, playCheer } from '../lib/audio';

type Phase = 'idle' | 'aiming' | 'shooting' | 'scored';

export default function BasketballGame({ students, onWinner }: GameProps) {
  const [hoops, setHoops] = useState<string[]>([]);
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
    const N = Math.min(Math.max(students.length, 1), 6);
    setHoops(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setAimIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleShoot = () => {
    if ((phase !== 'idle' && phase !== 'scored') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 6);
    const selected = shuffle([...students]).slice(0, N);
    setHoops(selected);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(winIdx);
    setPhase('aiming');

    const total = 14;
    let step = 0;

    const cycleAim = () => {
      if (step < total) {
        setAimIdx(step % N);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(cycleAim, 100 + step * 14));
      } else {
        setAimIdx(winIdx);
        setPhase('shooting');
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('scored');
            playCoin();
            setTimeout(() => playCheer(), 200);
            onWinner(selected[winIdx]);
          }, 700)
        );
      }
    };

    cycleAim();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🏀 Ném bóng rổ trúng bảng tên — Cú ném 3 điểm hoàn hảo gọi tên học sinh!
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-orange-950 via-amber-950 to-slate-950 border-4 border-orange-500/50 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {hoops.map((name, i) => {
            const isAimed = aimIdx === i;
            const isSwish = winnerIdx === i && phase === 'scored';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-4 min-h-[120px] flex flex-col items-center justify-between border-2 transition-all duration-200 ${
                  isSwish
                    ? 'bg-gradient-to-b from-orange-400 to-amber-600 text-slate-950 border-white scale-105 z-20 shadow-[0_0_30px_#f97316]'
                    : isAimed
                    ? 'bg-orange-900/70 text-white border-yellow-300 scale-105'
                    : 'bg-slate-900/80 text-orange-100 border-orange-500/30'
                }`}
              >
                {/* Backboard with student name */}
                <div className={`w-full py-1.5 px-2 rounded-lg border-2 text-center font-extrabold text-xs md:text-sm truncate ${
                  isSwish ? 'bg-white text-slate-950 border-red-600' : 'bg-slate-950 border-orange-400/50'
                }`}>
                  {name}
                </div>

                {/* Rim & Basketball */}
                <div className="mt-2 flex flex-col items-center">
                  <div className="w-12 h-2 bg-red-500 rounded-full" />
                  <div className="text-3xl mt-1">
                    {isSwish ? '🏀✨' : isAimed && phase === 'shooting' ? '🏀💨' : '🕸️'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-4xl">
          {phase === 'shooting' ? '🤾‍♂️💨' : '🤾‍♂️🏀'}
        </div>
      </div>

      <button
        onClick={handleShoot}
        disabled={phase === 'aiming' || phase === 'shooting'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🏀 NÉM BÓNG 3 ĐIỂM' : phase === 'scored' ? '🏀 NÉM LƯỢT TIẾP THEO' : '🏀 ĐANG NGẮM RỔ...'}
      </button>
    </div>
  );
}
