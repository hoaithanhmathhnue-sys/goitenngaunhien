import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { pickRandom } from '../lib/utils';
import { playTick, playCoin, playCheer, playSuspense } from '../lib/audio';

const CAPSULE_COLORS = [
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-blue-600',
  'from-amber-300 to-orange-500',
  'from-emerald-400 to-green-600',
  'from-violet-400 to-purple-600',
  'from-yellow-300 to-amber-500',
];

type Phase = 'idle' | 'turning' | 'dropping' | 'cracking' | 'opened';

export default function GachaponGame({ students, onWinner }: GameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<string | null>(null);
  const [capsuleColor, setCapsuleColor] = useState(CAPSULE_COLORS[0]);
  const [knobAngle, setKnobAngle] = useState(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    setPhase('idle');
    setWinner(null);
    return clearTimers;
  }, [students]);

  const handleSpinKnob = () => {
    if ((phase !== 'idle' && phase !== 'opened') || students.length === 0) return;
    clearTimers();

    const chosen = pickRandom(students)!;
    setWinner(chosen);
    setCapsuleColor(CAPSULE_COLORS[Math.floor(Math.random() * CAPSULE_COLORS.length)]);
    setPhase('turning');
    playSuspense();

    for (let i = 1; i <= 6; i++) {
      timersRef.current.push(
        window.setTimeout(() => {
          setKnobAngle(a => a + 60);
          playTick();
        }, i * 160)
      );
    }

    timersRef.current.push(
      window.setTimeout(() => {
        setPhase('dropping');
        playCoin();
        timersRef.current.push(
          window.setTimeout(() => {
            setPhase('cracking');
            playTick();
            timersRef.current.push(
              window.setTimeout(() => {
                setPhase('opened');
                playCheer();
                onWinner(chosen);
              }, 700)
            );
          }, 650)
        );
      }, 1100)
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        💊 Xoay núm máy Gachapon để nhả quả bóng Capsule bí ẩn chứa tên học sinh!
      </p>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Gachapon Machine */}
        <div className="w-64 bg-gradient-to-b from-red-500 to-rose-700 rounded-3xl p-4 border-4 border-yellow-300 shadow-2xl flex flex-col items-center">
          {/* Glass globe with balls */}
          <div className="w-52 h-48 rounded-full bg-sky-100/20 border-4 border-white/60 relative overflow-hidden flex flex-wrap items-end justify-center p-3 gap-1.5 shadow-inner">
            {CAPSULE_COLORS.concat(CAPSULE_COLORS).map((c, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${c} border-2 border-white/80 shadow ${
                  phase === 'turning' ? 'animate-bounce' : ''
                }`}
                style={{ animationDelay: `${(i % 5) * 80}ms` }}
              />
            ))}
          </div>

          {/* Turn Knob */}
          <div
            onClick={handleSpinKnob}
            className="my-4 w-16 h-16 rounded-full bg-gradient-to-b from-yellow-200 to-amber-500 border-4 border-amber-700 shadow-lg flex items-center justify-center cursor-pointer transition-transform duration-150"
            style={{ transform: `rotate(${knobAngle}deg)` }}
            title="Nhấn để xoay"
          >
            <div className="w-10 h-3 bg-amber-800 rounded-full" />
          </div>

          {/* Dispenser chute */}
          <div className="w-24 h-12 bg-slate-900 rounded-xl border-2 border-amber-400 flex items-center justify-center">
            {(phase === 'dropping' || phase === 'cracking' || phase === 'opened') && (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${capsuleColor} border-2 border-white animate-bounce`} />
            )}
          </div>
        </div>

        {/* Capsule Reveal Stage */}
        <div className="w-72 h-64 rounded-3xl bg-slate-900/90 border-2 border-pink-400/40 flex flex-col items-center justify-center p-6 text-center shadow-xl">
          {phase === 'idle' || phase === 'turning' ? (
            <div className="text-slate-400 text-sm font-mono uppercase">
              {phase === 'turning' ? '🔄 Đang trộn bóng Capsule...' : '👉 Bấm nút xoay máy để lấy bóng!'}
            </div>
          ) : phase === 'dropping' || phase === 'cracking' ? (
            <div className="flex flex-col items-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${capsuleColor} border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.6)] animate-ping`} />
              <p className="mt-4 text-xs font-mono text-amber-300 uppercase">Quả cầu đang tách vỏ...</p>
            </div>
          ) : (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center">
              <div className="text-4xl mb-2">🎊💊🎊</div>
              <div className="text-xs font-mono uppercase tracking-widest text-pink-300 mb-1">Capsule Mở Ra</div>
              <div className="text-2xl font-black text-yellow-300 bg-slate-950 px-4 py-2 rounded-xl border border-yellow-400/50">
                {winner}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSpinKnob}
        disabled={phase === 'turning' || phase === 'dropping' || phase === 'cracking'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'idle' ? '💊 XOAY MÁY GACHAPON' : phase === 'opened' ? '💊 XOAY QUẢ BÓNG MỚI' : '🔄 ĐANG NHẢ BÓNG...'}
      </button>
    </div>
  );
}
