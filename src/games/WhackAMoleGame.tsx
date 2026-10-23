import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playBoom, playCheer } from '../lib/audio';

type Phase = 'idle' | 'popping' | 'whacked';

export default function WhackAMoleGame({ students, onWinner }: GameProps) {
  const [holes, setHoles] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [upIdx, setUpIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 9);
    setHoles(shuffle([...students]).slice(0, N));
    setPhase('idle');
    setUpIdx(null);
    setWinnerIdx(null);
    return clearTimers;
  }, [students]);

  const handleWhack = () => {
    if ((phase !== 'idle' && phase !== 'whacked') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 9);
    const selected = shuffle([...students]).slice(0, N);
    setHoles(selected);

    const winIdx = Math.floor(Math.random() * selected.length);
    setWinnerIdx(winIdx);
    setPhase('popping');

    const totalPops = 16;
    let step = 0;

    const pop = () => {
      if (step < totalPops) {
        const next = step === totalPops - 1 ? winIdx : Math.floor(Math.random() * selected.length);
        setUpIdx(next);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(pop, 130 + step * 12));
      } else {
        setUpIdx(winIdx);
        setPhase('whacked');
        playBoom();
        setTimeout(() => playCheer(), 250);
        onWinner(selected[winIdx]);
      }
    };

    pop();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🔨 Đập chuột gọi tên — Khi dừng lại chiếc búa sẽ gõ trúng người may mắn!
      </p>

      <div className="w-full max-w-2xl p-6 rounded-3xl bg-gradient-to-b from-lime-700 via-emerald-800 to-green-950 border-4 border-lime-400/50 shadow-2xl">
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {holes.map((name, i) => {
            const isUp = upIdx === i;
            const isHit = winnerIdx === i && phase === 'whacked';

            return (
              <div key={i} className="relative h-28 md:h-32 flex flex-col items-center justify-end">
                {/* Mole popping up */}
                <div
                  className="transition-all duration-150 flex flex-col items-center z-10"
                  style={{
                    transform: isUp ? 'translateY(-14px) scale(1.1)' : 'translateY(28px) scale(0.75)',
                    opacity: isUp ? 1 : 0.35,
                  }}
                >
                  {isHit && <span className="text-3xl -mb-2 animate-bounce">🔨💥</span>}
                  <span className="text-4xl md:text-5xl select-none">{isHit ? '🐹💫' : '🐹'}</span>
                  <span
                    className={`mt-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-extrabold truncate max-w-[110px] border ${
                      isHit
                        ? 'bg-yellow-300 text-slate-950 border-white shadow-[0_0_15px_gold]'
                        : 'bg-amber-100 text-amber-950 border-amber-400'
                    }`}
                  >
                    {name}
                  </span>
                </div>

                {/* Dirt Mound */}
                <div className="w-full h-7 bg-gradient-to-b from-amber-800 to-stone-950 rounded-full border-2 border-amber-900 shadow-inner" />
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleWhack}
        disabled={phase === 'popping'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🔨 BẮT ĐẦU ĐẬP CHUỘT' : phase === 'whacked' ? '🔨 CHƠI LƯỢT MỚI' : '🐹 ĐANG NHÔ LÊN...'}
      </button>
    </div>
  );
}
