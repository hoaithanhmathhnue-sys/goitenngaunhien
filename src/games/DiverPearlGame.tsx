import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playCoin, playCheer } from '../lib/audio';

type Phase = 'idle' | 'diving' | 'opened';

export default function DiverPearlGame({ students, onWinner }: GameProps) {
  const [shells, setShells] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [diverIdx, setDiverIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setShells(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setDiverIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleDive = () => {
    if (phase === 'diving' || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setShells(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('diving');

    const total = 15;
    let step = 0;

    const swim = () => {
      if (step < total) {
        setDiverIdx(step % selected.length);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(swim, 120 + step * 15));
      } else {
        setDiverIdx(winIdx);
        setPhase('opened');
        playCoin();
        setTimeout(() => playCheer(), 200);
        onWinner(selected[winIdx]);
      }
    };

    swim();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🤿 Thợ lặn khám phá đáy đại dương và mở vỏ sò chứa viên ngọc trai mang tên học sinh!
      </p>

      <div className="relative w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-cyan-700 via-blue-900 to-slate-950 border-4 border-cyan-300/50 shadow-2xl overflow-hidden">
        {/* Sea bubbles decoration */}
        <div className="flex justify-around text-lg opacity-50 mb-4 pointer-events-none">
          <span>🫧</span><span>🐠</span><span>🫧</span><span>🐙</span><span>🫧</span><span>🐬</span><span>🫧</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {shells.map((name, i) => {
            const isNear = diverIdx === i;
            const isPearl = winnerIdx === i && phase === 'opened';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-4 min-h-[125px] flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                  isPearl
                    ? 'bg-gradient-to-br from-pink-300 via-amber-200 to-cyan-200 border-white scale-110 z-20 shadow-[0_0_30px_#67e8f9]'
                    : isNear
                    ? 'bg-cyan-800/80 border-cyan-200 scale-105'
                    : 'bg-blue-950/75 border-cyan-500/30'
                }`}
              >
                {isNear && (
                  <span className="absolute -top-3 -right-2 text-2xl animate-bounce">🤿</span>
                )}
                <span className="text-4xl mb-2">{isPearl ? '🦪✨' : '🐚'}</span>
                <span className={`text-xs md:text-sm font-black text-center ${isPearl ? 'text-slate-950' : 'text-cyan-100'}`}>
                  {isPearl ? name : `Vỏ sò #${i + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleDive}
        disabled={phase === 'diving'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'diving' ? '🤿 ĐANG LẶN TÌM NGỌC...' : '🤿 LẶN XUỐNG ĐÁY BIỂN'}
      </button>
    </div>
  );
}
