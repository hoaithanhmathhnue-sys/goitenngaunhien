import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playCheer } from '../lib/audio';

const BALLOON_STYLES = [
  'from-rose-400 to-red-600',
  'from-amber-300 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-sky-400 to-indigo-600',
  'from-fuchsia-400 to-purple-600',
  'from-yellow-300 to-amber-600',
];

export default function HotAirBalloonGame({ students, onWinner }: GameProps) {
  const [balloons, setBalloons] = useState<string[]>([]);
  const [heights, setHeights] = useState<number[]>([]);
  const [flying, setFlying] = useState(false);
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
    setBalloons(shuffle([...students]).slice(0, N));
    setHeights(new Array(N).fill(0));
    setFlying(false);
    setWinnerIdx(null);
    return stopTimer;
  }, [students]);

  const handleFly = () => {
    if (flying || students.length === 0) return;
    stopTimer();

    const N = Math.min(Math.max(students.length, 1), 6);
    const selected = shuffle([...students]).slice(0, N);
    setBalloons(selected);
    const cur = new Array(N).fill(0);
    setHeights(cur);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(null);
    setFlying(true);
    playWhoosh();

    let ticks = 0;
    ivRef.current = window.setInterval(() => {
      ticks++;
      if (ticks % 3 === 0) playTick();

      let done = false;
      for (let i = 0; i < N; i++) {
        const lift = i === winIdx && ticks > 12 ? 3.2 : 1.6;
        cur[i] = Math.min(100, cur[i] + Math.random() * 2.2 + lift);
        if (cur[winIdx] >= 100) {
          cur[winIdx] = 100;
          done = true;
        }
      }
      setHeights([...cur]);

      if (done) {
        stopTimer();
        setFlying(false);
        setWinnerIdx(winIdx);
        playCheer();
        onWinner(selected[winIdx]);
      }
    }, 60);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🎈 Khinh khí cầu may mắn bay lên tầng mây — Quả nào chạm vạch đích trên bầu trời trước?
      </p>

      <div className="relative w-full max-w-3xl h-[360px] rounded-3xl bg-gradient-to-b from-sky-500 via-sky-300 to-amber-100 border-4 border-sky-300 shadow-2xl overflow-hidden px-4">
        {/* Finish altitude line */}
        <div className="absolute top-8 left-0 right-0 border-b-2 border-dashed border-red-500/80 flex justify-between px-4 text-[10px] font-black text-red-700 uppercase">
          <span>🏁 Đích Tầng Mây Cao</span>
          <span>🏁</span>
        </div>

        {/* Clouds */}
        <div className="absolute top-16 left-12 text-4xl opacity-70 pointer-events-none">☁️</div>
        <div className="absolute top-28 right-16 text-5xl opacity-70 pointer-events-none">☁️</div>
        <div className="absolute top-44 left-1/2 text-4xl opacity-60 pointer-events-none">☁️</div>

        <div className="absolute inset-x-4 bottom-4 top-10 flex justify-around items-end">
          {balloons.map((name, i) => {
            const pct = heights[i] || 0;
            const isWin = winnerIdx === i;
            return (
              <div
                key={i}
                className="flex flex-col items-center transition-all duration-75"
                style={{ transform: `translateY(-${pct * 2.3}px)` }}
              >
                <div
                  className={`w-12 h-14 rounded-t-full rounded-b-2xl bg-gradient-to-b ${
                    BALLOON_STYLES[i % BALLOON_STYLES.length]
                  } border-2 border-white shadow-lg flex items-center justify-center text-xl ${
                    isWin ? 'ring-4 ring-yellow-300 scale-110' : ''
                  }`}
                >
                  🎈
                </div>
                <div className="w-0.5 h-2 bg-amber-900" />
                <div className="px-2 py-0.5 rounded bg-amber-900 text-amber-100 text-[10px] md:text-xs font-bold max-w-[95px] truncate border border-amber-400">
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleFly}
        disabled={flying}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-sky-500 via-orange-400 to-rose-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {flying ? '🎈 ĐANG BAY LÊN TRỜI...' : '🎈 THẢ KHINH KHÍ CẦU'}
      </button>
    </div>
  );
}
