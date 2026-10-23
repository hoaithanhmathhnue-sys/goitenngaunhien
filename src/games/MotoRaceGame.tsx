import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playCheer } from '../lib/audio';

const BIKES = ['🏍️', '🏎️', '🛵', '🚓', '🚑', '🚙', '🚕', '🚜'];

export default function MotoRaceGame({ students, onWinner }: GameProps) {
  const [racers, setRacers] = useState<string[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [nitroIdx, setNitroIdx] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const ivRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (ivRef.current) {
      clearInterval(ivRef.current);
      ivRef.current = null;
    }
  };

  useEffect(() => {
    stopTimer();
    const N = Math.min(Math.max(students.length, 1), 6);
    setRacers(shuffle([...students]).slice(0, N));
    setProgress(new Array(N).fill(0));
    setNitroIdx(null);
    setWinnerIdx(null);
    setIsRacing(false);
    return stopTimer;
  }, [students]);

  const handleStart = () => {
    if (isRacing || students.length === 0) return;
    stopTimer();

    const N = Math.min(Math.max(students.length, 1), 6);
    const selected = shuffle([...students]).slice(0, N);
    setRacers(selected);
    const cur = new Array(N).fill(0);
    setProgress(cur);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(null);
    setIsRacing(true);
    playWhoosh();

    let ticks = 0;
    ivRef.current = window.setInterval(() => {
      ticks++;
      if (ticks % 3 === 0) playTick();
      if (ticks === 18) {
        setNitroIdx(winIdx);
        playWhoosh();
      }

      let finished = false;
      for (let i = 0; i < N; i++) {
        const boost = i === winIdx && ticks > 15 ? 3.4 : 1.5;
        cur[i] = Math.min(100, cur[i] + Math.random() * 2.4 + boost);
        if (cur[winIdx] >= 100) {
          cur[winIdx] = 100;
          finished = true;
        }
      }
      setProgress([...cur]);

      if (finished) {
        stopTimer();
        setIsRacing(false);
        setWinnerIdx(winIdx);
        playCheer();
        onWinner(selected[winIdx]);
      }
    }, 60);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🏍️ Đường đua Moto GP học đường — Ai bật Nitro cán đích đầu tiên?
      </p>

      <div className="w-full max-w-3xl bg-slate-900 rounded-3xl p-4 md:p-6 border-4 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.2)] space-y-3">
        {racers.map((name, i) => {
          const pct = progress[i] || 0;
          const hasNitro = nitroIdx === i && isRacing;
          const isWin = winnerIdx === i;
          return (
            <div
              key={i}
              className={`relative h-12 rounded-xl bg-slate-800/90 border flex items-center px-3 overflow-hidden ${
                isWin ? 'border-yellow-400 shadow-[0_0_20px_gold]' : 'border-slate-700'
              }`}
            >
              {/* Asphalt road dashes */}
              <div className="absolute inset-x-0 top-1/2 h-[2px] border-t border-dashed border-slate-500/40 pointer-events-none" />
              {/* Finish checkered line */}
              <div className="absolute right-3 top-0 bottom-0 w-2 bg-[repeating-linear-gradient(0deg,#fff_0,#fff_6px,#000_6px,#000_12px)] opacity-80" />

              <span className="relative z-10 text-xs font-extrabold text-cyan-200 bg-slate-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30 truncate max-w-[130px]">
                {name}
              </span>

              <div
                className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center transition-all duration-75"
                style={{ left: `calc(18% + ${pct * 0.72}%)` }}
              >
                {hasNitro && <span className="text-sm -mr-1 animate-pulse">🔥💨</span>}
                <span className="text-2xl md:text-3xl inline-block -scale-x-100 drop-shadow-md">
                  {BIKES[i % BIKES.length]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleStart}
        disabled={isRacing}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {isRacing ? '🏍️ ĐANG BỨT TỐC NITRO...' : '🏁 RỒ GA XUẤT PHÁT!'}
      </button>
    </div>
  );
}
