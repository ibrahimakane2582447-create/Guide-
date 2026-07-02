import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Heart, Plus, X, Keyboard, Trash2, Maximize2, Minimize2 } from 'lucide-react';

const DHIKR_TYPES = [
  { id: 'subhanallah', title: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { id: 'alhamdulillah', title: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { id: 'allahuakbar', title: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 34 },
  { id: 'laila', title: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
  { id: 'astaghfirullah', title: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
];

const ARABIC_LETTERS = [
  'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د',
  'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط',
  'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'ذ'
];

export function Dhikr() {
  const [customDhikrs, setCustomDhikrs] = useState<any[]>(() => {
    const saved = localStorage.getItem('alihsan-custom-dhikrs');
    return saved ? JSON.parse(saved) : [];
  });
  const allDhikrs = [...DHIKR_TYPES, ...customDhikrs];

  const [activeDhikr, setActiveDhikr] = useState(() => {
    const saved = localStorage.getItem('alihsan-dhikr-active');
    return saved ? JSON.parse(saved) : DHIKR_TYPES[0];
  });
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('alihsan-dhikr-sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    const oldSaved = localStorage.getItem('alihsan-dhikr-session');
    if (oldSaved) {
      const parsed = parseInt(oldSaved, 10);
      if (!isNaN(parsed)) {
        // Fallback for previous single session state
        return { 'subhanallah': parsed };
      }
    }
    return {};
  });

  const count = sessionCounts[activeDhikr.id] || 0;
  const [totalCount, setTotalCount] = useState(0);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('100');
  const [isInfinite, setIsInfinite] = useState(false);
  const [showArabicKeyboard, setShowArabicKeyboard] = useState(false);
  const [isFullscreenTap, setIsFullscreenTap] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('alihsan-dhikr-totals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTotalCount(parsed[activeDhikr.id] || 0);
      } catch (e) {}
    } else {
        setTotalCount(0);
    }
  }, [activeDhikr]);

  useEffect(() => {
      localStorage.setItem('alihsan-dhikr-active', JSON.stringify(activeDhikr));
      localStorage.setItem('alihsan-dhikr-sessions', JSON.stringify(sessionCounts));
  }, [activeDhikr, sessionCounts]);

  const increment = () => {
    if (activeDhikr.target !== -1 && count >= activeDhikr.target) {
      if ('vibrate' in navigator) {
        navigator.vibrate([500]); // long vibration
      }
      return;
    }

    setSessionCounts(prev => ({
      ...prev,
      [activeDhikr.id]: (prev[activeDhikr.id] || 0) + 1
    }));
    setTotalCount(t => t + 1);
    
    const saved = localStorage.getItem('alihsan-dhikr-totals');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[activeDhikr.id] = (parsed[activeDhikr.id] || 0) + 1;
    localStorage.setItem('alihsan-dhikr-totals', JSON.stringify(parsed));
    
    // Vibrate
    if ('vibrate' in navigator) {
      if (activeDhikr.target !== -1 && count + 1 === activeDhikr.target) {
        navigator.vibrate([1000, 300, 1000]); // long vibrations when target is reached
      } else {
        navigator.vibrate(40); // standard subtle tap feedback vibration
      }
    }
  };

  const reset = () => {
    setSessionCounts(prev => ({
      ...prev,
      [activeDhikr.id]: 0
    }));
  };

  const deleteCustom = (id: string) => {
    const updated = customDhikrs.filter(d => d.id !== id);
    setCustomDhikrs(updated);
    localStorage.setItem('alihsan-custom-dhikrs', JSON.stringify(updated));
    if (activeDhikr.id === id) {
      setActiveDhikr(DHIKR_TYPES[0]);
    }
  };

  if (isAdding) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-indigo-950">Nouveau Zikr</h3>
          <button onClick={() => setIsAdding(false)} className="p-2 text-stone-400 hover:text-stone-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">Nom du zikr (Arabe ou Français)</label>
            <div className="flex items-stretch gap-2">
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                dir="auto"
                placeholder="Ex: Ya Latif"
              />
              <button 
                onClick={() => setShowArabicKeyboard(!showArabicKeyboard)}
                className={`px-4 rounded-xl border flex items-center justify-center transition-colors ${showArabicKeyboard ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'}`}
              >
                <Keyboard className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showArabicKeyboard && (
            <div className="bg-stone-50 p-2 rounded-xl border border-stone-200 grid grid-cols-6 sm:grid-cols-8 gap-1" dir="rtl">
              {ARABIC_LETTERS.map(letter => (
                <button
                  key={letter}
                  onClick={() => setNewTitle(prev => prev + letter)}
                  className="bg-white border border-stone-200 rounded p-2 text-lg font-arabic hover:bg-indigo-50 active:bg-indigo-100"
                >
                  {letter}
                </button>
              ))}
              <button onClick={() => setNewTitle(prev => prev + ' ')} className="col-span-3 bg-white border border-stone-200 rounded p-2 hover:bg-indigo-50 active:bg-indigo-100 text-sm font-bold text-stone-500">Espace</button>
              <button onClick={() => setNewTitle(prev => prev.slice(0, -1))} className="col-span-2 bg-white border border-stone-200 rounded p-2 hover:bg-indigo-50 active:bg-indigo-100 text-sm font-bold text-stone-500">Effacer</button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase">Objectif (Nombre)</label>
            <div className="flex flex-col gap-3">
               <input 
                type="number" 
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                disabled={isInfinite}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium disabled:opacity-50"
              />
              <label className="flex items-center gap-2 cursor-pointer bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 w-fit">
                <input type="checkbox" checked={isInfinite} onChange={e => setIsInfinite(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"/>
                <span className="text-sm font-bold text-stone-700">Infini</span>
              </label>
            </div>
          </div>

          <button 
            onClick={() => {
              if (!newTitle) return;
              const newDhikr = {
                id: 'custom-' + Date.now(),
                title: newTitle,
                arabic: newTitle,
                target: isInfinite ? -1 : (parseInt(newTarget) || 100)
              };
              const updated = [...customDhikrs, newDhikr];
              setCustomDhikrs(updated);
              localStorage.setItem('alihsan-custom-dhikrs', JSON.stringify(updated));
              setActiveDhikr(newDhikr);
              setIsAdding(false);
              setNewTitle('');
              setNewTarget('100');
              setIsInfinite(false);
            }}
            disabled={!newTitle}
            className="w-full bg-indigo-600 text-white rounded-xl py-4 mt-4 font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Commencer ce Zikr
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {allDhikrs.map((dt) => (
          <button
            key={dt.id}
            onClick={() => {
              if (activeDhikr.id !== dt.id) {
                setActiveDhikr(dt);
              }
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeDhikr.id === dt.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            {dt.title}
          </button>
        ))}
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 w-full mb-8">
            {activeDhikr.id.startsWith('custom-') && (
              <button 
                onClick={() => deleteCustom(activeDhikr.id)} 
                className="absolute top-0 left-0 text-red-400 p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Supprimer ce zikr"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-serif font-bold text-2xl text-indigo-950 mb-2" dir="auto">{activeDhikr.title}</h3>
            {activeDhikr.title !== activeDhikr.arabic && (
              <p className="arabic-text text-5xl text-indigo-800 leading-relaxed mb-4">{activeDhikr.arabic}</p>
            )}
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold mt-2">
                Objectif: {activeDhikr.target === -1 ? 'Infini' : activeDhikr.target}
            </div>
            {totalCount > 0 && (
                <div className="mt-2 text-stone-400 text-xs font-medium">Total global : {totalCount}</div>
            )}
        </div>

        <button 
            onClick={increment}
            className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-2xl flex flex-col items-center justify-center relative active:scale-95 transition-transform duration-100 overflow-hidden group"
        >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-active:opacity-100 transition-opacity"></div>
            <motion.span 
              key={count}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-white text-7xl font-bold font-mono tracking-tighter mix-blend-overlay"
            >
                {count}
            </motion.span>
        </button>

        <div className="flex justify-between w-full max-w-[16rem] mt-8 gap-4 px-2">
            <button 
                onClick={() => setIsFullscreenTap(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full transition-all font-bold text-xs shadow-sm hover:scale-[1.03] active:scale-[0.98]"
                title="Taper n'importe où sur l'écran"
            >
                <Maximize2 className="w-4 h-4" /> Tap Partout
            </button>
            <button 
                onClick={reset}
                className="p-3 bg-stone-100 text-stone-500 hover:bg-stone-200 rounded-full transition-colors flex items-center justify-center shadow-inner hover:scale-[1.03] active:scale-[0.98]"
                title="Remettre à zéro"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
        </div>

        {/* Progress bar */}
        {activeDhikr.target !== -1 && (
          <div className="w-full max-w-[16rem] mt-8 bg-stone-100 h-2 rounded-full overflow-hidden">
              <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (count / activeDhikr.target) * 100)}%` }}
              ></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFullscreenTap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={increment}
            className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-between p-6 select-none cursor-pointer"
          >
            {/* Header with Exit & Reset */}
            <div className="w-full flex justify-between items-center relative z-10 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md rounded-full text-white text-xs font-bold transition-all border border-white/10"
                title="Remettre à zéro"
              >
                <RotateCcw className="w-4 h-4 animate-spin-once" /> Reset
              </button>
              
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 text-center">
                Tapez n'importe où
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreenTap(false);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 active:bg-red-600/40 backdrop-blur-md rounded-full text-red-200 text-xs font-bold transition-all border border-red-500/20"
                title="Quitter le plein écran"
              >
                <X className="w-4 h-4" /> Quitter
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col items-center justify-center flex-1 w-full text-center py-12">
              <h3 className="font-serif font-black text-4xl text-indigo-100 mb-2 drop-shadow-sm" dir="auto">
                {activeDhikr.title}
              </h3>
              {activeDhikr.title !== activeDhikr.arabic && (
                <p className="arabic-text text-5xl text-indigo-400 leading-relaxed mb-6 drop-shadow-sm">
                  {activeDhikr.arabic}
                </p>
              )}

              {/* Huge pulsating counter */}
              <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl animate-pulse w-80 h-80"></div>
                <motion.div
                  key={count}
                  initial={{ scale: 0.75, opacity: 0.5 }}
                  animate={{ scale: [1.1, 1], opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-white text-9xl sm:text-[12rem] font-extrabold font-mono tracking-tighter relative z-10 drop-shadow-md select-none"
                >
                  {count}
                </motion.div>
              </div>

              {/* Progress and Target info */}
              <div className="space-y-3 relative z-10 w-full max-w-xs">
                <div className="text-indigo-200/80 text-sm font-semibold">
                  Objectif: {activeDhikr.target === -1 ? 'Infini' : `${count} / ${activeDhikr.target}`}
                </div>
                {activeDhikr.target !== -1 && (
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                    <div
                      className="h-full bg-indigo-400 transition-all duration-150 rounded-full"
                      style={{ width: `${Math.min(100, (count / activeDhikr.target) * 100)}%` }}
                    ></div>
                  </div>
                )}
                {totalCount > 0 && (
                  <div className="text-white/30 text-[11px] font-bold tracking-wider uppercase pt-2">
                    Total Global: {totalCount}
                  </div>
                )}
              </div>
            </div>

            {/* Tap cue at bottom */}
            <div className="w-full text-center pb-6">
              <span className="text-indigo-300/40 text-xs font-bold tracking-widest animate-pulse uppercase">
                Taper l'écran • Vibration active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
