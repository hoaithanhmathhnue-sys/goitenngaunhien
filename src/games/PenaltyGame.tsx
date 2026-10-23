import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playCheer } from '../lib/audio';

type Phase = 'idle' | 'aiming' | 'kicking' | 'goal';

export default function PenaltyGame({ students, onWinner }: GameProps) {
  const [zones, setZones] = useState<string[]>([]);
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
    setZones(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setAimIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleKick = () => {
    if ((phase !== 'idle' && phase !== 'goal') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 6);
    const selected = shuffle([...students]).slice(0, N);
    setZones(selected);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(winIdx);
    setPhase('aiming');

    const total = 14;
    let step = 0;

    const aim = () => {
      if (step < total) {
        setAimIdx(step % N);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(aim, 100 + step * 14));
      } else {
        setAimIdx(winIdx);
        setPhase('kicking');
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('goal');
            playCheer();
            onWinner(selected[winIdx]);
          }, 650)
        );
      }
    };

    aim();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        ⚽ Sút Penalty — Bóng găm thẳng vào góc khung thành mang tên người được chọn!
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-emerald-800 via-green-700 to-emerald-950 border-4 border-white/80 shadow-2xl">
        {/* Goal Frame */}
        <div className="border-t-8 border-x-8 border-white rounded-t-2xl p-4 bg-black/25 relative">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {zones.map((name, i) => {
              const isTarget = aimIdx === i;
              const isGoal = winnerIdx === i && phase === 'goal';

              return (
                <div
                  key={i}
                  className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all duration-150 ${
                    isGoal
                      ? 'bg-yellow-400 text-slate-950 border-white scale-105 shadow-[0_0_25px_gold]'
                      : isTarget
                      ? 'bg-emerald-500/60 text-white border-yellow-300 scale-105'
                      : 'bg-white/10 text-white border-white/30'
                  }`}
                >
                  <span className="text-2xl mb-1">{isGoal ? '⚽🔥' : isTarget ? '🎯' : '🥅'}</span>
                  <span className="text-xs md:text-sm font-black text-center truncate w-full">{name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Penalty Spot */}
        <div className="mt-6 flex flex-col items-center">
          <div className={`text-4xl transition-transform duration-300 ${phase === 'kicking' ? '-translate-y-12 scale-75' : ''}`}>
            ⚽
          </div>
          <span className="text-xs font-mono text-emerald-200 uppercase mt-1">Chấm phạt đền 11m</span>
        </div>
      </div>

      <button
        onClick={handleKick}
        disabled={phase === 'aiming' || phase === 'kicking'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '⚽ SÚT PENALTY!' : phase === 'goal' ? '⚽ SÚT QUẢ TIẾP THEO' : '⚽ ĐANG LẤY ĐÀ...'}
      </button>
    </div>
  );
}
