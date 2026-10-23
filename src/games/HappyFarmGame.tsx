import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playCoin, playCheer } from '../lib/audio';

const ANIMALS = ['🐄', '🐖', '🐑', '🐓', '🐎', '🐕', '🐐', '🐇'];

export default function HappyFarmGame({ students, onWinner }: GameProps) {
  const [animals, setAnimals] = useState<{ name: string; icon: string }[]>([]);
  const [positions, setPositions] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
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
    const selected = shuffle([...students]).slice(0, N);
    setAnimals(selected.map((name, i) => ({ name, icon: ANIMALS[i % ANIMALS.length] })));
    setPositions(new Array(N).fill(0));
    setRunning(false);
    setWinnerIdx(null);
    return stopTimer;
  }, [students]);

  const handleRunToBarn = () => {
    if (running || students.length === 0) return;
    stopTimer();

    const N = Math.min(Math.max(students.length, 1), 6);
    const selected = shuffle([...students]).slice(0, N);
    const list = selected.map((name, i) => ({ name, icon: ANIMALS[i % ANIMALS.length] }));
    setAnimals(list);
    const cur = new Array(N).fill(0);
    setPositions(cur);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(null);
    setRunning(true);

    let ticks = 0;
    ivRef.current = window.setInterval(() => {
      ticks++;
      if (ticks % 3 === 0) playTick();

      let done = false;
      for (let i = 0; i < N; i++) {
        const boost = i === winIdx && ticks > 12 ? 3.2 : 1.7;
        cur[i] = Math.min(100, cur[i] + Math.random() * 2.3 + boost);
        if (cur[winIdx] >= 100) {
          cur[winIdx] = 100;
          done = true;
        }
      }
      setPositions([...cur]);

      if (done) {
        stopTimer();
        setRunning(false);
        setWinnerIdx(winIdx);
        playCoin();
        setTimeout(() => playCheer(), 200);
        onWinner(list[winIdx].name);
      }
    }, 60);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🐄 Nông trại vui vẻ — Thú cưng mang bảng tên chạy về chuồng Vàng!
      </p>

      <div className="w-full max-w-3xl p-5 rounded-3xl bg-gradient-to-b from-lime-700 via-green-700 to-emerald-900 border-4 border-amber-400 shadow-2xl space-y-3">
        {animals.map((a, i) => {
          const pct = positions[i] || 0;
          const isWin = winnerIdx === i;
          return (
            <div
              key={i}
              className={`relative h-12 rounded-xl bg-lime-950/60 border flex items-center px-3 overflow-hidden ${
                isWin ? 'border-yellow-300 shadow-[0_0_20px_gold]' : 'border-lime-500/30'
              }`}
            >
              <span className="text-xs font-extrabold text-amber-100 bg-amber-900/80 px-2.5 py-1 rounded-md border border-amber-400/40 truncate max-w-[130px] z-10">
                {a.name}
              </span>

              <div
                className="absolute top-1/2 -translate-y-1/2 z-20 text-3xl transition-all duration-75"
                style={{ left: `calc(20% + ${pct * 0.68}%)` }}
              >
                <span className="inline-block -scale-x-100">{a.icon}</span>
              </div>

              <div className="absolute right-2 text-2xl z-10">{isWin ? '🏡✨' : '🏠'}</div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleRunToBarn}
        disabled={running}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-lime-500 via-emerald-500 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {running ? '🐄 ĐANG CHẠY VỀ CHUỒNG...' : '🌾 MỞ CỬA NÔNG TRẠI'}
      </button>
    </div>
  );
}
