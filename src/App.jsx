import React, { useState, useEffect } from 'react';
import {
  Heart, Sword, ShieldAlert, Skull, Play, RefreshCw,
  Trophy, ChevronLeft, Link as LinkIcon, Check, LogOut, X, Home,
  ShoppingBag, Coins, Languages
} from 'lucide-react';

import { fetchLeaderboard, submitScore, signup, login, saveProgress } from './leaderboardApi';
import en from '../locales/en.toml';
import he from '../locales/he.toml';

const LOCALES = { en, he };

// ----------------------------------------

const SKINS = [
  {
    id: 'default', price: 0,
    bg: 'bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]', border: 'border-slate-200',
    goodColor: 'text-red-600', badColor: 'text-slate-900',
    font: 'font-sans', rounded: 'rounded-xl', shadow: 'shadow-lg'
  },
  {
    id: 'obsidian', price: 100,
    bg: 'bg-slate-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]', border: 'border-slate-600',
    goodColor: 'text-red-400', badColor: 'text-slate-300',
    font: 'font-sans', rounded: 'rounded-md', shadow: 'shadow-xl'
  },
  {
    id: 'gilded', price: 250,
    bg: 'bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-400 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.6),transparent_50%)]', border: 'border-yellow-500 border-2',
    goodColor: 'text-red-700', badColor: 'text-amber-950',
    font: 'font-serif', rounded: 'rounded-sm', shadow: 'shadow-2xl',
    numeralSystem: 'roman'
  },
  {
    id: 'blood', price: 400,
    bg: 'bg-red-950 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.4)_0,transparent_100%),repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]', border: 'border-red-900 border-2',
    goodColor: 'text-red-400', badColor: 'text-slate-300',
    font: 'font-serif', rounded: 'rounded-sm', shadow: 'shadow-[0_0_15px_rgba(153,27,27,0.5)]',
    icons: { hearts: '🩸', diamonds: '🗡️', clubs: '🐺', spades: '🦇' }
  },
  {
    id: 'druid', price: 500,
    bg: 'bg-green-950 bg-[radial-gradient(#14532d_1px,transparent_1px)] [background-size:16px_16px]', border: 'border-green-800 border-2',
    goodColor: 'text-emerald-400', badColor: 'text-amber-700',
    font: 'font-serif', rounded: 'rounded-xl', shadow: 'shadow-[0_0_10px_rgba(20,83,45,0.8)]',
    icons: { hearts: '💚', diamonds: '🌿', clubs: '🐺', spades: '🐻' }
  },
  {
    id: 'cyber', price: 750,
    bg: 'bg-slate-950 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#ec4899_1px,transparent_1px)] [background-size:1.5rem_1.5rem] [background-position:center_center]', border: 'border-cyan-500 border-2 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    goodColor: 'text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]', badColor: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]',
    font: 'font-mono uppercase', rounded: 'rounded-none', shadow: 'shadow-none',
    numeralSystem: 'binary'
  },
  {
    id: 'frost', price: 900,
    bg: 'bg-cyan-50 bg-[radial-gradient(circle_at_50%_50%,rgba(103,232,249,0.2)_0%,transparent_50%),linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.8)_50%,transparent_55%)] [background-size:100%_100%,20px_20px]', border: 'border-cyan-300 border-2',
    goodColor: 'text-blue-500', badColor: 'text-cyan-800',
    font: 'font-sans', rounded: 'rounded-lg', shadow: 'shadow-[0_0_15px_rgba(103,232,249,0.5)]',
    icons: { hearts: '💙', diamonds: '🧊', clubs: '🥶', spades: '❄️' }
  },
  {
    id: 'pirate', price: 1200,
    bg: 'bg-[#e6d5a7] bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(139,90,43,0.1)_40px,rgba(139,90,43,0.1)_80px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_0%,transparent_100%)]', border: 'border-[#8b5a2b] border-4',
    goodColor: 'text-red-800', badColor: 'text-[#3e2723]',
    font: 'font-serif font-bold', rounded: 'rounded-none', shadow: 'shadow-2xl',
    icons: { hearts: '🍎', diamonds: '⚔️', clubs: '🐙', spades: '☠️' }
  },
  {
    id: 'steampunk', price: 1500,
    bg: 'bg-[#3e2723] bg-[radial-gradient(circle_at_30%_30%,rgba(255,179,0,0.2)_0%,transparent_30%),radial-gradient(circle_at_70%_70%,rgba(255,179,0,0.15)_0%,transparent_40%),repeating-linear-gradient(45deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_2px,transparent_2px,transparent_4px)]', border: 'border-[#ffb300] border-4',
    goodColor: 'text-[#ffb300]', badColor: 'text-[#bcaaa4]',
    font: 'font-serif font-bold', rounded: 'rounded-md', shadow: 'shadow-2xl',
    icons: { hearts: '🤎', diamonds: '🔧', clubs: '⚙️', spades: '🕰️' }
  },
  {
    id: 'arcade', price: 2000,
    bg: 'bg-black bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.15)_0,transparent_100%),repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(163,230,53,0.1)_2px,rgba(163,230,53,0.1)_4px)]', border: 'border-fuchsia-500 border-2 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
    goodColor: 'text-lime-400 drop-shadow-[0_0_8px_rgba(163,230,53,1)]', badColor: 'text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,1)]',
    font: 'font-mono font-black', rounded: 'rounded-sm', shadow: 'shadow-none',
    icons: { hearts: '💖', diamonds: '💎', clubs: '👾', spades: '🛸' },
    numeralSystem: 'binary'
  },
  {
    id: 'monochrome', price: 2500,
    bg: 'bg-zinc-950 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.05)_5px,rgba(255,255,255,0.05)_10px)]', border: 'border-zinc-300 border-2',
    goodColor: 'text-white', badColor: 'text-zinc-500',
    font: 'font-mono', rounded: 'rounded-none', shadow: 'shadow-none',
    icons: { hearts: '🤍', diamonds: '🔪', clubs: '🎱', spades: '🕷️' },
    numeralSystem: 'hex'
  },
  {
    id: 'hologram', price: 3000,
    bg: 'bg-gradient-to-tr from-cyan-200 via-fuchsia-200 to-yellow-200 bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_0%,transparent_20%,transparent_80%,rgba(255,255,255,0.5)_100%),repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.3)_2px,rgba(255,255,255,0.3)_4px)] backdrop-blur-sm opacity-90', border: 'border-white/60 border-2 backdrop-blur-sm',
    goodColor: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]', badColor: 'text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]',
    font: 'font-sans italic font-black', rounded: 'rounded-3xl', shadow: 'shadow-xl',
    icons: { hearts: '🫧', diamonds: '✨', clubs: '🌪️', spades: '🌑' }
  },
  {
    id: 'toxic', price: 3500,
    bg: 'bg-lime-950 bg-[radial-gradient(circle_at_50%_0%,rgba(132,204,22,0.3)_0,transparent_50%),radial-gradient(circle_at_0%_100%,rgba(22,163,74,0.3)_0,transparent_50%)]', border: 'border-lime-500 border-2 border-dashed',
    goodColor: 'text-lime-400 drop-shadow-[0_0_5px_rgba(132,204,22,0.8)]', badColor: 'text-green-700',
    font: 'font-mono font-bold', rounded: 'rounded-sm', shadow: 'shadow-[0_0_20px_rgba(132,204,22,0.4)]',
    icons: { hearts: '🧪', diamonds: '💉', clubs: '🧟', spades: '☣️' }
  },
  {
    id: 'desert', price: 4000,
    bg: 'bg-amber-100 bg-[repeating-linear-gradient(0deg,rgba(217,119,6,0.05)_0px,rgba(217,119,6,0.05)_1px,transparent_1px,transparent_10px)]', border: 'border-yellow-600 border-2',
    goodColor: 'text-red-700', badColor: 'text-amber-900',
    font: 'font-serif', rounded: 'rounded-sm', shadow: 'shadow-md',
    icons: { hearts: '🏺', diamonds: '🪃', clubs: '🦂', spades: '🐍' },
    numeralSystem: 'roman'
  },
  {
    id: 'deltarune',
    price: 4500,
    // Dark World floor pattern (checkered purple/black)
    bg: 'bg-[#0f0714] bg-[linear-gradient(45deg,#1a0d24_25%,transparent_25%,transparent_50%,#1a0d24_50%,#1a0d24_75%,transparent_75%,transparent)] [background-size:24px_24px]',
    border: 'border-[#ff00ff] border-2 shadow-[0_0_10px_rgba(255,0,255,0.4)]',
    // Good: Soul Red/Pink | Bad: Darkner Purple/Shadow
    goodColor: 'text-[#ff0037] drop-shadow-[0_0_5px_rgba(255,0,55,0.8)]',
    badColor: 'text-[#a44cd3] drop-shadow-[0_0_5px_rgba(164,76,211,0.8)]',
    font: 'font-mono uppercase',
    rounded: 'rounded-none', // Sharp retro corners
    shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,0.6)]',
    icons: {
      hearts: '❤️',
      diamonds: '🪓'
      clubs: '👁️‍🗨️',
      spades: '▬ι═ﺤ'
    },
    numeralSystem: 'default'
  },
  {
    id: 'infernal', price: 5000,
    bg: 'bg-orange-950 bg-[radial-gradient(ellipse_at_bottom,rgba(234,88,12,0.5)_0,transparent_60%),repeating-radial-gradient(circle_at_50%_100%,transparent,transparent_5px,rgba(0,0,0,0.2)_5px,rgba(0,0,0,0.2)_10px)]', border: 'border-orange-600 border-t-4 border-b-4',
    goodColor: 'text-orange-400 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]', badColor: 'text-red-800',
    font: 'font-serif font-black', rounded: 'rounded-none', shadow: 'shadow-[0_0_30px_rgba(234,88,12,0.6)]',
    icons: { hearts: '❤️‍🔥', diamonds: '🔱', clubs: '👹', spades: '😈' }
  },
  {
    id: 'celeste',
    price: 5500,
    // Midnight blue with a subtle "pixel snow" starfield
    bg: 'bg-[#0b0e1a] bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:20px_20px]',
    border: 'border-[#ff406e] border-2 shadow-[0_0_15px_rgba(255,64,110,0.3)]',
    goodColor: 'text-[#ff406e] drop-shadow-[0_0_3px_rgba(255,64,110,0.8)]',
    badColor: 'text-[#33f7ff] drop-shadow-[0_0_3px_rgba(51,247,255,0.8)]',
    font: 'font-mono uppercase tracking-tighter',
    rounded: 'rounded-none', // Pixel-art sharp edges
    shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]',
    icons: {
      hearts: '💙',
      diamonds: '🍓',
      clubs: '🏔️',
      spades: '📼',
    },
    numeralSystem: 'default'
  },
  {
    id: 'samurai', price: 6000,
    bg: 'bg-neutral-100 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05)_0%,transparent_100%),repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]', border: 'border-red-700 border-l-8 border-r-8',
    goodColor: 'text-red-600', badColor: 'text-neutral-900',
    font: 'font-serif', rounded: 'rounded-none', shadow: 'shadow-xl',
    icons: { hearts: '⛩️', diamonds: '🗡️', clubs: '👺', spades: '🐉' },
    numeralSystem: 'kanji'
  },
  {
    id: 'minecraft',
    price: 6500,
    // Creates a grass block look: a green strip at the top, dirt brown below
    bg: 'bg-[#745A36] bg-[linear-gradient(to_bottom,#5E8A3F_15%,transparent_15%)]',
    // Thick, dark dirt-colored border
    border: 'border-[#3C2812] border-4',
    // Diamond blue for good, Damage red for bad, both with hard black drop shadows
    goodColor: 'text-[#55FFFF] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]',
    badColor: 'text-[#FF5555] drop-shadow-[2px_2px_0_rgba(0,0,0,1)]',
    font: 'font-mono font-black uppercase',
    rounded: 'rounded-none', // Perfect blocks
    shadow: 'shadow-[6px_6px_0_rgba(0,0,0,0.5)]',
    icons: {
      hearts: '🍎',
      diamonds: '💎',
      clubs: '🧟',
      spades: '🕷'
    },
    numeralSystem: 'default'
  },
  {
    id: 'celestial', price: 7500,
    bg: 'bg-indigo-950 bg-[radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:20px_20px] [background-position:0_0,10px_10px]', border: 'border-purple-400 border-2',
    goodColor: 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]', badColor: 'text-indigo-300',
    font: 'font-sans font-light tracking-widest', rounded: 'rounded-[2rem]', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    icons: { hearts: '🌠', diamonds: '💫', clubs: '👽', spades: '👾' }
  },
  {
    id: 'royal', price: 8500,
    bg: 'bg-purple-950 bg-[repeating-linear-gradient(45deg,rgba(250,204,21,0.05)_0px,rgba(250,204,21,0.05)_2px,transparent_2px,transparent_8px),radial-gradient(circle_at_center,rgba(147,51,234,0.5)_0,transparent_100%)]', border: 'border-yellow-400 border-4',
    goodColor: 'text-yellow-400 drop-shadow-md', badColor: 'text-purple-300',
    font: 'font-serif', rounded: 'rounded-tl-3xl rounded-br-3xl', shadow: 'shadow-2xl',
    icons: { hearts: '🍷', diamonds: '👑', clubs: '🦁', spades: '🦅' }
  },
  {
    id: 'kawaii', price: 9000,
    bg: 'bg-pink-100 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.2)_0%,transparent_100%),radial-gradient(#ec4899_1px,transparent_1px)] [background-size:100%_100%,16px_16px]', border: 'border-pink-400 border-4 border-dashed',
    goodColor: 'text-pink-600', badColor: 'text-purple-500',
    font: 'font-sans font-black', rounded: 'rounded-3xl', shadow: 'shadow-lg',
    icons: { hearts: '💖', diamonds: '🎀', clubs: '🧸', spades: '🦄' }
  },
  {
    id: 'vaporwave', price: 10000,
    bg: 'bg-gradient-to-br from-fuchsia-400 via-purple-400 to-cyan-400 bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.2)_50%)] [background-size:100%_4px]', border: 'border-yellow-300 border-4',
    goodColor: 'text-yellow-200 drop-shadow-[2px_2px_0_rgba(236,72,153,1)]', badColor: 'text-cyan-100 drop-shadow-[2px_2px_0_rgba(168,85,247,1)]',
    font: 'font-serif italic tracking-widest', rounded: 'rounded-sm', shadow: 'shadow-[10px_10px_0_rgba(0,0,0,0.5)]',
    icons: { hearts: '🌺', diamonds: '💾', clubs: '🐬', spades: '🌴' }
  }
];

