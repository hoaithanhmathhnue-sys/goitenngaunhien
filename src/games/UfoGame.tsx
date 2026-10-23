import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle } from '../lib/utils';
import { playTick, playSuspense, playWhoosh, playCheer } from '../lib/audio';

const AVATARS = ['🧑‍🚀', '👾', '🤖', '🦊', '🐱', '🐼', '🐸', '🦁', '🐯', '🦄', '🐧', '🐨'];

type Phase = 'idle' | 'patrol' | 'locking' | 'abducting' | 'done';

export default function UfoGame({ students, onWinner }: GameProps) {
  const [targets, setTargets] = useState<{ name: string; avatar: string }[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [ufoIdx, setUfoIdx] = useState<number>(0);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const setupRound = () => {
    clearTimers();
    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    setTargets(selected.map((name, i) => ({ name, avatar: AVATARS[i % AVATARS.length] })));
    setPhase('idle');
    setUfoIdx(Math.floor(N / 2));
    setWinnerIdx(null);
  };

  useEffect(() => {
    setupRound();
    return clearTimers;
  }, [students]);

  const handleStart = () => {
    if ((phase !== 'idle' && phase !== 'done') || students.length === 0) return;
    clearTimers();

    const N = Math.min(Math.max(students.length, 1), 8);
    const selected = shuffle([...students]).slice(0, N);
    const newTargets = selected.map((name, i) => ({ name, avatar: AVATARS[i % AVATARS.length] }));
    setTargets(newTargets);

    const winIdx = Math.floor(Math.random() * newTargets.length);
    setWinnerIdx(winIdx);
    setPhase('patrol');
    playSuspense();

    const totalSteps = 14 + Math.floor(Math.random() * 6);
    let step = 0;

    const moveStep = () => {
      if (step < totalSteps) {
        const nextIdx = step === totalSteps - 1 ? winIdx : Math.floor(Math.random() * newTargets.length);
        setUfoIdx(nextIdx);
        playTick();
        step++;
        const delay = 140 + step * 18;
        timersRef.current.push(window.setTimeout(moveStep, delay));
      } else {
        setUfoIdx(winIdx);
        setPhase('locking');
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('abducting');
            playWhoosh();
            timersRef.current.push(
              window.setTimeout(() => {
                setPhase('done');
                playCheer();
                onWinner(newTargets[winIdx].name);
              }, 1100)
            );
          }, 700)
        );
      }
    };

    moveStep();
  };

  const ufoPercent = targets.length > 0 ? ((ufoIdx + 0.5) / targets.length) * 100 : 50;

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🛸 Đĩa bay ngoài hành tinh đang quét thành phố để bắt cóc 1 học sinh lên tàu!
      </p>

      <div className="relative w-full max-w-3xl h-[380px] rounded-3xl overflow-hidden border-4 border-cyan-400/50 bg-gradient-to-b from-[#060818] via-[#12163b] to-[#1e1b4b] shadow-[0_0_40px_rgba(34,211,238,0.25)]">
        {/* Stars background */}
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${(i * 17) % 65}%`,
                left: `${(i * 31) % 96}%`,
                animationDelay: `${(i % 5) * 0.4}s`,
              }}
            />
          ))}
        </div>

        {/* Pixel city silhouette */}
        <div className="absolute bottom-12 left-0 right-0 h-24 flex items-end opacity-40 pointer-events-none">
          {[40, 65, 50, 80, 45, 70, 55, 90, 60, 48, 75, 52].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-indigo-950 border-t border-x border-indigo-700/40"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* UFO + Tractor Beam */}
        <div
          className="absolute top-6 z-20 -translate-x-1/2 transition-all duration-200 ease-out flex flex-col items-center"
          style={{ left: `${ufoPercent}%` }}
        >
          {/* UFO Dome & Body */}
          <div className={`relative flex flex-col items-center ${phase === 'locking' || phase === 'abducting' ? 'animate-bounce' : ''}`}>
            <div className="w-12 h-6 bg-cyan-300/80 rounded-t-full border-2 border-cyan-100 flex items-center justify-center text-xs shadow-[0_0_15px_#22d3ee]">
              👽
            </div>
            <div className="w-28 h-7 -mt-1 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-cyan-500 rounded-full border-2 border-cyan-200 shadow-[0_0_25px_#a855f7] flex items-center justify-around px-2">
              <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-200" />
              <span className="w-2 h-2 rounded-full bg-pink-300 animate-ping" />
            </div>
          </div>

          {/* Tractor Beam */}
          {(phase === 'locking' || phase === 'abducting' || phase === 'done') && (
            <div
              className="w-28 h-[250px] -mt-1 pointer-events-none transition-opacity duration-300"
              style={{
                background: 'linear-gradient(180deg, rgba(34,211,238,0.65) 0%, rgba(168,85,247,0.35) 60%, rgba(34,211,238,0.08) 100%)',
                clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
                boxShadow: '0 0 30px rgba(34,211,238,0.5)',
              }}
            />
          )}
        </div>

        {/* Abducted student display in cockpit */}
        {phase === 'done' && winnerIdx !== null && targets[winnerIdx] && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-30 bg-cyan-950/90 border-2 border-cyan-300 px-5 py-2 rounded-2xl shadow-[0_0_30px_#22d3ee] text-center animate-in zoom-in duration-300">
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Đã đưa lên tàu UFO</div>
            <div className="text-lg md:text-xl font-black text-yellow-300">{targets[winnerIdx].name}</div>
          </div>
        )}

        {/* Ground & Students */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-slate-950 to-indigo-950 border-t-2 border-cyan-500/40" />

        <div className="absolute bottom-4 left-0 right-0 px-2 flex justify-around items-end z-20">
          {targets.map((t, i) => {
            const isTarget = i === ufoIdx;
            const isAbducted = i === winnerIdx && (phase === 'abducting' || phase === 'done');
            return (
              <div
                key={i}
                className="flex flex-col items-center transition-all"
                style={{
                  width: `${100 / Math.max(targets.length, 1)}%`,
                  transform: isAbducted
                    ? 'translateY(-210px) scale(1.25) rotate(12deg)'
                    : isTarget && phase !== 'idle'
                    ? 'translateY(-8px) scale(1.1)'
                    : 'none',
                  opacity: phase === 'done' && isAbducted ? 0.2 : 1,
                  transitionDuration: isAbducted ? '1000ms' : '200ms',
                }}
              >
                <div
                  className={`text-3xl md:text-4xl transition-all ${
                    isTarget && phase !== 'idle' ? 'drop-shadow-[0_0_14px_#22d3ee]' : ''
                  }`}
                >
                  {t.avatar}
                </div>
                <span
                  className={`mt-1 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold truncate max-w-[90px] border ${
                    isTarget && phase !== 'idle'
                      ? 'bg-cyan-400 text-slate-950 border-white shadow-[0_0_10px_#22d3ee]'
                      : 'bg-slate-900/90 text-cyan-100 border-cyan-500/30'
                  }`}
                >
                  {t.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={phase !== 'idle' && phase !== 'done'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-fuchsia-600 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-[0_0_25px_rgba(34,211,238,0.4)] uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🛸 PHÓNG TIA HÚT UFO' : phase === 'done' ? '🛸 QUÉT LƯỢT MỚI' : '👽 ĐANG TRUY BẮT...'}
      </button>
    </div>
  );
}
