import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playBoom, playSuspense, playCheer } from '../lib/audio';

type Phase = 'idle' | 'charging' | 'breathing' | 'chosen';

export default function DragonGame({ students, onWinner }: GameProps) {
  const [shields, setShields] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [power, setPower] = useState(0);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setShields(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setPower(0);
    setHighlightIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleSummon = () => {
    if ((phase !== 'idle' && phase !== 'chosen') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setShields(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('charging');
    setPower(0);
    playSuspense();

    const totalSteps = 14;
    let step = 0;

    const chargeStep = () => {
      if (step < totalSteps) {
        step++;
        setPower(Math.min(100, Math.round((step / totalSteps) * 100)));
        setHighlightIdx(step % selected.length);
        playTick();
        timersRef.current.push(window.setTimeout(chargeStep, 140));
      } else {
        setHighlightIdx(winIdx);
        setPhase('breathing');
        playBoom();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('chosen');
            playCheer();
            onWinner(selected[winIdx]);
          }, 900)
        );
      }
    };

    chargeStep();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🐉 Rồng Thần tích tụ năng lượng và phun lửa phép thuật chọn Chiến Binh!
      </p>

      <div className="relative w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-red-950 via-slate-950 to-orange-950 border-4 border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.3)] overflow-hidden">
        {/* Dragon Header & Power Bar */}
        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className={`text-6xl md:text-7xl select-none transition-transform duration-300 ${phase === 'breathing' ? 'scale-125 animate-bounce' : ''}`}>
            🐉
          </div>
          {phase === 'breathing' && (
            <div className="text-3xl animate-ping -mt-2">🔥🔥🔥</div>
          )}
          <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-orange-400/40 mt-3">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 transition-all duration-150"
              style={{ width: `${power}%` }}
            />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange-300 mt-1">
            Năng lượng Long Hồn: {power}%
          </span>
        </div>

        {/* Warrior Shields Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
          {shields.map((name, i) => {
            const isTarget = highlightIdx === i;
            const isWinner = winnerIdx === i && (phase === 'breathing' || phase === 'chosen');
            return (
              <div
                key={i}
                className={`p-3 md:p-4 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                  isWinner
                    ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 border-white scale-110 shadow-[0_0_30px_#f97316] z-20'
                    : isTarget
                    ? 'bg-orange-900/70 border-yellow-400 scale-105 shadow-[0_0_15px_#fb923c]'
                    : 'bg-slate-900/80 border-orange-500/30 opacity-80'
                }`}
              >
                <span className="text-2xl mb-1">{isWinner ? '⚔️🔥' : '🛡️'}</span>
                <span className={`font-extrabold text-xs md:text-sm truncate w-full ${isWinner ? 'text-slate-950' : 'text-orange-100'}`}>
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSummon}
        disabled={phase === 'charging' || phase === 'breathing'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-orange-500 via-red-600 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🐉 TRIỆU HỒI RỒNG THẦN' : phase === 'chosen' ? '🐉 TRIỆU HỒI TIẾP' : '🔥 ĐANG PHUN LỬA...'}
      </button>
    </div>
  );
}
