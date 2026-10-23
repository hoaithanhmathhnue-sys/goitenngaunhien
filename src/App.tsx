import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import {
  Volume2, VolumeX, Trash2, Upload, Shuffle, FileText, History, Gamepad2, X,
  Moon, Sun, Cookie, Music, Music2, Plus, FolderOpen, Save, Users,
  ChevronDown, ChevronUp, ShieldCheck, RotateCcw, Undo2, Maximize2, Minimize2, Mic, MicOff,
  GraduationCap, MapPin, School, Sparkles, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playWin, setSoundEnabled, startAmbient, stopAmbient, setAmbientEnabled } from './lib/audio';
import {
  getHistory, addHistory, clearHistory as clearStorageHistory, HistoryItem,
  getStudents, saveStudents, getTheme, saveTheme, ThemeName,
  ClassInfo, getClasses, addClass, deleteClass, updateClassStudents, getActiveClassId, saveActiveClassId
} from './lib/storage';
import {
  WheelGame, DuckRace, SlotMachine, BombGame, DiceGame, DartGame,
  CardsGame, PlinkoGame, RainGame, BalloonGame, ClawGame, EnvelopeGame,
  UfoGame, GalaxyShipGame, TreasureChestGame, DragonGame, PortalGame, MeteorGame, SuperheroGame,
  MotoRaceGame, ObstacleJumpGame, GachaponGame, WhackAMoleGame,
  DetectiveGame, MazeGame, MagicBookGame, AiScannerGame, SecretLabGame,
  DiverPearlGame, HotAirBalloonGame, IceSkatingGame, HappyFarmGame, HauntedHouseGame,
  GameshowStageGame, BasketballGame, PenaltyGame, RhythmDjGame, HeroArenaGame
} from './games';

const SAMPLE_STUDENTS = [
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Công", "Phạm Thị Dung", "Hoàng Văn Em",
  "Vũ Thị Phương", "Đỗ Minh Giang", "Bùi Quốc Hưng", "Ngô Thị Kim", "Đặng Văn Long",
  "Lý Hoàng My", "Mai Thị Nga", "Phan Văn Ơn", "Tô Thị Phúc", "Cao Thị Quỳnh",
  "Trịnh Văn Rồng", "Lưu Thị Sương", "Hồ Văn Thắng", "Đinh Thị Uyên", "Võ Văn Vũ",
  "Trương Thị Xuân", "Dương Văn Yến", "Kiều Thị Ánh", "Lâm Văn Bảo", "Tạ Thị Cúc",
  "Nguyễn Văn Đức", "Trần Thị Hà", "Lê Minh Khánh", "Phạm Thị Lan", "Hoàng Văn Nam"
];

export type GameCategory = 'all' | 'space' | 'speed' | 'arcade' | 'mystery' | 'world' | 'gameshow';

const CATEGORIES: { id: GameCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: '✨' },
  { id: 'space', label: 'Vũ trụ & Phiêu lưu', icon: '🛸' },
  { id: 'speed', label: 'Đua tốc độ', icon: '🏍️' },
  { id: 'arcade', label: 'Máy Arcade', icon: '🕹️' },
  { id: 'mystery', label: 'Bí ẩn & Trí tuệ', icon: '🕵️' },
  { id: 'world', label: 'Thế giới vui nhộn', icon: '🎠' },
  { id: 'gameshow', label: 'Gameshow & Tập thể', icon: '🎤' },
];

