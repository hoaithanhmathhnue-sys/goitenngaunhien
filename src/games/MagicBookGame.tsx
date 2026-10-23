import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { pickRandom } from '../lib/utils';
import { playTick, playSuspense, playCheer } from '../lib/audio';

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ'];

type Phase = 'idle' | 'chanting' | 'revealed';

export default function MagicBookGame({ students, onWinner }: GameProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
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

  const handleCastSpell = () => {
    if (phase === 'chanting' || students.length === 0) return;
    clearTimers();

    const chosen = pickRandom(students)!;
    setWinner(chosen);
    setPhase('chanting');
    playSuspense();

    const steps = 16;
    let step = 0;

    const cycle = () => {
      if (step < steps) {
        setPreviewName(pickRandom(students)!);
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(cycle, 110 + step * 12));
      } else {
        setPreviewName(chosen);
        setPhase('revealed');
        playCheer();
        onWinner(chosen);
      }
    };

    cycle();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        📖 Cuốn sách phép thuật cổ đại mở trang, các ký tự Rune kết tinh thành tên học sinh!
      </p>

      <div className="relative w-full max-w-2xl min-h-[320px] rounded-3xl p-6 md:p-8 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 border-4 border-amber-400/50 shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col items-center justify-center overflow-hidden">
        {/* Floating Runes */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {RUNES.slice(0, 10).map((r, i) => (
            <span
              key={i}
              className={`text-xl md:text-2xl font-serif text-amber-300/80 transition-all ${
                phase === 'chanting' ? 'animate-bounce text-fuchsia-300 drop-shadow-[0_0_10px_#e879f9]' : ''
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {r}
            </span>
          ))}
        </div>

        {/* Open Spellbook Pages */}
        <div className="w-full max-w-lg grid grid-cols-2 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-2xl border-4 border-amber-700 shadow-2xl overflow-hidden min-h-[170px]">
          {/* Left Page */}
          <div className="p-5 border-r-2 border-amber-300/80 flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-2">🔮</span>
            <p className="text-[11px] font-serif italic text-amber-900">
              "Cổ ngữ thức tỉnh, ánh sáng chỉ điểm người được chọn..."
            </p>
          </div>
          {/* Right Page */}
          <div className="p-5 flex flex-col items-center justify-center text-center">
            {phase === 'idle' ? (
              <span className="text-amber-800/60 font-serif text-sm">Trang sách đang chờ niệm chú...</span>
            ) : (
              <div className="animate-in zoom-in duration-300">
                <div className="text-[10px] uppercase tracking-widest text-purple-800 font-bold mb-1">
                  {phase === 'chanting' ? '✨ Đang giải mã cổ ngữ...' : '🌟 Pháp Thuật Chỉ Điểm'}
                </div>
                <div className={`text-lg md:text-2xl font-black ${phase === 'revealed' ? 'text-purple-950 scale-105' : 'text-amber-800/80'}`}>
                  {previewName || winner}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleCastSpell}
        disabled={phase === 'chanting'}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {phase === 'chanting' ? '✨ ĐANG NIỆM CHÚ...' : '📖 MỞ SÁCH PHÉP THUẬT'}
      </button>
    </div>
  );
}
