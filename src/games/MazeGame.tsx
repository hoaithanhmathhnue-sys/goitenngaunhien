import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playCoin, playCheer } from '../lib/audio';

export default function MazeGame({ students, onWinner }: GameProps) {
  const [exits, setExits] = useState<string[]>([]);
  const [runnerCell, setRunnerCell] = useState<{ r: number; c: number }>({ r: 0, c: 2 });
  const [trail, setTrail] = useState<string[]>(['0-2']);
  const [running, setRunning] = useState(false);
  const [winnerCol, setWinnerCol] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const COLS = 5;
  const ROWS = 5;

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), COLS);
    setExits(shuffle([...students]).slice(0, N));
    setRunnerCell({ r: 0, c: Math.floor(N / 2) });
    setTrail([`0-${Math.floor(N / 2)}`]);
    setRunning(false);
    setWinnerCol(null);
    return clearTimers;
  }, [students]);

  const handleExplore = () => {
    if (running || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), COLS);
    const selected = shuffle([...students]).slice(0, N);
    setExits(selected);

    const targetCol = Math.floor(Math.random() * N);
    setWinnerCol(null);
    setRunning(true);

    // Build path from row 0 to row ROWS-1 ending at targetCol
    let curCol = Math.floor(N / 2);
    const path: { r: number; c: number }[] = [{ r: 0, c: curCol }];

    for (let r = 1; r < ROWS; r++) {
      const randomShift = Math.random() < 0.5 ? -1 : 1;
      const nextCol = r === ROWS - 1 ? targetCol : Math.max(0, Math.min(N - 1, curCol + randomShift));
      if (nextCol !== curCol) {
        path.push({ r: r - 1, c: nextCol });
        curCol = nextCol;
      }
      path.push({ r, c: curCol });
    }

    const visited: string[] = [];
    path.forEach((p, idx) => {
      timersRef.current.push(
        window.setTimeout(() => {
          visited.push(`${p.r}-${p.c}`);
          setRunnerCell(p);
          setTrail([...visited]);
          playTick();

          if (idx === path.length - 1) {
            setRunning(false);
            setWinnerCol(targetCol);
            playCoin();
            setTimeout(() => playCheer(), 200);
            onWinner(selected[targetCol]);
          }
        }, idx * 240)
      );
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🧩 Nhà thám hiểm vượt qua mê cung cổ đại để mở cánh cửa thoát hiểm mang tên học sinh!
      </p>

      <div className="w-full max-w-2xl p-6 rounded-3xl bg-stone-950 border-4 border-emerald-500/40 shadow-2xl">
        {/* Maze Grid */}
        <div
          className="grid gap-2 mb-4"
          style={{ gridTemplateColumns: `repeat(${Math.max(exits.length, 1)}, minmax(0, 1fr))` }}
        >
          {[...Array(ROWS)].map((_, r) =>
            exits.map((_, c) => {
              const key = `${r}-${c}`;
              const isRunner = runnerCell.r === r && runnerCell.c === c;
              const inTrail = trail.includes(key);
              return (
                <div
                  key={key}
                  className={`h-11 rounded-xl border flex items-center justify-center transition-all ${
                    isRunner
                      ? 'bg-emerald-400 border-white scale-105 shadow-[0_0_15px_#34d399]'
                      : inTrail
                      ? 'bg-emerald-900/60 border-emerald-500/50'
                      : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  {isRunner ? <span className="text-2xl">🤠</span> : inTrail ? <span className="text-xs text-emerald-300">👣</span> : <span className="text-xs opacity-20">🧱</span>}
                </div>
              );
            })
          )}
        </div>

        {/* Exit Doors */}
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${Math.max(exits.length, 1)}, minmax(0, 1fr))` }}
        >
          {exits.map((name, c) => {
            const isWin = winnerCol === c;
            return (
              <div
                key={c}
                className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                  isWin
                    ? 'bg-yellow-400 text-slate-950 border-white scale-105 shadow-[0_0_25px_gold]'
                    : 'bg-stone-900 text-emerald-200 border-emerald-500/30'
                }`}
              >
                <div className="text-lg">{isWin ? '🚪✨' : '🚪'}</div>
                <div className="text-[11px] md:text-xs font-extrabold truncate">{name}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleExplore}
        disabled={running}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {running ? '🧭 ĐANG TÌM LỐI RA...' : '🧩 KHÁM PHÁ MÊ CUNG'}
      </button>
    </div>
  );
}
