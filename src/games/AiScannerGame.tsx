import React, { useEffect, useRef, useState } from 'react';
import { GameProps } from '../types';
import { pickRandom, shuffle } from '../lib/utils';
import { playTick, playSuspense, playCheer } from '../lib/audio';

export default function AiScannerGame({ students, onWinner }: GameProps) {
  const [logs, setLogs] = useState<string[]>([
    '> KHỞI ĐỘNG HỆ THỐNG AI CLASSROOM v4.0...',
    '> SẴN SÀNG QUÉT DỮ LIỆU SINH TRẮC HỌC.',
  ]);
  const [scanning, setScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<string>('CHỜ LỆNH QUÉT');
  const [lockedWinner, setLockedWinner] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    setScanning(false);
    setLockedWinner(null);
    setCurrentScan('CHỜ LỆNH QUÉT');
    return clearTimers;
  }, [students]);

  const handleScan = () => {
    if (scanning || students.length === 0) return;
    clearTimers();

    const chosen = pickRandom(students)!;
    setLockedWinner(null);
    setScanning(true);
    playSuspense();

    const pool = shuffle([...students]);
    const steps = 16;
    let step = 0;

    setLogs([
      '> ĐANG KẾT NỐI CƠ SỞ DỮ LIỆU LỚP HỌC...',
      `> TỔNG SỐ MỤC TIÊU: ${students.length} HỌC SINH`,
      '> BẮT ĐẦU QUÉT TIA LASER AI...',
    ]);

    const tick = () => {
      if (step < steps) {
        const candidate = pool[step % pool.length];
        setCurrentScan(candidate);
        if (step % 3 === 0) {
          setLogs(prev => [...prev.slice(-5), `> PHÂN TÍCH NODE #${100 + step}: ${candidate} [OK]`]);
        }
        playTick();
        step++;
        timersRef.current.push(window.setTimeout(tick, 110 + step * 10));
      } else {
        setCurrentScan(chosen);
        setLockedWinner(chosen);
        setScanning(false);
        setLogs(prev => [...prev.slice(-5), `> ĐÃ KHÓA MỤC TIÊU: ${chosen.toUpperCase()} [100%]`]);
        playCheer();
        onWinner(chosen);
      }
    };

    tick();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <p className="text-sm md:text-base mb-4 text-brand-muted uppercase tracking-wider font-bold text-center">
        🤖 Robot AI quét danh sách bằng tia laser và chạy thuật toán truy vết!
      </p>

      <div className="relative w-full max-w-2xl p-6 rounded-3xl bg-[#030d08] border-4 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.3)] font-mono overflow-hidden">
        {scanning && <div className="scanner-line" />}

        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{lockedWinner ? '🤖✨' : '🤖'}</span>
            <div>
              <div className="text-xs text-emerald-400 font-bold">NEURAL AI SCANNER // V4.2</div>
              <div className="text-[10px] text-emerald-600">STATUS: {scanning ? 'SCANNING_LASER' : lockedWinner ? 'TARGET_LOCKED' : 'STANDBY'}</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
            {students.length} NODES
          </span>
        </div>

        {/* Target Reticle Display */}
        <div className="my-4 p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-400/50 text-center relative">
          <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 mb-1">
            {lockedWinner ? '🎯 ĐÃ KHÓA MỤC TIÊU CHÍNH XÁC' : '📡 ĐANG QUÉT TẦN SỐ SINH TRẮC'}
          </div>
          <div className={`text-2xl md:text-3xl font-black ${lockedWinner ? 'text-yellow-300 drop-shadow-[0_0_15px_gold]' : 'text-emerald-200'}`}>
            {currentScan}
          </div>
        </div>

        {/* Terminal Logs */}
        <div className="bg-black/80 rounded-xl p-3 border border-emerald-500/30 text-xs text-emerald-400 space-y-1 min-h-[110px]">
          {logs.map((l, i) => (
            <div key={i} className="truncate">{l}</div>
          ))}
        </div>
      </div>

      <button
        onClick={handleScan}
        disabled={scanning}
        className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xl shadow-xl uppercase tracking-widest transition disabled:opacity-50 active:scale-95"
      >
        {scanning ? '🤖 ĐANG QUÉT LASER AI...' : '🤖 KÍCH HOẠT QUÉT AI'}
      </button>
    </div>
  );
}
