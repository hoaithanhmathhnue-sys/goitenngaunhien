import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playSuspense, playCheer } from '../lib/audio';

type Phase = 'idle' | 'knocking' | 'spooked';

export default function HauntedHouseGame({ students, onWinner }: GameProps) {
  const [doors, setDoors] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [knockIdx, setKnockIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setDoors(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setKnockIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleOpenDoor = () => {
    if (phase === 'knocking' || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setDoors(selected);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(winIdx);
    setPhase('knocking');
    playSuspense();

    const total = 15;
    let step = 0;

    const knock = () => {
      if (step < total) {
        setKnockIdx(step % N);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(knock, 115 + step * 14));
      } else {
        setKnockIdx(winIdx);
        setPhase('spooked');
        playCheer();
        onWinner(selected[winIdx]);
      }
    };

    knock();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        👻 Ngôi nhà ma vui nhộn — Cánh cửa nào mở ra cùng hồn ma cầm bảng tên học sinh?
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-purple-950 via-slate-950 to-indigo-950 border-4 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
        <div className="flex justify-between items-center mb-4 px-2 text-2xl opacity-80">
          <span>🦇</span>
          <span className="text-4xl">🌕</span>
          <span>🎃</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {doors.map((name, i) => {
            const isKnocking = knockIdx === i;
            const isOpened = winnerIdx === i && phase === 'spooked';

            return (
              <div
                key={i}
                className={`rounded-t-full rounded-b-xl p-4 min-h-[135px] flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                  isOpened
                    ? 'bg-gradient-to-b from-purple-500 via-fuchsia-600 to-indigo-900 border-yellow-300 scale-110 z-20 shadow-[0_0_30px_#e879f9]'
                    : isKnocking
                    ? 'bg-purple-900/80 border-purple-300 scale-105'
                    : 'bg-slate-900/90 border-purple-800/40'
                }`}
              >
                <span className={`text-4xl mb-2 ${isOpened ? 'animate-bounce' : ''}`}>
                  {isOpened ? '👻🪧' : isKnocking ? '🕯️🚪' : '🚪'}
                </span>
                <span className={`text-xs md:text-sm font-black text-center ${isOpened ? 'text-yellow-300' : 'text-purple-200'}`}>
                  {isOpened ? name : `Phòng #${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleOpenDoor}
        disabled={phase === 'knocking'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-orange-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'knocking' ? '🕯️ ĐANG GÕ CỬA BÍ ẨN...' : '👻 GÕ CỬA NGÔI NHÀ MA'}
      </button>
    </div>
  );
}
