import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playDrumroll, playCheer } from '../lib/audio';

export default function GameshowStageGame({ students, onWinner }: GameProps) {
  const [contestants, setContestants] = useState<string[]>([]);
  const [spotIdx, setSpotIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    setContestants(shuffle([...students]).slice(0, N));
    setSpotIdx(null);
    setWinnerIdx(null);
    setRunning(false);
    return clearTimers;
  }, [students]);

  const handleSpotlight = () => {
    if (running || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setContestants(selected);

    const winIdx = Math.floor(Math.random() * N);
    setWinnerIdx(null);
    setRunning(true);
    playDrumroll();

    const total = 18;
    let step = 0;

    const sweep = () => {
      if (step < total) {
        setSpotIdx(step % N);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(sweep, 95 + step * 14));
      } else {
        setSpotIdx(winIdx);
        setWinnerIdx(winIdx);
        setRunning(false);
        playCheer();
        onWinner(selected[winIdx]);
      }
    };

    sweep();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🎤 Sân khấu Gameshow "Ai Sẽ Trả Lời?" — Đèn Spotlight quét qua và MC công bố kết quả!
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border-4 border-yellow-400/60 shadow-[0_0_50px_rgba(250,204,21,0.25)]">
        {/* LED Stage Screen */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950 border-2 border-yellow-400 text-center shadow-[0_0_25px_rgba(250,204,21,0.3)]">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-yellow-400 mb-1">
            💡 GAMESHOW LIVE STAGE 💡
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">
            {winnerIdx !== null
              ? `🎉 XIN MỜI: ${contestants[winnerIdx]}!`
              : spotIdx !== null
              ? contestants[spotIdx]
              : 'AI SẼ LÀ NGƯỜI TIẾP THEO?'}
          </div>
        </div>

        {/* Contestants Podiums */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {contestants.map((name, i) => {
            const isLit = spotIdx === i;
            const isWin = winnerIdx === i;

            return (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-150 ${
                  isWin
                    ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 text-slate-950 border-white scale-110 z-20 shadow-[0_0_35px_gold]'
                    : isLit
                    ? 'bg-purple-800/90 text-white border-yellow-300 scale-105 shadow-[0_0_20px_rgba(253,224,71,0.6)]'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-2xl md:text-3xl mb-1">{isWin ? '🎤🌟' : isLit ? '💡🧑' : '🧑'}</span>
                <span className="text-xs font-extrabold truncate w-full text-center">{name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSpotlight}
        disabled={running}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-pink-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {running ? '💡 ĐÈN SÂN KHẤU ĐANG QUÉT...' : '🎤 BẬT ĐÈN SÂN KHẤU'}
      </button>
    </div>
  );
}
