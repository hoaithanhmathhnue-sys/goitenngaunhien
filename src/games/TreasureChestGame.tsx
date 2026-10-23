import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playCoin, playDrumroll, playCheer } from '../lib/audio';

type Phase = 'idle' | 'searching' | 'unlocking' | 'opened';

export default function TreasureChestGame({ students, onWinner }: GameProps) {
  const [chests, setChests] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 9);
    setChests(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setActiveIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleOpen = () => {
    if ((phase !== 'idle' && phase !== 'opened') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 9);
    const selected = shuffle([...students]).slice(0, N);
    setChests(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('searching');
    playDrumroll();

    const totalSteps = selected.length * 2 + winIdx + 6;
    let step = 0;

    const tick = () => {
      if (step < totalSteps) {
        setActiveIdx(step % selected.length);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(tick, 90 + step * 14));
      } else {
        setActiveIdx(winIdx);
        setPhase('unlocking');
        playCoin();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('opened');
            playCheer();
            onWinner(selected[winIdx]);
          }, 900)
        );
      }
    };

    tick();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🗝️ Chìa khóa vàng sẽ mở chiếc rương kho báu chứa tên học sinh may mắn!
      </p>

      <div className="w-full max-w-3xl p-6 md:p-8 rounded-3xl bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 border-4 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {chests.map((name, i) => {
            const isCurrent = activeIdx === i;
            const isWin = winnerIdx === i && (phase === 'unlocking' || phase === 'opened');
            const isOpened = winnerIdx === i && phase === 'opened';

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-4 flex flex-col items-center justify-center min-h-[120px] border-2 transition-all duration-300 ${
                  isOpened
                    ? 'bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-600 border-white scale-110 z-20 shadow-[0_0_35px_gold]'
                    : isCurrent
                    ? 'bg-amber-800/80 border-yellow-300 scale-105 shadow-[0_0_20px_rgba(253,224,71,0.6)]'
                    : 'bg-stone-800/80 border-amber-700/40 opacity-85'
                }`}
              >
                {/* Floating Key when active */}
                {isCurrent && !isOpened && (
                  <div className="absolute -top-4 text-2xl animate-bounce drop-shadow-[0_0_8px_gold]">
                    🗝️
                  </div>
                )}

                <div className={`text-4xl md:text-5xl select-none ${isWin && phase === 'unlocking' ? 'animate-ping' : ''}`}>
                  {isOpened ? '👑' : '🧰'}
                </div>

                {isOpened ? (
                  <div className="mt-2 text-center animate-in zoom-in duration-300">
                    <span className="text-xs md:text-sm font-black text-slate-950 bg-yellow-100 px-2.5 py-1 rounded-lg shadow block">
                      {name}
                    </span>
                  </div>
                ) : (
                  <span className="mt-2 text-[11px] font-mono uppercase tracking-wider text-amber-200/80">
                    Rương #{i + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleOpen}
        disabled={phase === 'searching' || phase === 'unlocking'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🗝️ MỞ RƯƠNG KHO BÁU' : phase === 'opened' ? '🗝️ MỞ RƯƠNG KHÁC' : '✨ ĐANG TRA KHÓA...'}
      </button>
    </div>
  );
}
