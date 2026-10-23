import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playWhoosh, playCheer, playSuspense } from '../lib/audio';

const PLANETS = [
  { icon: '🪐', color: 'from-amber-400 to-orange-600', ring: 'border-amber-300' },
  { icon: '🌍', color: 'from-sky-400 to-emerald-600', ring: 'border-sky-300' },
  { icon: '🌕', color: 'from-yellow-200 to-amber-500', ring: 'border-yellow-200' },
  { icon: '🔮', color: 'from-fuchsia-500 to-purple-800', ring: 'border-fuchsia-300' },
  { icon: '☄️', color: 'from-rose-500 to-red-800', ring: 'border-rose-300' },
  { icon: '❄️', color: 'from-cyan-300 to-blue-700', ring: 'border-cyan-200' },
  { icon: '🌋', color: 'from-orange-500 to-red-900', ring: 'border-orange-300' },
  { icon: '🌟', color: 'from-violet-400 to-indigo-800', ring: 'border-violet-300' },
];

const POSITIONS = [
  { x: 16, y: 24 },
  { x: 42, y: 18 },
  { x: 70, y: 22 },
  { x: 85, y: 48 },
  { x: 72, y: 76 },
  { x: 45, y: 78 },
  { x: 18, y: 72 },
  { x: 28, y: 48 },
];

export default function GalaxyShipGame({ students, onWinner }: GameProps) {
  const [planets, setPlanets] = useState<{ name: string; p: typeof PLANETS[0]; pos: { x: number; y: number } }[]>([]);
  const [shipPos, setShipPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setPlanets(
      selected.map((name, i) => ({
        name,
        p: PLANETS[i % PLANETS.length],
        pos: POSITIONS[i % POSITIONS.length],
      }))
    );
    setShipPos({ x: 50, y: 50 });
    setActiveIdx(null);
    setWinnerIdx(null);
    setFlying(false);
    return clearTimers;
  }, [students]);

  const handleLaunch = () => {
    if (flying || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    const newPlanets = selected.map((name, i) => ({
      name,
      p: PLANETS[i % PLANETS.length],
      pos: POSITIONS[i % POSITIONS.length],
    }));
    setPlanets(newPlanets);

    const winIdx = Math.floor(Math.random() * newPlanets.length);
    setWinnerIdx(null);
    setFlying(true);
    playSuspense();

    const hops = 12 + Math.floor(Math.random() * 5);
    let step = 0;

    const hop = () => {
      if (step < hops) {
        const idx = step === hops - 1 ? winIdx : (step + Math.floor(Math.random() * newPlanets.length)) % newPlanets.length;
        setActiveIdx(idx);
        setShipPos(newPlanets[idx].pos);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(hop, 240 + step * 25));
      } else {
        setActiveIdx(winIdx);
        setWinnerIdx(winIdx);
        setShipPos(newPlanets[winIdx].pos);
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setFlying(false);
            playCheer();
            onWinner(newPlanets[winIdx].name);
          }, 600)
        );
      }
    };

    hop();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🚀 Phi thuyền xuyên thiên hà đang tìm hành tinh để hạ cánh!
      </p>

      <div className="relative w-full max-w-3xl h-[380px] rounded-3xl overflow-hidden border-4 border-indigo-400/50 bg-[radial-gradient(ellipse_at_center,#1e1b4b_0%,#090a1a_75%,#020617_100%)] shadow-[0_0_40px_rgba(99,102,241,0.3)]">
        {/* Nebula & Stars */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl" />
          {[...Array(35)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ top: `${(i * 29) % 95}%`, left: `${(i * 43) % 95}%` }}
            />
          ))}
        </div>

        {/* Planets */}
        {planets.map((item, i) => {
          const isVisited = activeIdx === i;
          const isWinner = winnerIdx === i;
          return (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
              style={{
                left: `${item.pos.x}%`,
                top: `${item.pos.y}%`,
                transform: `translate(-50%, -50%) scale(${isWinner ? 1.35 : isVisited ? 1.15 : 1})`,
                zIndex: isWinner ? 25 : isVisited ? 15 : 10,
              }}
            >
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${item.p.color} border-2 ${item.p.ring} flex items-center justify-center text-2xl md:text-3xl shadow-lg ${
                  isWinner ? 'ring-4 ring-yellow-300 shadow-[0_0_30px_gold]' : isVisited ? 'ring-2 ring-cyan-300 shadow-[0_0_20px_#22d3ee]' : ''
                }`}
              >
                {item.p.icon}
              </div>
              <span
                className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] md:text-xs font-extrabold whitespace-nowrap border ${
                  isWinner
                    ? 'bg-yellow-300 text-slate-950 border-white shadow-[0_0_15px_gold]'
                    : isVisited
                    ? 'bg-cyan-400 text-slate-950 border-white'
                    : 'bg-slate-900/85 text-white border-white/20'
                }`}
              >
                {item.name}
              </span>
            </div>
          );
        })}

        {/* Spaceship */}
        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out"
          style={{ left: `${shipPos.x}%`, top: `${shipPos.y - 8}%` }}
        >
          <div className={`text-4xl md:text-5xl drop-shadow-[0_0_16px_#38bdf8] ${flying ? 'animate-bounce' : ''}`}>
            🚀
          </div>
        </div>
      </div>

      <button
        onClick={handleLaunch}
        disabled={flying}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {flying ? '🚀 ĐANG DU HÀNH...' : '🚀 KHỞI HÀNH XUYÊN THIÊN HÀ'}
      </button>
    </div>
  );
}
