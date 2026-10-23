import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playSuspense, playCheer } from '../lib/audio';

export default function IceSkatingGame({ students, onWinner }: GameProps) {
  const [skaters, setSkaters] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [skating, setSkating] = useState(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setSkaters(shuffle([...students]).slice(0, N));
    setActiveIdx(0);
    setWinnerIdx(null);
    setSkating(false);
    return clearTimers;
  }, [students]);

  const handleSkate = () => {
    if (skating || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setSkaters(selected);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(null);
    setSkating(true);
    playSuspense();

    const totalSteps = N * 3 + winIdx;
    let step = 0;

    const glide = () => {
      if (step < totalSteps) {
        setActiveIdx(step % N);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(glide, 90 + step * 12));
      } else {
        setActiveIdx(winIdx);
        setWinnerIdx(winIdx);
        setSkating(false);
        playCheer();
        onWinner(selected[winIdx]);
      }
    };

    glide();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        ⛸️ Trượt băng vòng quanh lớp — Khi dừng lại người tỏa sáng ở tâm sân băng được chọn!
      </p>

      <div className="relative w-full max-w-2xl h-[350px] rounded-full bg-gradient-to-br from-cyan-100 via-sky-200 to-blue-300 border-8 border-white shadow-[inset_0_0_50px_rgba(14,165,233,0.4),0_15px_40px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden">
        {/* Ice Rink Center Circle */}
        <div className="w-40 h-40 rounded-full border-4 border-dashed border-sky-500/50 flex flex-col items-center justify-center text-center p-3 bg-white/60 backdrop-blur-sm">
          <span className="text-3xl mb-1">❄️⛸️❄️</span>
          <span className="text-xs font-black text-sky-900 uppercase">
            {winnerIdx !== null ? skaters[winnerIdx] : skating ? 'Đang lướt băng...' : 'Sân Băng Mùa Đông'}
          </span>
        </div>

        {/* Skaters around rink */}
        {skaters.map((name, i) => {
          const angle = (i / skaters.length) * 2 * Math.PI - Math.PI / 2;
          const rx = 185;
          const ry = 125;
          const x = Math.cos(angle) * rx;
          const y = Math.sin(angle) * ry;
          const isCurrent = activeIdx === i;
          const isWin = winnerIdx === i;

          return (
            <div
              key={i}
              className="absolute flex flex-col items-center transition-all duration-150"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isWin ? 1.3 : isCurrent ? 1.15 : 0.95})`,
                zIndex: isWin ? 20 : isCurrent ? 15 : 5,
              }}
            >
              <span className="text-2xl md:text-3xl">{isWin ? '🥇⛸️' : '⛸️'}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold whitespace-nowrap border shadow ${
                  isWin
                    ? 'bg-yellow-400 text-slate-950 border-white shadow-[0_0_20px_gold]'
                    : isCurrent
                    ? 'bg-sky-600 text-white border-white'
                    : 'bg-white/90 text-slate-800 border-sky-300'
                }`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSkate}
        disabled={skating}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-sky-400 via-cyan-500 to-blue-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {skating ? '⛸️ ĐANG LƯỚT TRÊN SÂN BĂNG...' : '⛸️ BẮT ĐẦU TRƯỢT BĂNG'}
      </button>
    </div>
  );
}