const SUITS = {
  hearts: { icon: '♥️', category: 'good', type: 'potion' },
  diamonds: { icon: '♦️', category: 'good', type: 'weapon' },
  clubs: { icon: '♣️', category: 'bad', type: 'monster' },
  spades: { icon: '♠️', category: 'bad', type: 'monster' }
};

const getFace = (val) => {
  if (val === 11) return 'J';
  if (val === 12) return 'Q';
  if (val === 13) return 'K';
  if (val === 14) return 'A';
  return val;
};

const intToRoman = (num) => {
  if (num === 0) return "N";
  const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const sym = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let roman = "";
  let i = 0;
  while (num > 0) {
    while (num >= val[i]) {
      roman += sym[i];
      num -= val[i];
    }
    i++;
  }
  return roman;
};

const intToKanji = (num) => {
  const kanjiMap = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十'];
  if(num >= 0 && num <= 20) return kanjiMap[num];
  return num.toString();
};

const intToBinary = (num) => "0b" + num.toString(2);
const intToHex = (num) => "0x" + num.toString(16).toUpperCase();

const formatValue = (val, system, isFace = false) => {
  if (!system || system === 'default') {
      return isFace ? getFace(val) : val;
  }
  if (system === 'roman') return intToRoman(val);
  if (system === 'kanji') return intToKanji(val);
  if (system === 'binary') return intToBinary(val);
  if (system === 'hex') return intToHex(val);
  return val;
};

