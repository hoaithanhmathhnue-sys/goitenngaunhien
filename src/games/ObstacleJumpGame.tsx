import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playCoin, playCheer } from '../lib/audio';

const RUNNERS = ['🥷', '🦸', '🏃', '🦊', '🐸', '🐵'];

export default function ObstacleJumpGame({ students, onWinner }: GameProps) {
  const [climbers, setClimbers] = useState<{ name: string; icon: string; step: number }[]>([]);
  const [running, setRunning] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const ivRef = useRef<number | null>(null);
  const TOTAL_STEPS = 7;

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
    setClimbers(selected.map((name, i) => ({ name, icon: RUNNERS[i % RUNNERS.length], step: 0 })));
    setRunning(false);
    setWinnerIdx(null);
    return stopTimer;
  }, [students]);

  const handleJump = () => {
    if (running || students.length === 0) return;
    stopTimer();

    const N = Math.min(Math.max(students.length, 1), 6);
    const selected = shuffle([...students]).slice(0, N);
    const state = selected.map((name, i) => ({ name, icon: RUNNERS[i % RUNNERS.length], step: 0 }));
    setClimbers(state);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(null);
    setRunning(true);

    ivRef.current = window.setInterval(() => {
      let finished = false;
      for (let i = 0; i < state.length; i++) {
        const chance = i === winIdx ? 0.65 : 0.42;
        if (Math.random() < chance && state[i].step < TOTAL_STEPS) {
          state[i].step += 1;
        }
        if (state[winIdx].step >= TOTAL_STEPS) {
          finished = true;
        }
      }
      playTick();
      setClimbers([...state.map(c => ({ ...c }))]);

      if (finished) {
        stopTimer();
        setRunning(false);
        setWinnerIdx(winIdx);
        playCoin();
        setTimeout(() => playCheer(), 200);
        onWinner(state[winIdx].name);
      }
    }, 320);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🏃 Nhảy vượt bậc thang chướng ngại vật để chạm lá cờ trên đỉnh!
      </p>

      <div className="w-full max-w-3xl p-5 rounded-3xl bg-gradient-to-b from-sky-900 via-indigo-950 to-emerald-950 border-4 border-emerald-400/40 shadow-2xl space-y-3">
        {climbers.map((c, i) => {
          const isWin = winnerIdx === i;
          return (
            <div key={i} className="flex items-center gap-3 bg-slate-900/70 p-2.5 rounded-2xl border border-white/10">
              <span className="w-28 md:w-36 text-xs font-bold text-emerald-200 truncate px-2 py-1 bg-slate-950 rounded-lg border border-emerald-500/30">
                {c.name}
              </span>
              <div className="flex-1 grid grid-cols-8 gap-1.5 items-center">
                {[...Array(TOTAL_STEPS + 1)].map((_, s) => {
                  const isHere = c.step === s;
                  const isGoal = s === TOTAL_STEPS;
                  return (
                    <div
                      key={s}
                      className={`h-10 rounded-lg flex items-center justify-center border transition-all ${
                        isHere && isWin
                          ? 'bg-yellow-400 border-white scale-110 shadow-[0_0_15px_gold]'
                          : isHere
                          ? 'bg-emerald-500/80 border-emerald-200 scale-105'
                          : isGoal
                          ? 'bg-amber-500/20 border-amber-400/50'
                          : 'bg-slate-800/70 border-slate-700'
                      }`}
                    >
                      {isHere ? (
                        <span className="text-xl md:text-2xl animate-bounce">{c.icon}</span>
                      ) : isGoal ? (
                        <span className="text-lg">🚩</span>
                      ) : s % 2 === 1 ? (
                        <span className="text-xs opacity-50">🌵</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">▬</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleJump}
        disabled={running}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {running ? '🏃 ĐANG NHẢY VƯỢT CHƯỚNG NGẠI...' : '🏃 BẮT ĐẦU VƯỢT THỬ THÁCH'}
      </button>
    </div>
  );
}
