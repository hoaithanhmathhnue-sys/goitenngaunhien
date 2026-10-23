import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { pickRandom, shuffle } from '../lib/utils';
import { playTick, playSuspense, playCheer } from '../lib/audio';

export default function RhythmDjGame({ students, onWinner }: GameProps) {
  const [bars, setBars] = useState<number[]>(new Array(12).fill(30));
  const [centerName, setCenterName] = useState<string>('NHẤN PLAY ĐỂ LÊN NHẠC');
  const [playing, setPlaying] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    setPlaying(false);
    setFrozen(false);
    setCenterName('NHẤN PLAY ĐỂ LÊN NHẠC');
    return clearTimers;
  }, [students]);

  const handleDropBeat = () => {
    if (playing || students.length === 0) return;
    clearTimers();

    const chosen = pickRandom(students)!;
    const pool = shuffle([...students]);
    setPlaying(true);
    setFrozen(false);
    playSuspense();

    const steps = 18;
    let step = 0;

    const beat = () => {
      if (step < steps) {
        setCenterName(pool[step % pool.length]);
        setBars(bars.map(() => 20 + Math.floor(Math.random() * 80)));
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(beat, 100 + step * 10));
      } else {
        setCenterName(chosen);
        setBars(new Array(12).fill(95));
        setPlaying(false);
        setFrozen(true);
        playCheer();
        onWinner(chosen);
      }
    };

    beat();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🎵 Nhịp điệu gọi tên — Khi nhạc dừng, thẻ tên ở tâm sóng âm sẽ được chọn!
      </p>

      <div className="w-full max-w-2xl p-6 rounded-3xl bg-gradient-to-br from-fuchsia-950 via-slate-950 to-cyan-950 border-4 border-fuchsia-400/50 shadow-[0_0_45px_rgba(217,70,239,0.3)] flex flex-col items-center">
        {/* Equalizer Bars */}
        <div className="w-full h-28 flex items-end justify-center gap-2 mb-6 px-4">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-400 via-fuchsia-500 to-yellow-300 transition-all duration-100"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Turntable & Center Track */}
        <div
          className={`w-full p-5 rounded-2xl border-2 text-center transition-all ${
            frozen
              ? 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 border-white shadow-[0_0_30px_#e879f9]'
              : 'bg-slate-900/90 border-cyan-400/40'
          }`}
        >
          <div className="text-xs font-mono uppercase tracking-widest text-cyan-300 mb-1">
            {frozen ? '❄️ FREEZE BEAT — MỤC TIÊU TRUNG TÂM' : '🎧 DJ TURNTABLE MIXER'}
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{centerName}</div>
        </div>
      </div>

      <button
        onClick={handleDropBeat}
        disabled={playing}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 hover:brightness-110 text-white font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {playing ? '🎵 ĐANG PHIÊU THEO NHẠC...' : '🎧 BẬT NHẠC GỌI TÊN'}
      </button>
    </div>
  );
}