const buildDeck = () => {
  const deck = [];
  Object.keys(SUITS).forEach(suit => {
    const maxVal = (suit === 'hearts' || suit === 'diamonds') ? 10 : 14;
    for (let i = 2; i <= maxVal; i++) {
      deck.push({ suit, value: i, id: `${suit}-${i}` });
    }
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export default function App() {
  const [language, setLanguage] = useState('en');
  const t = LOCALES[language];

  const [leaderboard, setLeaderboard] = useState([]);
  const [deck, setDeck] = useState([]);
  const [room, setRoom] = useState([]);
  const [health, setHealth] = useState(20);
  const [weapon, setWeapon] = useState(null);
  const [lastKilled, setLastKilled] = useState(null);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [potionsUsed, setPotionsUsed] = useState(0);
  const [canRun, setCanRun] = useState(true);
  const [status, setStatus] = useState('menu');
  const [score, setScore] = useState(null);
  const [loseReason, setLoseReason] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // --- AUTH STATE ---
  const [authPassword, setAuthPassword] = useState("");
  const [loggedInPassword, setLoggedInPassword] = useState("");
  const [authMessage, setAuthMessage] = useState({ text: "", type: "" });
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // --- SHOP & ECONOMY STATE ---
  const [money, setMoney] = useState(0);
  const [lastEarnedMoney, setLastEarnedMoney] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState(['default']);
  const [equippedSkin, setEquippedSkin] = useState('default');
  const [creatorCode, setCreatorCode] = useState("");
  const [codeMessage, setCodeMessage] = useState({ text: "", type: "" });

  const currentSkin = SKINS.find(s => s.id === equippedSkin) || SKINS[0];

  const TOTAL_CARDS_IN_GAME = 44;

  const loadLeaderboard = async () => {
    try {
      const scores = await fetchLeaderboard();
      setLeaderboard(scores);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    }
  };

  useEffect(() => { loadLeaderboard(); }, []);

  const startGame = () => {
    const newDeck = buildDeck();
    const initialRoom = newDeck.splice(0, 4);
    setDeck(newDeck);
    setRoom(initialRoom);
    setHealth(20);
    setWeapon(null);
    setLastKilled(null);
    setCardsPlayed(0);
    setPotionsUsed(0);
    setCanRun(true);
    setStatus('playing');
    setScore(null);
    setSelectedCardId(null);
    setScoreSaved(false);
    setPlayerName("");
    setShowExitConfirm(false);
  };

  const forcedRetreat = status === 'playing' && room.filter(c => c.suit === 'hearts').length >= 3;

  // --- LOGIC: GAME STATE WATCHER ---
  useEffect(() => {
    if (status !== 'playing') return;

    if (health <= 0) {
      setHealth(0);
      endGame('lost', t.game_over.lose_reason_succumbed, 0);
      return;
    }

    const remainingMonstersInRoom = room.filter(c => c.suit === 'clubs' || c.suit === 'spades');
    if (deck.length === 0 && remainingMonstersInRoom.length === 0) {
      endGame('won', t.game_over.win_reason_survived, health);
      return;
    }

    if (forcedRetreat && !canRun) {
      endGame('lost', t.game_over.lose_reason_trapped, health);
      return;
    }
  }, [room, deck, health, status, forcedRetreat, canRun, t]);

  // --- LOGIC: END GAME & SCORING ---
  const endGame = (endStatus, reason, finalHealth) => {
    setStatus(endStatus);
    setLoseReason(reason);

    const effectiveHealth = finalHealth !== undefined ? finalHealth : health;
    let finalScore = 0;

    if (endStatus === 'won') {
      const remainingHearts = room.filter(c => c.suit === 'hearts').map(c => c.value);
      const bonus = remainingHearts.length > 0 ? Math.max(...remainingHearts) : 0;
      finalScore = effectiveHealth + bonus;
    } else {
      const allRemaining = [...deck, ...room];
      const remainingMonsters = allRemaining.filter(c => c.suit === 'clubs' || c.suit === 'spades');
      const totalMonsterValue = remainingMonsters.reduce((acc, m) => acc + m.value, 0);
      finalScore = effectiveHealth - totalMonsterValue;
      setLastKilled(0);
    }

    setScore(finalScore);

    // Calculate money based on the provided formula
    const earnedMoney = Math.max(0, finalScore + 100);
    setLastEarnedMoney(earnedMoney);
    setMoney(prev => prev + earnedMoney);
  };

  const handleSaveScore = async () => {
    if (!playerName.trim() || scoreSaved || isSaving) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const scores = await submitScore(playerName, score);
      setLeaderboard(scores);
      setScoreSaved(true);
    } catch (e) {
      setSaveError(t.game_over.save_error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = (card) => {
    if (forcedRetreat || cardsPlayed >= 3) return;

    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      return;
    }

    const type = SUITS[card.suit].type;
    if (type === 'potion') {
      if (potionsUsed >= 1) return;
      setHealth(prev => Math.min(20, prev + card.value));
      setPotionsUsed(prev => prev + 1);
      removeCardFromRoom(card.id);
    } else if (type === 'weapon') {
      setWeapon(card);
      setLastKilled(null);
      removeCardFromRoom(card.id);
    } else if (type === 'monster') {
      setSelectedCardId(card.id);
    }
  };

  const removeCardFromRoom = (cardId) => {
    setRoom(prev => prev.filter(c => c.id !== cardId));
    setCardsPlayed(prev => prev + 1);
    setSelectedCardId(null);
  };

  const attackBarehanded = (card) => {
    if (cardsPlayed >= 3) return;
    setHealth(prev => prev - card.value);
    removeCardFromRoom(card.id);
  };

  const attackWithWeapon = (card) => {
    if (!weapon || cardsPlayed >= 3) return;
    const damage = Math.max(0, card.value - weapon.value);
    setHealth(prev => prev - damage);
    setLastKilled(card.value);
    removeCardFromRoom(card.id);
  };

  const nextRoom = () => {
    if (cardsPlayed < 3 && room.length > 0) return;
    const newDeck = [...deck];
    const needed = 4 - room.length;
    const drawn = newDeck.splice(0, needed);
    setRoom(prev => [...prev, ...drawn]);
    setDeck(newDeck);
    setCardsPlayed(0);
    setPotionsUsed(0);
    setCanRun(true);
  };

  const runAway = () => {
    if (!canRun || cardsPlayed > 0) return;
    const isFirstRoomEver = (deck.length + room.length) === TOTAL_CARDS_IN_GAME;
    const newDeck = [...deck, ...room];
    const newRoom = newDeck.splice(0, 4);
    setRoom(newRoom);
    setDeck(newDeck);
    if (!isFirstRoomEver) {
      setCanRun(false);
    }
  };

  const handleShare = () => {
    let shareUrl = window.location.href;
    try {
      if (window.self !== window.top) shareUrl = document.referrer || window.location.href;
    } catch (e) {}

    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleBuySkin = (skin) => {
    if (money >= skin.price && !ownedSkins.includes(skin.id)) {
      setMoney(prev => prev - skin.price);
      setOwnedSkins(prev => [...prev, skin.id]);
      setEquippedSkin(skin.id);
    }
  };

  const handleRedeemCode = () => {
    if (creatorCode.trim().toLowerCase() === 'pizza pizza and more pizza') {
      setOwnedSkins(SKINS.map(s => s.id));
      setCodeMessage({ text: t.shop.msg_success, type: "success" });
      setCreatorCode("");
    } else {
      setCodeMessage({ text: t.shop.msg_error, type: "error" });
    }
    setTimeout(() => setCodeMessage({ text: "", type: "" }), 3000);
  };

  const handleSignup = async () => {
    if (!authPassword.trim() || isAuthLoading) return;
    setIsAuthLoading(true);
    setAuthMessage({ text: "", type: "" });
    try {
      const initialData = { money, ownedSkins, equippedSkin };
      await signup(authPassword, initialData);
      setLoggedInPassword(authPassword);
      setAuthMessage({ text: t.auth.save_success, type: "success" });
    } catch (e) {
      setAuthMessage({ text: e.message === "Someone is already using that password" ? t.auth.signup_error : t.auth.save_error, type: "error" });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!authPassword.trim() || isAuthLoading) return;
    setIsAuthLoading(true);
    setAuthMessage({ text: "", type: "" });
    try {
      const result = await login(authPassword);
      setLoggedInPassword(authPassword);
      setMoney(result.data.money || 0);
      setOwnedSkins(result.data.ownedSkins || ['default']);
      setEquippedSkin(result.data.equippedSkin || 'default');
      setAuthMessage({ text: t.auth.logged_in_as, type: "success" });
    } catch (e) {
      setAuthMessage({ text: t.auth.login_error, type: "error" });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInPassword("");
    setAuthPassword("");
    setAuthMessage({ text: "", type: "" });
  };

  useEffect(() => {
    if (loggedInPassword) {
      saveProgress(loggedInPassword, { money, ownedSkins, equippedSkin }).catch(console.error);
    }
  }, [money, ownedSkins, equippedSkin, loggedInPassword]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'he' : 'en');
  };

  const Card = ({ card }) => {
    const isSelected = selectedCardId === card.id;
    const { icon, type, category } = SUITS[card.suit];
    const isMonster = type === 'monster';
    const isRoomFull = cardsPlayed >= 3;
    let weaponValid = isMonster && weapon ? (lastKilled === null || card.value <= lastKilled) : false;

    const color = category === 'good' ? currentSkin.goodColor : currentSkin.badColor;
    const displayIcon = currentSkin.icons ? currentSkin.icons[card.suit] : icon;

    // Fallbacks for older skins if properties are missing
    const fontClass = currentSkin.font || 'font-sans';
    const roundedClass = currentSkin.rounded || 'rounded-xl';
    const shadowClass = currentSkin.shadow || 'shadow-lg';

    // Helper label for custom skins
    const typeLabel = type === 'potion' ? 'HEAL' : type === 'weapon' ? 'WEAPON' : 'ENEMY';

    return (
      <div
        onClick={() => handleCardClick(card)}
        className={`relative w-28 h-40 sm:w-32 sm:h-48 border-2 flex flex-col justify-between p-3 cursor-pointer transform transition-all duration-200
          ${currentSkin.bg} ${currentSkin.border} ${fontClass} ${roundedClass} ${shadowClass}
          ${isSelected ? 'scale-105 ring-4 ring-indigo-500 z-10' : 'hover:-translate-y-2 hover:shadow-2xl'}
          ${(forcedRetreat || (isRoomFull && !isSelected)) ? 'opacity-40 grayscale-[0.5] cursor-not-allowed' : ''}`}
      >
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col">
            <div className={`text-xl sm:text-2xl font-bold leading-none ${color}`}>
              {formatValue(card.value, currentSkin.numeralSystem, true)}
            </div>
            {currentSkin.numeralSystem && (
              <div className={`text-[10px] sm:text-xs opacity-70 font-mono ${color} mt-1`}>
                ({getFace(card.value)})
              </div>
            )}
          </div>
          {currentSkin.id !== 'default' && (
            <div className={`flex flex-col items-end opacity-60 font-sans ${color}`}>
              <span className="text-[12px] sm:text-sm leading-none drop-shadow-md">{icon}</span>
              <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider mt-0.5">{typeLabel}</span>
            </div>
          )}
        </div>
        
        <div className={`text-4xl sm:text-6xl self-center ${color}`}>{displayIcon}</div>
        
        <div className={`flex flex-col items-end self-end transform rotate-180`}>
          <div className={`text-xl sm:text-2xl font-bold leading-none ${color}`}>
            {formatValue(card.value, currentSkin.numeralSystem, true)}
          </div>
          {currentSkin.numeralSystem && (
            <div className={`text-[10px] sm:text-xs opacity-70 font-mono ${color} mt-1`}>
              ({getFace(card.value)})
            </div>
          )}
        </div>

        {isSelected && isMonster && !forcedRetreat && !isRoomFull && (
          <div className={`absolute inset-0 bg-slate-900/95 flex flex-col justify-center items-center p-2 gap-2 backdrop-blur-sm border border-slate-700 ${roundedClass}`} onClick={(e) => e.stopPropagation()}>
            <span className="text-white text-xs mb-1 font-semibold uppercase tracking-tighter">{t.playing.choose_attack}</span>
            <button onClick={() => attackBarehanded(card)} className="w-full bg-red-600 hover:bg-red-500 text-white text-[10px] py-2 px-1 rounded-md transition-colors leading-tight">{t.playing.barehanded}<br/>(-{card.value} {t.playing.hp})</button>
            {weapon && (
              <button onClick={() => attackWithWeapon(card)} disabled={!weaponValid} className={`w-full text-white text-[10px] py-2 px-1 rounded-md transition-colors ${weaponValid ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-600 opacity-50 cursor-not-allowed'}`}>{t.playing.weapon}<br/>(-{Math.max(0, card.value - weapon.value)} {t.playing.hp})</button>
            )}
            <button onClick={() => setSelectedCardId(null)} className="mt-1 text-slate-300 hover:text-white text-xs underline">{t.exit_modal.cancel}</button>
          </div>
        )}
      </div>
    );
  };

  const isRTL = language === 'he';

  const containerProps = {
    dir: isRTL ? 'rtl' : 'ltr',
    className: `min-h-screen bg-slate-900 text-slate-100 flex flex-col ${isRTL ? 'font-sans' : 'font-sans'}`
  };

  if (status === 'menu') {
    return (
      <div {...containerProps} className={`${containerProps.className} items-center justify-center p-6`}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center mb-2">
            <button onClick={toggleLanguage} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 py-2 px-4 rounded-full border border-slate-700 text-slate-300 font-bold transition-colors">
              <Languages className="w-5 h-5" />
              {language === 'en' ? 'עברית' : 'English'}
            </button>
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-indigo-600 tracking-tight">{t.menu.title}</h1>
          <p className="text-slate-400 text-lg">{t.menu.subtitle}</p>

          <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold bg-slate-800/50 py-2 px-4 rounded-full w-max mx-auto border border-yellow-500/30">
            <Coins className="w-5 h-5" /> {money} {t.menu.coins}
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl text-left rtl:text-right text-sm space-y-3 shadow-xl border border-slate-700">
            <p className="flex items-center gap-2"><Heart className="w-4 text-red-500"/> <span><b>{t.menu.rules.hearts_label}</b>{t.menu.rules.hearts_desc}</span></p>
            <p className="flex items-center gap-2"><Sword className="w-4 text-red-500"/> <span><b>{t.menu.rules.diamonds_label}</b>{t.menu.rules.diamonds_desc}</span></p>
            <p className="flex items-center gap-2"><Skull className="w-4 text-slate-400"/> <span><b>{t.menu.rules.monsters_label}</b>{t.menu.rules.monsters_desc}</span></p>
            <hr className="border-slate-700 my-2" />
            <p className="text-xs text-indigo-400 font-bold">{t.menu.rules.rule_3_cards}</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl text-left rtl:text-right text-sm space-y-4 shadow-xl border border-slate-700">
            <h3 className="text-indigo-400 font-bold flex items-center gap-2"><Check className="w-4 h-4"/> {t.auth.title}</h3>
            {loggedInPassword ? (
              <div className="space-y-3">
                <p className="text-slate-300">{t.auth.logged_in_as}: <span className="text-white font-mono">{"*".repeat(loggedInPassword.length)}</span></p>
                <button onClick={handleLogout} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/> {t.auth.logout}</button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder={t.auth.password_placeholder}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
                {authMessage.text && (
                  <p className={`text-xs font-bold ${authMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{authMessage.text}</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleSignup} disabled={!authPassword.trim() || isAuthLoading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {isAuthLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : t.auth.signup}
                  </button>
                  <button onClick={handleLogin} disabled={!authPassword.trim() || isAuthLoading} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {isAuthLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : t.auth.login}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button onClick={startGame} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg shadow-lg"><Play className="w-6 h-6" /> {t.menu.enter}</button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { loadLeaderboard(); setStatus('leaderboard'); }} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><Trophy className="w-5 h-5" /> {t.menu.top10}</button>
              <button onClick={() => setStatus('shop')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-yellow-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><ShoppingBag className="w-5 h-5" /> {t.menu.shop}</button>
            </div>
            <button onClick={handleShare} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">{copied ? <Check className="w-5 h-5 text-green-400" /> : <LinkIcon className="w-5 h-5" />} {copied ? t.menu.copied : t.menu.share}</button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'shop') {
    return (
      <div {...containerProps} className={`${containerProps.className} items-center p-6 sm:p-12 overflow-y-auto`}>
        <div className="max-w-2xl w-full space-y-6">
          <div className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
             <button onClick={() => setStatus('menu')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold p-2 rounded-xl transition-colors"><ChevronLeft className={`w-6 h-6 ${isRTL ? 'transform rotate-180' : ''}`} /></button>
             <h1 className="text-3xl font-black text-yellow-400 flex items-center gap-2"><ShoppingBag className="w-8 h-8" /> {t.shop.title}</h1>
             <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl"><Coins className="w-6 h-6" /> {money}</div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder={t.shop.placeholder_code}
              value={creatorCode}
              onChange={(e) => setCreatorCode(e.target.value)}
              className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 placeholder-slate-500"
            />
            <button
              onClick={handleRedeemCode}
              disabled={!creatorCode.trim()}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-400 font-bold px-8 py-3 rounded-xl transition-colors w-full sm:w-auto"
            >
              {t.shop.redeem}
            </button>
          </div>

          {codeMessage.text && (
            <div className={`text-center font-bold p-3 rounded-xl bg-slate-800 border ${codeMessage.type === 'success' ? 'text-green-400 border-green-800' : 'text-red-400 border-red-800'}`}>
              {codeMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKINS.map(skin => {
               const isOwned = ownedSkins.includes(skin.id);
               const isEquipped = equippedSkin === skin.id;
               const canAfford = money >= skin.price;

               const fontClass = skin.font || 'font-sans';
               const roundedClass = skin.rounded || 'rounded-xl';
               const previewIcon = skin.icons ? skin.icons['spades'] : '♠️';
               const skinName = t.skins[skin.id] || skin.id;

               return (
                 <div key={skin.id} className={`bg-slate-800 p-5 rounded-2xl border ${isEquipped ? 'border-indigo-500 shadow-[0_0_15_rgba(99,102,241,0.3)]' : 'border-slate-700'} flex flex-col sm:flex-row items-center gap-6`}>
                    <div className={`w-16 h-24 sm:w-20 sm:h-28 flex items-center justify-center text-3xl border-2 flex-shrink-0 ${skin.bg} ${skin.border} ${roundedClass} ${fontClass}`}>
                      <span className={skin.badColor}>{previewIcon}</span>
                    </div>
                    <div className="flex-1 text-center sm:text-left rtl:sm:text-right space-y-3 w-full">
                      <div>
                        <h3 className="font-bold text-xl">{skinName}</h3>
                        {!isOwned && <p className="text-yellow-400 flex items-center justify-center sm:justify-start rtl:sm:justify-end gap-1 font-semibold mt-1"><Coins className="w-4 h-4"/> {skin.price}</p>}
                      </div>

                      {isEquipped ? (
                         <button disabled className="w-full py-2 bg-indigo-600/50 text-indigo-200 rounded-lg font-bold border border-indigo-500/50 cursor-default">{t.shop.equipped}</button>
                      ) : isOwned ? (
                         <button onClick={() => setEquippedSkin(skin.id)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors">{t.shop.equip_skin}</button>
                      ) : (
                         <button onClick={() => handleBuySkin(skin)} disabled={!canAfford} className={`w-full py-2 rounded-lg font-bold transition-colors ${canAfford ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg' : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'}`}>
                           {canAfford ? t.shop.purchase : t.shop.not_enough}
                         </button>
                      )}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'leaderboard') {
    return (
      <div {...containerProps} className={`${containerProps.className} items-center p-6 sm:p-12`}>
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-700">
          <h1 className="text-3xl font-black text-indigo-400 flex items-center justify-center gap-2"><Trophy className="w-8 h-8" /> {t.leaderboard.title}</h1>
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            {leaderboard.length === 0 ? <div className="p-8 text-center text-slate-400">{t.leaderboard.no_scores}</div> : (
              <div className="flex flex-col">
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div key={entry.id} className={`flex justify-between items-center p-4 ${idx < Math.min(leaderboard.length, 10) - 1 ? 'border-b border-slate-800' : ''}`}>
                    <div className="flex gap-4 items-center"><span className="text-slate-500 font-bold w-4 text-right rtl:text-left">{idx + 1}.</span><span className="font-semibold text-lg max-w-[150px] truncate">{entry.name}</span></div>
                    <span className={`font-black text-xl ${entry.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>{entry.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setStatus('menu')} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors mt-6">{t.leaderboard.back}</button>
        </div>
      </div>
    );
  }

  if (status === 'won' || status === 'lost') {
    return (
      <div {...containerProps} className={`${containerProps.className} items-center justify-center p-6`}>
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 border border-slate-700">
          <h1 className={`text-5xl font-black ${status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
            {status === 'won' ? t.game_over.victory : t.game_over.defeat}
          </h1>
          <p className="text-slate-300 text-lg">{loseReason}</p>
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 space-y-2">
            <div className="text-sm text-slate-400 uppercase font-bold tracking-wider">{t.game_over.final_score}</div>
            <div className={`text-6xl font-black ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>{score}</div>
            {lastEarnedMoney > 0 && (
                <div className="text-yellow-400 font-bold flex items-center justify-center gap-1 mt-2">
                    <Coins className="w-5 h-5" /> +{lastEarnedMoney} {t.menu.coins}
                </div>
            )}
          </div>

          {!scoreSaved ? (
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder={t.game_over.placeholder_name}
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 text-center text-lg font-bold"
              />
              {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
              <button 
                onClick={handleSaveScore} 
                disabled={!playerName.trim() || isSaving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : t.game_over.save_score}
              </button>
            </div>
          ) : (
            <div className="bg-green-900/30 border border-green-500/30 text-green-400 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
              <Check className="w-5 h-5" /> {t.game_over.score_saved}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
            <button onClick={startGame} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5" /> {t.game_over.play_again}</button>
            <button onClick={() => setStatus('menu')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"><Home className="w-5 h-5" /> {t.game_over.menu}</button>
          </div>
        </div>
      </div>
    );
  }

  // Active Game View ('playing')
  return (
    <div {...containerProps}>
      {/* Header Stats */}
      <div className="max-w-4xl w-full mx-auto flex flex-wrap justify-between items-center bg-slate-800 p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-700 my-6 gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 bg-slate-900 py-2 px-3 sm:px-4 rounded-xl border border-slate-700">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl font-black">{formatValue(health, currentSkin.numeralSystem)}</span>
                <span className="text-slate-500 text-sm sm:text-base font-bold ml-1 rtl:mr-1 rtl:ml-0">/ {formatValue(20, currentSkin.numeralSystem)}</span>
              </div>
              {currentSkin.numeralSystem && (
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                  DEC: {health}/20
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900 py-2 px-3 sm:px-4 rounded-xl border border-slate-700">
            <Sword className={`w-5 h-5 sm:w-6 sm:h-6 ${weapon ? 'text-indigo-400' : 'text-slate-600'}`} />
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-black leading-none">
                {weapon ? formatValue(weapon.value, currentSkin.numeralSystem) : 'None'}
              </span>
              {weapon && currentSkin.numeralSystem && (
                <span className="text-[9px] text-indigo-400 font-mono uppercase mt-0.5">
                  DEC: {weapon.value}
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                {weapon && lastKilled !== null ? `${t.playing.max_weapon}: ${lastKilled}` : t.playing.weapon}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="p-2 sm:p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center gap-2">
              <Languages className="w-5 h-5" />
              <span className="hidden sm:inline font-bold">{language === 'en' ? 'HE' : 'EN'}</span>
            </button>
            <div className="hidden sm:flex flex-col items-end rtl:items-start mx-4">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.playing.deck_label}</span>
                <span className="text-2xl font-black leading-none">{deck.length}</span>
            </div>
            <button onClick={() => setShowExitConfirm(true)} className="p-2 sm:p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
              <LogOut className={`w-5 h-5 sm:w-6 sm:h-6 ${isRTL ? 'transform rotate-180' : ''}`} />
            </button>
        </div>
      </div>

      {/* Main Room Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto relative">
        {forcedRetreat && (
           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 w-full text-center z-20">
             <div className="inline-flex items-center gap-2 bg-red-900/90 text-red-200 border border-red-500 px-4 py-2 rounded-xl font-bold shadow-lg animate-pulse">
               <ShieldAlert className="w-5 h-5" /> {t.playing.too_many_potions}
             </div>
           </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 items-center min-h-[16rem]">
          {room.map(card => <Card key={card.id} card={card} />)}
          {room.length === 0 && deck.length > 0 && (
            <div className="text-slate-500 font-bold text-xl uppercase tracking-widest animate-pulse">{t.playing.room_cleared}</div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="max-w-4xl w-full mx-auto mt-6 p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button 
                onClick={runAway}
                disabled={!canRun || cardsPlayed > 0 || room.length === 0}
                className={`flex-1 sm:flex-none py-4 px-8 rounded-xl font-black text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2
                    ${(!canRun || cardsPlayed > 0 || room.length === 0) ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] hover:shadow-[0_0_25px_rgba(217,119,6,0.6)]'}`}
            >
                <RefreshCw className="w-5 h-5" /> {t.playing.run_away}
            </button>

            <button 
                onClick={nextRoom}
                disabled={(cardsPlayed < 3 && room.length > 0) || deck.length === 0}
                className={`flex-1 sm:flex-none py-4 px-8 rounded-xl font-black text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2
                    ${((cardsPlayed < 3 && room.length > 0) || deck.length === 0) ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]'}`}
            >
                {t.playing.next_room} <ChevronLeft className={`w-5 h-5 transform ${isRTL ? '' : 'rotate-180'}`} />
            </button>
        </div>
        <div className="text-center mt-4 text-slate-500 font-bold text-sm sm:hidden">
            {t.playing.deck_label}: {deck.length} {t.playing.deck_remaining}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white">{t.exit_modal.title}</h3>
                <button onClick={() => setShowExitConfirm(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
            </div>
            <p className="text-slate-400">{t.exit_modal.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setStatus('menu')} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">{t.exit_modal.yes}</button>
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors">{t.exit_modal.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
