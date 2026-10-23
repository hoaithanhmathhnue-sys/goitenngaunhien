import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { shuffle, pickRandom } from '../lib/utils';
import { playTick, playWhoosh, playSuspense, playCheer } from '../lib/audio';

type Phase = 'idle' | 'vortex' | 'teleporting' | 'arrived';

export default function PortalGame({ students, onWinner }: GameProps) {
  const [orbitNames, setOrbitNames] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [chosen, setChosen] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    setOrbitNames(shuffle([...students]).slice(0, Math.min(students.length, 10)));
    setPhase('idle');
    setChosen(null);
    return clearTimers;
  }, [students]);

  const handleTeleport = () => {
    if ((phase !== 'idle' && phase !== 'arrived') || students.length === 0) return;
    clearTimers();

    const pool = shuffle([...students]).slice(0, Math.min(students.length, 10));
    setOrbitNames(pool);
    const win = pickRandom(students)!;
    setChosen(win);
    setPhase('vortex');
    playSuspense();

    let step = 0;
    const spinIv = window.setInterval(() => {
      step++;
      setRotation(r => r + 45);
      if (step % 2 === 0) playTick();
    }, 100);
    timersRef.current.push(spinIv);

    timersRef.current.push(
      window.setTimeout(() => {
        clearInterval(spinIv);
        setPhase('teleporting');
        playWhoosh();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('arrived');
            playCheer();
            onWinner(win);
          }, 900)
        );
      }, 2200)
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🌀 Cổng dịch chuyển không gian hút các thẻ tên và đưa 1 học sinh xuất hiện!
      </p>

      <div className="relative w-full max-w-2xl h-[360px] rounded-3xl overflow-hidden border-4 border-fuchsia-500/50 bg-[#070312] flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.3)]">
        {/* Swirling Portal Rings */}
        <div
          className="w-64 h-64 rounded-full border-4 border-dashed border-cyan-400/60 flex items-center justify-center transition-transform duration-200"
          style={{ transform: `rotate(${rotation}deg) scale(${phase === 'teleporting' ? 0.4 : 1})` }}
        >
          <div className="w-48 h-48 rounded-full border-4 border-dotted border-fuchsia-500/80 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-400 animate-pulse shadow-[0_0_40px_#d946ef]" />
          </div>
        </div>

        {/* Orbiting Student Tags */}
        {phase !== 'arrived' &&
          orbitNames.map((name, i) => {
            const angle = ((i / orbitNames.length) * 360 + rotation) * (Math.PI / 180);
            const radius = phase === 'teleporting' ? 12 : 125;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div
                key={i}
                className="absolute px-2.5 py-1 rounded-full bg-indigo-950/90 border border-cyan-400/50 text-cyan-200 text-xs font-bold whitespace-nowrap transition-all duration-200"
                style={{
                  transform: `translate(${x}px, ${y}px) scale(${phase === 'teleporting' ? 0 : 1})`,
                  opacity: phase === 'teleporting' ? 0 : 0.9,
                }}
              >
                {name}
              </div>
            );
          })}

        {/* Teleported Winner */}
        {phase === 'arrived' && chosen && (
          <div className="absolute z-30 bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 p-1 rounded-2xl shadow-[0_0_40px_#22d3ee] animate-in zoom-in duration-300">
            <div className="bg-slate-950 px-8 py-5 rounded-xl text-center">
              <div className="text-xs font-mono text-cyan-300 uppercase tracking-widest mb-1">⚡ Dịch chuyển thành công</div>
              <div className="text-2xl md:text-3xl font-black text-white">{chosen}</div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleTeleport}
        disabled={phase === 'vortex' || phase === 'teleporting'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '🌀 KÍCH HOẠT CỔNG KHÔNG GIAN' : phase === 'arrived' ? '🌀 DỊCH CHUYỂN LƯỢT MỚI' : '⚡ ĐANG DỊCH CHUYỂN...'}
      </button>
    </div>
  );
}