const GAMES = [
  // Nhóm A: Vũ trụ và phiêu lưu
  { id: 'ufo', name: 'UFO Bắt Cóc', desc: 'Đĩa bay quét tia sáng hút 1 bạn lên tàu', icon: '🛸', category: 'space' as GameCategory, component: UfoGame },
  { id: 'galaxy', name: 'Phi Thuyền Thiên Hà', desc: 'Tàu vũ trụ đáp xuống hành tinh ngẫu nhiên', icon: '🚀', category: 'space' as GameCategory, component: GalaxyShipGame },
  { id: 'treasure', name: 'Hầm Ngục Kho Báu', desc: 'Chìa khóa vàng mở rương báu bí ẩn', icon: '🧰', category: 'space' as GameCategory, component: TreasureChestGame },
  { id: 'dragon', name: 'Rồng Thần Chọn Binh', desc: 'Rồng phun lửa phép thuật chọn chiến binh', icon: '🐉', category: 'space' as GameCategory, component: DragonGame },
  { id: 'portal', name: 'Cổng Không Gian', desc: 'Xoáy không gian dịch chuyển học sinh', icon: '🌀', category: 'space' as GameCategory, component: PortalGame },
  { id: 'meteor', name: 'Thiên Thạch Gọi Tên', desc: 'Thiên thạch va chạm lộ diện người được chọn', icon: '☄️', category: 'space' as GameCategory, component: MeteorGame },
  { id: 'superhero', name: 'Siêu Anh Hùng Giải Cứu', desc: 'Phá vỡ lồng năng lượng giải cứu học sinh', icon: '🦸', category: 'space' as GameCategory, component: SuperheroGame },

  // Nhóm B: Đua tốc độ và phản xạ
  { id: 'duck', name: 'Đua Vịt Sôi Động', desc: 'Cuộc đua vịt bơi về đích', icon: '🦆', category: 'speed' as GameCategory, component: DuckRace },
  { id: 'motorace', name: 'Đường Đua Moto GP', desc: 'Mô tô bật Nitro tăng tốc cán đích', icon: '🏍️', category: 'speed' as GameCategory, component: MotoRaceGame },
  { id: 'obstacle', name: 'Vượt Chướng Ngại Vật', desc: 'Nhảy qua thử thách chạm cờ chiến thắng', icon: '🏃', category: 'speed' as GameCategory, component: ObstacleJumpGame },
  { id: 'dart', name: 'Phóng Phi Tiêu', desc: 'Mũi tên hồng tâm trúng ai?', icon: '🎯', category: 'speed' as GameCategory, component: DartGame },
  { id: 'balloon', name: 'Bắn Bong Bóng', desc: 'Chọn bong bóng phát nổ bất ngờ', icon: '🎈', category: 'speed' as GameCategory, component: BalloonGame },

  // Nhóm C: Máy arcade và trò chơi may mắn
  { id: 'wheel', name: 'Vòng Quay May Mắn', desc: 'Quay bánh xe chọn ngẫu nhiên', icon: '🎡', category: 'arcade' as GameCategory, component: WheelGame },
  { id: 'claw', name: 'Máy Gắp Thú', desc: 'Cần cẩu gắp ngẫu nhiên 1 bạn', icon: '🪝', category: 'arcade' as GameCategory, component: ClawGame },
  { id: 'slot', name: 'Ba Cuộn Tên Bí Ẩn', desc: 'Kéo cần máy Arcade khớp tên', icon: '🎰', category: 'arcade' as GameCategory, component: SlotMachine },
  { id: 'gachapon', name: 'Máy Bán Bóng Capsule', desc: 'Xoay máy nhả bóng Gachapon nứt vỏ', icon: '💊', category: 'arcade' as GameCategory, component: GachaponGame },
  { id: 'whackamole', name: 'Đập Chuột Gọi Tên', desc: 'Búa đồ chơi gõ trúng ô đất may mắn', icon: '🔨', category: 'arcade' as GameCategory, component: WhackAMoleGame },
  { id: 'plinko', name: 'Bóng Pinball Plinko', desc: 'Bóng nảy qua chốt rơi vào ô tên', icon: '⚪', category: 'arcade' as GameCategory, component: PlinkoGame },
  { id: 'dice', name: 'Xúc Xắc May Rủi', desc: 'Gieo xúc xắc chọn người', icon: '🎲', category: 'arcade' as GameCategory, component: DiceGame },

  // Nhóm D: Bí ẩn và thử thách trí tuệ
  { id: 'detective', name: 'Thám Tử Tìm Danh Tính', desc: 'Kính lúp soi sáng hồ sơ manh mối', icon: '🕵️', category: 'mystery' as GameCategory, component: DetectiveGame },
  { id: 'maze', name: 'Mê Cung Lựa Chọn', desc: 'Tìm lối thoát dẫn tới cánh cửa tên', icon: '🧩', category: 'mystery' as GameCategory, component: MazeGame },
  { id: 'magicbook', name: 'Cuốn Sách Phép Thuật', desc: 'Cổ ngữ Rune bay lên ghép thành tên', icon: '📖', category: 'mystery' as GameCategory, component: MagicBookGame },
  { id: 'aiscanner', name: 'Hệ Thống AI Truy Vết', desc: 'Robot quét tia laser & mã Terminal', icon: '🤖', category: 'mystery' as GameCategory, component: AiScannerGame },
  { id: 'secretlab', name: 'Phòng Thí Nghiệm Bí Mật', desc: 'Bình hóa chất đổi màu phát nổ khói', icon: '🧪', category: 'mystery' as GameCategory, component: SecretLabGame },
  { id: 'cards', name: 'Rút Bài Tarot', desc: 'Lật lá bài định mệnh', icon: '🃏', category: 'mystery' as GameCategory, component: CardsGame },
  { id: 'envelope', name: 'Phong Bì Bí Ẩn', desc: 'Mở phong bì niêm phong sáp vàng', icon: '💌', category: 'mystery' as GameCategory, component: EnvelopeGame },
  { id: 'rain', name: 'Ma Trận Mưa Tên', desc: 'Tên rơi như ma trận kỹ thuật số', icon: '🌧️', category: 'mystery' as GameCategory, component: RainGame },

  // Nhóm E: Thế giới vui nhộn và tương tác
  { id: 'diver', name: 'Thợ Lặn Tìm Ngọc', desc: 'Mở vỏ sò dưới đáy biển lộ ngọc trai', icon: '🤿', category: 'world' as GameCategory, component: DiverPearlGame },
  { id: 'hotair', name: 'Khinh Khí Cầu May Mắn', desc: 'Khinh khí cầu bay vượt mây chạm đích', icon: '🪂', category: 'world' as GameCategory, component: HotAirBalloonGame },
  { id: 'iceskating', name: 'Trượt Băng Quanh Lớp', desc: 'Lướt quanh sân băng dừng tại tâm điểm', icon: '⛸️', category: 'world' as GameCategory, component: IceSkatingGame },
  { id: 'farm', name: 'Nông Trại Vui Vẻ', desc: 'Thú cưng đeo bảng tên chạy vào chuồng', icon: '🐄', category: 'world' as GameCategory, component: HappyFarmGame },
  { id: 'haunted', name: 'Ngôi Nhà Ma Vui Nhộn', desc: 'Cánh cửa mở ra cùng hồn ma dễ thương', icon: '👻', category: 'world' as GameCategory, component: HauntedHouseGame },

  // Nhóm F: Gameshow và hoạt động tập thể
  { id: 'gameshow', name: 'Gameshow Ai Trả Lời?', desc: 'Đèn sân khấu Spotlight quét chọn người', icon: '🎤', category: 'gameshow' as GameCategory, component: GameshowStageGame },
  { id: 'basketball', name: 'Ném Bóng Trúng Tên', desc: 'Ném bóng rổ 3 điểm vào bảng tên', icon: '🏀', category: 'gameshow' as GameCategory, component: BasketballGame },
  { id: 'penalty', name: 'Sút Penalty', desc: 'Sút bóng găm vào ô khung thành tên', icon: '⚽', category: 'gameshow' as GameCategory, component: PenaltyGame },
  { id: 'rhythmdj', name: 'Nhịp Điệu Gọi Tên', desc: 'Sóng nhạc DJ đóng băng thẻ tên ở tâm', icon: '🎵', category: 'gameshow' as GameCategory, component: RhythmDjGame },
  { id: 'heroarena', name: 'Đấu Trường Anh Hùng', desc: 'Đấu loại trực tiếp tìm nhà vô địch', icon: '⚔️', category: 'gameshow' as GameCategory, component: HeroArenaGame },
  { id: 'bomb', name: 'Bom Nổ Chậm', desc: 'Chuyền tay hồi hộp — Ai cầm khi nổ?', icon: '💣', category: 'gameshow' as GameCategory, component: BombGame },
];

