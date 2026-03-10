import React, { useState, useEffect } from 'react';
import { Heart, Sword, ShieldAlert, Skull, Play, RefreshCw, Info, Trophy, ChevronLeft, Link as LinkIcon, Check, Copy, LogOut, X, Home } from 'lucide-react';
import { fetchLeaderboard, submitScore } from './leaderboardApi';

const SUITS = {
  hearts: { icon: '♥️', color: 'text-red-600', type: 'potion' },
  diamonds: { icon: '♦️', color: 'text-red-600', type: 'weapon' },
  clubs: { icon: '♣️', color: 'text-slate-900', type: 'monster' },
  spades: { icon: '♠️', color: 'text-slate-900', type: 'monster' }
};

const getFace = (val) => {
  if (val === 11) return 'J';
  if (val === 12) return 'Q';
  if (val === 13) return 'K';
  if (val === 14) return 'A';
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

  useEffect(() => {
    if (status !== 'playing') return;
    if (health <= 0) {
      endGame('lost', "You succumbed to your injuries in the dungeon.");
      return;
    }
    const remainingMonstersInRoom = room.filter(c => c.suit === 'clubs' || c.suit === 'spades');
    if (deck.length === 0 && remainingMonstersInRoom.length === 0) {
      endGame('won', "You survived the dungeon!");
      return;
    }
    if (forcedRetreat && !canRun) {
      endGame('lost', "You were trapped in a room with too many potions and were too tired to run away!");
      return;
    }
  }, [room, deck, health, status, forcedRetreat, canRun]);

  const endGame = (endStatus, reason) => {
  setStatus(endStatus);
  setLoseReason(reason);
  if (endStatus === 'won') {
    const remainingHearts = room.filter(c => c.suit === 'hearts').map(c => c.value);
    const bonus = remainingHearts.length > 0 ? Math.max(...remainingHearts) : 0;
    setScore(health + bonus);
  } else {
    const allRemaining = [...deck, ...room];
    const remainingMonsters = allRemaining.filter(c => c.suit === 'clubs' || c.suit === 'spades');
    const totalMonsterValue = remainingMonsters.reduce((acc, m) => acc + m.value, 0);
    setScore(health - totalMonsterValue);
    setLastKilled(0);  // ← New line: Reset last killed enemy value on loss
  }
};

  const getRankMessage = () => {
    if (status === 'lost') {
      if (score < -50) return "Dungeon Fodder: The rats will feast well tonight.";
      if (score < -20) return "Tragic Adventurer: You almost made it past the first few rooms.";
      if (score < 0) return "Near Miss: You were so close to the exit!";
      return "Close Enough: You died, but at least you took some monsters with you.";
    }
    if (status === 'won') {
      if (score < 10) return "Survivor: Barely made it out alive, but you're free!";
      if (score < 20) return "Dungeon Delver: A successful run with skin still on your bones.";
      if (score < 30) return "Master Scoundrel: You played the odds and won big.";
      return "Legendary Hero: The dungeon trembles at the mention of your name!";
    }
    return "";
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
      setSaveError("Failed to save score. Please try again.");
      console.error("Error saving score", e);
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
      if (window.self !== window.top) {
        shareUrl = document.referrer || window.location.href;
      }
    } catch (e) {}
    
    const textArea = document.createElement("textarea");
    textArea.value = shareUrl;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const Card = ({ card }) => {
    const isSelected = selectedCardId === card.id;
    const { icon, color, type } = SUITS[card.suit];
    const isMonster = type === 'monster';
    const isRoomFull = cardsPlayed >= 3;
    let weaponValid = isMonster && weapon ? (lastKilled === null || card.value <= lastKilled) : false;

    return (
      <div 
        onClick={() => handleCardClick(card)}
        className={`relative w-28 h-40 sm:w-32 sm:h-48 rounded-xl bg-white shadow-lg border border-slate-200 flex flex-col justify-between p-3 cursor-pointer transform transition-transform duration-200 
          ${isSelected ? 'scale-105 ring-4 ring-indigo-500 z-10' : 'hover:-translate-y-2 hover:shadow-xl'} 
          ${(forcedRetreat || (isRoomFull && !isSelected)) ? 'opacity-40 grayscale-[0.5] cursor-not-allowed' : ''}`}
      >
        <div className={`text-xl sm:text-2xl font-bold ${color}`}>{getFace(card.value)}</div>
        <div className={`text-4xl sm:text-6xl self-center ${color}`}>{icon}</div>
        <div className={`text-xl sm:text-2xl font-bold ${color} self-end transform rotate-180`}>{getFace(card.value)}</div>
        {isSelected && isMonster && !forcedRetreat && !isRoomFull && (
          <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex flex-col justify-center items-center p-2 gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-white text-xs mb-1 font-semibold uppercase tracking-tighter">Choose Attack</span>
            <button onClick={() => attackBarehanded(card)} className="w-full bg-red-600 hover:bg-red-500 text-white text-[10px] py-2 px-1 rounded-md transition-colors leading-tight">Barehanded<br/>(-{card.value} HP)</button>
            {weapon && (
              <button onClick={() => attackWithWeapon(card)} disabled={!weaponValid} className={`w-full text-white text-[10px] py-2 px-1 rounded-md transition-colors ${weaponValid ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-600 opacity-50 cursor-not-allowed'}`}>Weapon<br/>(-{Math.max(0, card.value - weapon.value)} HP)</button>
            )}
            <button onClick={() => setSelectedCardId(null)} className="mt-1 text-slate-300 hover:text-white text-xs underline">Cancel</button>
          </div>
        )}
      </div>
    );
  };

  if (status === 'menu') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-indigo-600 tracking-tight">SCOUNDREL</h1>
          <p className="text-slate-400 text-lg">A Solitaire Dungeon Crawler</p>
          <div className="bg-slate-800 p-6 rounded-2xl text-left text-sm space-y-3 shadow-xl border border-slate-700">
            <p className="flex items-center gap-2"><Heart className="w-4 text-red-500"/> <b>Hearts:</b> Health (+HP, Max 20). 1 per room max.</p>
            <p className="flex items-center gap-2"><Sword className="w-4 text-red-500"/> <b>Diamonds:</b> Weapons. Equip to fight.</p>
            <p className="flex items-center gap-2"><Skull className="w-4 text-slate-400"/> <b>Clubs/Spades:</b> Monsters. Defeat them to survive.</p>
            <hr className="border-slate-700 my-2" />
            <p className="text-xs text-indigo-400 font-bold">Rule: You can only play exactly 3 cards per room.</p>
            <p className="text-xs text-slate-400 font-medium italic">Grace Rule: You can Run Away infinitely in the first room until you play your first card.</p>
          </div>
          <div className="space-y-3">
            <button onClick={startGame} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg shadow-lg"><Play className="w-6 h-6" /> Enter the Dungeon</button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { loadLeaderboard(); setStatus('leaderboard'); }} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><Trophy className="w-5 h-5" /> Leaderboard</button>
              <button onClick={handleShare} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">{copied ? <Check className="w-5 h-5 text-green-400" /> : <LinkIcon className="w-5 h-5" />} {copied ? "Copied!" : "Share URL"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'leaderboard') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-6 sm:p-12">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <h1 className="text-3xl font-black text-indigo-400 flex items-center justify-center gap-2"><Trophy className="w-8 h-8" /> Leaderboard</h1>
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            {leaderboard.length === 0 ? <div className="p-8 text-center text-slate-400">No scores yet. Complete a run to be the first!</div> : (
              <div className="flex flex-col">
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div key={entry.id} className={`flex justify-between items-center p-4 ${idx < Math.min(leaderboard.length, 10) - 1 ? 'border-b border-slate-800' : ''}`}>
                    <div className="flex gap-4 items-center"><span className="text-slate-500 font-bold w-4 text-right">{idx + 1}.</span><span className="font-semibold text-lg max-w-[150px] truncate">{entry.name}</span></div>
                    <span className={`font-black text-xl ${entry.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>{entry.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setStatus('menu')} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><ChevronLeft className="w-5 h-5" /> Back to Menu</button>
        </div>
      </div>
    );
  }

  if (status === 'won' || status === 'lost') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-6">
          <div className="flex justify-center mb-4">{status === 'won' ? <ShieldAlert className="w-20 h-20 text-indigo-500" /> : <Skull className="w-20 h-20 text-red-500" />}</div>
          <h1 className={`text-4xl font-black ${status === 'won' ? 'text-indigo-400' : 'text-red-500'}`}>{status === 'won' ? 'VICTORY' : 'GAME OVER'}</h1>
          <p className="text-slate-300 italic">"{getRankMessage()}"</p>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 space-y-4">
            <div><h2 className="text-xl font-bold mb-1">Final Score: <span className={score >= 0 ? 'text-green-400' : 'text-red-400'}>{score}</span></h2></div>
            <div className="pt-4 border-t border-slate-800">
              {!scoreSaved ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-slate-300 text-left">Save your score:</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Your name..." value={playerName} onChange={e => setPlayerName(e.target.value)} className="flex-1 bg-slate-800 text-white p-3 rounded-lg border border-slate-600 focus:outline-none focus:border-indigo-500" maxLength={15} />
                    <button onClick={handleSaveScore} disabled={!playerName.trim() || isSaving} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">{isSaving ? '...' : 'Save'}</button>
                  </div>
                  {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
                </div>
              ) : <div className="bg-green-900/30 border border-green-800 text-green-400 p-3 rounded-lg font-bold flex items-center justify-center gap-2"><Trophy className="w-5 h-5" /> Score Saved!</div>}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { loadLeaderboard(); setStatus('leaderboard'); }} className="bg-slate-900 border border-slate-700 hover:bg-slate-700 text-indigo-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><Trophy className="w-5 h-5" /> Top 10</button>
              <button onClick={startGame} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"><RefreshCw className="w-5 h-5" /> Play Again</button>
            </div>
            <button onClick={() => setStatus('menu')} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><Home className="w-5 h-5" /> Back to Menu</button>
            <button onClick={handleShare} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">{copied ? <Check className="w-5 h-5 text-green-400" /> : <LinkIcon className="w-5 h-5" />} {copied ? "URL Copied!" : "Share Game URL"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none overflow-hidden relative">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center"><LogOut className="w-16 h-16 text-yellow-500" /></div>
            <h2 className="text-2xl font-bold">Abandon Run?</h2>
            <p className="text-slate-400">Your current progress will be lost. This run will not be scored.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowExitConfirm(false)} className="bg-slate-700 hover:bg-slate-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><X className="w-5 h-5" /> Cancel</button>
              <button onClick={() => setStatus('menu')} className="bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> Abandon</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-20 shadow-md flex justify-between items-center">
        <div className="flex gap-4 sm:gap-8 flex-wrap">
          <div className="flex items-center gap-2"><div className="bg-slate-900 p-2 rounded-lg flex items-center gap-2"><Heart className={`w-6 h-6 ${health > 10 ? 'text-green-500' : health > 5 ? 'text-yellow-500' : 'text-red-500'}`} /><span className="text-2xl font-bold">{health}</span><span className="text-xs text-slate-500">/20</span></div></div>
          <div className="flex items-center gap-2"><div className="bg-slate-900 p-2 rounded-lg flex flex-col justify-center min-w-[140px] border border-slate-700"><div className="flex items-center gap-2 text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1"><Sword className="w-4 h-4 text-indigo-400"/> Weapon</div>{weapon ? <div className="flex justify-between items-center"><span className="text-xl font-bold text-red-500">{getFace(weapon.value)}♦️</span><span className="text-xs text-slate-400 ml-2 border-l border-slate-700 pl-2">Last: <span className="text-slate-200 font-bold">{lastKilled !== null ? getFace(lastKilled) : 'Any'}</span></span></div> : <span className="text-slate-600 text-sm italic px-1">Barehanded</span>}</div></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block"><div className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Deck</div><div className="text-2xl font-black text-indigo-400">{deck.length}</div></div>
          <button onClick={() => setShowExitConfirm(true)} className="p-3 bg-slate-900 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-700 hover:border-red-800" title="Exit to Menu"><LogOut className="w-6 h-6" /></button>
        </div>
      </div>
      {forcedRetreat && (
        <div className="bg-red-600/90 text-white p-3 text-center font-bold tracking-wide animate-pulse border-y border-red-500 z-10">⚠️ FORCED RETREAT! Too many potions. You must run! ⚠️</div>
      )}
      <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
          {room.map((card) => <Card key={card.id} card={card} />)}
        </div>
      </div>
      <div className="bg-slate-800 border-t border-slate-700 p-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          onClick={runAway} 
          disabled={!canRun || cardsPlayed > 0} 
          className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all w-full sm:w-auto ${canRun && cardsPlayed === 0 ? (forcedRetreat ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105' : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg shadow-black/30') : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800 opacity-60'}`}
        >
          🏃 Run Away {(deck.length + room.length === TOTAL_CARDS_IN_GAME && cardsPlayed === 0) ? '(Infinite)' : (!canRun ? '(Locked)' : (cardsPlayed > 0 ? '(In Battle)' : ''))}
        </button>
        <div className="text-center text-slate-400 text-sm mx-4 flex flex-col items-center"><span className="font-semibold text-slate-300">Room Clear Progress</span><div className="flex gap-1 mt-1">{[1, 2, 3].map(i => <div key={i} className={`w-8 h-2 rounded-full transition-all duration-300 ${cardsPlayed >= i ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-slate-700'}`} />)}</div></div>
        <button onClick={nextRoom} disabled={cardsPlayed < 3 && room.length > 0} className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all w-full sm:w-auto ${cardsPlayed >= 3 || room.length === 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}>Next Room ➡️</button>
      </div>
    </div>
  );
}
