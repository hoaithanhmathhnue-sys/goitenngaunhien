import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playBoom, playCheer } from '../lib/audio';

interface Fighter {
  name: string;
  hp: number;
  eliminated: boolean;
}

export default function HeroArenaGame({ students, onWinner }: GameProps) {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [battling, setBattling] = useState(false);
  const [champion, setChampion] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setFighters(selected.map(name => ({ name, hp: 100, eliminated: false })));
    setBattling(false);
    setChampion(null);
    return clearTimers;
  }, [students]);

  const handleBattle = () => {
    if (battling || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    const winIdx = Math.floor(Math.random() * N);
    const roster: Fighter[] = selected.map(name => ({ name, hp: 100, eliminated: false }));
    setFighters(roster);
    setChampion(null);
    setBattling(true);

    // Order of elimination for everyone except winIdx
    const losers = shuffle(roster.map((_, i) => i).filter(i => i !== winIdx));

    losers.forEach((loserIdx, step) => {
      timersRef.current.push(
        window.setTimeout(() => {
          roster[loserIdx] = { ...roster[loserIdx], hp: 0, eliminated: true };
          setFighters([...roster]);
          playTick();

          if (step === losers.length - 1) {
            playBoom();
            timersRef.current.push(
              window.setTimeout(() => {
                setBattling(false);
                setChampion(roster[winIdx].name);
                playCheer();
                onWinner(roster[winIdx].name);
              }, 450)
            );
          }
        }, (step + 1) * 320)
      );
    });

    if (losers.length === 0) {
      setBattling(false);
      setChampion(roster[0].name);
      playCheer();
      onWinner(roster[0].name);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        ⚔️ Đấu trường anh hùng — Các chiến binh so tài đến khi tìm ra Nhà Vô Địch cuối cùng!
      </p>

      <div className="w-full max-w-3xl p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-red-950/70 to-slate-950 border-4 border-red-500/50 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fighters.map((f, i) => {
            const isChamp = champion === f.name;
            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                  isChamp
                    ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 text-slate-950 border-white scale-110 z-20 shadow-[0_0_35px_gold]'
                    : f.eliminated
                    ? 'bg-slate-900/40 text-slate-600 border-slate-800 scale-95 opacity-40'
                    : 'bg-slate-900/90 text-white border-red-500/40'
                }`}
              >
                <span className="text-3xl mb-1">{isChamp ? '👑⚔️' : f.eliminated ? '🏳️' : '🥷'}</span>
                <span className="text-xs md:text-sm font-extrabold truncate w-full text-center">{f.name}</span>
                {/* HP Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-200 ${isChamp ? 'bg-emerald-600' : 'bg-red-500'}`}
                    style={{ width: `${f.hp}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleBattle}
        disabled={battling}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {battling ? '⚔️ ĐANG GIAO ĐẤU...' : '⚔️ KHAI MÀN ĐẤU TRƯỜNG'}
      </button>
    </div>
  );
}