const THEMES: { id: ThemeName; label: string; icon: React.ReactNode }[] = [
  { id: 'dark', label: 'Tối', icon: <Moon size={16} /> },
  { id: 'light', label: 'Sáng', icon: <Sun size={16} /> },
  { id: 'cute', label: 'Phô Mai Que', icon: <Cookie size={16} /> },
];

const CALLED_KEY = 'goiHS_calledInRound';
const NOREPEAT_KEY = 'goiHS_noRepeat';
const TTS_KEY = 'goiHS_tts';

export default function App() {
  const [students, setStudents] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [ambientOn, setAmbientOn] = useState(false);
  const [ttsOn, setTtsOn] = useState<boolean>(() => localStorage.getItem(TTS_KEY) !== 'false');
  const [noRepeat, setNoRepeat] = useState<boolean>(() => localStorage.getItem(NOREPEAT_KEY) !== 'false');
  const [calledInRound, setCalledInRound] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CALLED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [theme, setTheme] = useState<ThemeName>('dark');
  const [inputText, setInputText] = useState('');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Class management state ──
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [showClassPanel, setShowClassPanel] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showNewClassInput, setShowNewClassInput] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  useEffect(() => {
    const loadedClasses = getClasses();
    setClasses(loadedClasses);
    const savedActiveId = getActiveClassId();

    if (savedActiveId && loadedClasses.find(c => c.id === savedActiveId)) {
      setActiveClassId(savedActiveId);
      const activeClass = loadedClasses.find(c => c.id === savedActiveId)!;
      setStudents(activeClass.students);
      setInputText(activeClass.students.join('\n'));
    } else {
      const loadedStudents = getStudents();
      if (loadedStudents.length > 0) {
        setStudents(loadedStudents);
        setInputText(loadedStudents.join('\n'));
      } else {
        setStudents(SAMPLE_STUDENTS);
        setInputText(SAMPLE_STUDENTS.join('\n'));
        saveStudents(SAMPLE_STUDENTS);
      }
    }
    setHistory(getHistory());
    const savedTheme = getTheme();
    setTheme(savedTheme);

    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (ambientOn) startAmbient(theme);
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      localStorage.setItem(CALLED_KEY, JSON.stringify(calledInRound));
    } catch {}
  }, [calledInRound]);

  useEffect(() => {
    try {
      localStorage.setItem(NOREPEAT_KEY, String(noRepeat));
    } catch {}
  }, [noRepeat]);

  useEffect(() => {
    try {
      localStorage.setItem(TTS_KEY, String(ttsOn));
    } catch {}
  }, [ttsOn]);

  const speakStudentName = (name: string) => {
    if (!ttsOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(`Xin mời bạn ${name}`);
      utter.lang = 'vi-VN';
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const toggleSound = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
    setSoundEnabled(newVal);
    if (!newVal && ambientOn) {
      setAmbientOn(false);
      stopAmbient();
    }
  };

  const toggleAmbient = () => {
    const newVal = !ambientOn;
    setAmbientOn(newVal);
    setAmbientEnabled(newVal);
    if (newVal) {
      if (!soundOn) {
        setSoundOn(true);
        setSoundEnabled(true);
      }
      startAmbient(theme);
    } else {
      stopAmbient();
    }
  };

  const cycleTheme = () => {
    const i = THEMES.findIndex(t => t.id === theme);
    const next = THEMES[(i + 1) % THEMES.length];
    setTheme(next.id);
  };

  const updateStudents = (newStudents: string[]) => {
    setStudents(newStudents);
    setInputText(newStudents.join('\n'));
    saveStudents(newStudents);
    setCalledInRound(prev => prev.filter(n => newStudents.includes(n)));
    if (activeClassId) {
      const updated = updateClassStudents(activeClassId, newStudents);
      setClasses(updated);
    }
  };

  const handleParseTextarea = () => {
    const newStudents = inputText.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 80);
    updateStudents(newStudents);
  };

  const handleClearList = () => updateStudents([]);
  const handleLoadSample = () => updateStudents(SAMPLE_STUDENTS);
  const handleRemoveStudent = (i: number) => updateStudents(students.filter((_, idx) => idx !== i));

  // ── Class management handlers ──
  const handleCreateClass = () => {
    const name = newClassName.trim();
    if (!name) return;
    const updated = addClass(name, students);
    setClasses(updated);
    setActiveClassId(updated[updated.length - 1].id);
    setNewClassName('');
    setShowNewClassInput(false);
  };

  const handleDeleteClass = (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lớp này?')) return;
    const updated = deleteClass(id);
    setClasses(updated);
    const newActiveId = getActiveClassId();
    setActiveClassId(newActiveId);
    if (newActiveId) {
      const cls = updated.find(c => c.id === newActiveId);
      if (cls) {
        setStudents(cls.students);
        setInputText(cls.students.join('\n'));
        saveStudents(cls.students);
      }
    } else {
      setStudents([]);
      setInputText('');
      saveStudents([]);
    }
  };

  const handleSelectClass = (id: string) => {
    setActiveClassId(id);
    saveActiveClassId(id);
    const cls = classes.find(c => c.id === id);
    if (cls) {
      setStudents(cls.students);
      setInputText(cls.students.join('\n'));
      saveStudents(cls.students);
      setCalledInRound([]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      let newStudents: string[] = [];
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
        rows.forEach(r => {
          for (let cell of r) {
            const v = String(cell).trim();
            if (v && !/^\d+$/.test(v) && v.length < 80 && !/^(stt|số thứ tự|họ và tên|họ tên|name|tên)$/i.test(v)) {
              newStudents.push(v);
              break;
            }
          }
        });
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        newStudents = result.value.split(/\r?\n/).map(s => s.trim()).filter(s => s && s.length < 80 && !/^(stt|họ và tên|danh sách)$/i.test(s));
      } else if (ext === 'txt') {
        const text = await file.text();
        newStudents = text.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0);
      }

      if (newStudents.length > 0) updateStudents(newStudents);
      else alert('Không tìm thấy tên nào trong file.');
    } catch (err: any) {
      alert('Lỗi đọc file: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearHistory = () => {
    clearStorageHistory();
    setHistory([]);
  };

  const handleResetRound = () => {
    setCalledInRound([]);
    setWinner(null);
  };

  const handleUndoLastCalled = () => {
    setCalledInRound(prev => prev.slice(0, -1));
    setWinner(null);
  };

  // Eligible students for the current spin
  const uncalledStudents = students.filter(s => !calledInRound.includes(s));
  const eligibleStudents = noRepeat ? (uncalledStudents.length > 0 ? uncalledStudents : students) : students;

  const openGame = (id: string) => {
    if (students.length === 0) {
      alert('Vui lòng thêm học sinh vào danh sách trước khi quay!');
      return;
    }
    if (noRepeat && uncalledStudents.length === 0) {
      setCalledInRound([]);
    }
    setWinner(null);
    setActiveGameId(id);
  };

  const handleWinner = (w: string) => {
    setWinner(w);
    setHistory(addHistory(w));
    if (noRepeat) {
      setCalledInRound(prev => (prev.includes(w) ? prev : [...prev, w]));
    }
    playWin();
    speakStudentName(w);
    confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 80, origin: { x: 0 } }), 250);
    setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 80, origin: { x: 1 } }), 500);
    setTimeout(() => confetti({ particleCount: 80, spread: 120, startVelocity: 55, origin: { y: 0.4 } }), 800);
  };

  const filteredGames = selectedCategory === 'all'
    ? GAMES
    : GAMES.filter(g => g.category === selectedCategory);

  const activeGame = activeGameId ? GAMES.find(g => g.id === activeGameId) : null;
  const ActiveGameComponent = activeGame?.component;
  const currentThemeInfo = THEMES.find(t => t.id === theme)!;

  return (
    <div className="min-h-screen text-brand p-4 md:p-6 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full relative z-10">
        {/* Header */}
        <header className="flex flex-col xl:flex-row justify-between items-center mb-2 glass p-4 gap-4">
          <div className="flex items-center gap-3.5 w-full xl:w-auto">
            {/* Logo & Avatar */}
            <div
              onClick={() => setShowAuthorModal(true)}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
              title="Xem thông tin tác giả Trần Thị Kim Thoa"
            >
              <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md border border-accent-soft flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img
                  src="/logo.jpg"
                  alt="Logo Trần Thị Kim Thoa"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="relative">
                <img
                  src="/avatar.jpg"
                  alt="GV Trần Thị Kim Thoa"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-accent shadow-md transition-transform group-hover:scale-105"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow border border-white">
                  <GraduationCap size={11} />
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                <h1 className="text-xs font-bold tracking-widest uppercase text-brand-muted">
                  Hệ Thống Gọi Tên Học Sinh
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-accent-soft text-accent border border-accent-soft">
                  PRO
                </span>
              </div>
              <p className="text-lg sm:text-xl font-black text-brand uppercase tracking-wider leading-tight mt-0.5">
                🎯 {GAMES.length} CHẾ ĐỘ NGẪU NHIÊN
              </p>
              <div className="text-[11px] mt-1 text-brand-muted leading-snug">
                <span className="font-bold text-brand">Giáo viên: Trần Thị Kim Thoa</span>
                <span className="mx-1.5 text-brand-faint">•</span>
                <span className="text-accent font-semibold">Trường THPT Hoàng Diệu</span>
                <p className="text-[10px] text-brand-faint mt-0.5">
                  📍 Số 1 Mạc Đĩnh Chi, phường Phú Lợi, thành phố Cần Thơ
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 items-center flex-wrap xl:flex-nowrap justify-center shrink-0">
            <div className="text-right hidden sm:block px-1">
              <p className="text-[10px] text-brand-faint uppercase">Sĩ số</p>
              <p className="text-base font-mono text-accent">{students.length}</p>
            </div>
            <div className="text-right hidden sm:block px-1">
              <p className="text-[10px] text-brand-faint uppercase">Chưa gọi</p>
              <p className="text-base font-mono text-emerald-400">{uncalledStudents.length}</p>
            </div>
            <div className="text-right hidden sm:block px-1">
              <p className="text-[10px] text-brand-faint uppercase">Đã gọi</p>
              <p className="text-base font-mono text-warn">{history.length}</p>
            </div>
            <div className="h-9 w-[1px] bg-brand-muted/20 hidden sm:block" />

            <button
              onClick={() => setNoRepeat(v => !v)}
              className={`glass px-2.5 py-2 hover-bg-surface-strong transition-all flex flex-col items-center justify-center gap-1 min-w-[68px] ${
                noRepeat ? 'border-accent' : ''
              }`}
              title="Bật/Tắt chế độ chống gọi trùng trong vòng"
            >
              <ShieldCheck size={17} className={noRepeat ? 'text-accent' : 'text-brand-faint'} />
              <span className="text-[9px] font-bold uppercase whitespace-nowrap">
                {noRepeat ? 'Chống trùng: ON' : 'Chống trùng: OFF'}
              </span>
            </button>

            <button
              onClick={() => setTtsOn(v => !v)}
              className="glass px-2.5 py-2 hover-bg-surface-strong transition-all flex flex-col items-center justify-center gap-1 min-w-[64px]"
              title="Bật/Tắt giọng đọc tên tiếng Việt"
            >
              {ttsOn ? <Mic size={17} className="text-accent" /> : <MicOff size={17} className="text-brand-faint" />}
              <span className="text-[9px] font-bold uppercase whitespace-nowrap">{ttsOn ? 'Đọc tên: ON' : 'Đọc tên: OFF'}</span>
            </button>

            <button
              onClick={cycleTheme}
              className="glass px-2.5 py-2 hover-bg-surface-strong transition-all text-brand-muted flex flex-col items-center justify-center gap-1 min-w-[62px]"
              title="Đổi giao diện"
            >
              <span className="text-accent">{currentThemeInfo.icon}</span>
              <span className="text-[9px] font-bold uppercase whitespace-nowrap">{currentThemeInfo.label}</span>
            </button>

            <button
              onClick={toggleAmbient}
              className="glass px-2.5 py-2 hover-bg-surface-strong transition-all flex flex-col items-center justify-center gap-1 min-w-[62px]"
              title="Bật/Tắt nhạc nền"
            >
              {ambientOn ? <Music2 size={17} className="text-warn" /> : <Music size={17} className="text-brand-faint" />}
              <span className="text-[9px] font-bold uppercase whitespace-nowrap">{ambientOn ? 'Nhạc: ON' : 'Nhạc: OFF'}</span>
            </button>

            <button
              onClick={toggleSound}
              className="glass px-2.5 py-2 hover-bg-surface-strong transition-all flex flex-col items-center justify-center gap-1 min-w-[64px]"
              title="Bật/Tắt âm thanh"
            >
              {soundOn ? <Volume2 size={17} className="text-accent" /> : <VolumeX size={17} className="text-danger" />}
              <span className="text-[9px] font-bold uppercase whitespace-nowrap">{soundOn ? 'Âm thanh: ON' : 'Âm thanh: OFF'}</span>
            </button>

            <button
              onClick={() => setShowAuthorModal(true)}
              className="glass px-2.5 py-2 hover-bg-surface-strong border-warn-soft hover:border-warn transition-all flex items-center gap-2 min-h-[48px]"
              title="Thông tin Tác giả & Bản quyền"
            >
              <img
                src="/avatar.jpg"
                alt="GV Trần Thị Kim Thoa"
                className="w-7 h-7 rounded-full object-cover border border-warn shrink-0"
              />
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-black uppercase text-warn tracking-wider whitespace-nowrap">Tác Giả</span>
                <span className="block text-[9px] font-semibold text-brand-muted whitespace-nowrap">Kim Thoa</span>
              </div>
            </button>

            <button
              onClick={toggleFullscreen}
              className="glass px-2.5 py-2 hover-bg-surface-strong transition-all flex flex-col items-center justify-center gap-1 min-w-[60px]"
              title="Toàn màn hình máy chiếu"
            >
              {isFullscreen ? <Minimize2 size={17} className="text-warn" /> : <Maximize2 size={17} className="text-accent" />}
              <span className="text-[9px] font-bold uppercase whitespace-nowrap">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn'}</span>
            </button>
          </div>
        </header>

        <main className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Left column: Student list */}
          <section className="lg:w-80 flex flex-col gap-4">
            {/* ── Class Manager Panel ── */}
            <div className="glass p-4 flex flex-col">
              <button
                onClick={() => setShowClassPanel(!showClassPanel)}
                className="flex items-center justify-between w-full mb-0"
              >
                <h3 className="text-[11px] font-bold text-brand-faint uppercase tracking-widest flex items-center gap-2">
                  <FolderOpen className="text-warn" size={14} /> Quản lý lớp
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-warn bg-warn-soft px-2 py-0.5 rounded border border-warn-soft">
                    {classes.length} lớp
                  </span>
                  {showClassPanel ? <ChevronUp size={14} className="text-brand-faint" /> : <ChevronDown size={14} className="text-brand-faint" />}
                </div>
              </button>

              {showClassPanel && (
                <div className="mt-3 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                  {!showNewClassInput ? (
                    <button
                      onClick={() => setShowNewClassInput(true)}
                      className="w-full flex items-center justify-center gap-2 bg-accent-soft hover-bg-accent-mid border border-accent-soft text-accent px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <Plus size={14} /> Tạo lớp mới
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreateClass()}
                        placeholder="Tên lớp (VD: 10A1)"
                        className="flex-1 bg-surface-code border border-brand-strong rounded-lg px-3 py-2 text-sm text-brand placeholder:text-brand-faint focus-border-accent"
                        autoFocus
                      />
                      <button
                        onClick={handleCreateClass}
                        className="bg-accent-soft hover-bg-accent-mid border border-accent-soft text-accent px-3 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => { setShowNewClassInput(false); setNewClassName(''); }}
                        className="bg-surface-item hover-bg-surface-strong border border-brand text-brand-faint px-3 py-2 rounded-lg text-xs font-bold transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {classes.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-[200px] pr-1">
                      {classes.map(cls => (
                        <div
                          key={cls.id}
                          className={`p-3 rounded-lg border flex items-center justify-between group cursor-pointer transition-all ${
                            activeClassId === cls.id
                              ? 'bg-accent-soft border-accent glow-blue'
                              : 'bg-surface-item border-brand hover-border-accent hover-bg-accent-soft'
                          }`}
                          onClick={() => handleSelectClass(cls.id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Users size={16} className={activeClassId === cls.id ? 'text-accent' : 'text-brand-faint'} />
                            <div className="min-w-0">
                              <p className={`text-sm font-bold truncate ${activeClassId === cls.id ? 'text-accent' : 'text-brand'}`}>
                                {cls.name}
                              </p>
                              <p className="text-[10px] text-brand-faint font-mono">
                                {cls.students.length} học sinh
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                            className="text-brand-faint hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-danger-soft"
                            title="Xóa lớp"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-code rounded-lg p-3 text-[10px] font-mono text-brand-faint text-center">
                      Chưa có lớp nào. Nhập danh sách HS rồi bấm "Tạo lớp mới".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Student List Panel ── */}
            <div className="glass p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-brand-faint uppercase tracking-widest flex items-center gap-2">
                  <FileText className="text-accent" size={14} />
                  {activeClassId && classes.find(c => c.id === activeClassId)
                    ? classes.find(c => c.id === activeClassId)!.name
                    : 'Danh sách lớp'}
                </h3>
                <span className="text-[10px] font-mono text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent-soft">
                  {uncalledStudents.length}/{students.length} chưa gọi
                </span>
              </div>

              {/* Round Controls (Reset / Undo) */}
              {calledInRound.length > 0 && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleUndoLastCalled}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-surface-item hover-bg-surface-strong border border-brand text-brand-muted px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    title="Hoàn tác học sinh vừa gọi"
                  >
                    <Undo2 size={13} /> Hoàn tác
                  </button>
                  <button
                    onClick={handleResetRound}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-warn-soft hover-bg-warn-mid border border-warn-soft text-warn px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    title="Đặt lại vòng gọi mới"
                  >
                    <RotateCcw size={13} /> Đặt lại vòng ({calledInRound.length})
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv,.docx,.txt" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent-soft hover-bg-accent-mid border border-accent-soft text-accent px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Upload size={14} /> Tải file
                </button>
                <button
                  onClick={handleLoadSample}
                  className="flex-1 flex items-center justify-center gap-2 bg-surface-item hover-bg-surface-strong border border-brand text-brand-muted px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Shuffle size={14} /> Mẫu
                </button>
                <button
                  onClick={handleClearList}
                  className="flex items-center justify-center gap-2 bg-danger-soft hover-bg-danger-mid border border-danger-soft text-danger px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Dán danh sách học sinh ở đây (mỗi dòng 1 tên)..."
                className="w-full h-28 flex-shrink-0 bg-surface-code border border-brand-strong rounded-xl p-3 text-sm focus-border-accent focus-ring-accent placeholder:text-brand-faint mb-3 text-brand"
              />

              <button
                onClick={handleParseTextarea}
                className="w-full py-2.5 bg-accent-mid hover-bg-accent-soft border border-accent rounded-xl text-xs font-bold uppercase tracking-widest text-accent glow-blue transition-all active:scale-95 mb-4"
              >
                Cập nhật danh sách
              </button>

              {students.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[260px]">
                    {students.map((student, idx) => {
                      const isCalled = calledInRound.includes(student);
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg bg-surface-item border flex justify-between items-center group transition-colors ${
                            isCalled && noRepeat
                              ? 'border-brand opacity-50'
                              : 'border-brand hover-border-accent hover-bg-accent-soft'
                          }`}
                        >
                          <span className={`text-sm font-medium truncate pr-2 ${isCalled && noRepeat ? 'line-through text-brand-muted' : 'text-brand'}`}>
                            <span className="text-brand-faint text-xs mr-2 font-mono">{String(idx + 1).padStart(2, '0')}.</span>
                            {student}
                          </span>
                          <div className="flex items-center gap-1">
                            {isCalled && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-warn-soft text-warn">
                                Đã gọi
                              </span>
                            )}
                            <button onClick={() => handleRemoveStudent(idx)} className="text-brand-faint hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Center: Games grid with Category filter */}
          <section className="flex-1 flex flex-col gap-6 w-full">
            <div className="glass p-6 flex flex-col relative h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-[11px] font-bold text-brand-faint uppercase tracking-widest flex items-center gap-2">
                  <Gamepad2 className="text-warn" size={14} />
                  Thư viện Mini Game ({filteredGames.length}/{GAMES.length})
                </h3>
              </div>

              {/* Category Filter Bar */}
              <div className="flex flex-wrap gap-2 mb-5">
                {CATEGORIES.map(cat => {
                  const active = selectedCategory === cat.id;
                  const count = cat.id === 'all' ? GAMES.length : GAMES.filter(g => g.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        active
                          ? 'bg-accent-mid border-accent text-accent glow-blue'
                          : 'bg-surface-item border-brand text-brand-muted hover-border-accent'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className="text-[10px] font-mono opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 overflow-y-auto custom-scrollbar pb-4 pr-1 max-h-[640px]">
                {filteredGames.map(game => (
                  <button
                    key={game.id}
                    onClick={() => openGame(game.id)}
                    className="glass p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-105 active:scale-95 hover-border-accent group relative overflow-hidden min-h-[124px]"
                  >
                    <div className="absolute inset-0 bg-accent-soft opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-3xl mb-2 group-hover:-translate-y-1 transition-transform drop-shadow-md relative z-10">{game.icon}</span>
                    <span className="font-bold text-xs mb-1 text-brand uppercase tracking-wider relative z-10">{game.name}</span>
                    <span className="text-[10px] text-brand-muted line-clamp-1 relative z-10">{game.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right: History */}
          <aside className="lg:w-64 flex flex-col gap-6">
            <div className="glass p-5 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-brand-faint uppercase tracking-widest flex items-center gap-2">
                  <History className="text-warn" size={14} />
                  Lịch sử gọi
                </h3>
                <button onClick={handleClearHistory} className="text-[9px] uppercase font-bold text-brand-faint hover:text-danger transition-colors">Xóa</button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[380px]">
                {history.length > 0 ? history.slice().reverse().map((h, i) => (
                  <div key={h.id} className={`border-l-2 ${i === 0 ? 'border-warn' : 'border-brand opacity-60'} pl-3 py-1 flex flex-col`}>
                    <p className="text-[10px] text-brand-faint font-mono tracking-widest">{h.timeString}</p>
                    <p className={`text-sm ${i === 0 ? 'font-bold text-warn' : 'font-medium text-brand-muted'}`}>{h.name}</p>
                  </div>
                )) : (
                  <div className="bg-surface-code rounded-lg p-3 text-[10px] font-mono text-brand-faint">
                    <p>{'>'} CHƯA CÓ DỮ LIỆU</p>
                    <p>{'>'} ĐANG CHỜ...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-brand space-y-3">
                <div
                  onClick={() => setShowAuthorModal(true)}
                  className="bg-surface-item hover-bg-surface-strong border border-brand hover-border-accent rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all group"
                  title="Xem thông tin tác giả"
                >
                  <img
                    src="/avatar.jpg"
                    alt="GV Trần Thị Kim Thoa"
                    className="w-11 h-11 rounded-xl object-cover border border-accent shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-accent">Giáo viên phát triển</p>
                    <p className="text-xs font-extrabold text-brand truncate">Trần Thị Kim Thoa</p>
                    <p className="text-[10px] text-brand-muted truncate">THPT Hoàng Diệu • Cần Thơ</p>
                  </div>
                  <img
                    src="/logo.jpg"
                    alt="Logo"
                    className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain border border-brand shrink-0"
                  />
                </div>

                <div className="bg-surface-code rounded-lg p-3 text-[10px] font-mono text-accent leading-relaxed uppercase">
                  <p>{'>'} HỆ THỐNG SẴN SÀNG</p>
                  <p className={noRepeat ? "text-emerald-400" : "text-brand-faint"}>
                    {`> CHỐNG TRÙNG: ${noRepeat ? `BẬT (${uncalledStudents.length} CÒN LẠI)` : 'TẮT'}`}
                  </p>
                  <p className={soundOn ? "" : "text-brand-faint"}>{`> AUDIO: ${soundOn ? 'ĐÃ KẾT NỐI' : 'ĐÃ NGẮT'}`}</p>
                  <p className={ambientOn ? "text-warn" : "text-brand-faint"}>{`> NHẠC NỀN: ${ambientOn ? 'ĐANG PHÁT' : 'TẮT'}`}</p>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* Author & Copyright Modal */}
      {showAuthorModal && (
        <div
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAuthorModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-indigo-500/30 bg-[#0d1226]/95 text-slate-100 shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Section */}
            <div className="p-6 pb-5 border-b border-slate-800/80 text-center relative bg-gradient-to-b from-indigo-950/50 to-transparent">
              <button
                onClick={() => setShowAuthorModal(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                title="Đóng"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-indigo-400/30 bg-indigo-500/10 text-[11px] font-bold uppercase tracking-wider text-indigo-200 mb-3">
                <Sparkles size={13} className="text-amber-400" />
                Thông Tin Tác Giả & Bản Quyền
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Tác Giả Ứng Dụng
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Dự án công nghệ giáo dục đổi mới sáng tạo trong dạy học
              </p>
            </div>

            {/* Body Section */}
            <div className="p-6 space-y-4">
              {/* Teacher Profile Card */}
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative shrink-0">
                  <img
                    src="/avatar.jpg"
                    alt="Cô Trần Thị Kim Thoa"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-indigo-400/60 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-slate-900">
                    <GraduationCap size={16} />
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                    Giáo Viên Phát Triển
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
                    <span>Trần Thị Kim Thoa</span>
                    <span className="text-lg">👩‍🏫</span>
                  </h3>

                  <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                    <img
                      src="/logo.jpg"
                      alt="Logo Trần Thị Kim Thoa"
                      className="w-7 h-7 rounded-md bg-white p-0.5 object-contain shadow-sm"
                    />
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-100">
                      <School size={15} className="text-amber-400 shrink-0" />
                      Trường THPT Hoàng Diệu
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 flex items-start justify-center sm:justify-start gap-1.5 leading-relaxed">
                    <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Số 1 Mạc Đĩnh Chi, phường Phú Lợi, thành phố Cần Thơ</span>
                  </p>
                </div>
              </div>

              {/* Mission Card */}
              <div className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 sm:p-5 space-y-2">
                <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-400 fill-rose-400" />
                  Sứ mệnh ứng dụng:
                </p>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed text-justify">
                  Ứng dụng <strong className="text-white">Hệ Thống Gọi Tên Học Sinh — 38 Chế Độ Ngẫu Nhiên PRO</strong> được phát triển nhằm hỗ trợ quý thầy cô giáo khuấy động không khí lớp học, kích thích sự hứng thú và chủ động của học sinh thông qua 38 trò chơi tương tác gọi tên ngẫu nhiên, đọc tên tiếng Việt tự động (Web Speech TTS), quản lý đa lớp học, chống gọi trùng thông minh và hiệu ứng âm thanh Tone.js sống động.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowAuthorModal(false)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99]"
              >
                Đóng Cửa Sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {activeGameId && activeGame && ActiveGameComponent && (
        <div className="fixed inset-0 z-[100] bg-modal-backdrop backdrop-blur-md flex items-center justify-center p-4 xl:p-8 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-full max-h-[92vh] glass glow-blue border-accent flex flex-col relative overflow-hidden">
            <div className="p-4 border-b border-accent-soft flex justify-between items-center bg-surface-strong z-10">
              <div>
                <h2 className="text-lg font-bold text-accent uppercase tracking-widest flex items-center gap-3">
                  <span className="text-2xl">{activeGame.icon}</span>
                  {activeGame.name}
                </h2>
                <p className="text-[11px] text-brand-muted">{activeGame.desc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-brand-faint uppercase tracking-wider hidden sm:block">
                  ĐỦ ĐIỀU KIỆN: {eligibleStudents.length} HS
                </span>
                <button
                  onClick={() => setActiveGameId(null)}
                  className="w-10 h-10 rounded-xl bg-danger-soft hover-bg-danger-mid text-danger border border-danger-soft flex items-center justify-center transition-all active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center relative bg-modal">
              <ActiveGameComponent
                students={eligibleStudents}
                onWinner={handleWinner}
                onClose={() => setActiveGameId(null)}
              />

              {winner && (
                <div className="mt-8 animate-in zoom-in slide-in-from-bottom-8 duration-500 relative z-20 w-full max-w-md">
                  <div className="glass p-6 glow-orange text-center border-warn bg-warn-soft relative overflow-hidden">
                    <div className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-warn mb-2 relative z-10">
                      🎉 Học sinh được chọn 🎉
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-brand px-2 py-3 relative z-10">
                      {winner}
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 relative z-10">
                      <button
                        onClick={() => speakStudentName(winner)}
                        className="px-3 py-1.5 bg-surface-strong hover:brightness-110 border border-warn-soft rounded-full text-warn font-mono text-xs uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Volume2 size={14} /> Đọc tên
                      </button>
                      <button
                        onClick={() => setWinner(null)}
                        className="px-3 py-1.5 bg-surface-strong hover:brightness-110 border border-brand rounded-full text-brand-muted font-mono text-xs uppercase tracking-wider"
                      >
                        Ẩn bảng kết quả
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
