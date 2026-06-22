import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Heart } from 'lucide-react';

const DHIKR_TYPES = [
  { id: 'subhanallah', title: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { id: 'alhamdulillah', title: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { id: 'allahuakbar', title: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 34 },
  { id: 'laila', title: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
  { id: 'astaghfirullah', title: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
];

export function Dhikr() {
  const [activeDhikr, setActiveDhikr] = useState(DHIKR_TYPES[0]);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('alihsan-dhikr-totals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTotalCount(parsed[activeDhikr.id] || 0);
      } catch (e) {}
    }
  }, [activeDhikr]);

  const increment = () => {
    setCount(c => c + 1);
    
    // Vibrate
    if ('vibrate' in navigator) {
      if (count + 1 === activeDhikr.target) {
        navigator.vibrate([100, 50, 100]); // double vibrate at target
      } else {
        navigator.vibrate(20);
      }
    }
  };

  const reset = () => {
    // save total
    const saved = localStorage.getItem('alihsan-dhikr-totals');
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[activeDhikr.id] = (parsed[activeDhikr.id] || 0) + count;
    localStorage.setItem('alihsan-dhikr-totals', JSON.stringify(parsed));
    
    setTotalCount(parsed[activeDhikr.id]);
    setCount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DHIKR_TYPES.map((dt) => (
          <button
            key={dt.id}
            onClick={() => {
              if (count > 0 && confirm('Enregistrer la session en cours ?')) reset();
              else setCount(0);
              setActiveDhikr(dt);
            }}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeDhikr.id === dt.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            {dt.title}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>
        <div className="relative z-10 w-full mb-8">
            <h3 className="font-serif font-bold text-2xl text-indigo-950 mb-2">{activeDhikr.title}</h3>
            <p className="arabic-text text-5xl text-indigo-800 leading-relaxed mb-4">{activeDhikr.arabic}</p>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                Objectif: {activeDhikr.target}
            </div>
            {totalCount > 0 && (
                <div className="mt-2 text-stone-400 text-xs font-medium">Total global : {totalCount + count}</div>
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

        <div className="flex justify-between w-full max-w-[16rem] mt-8 gap-4 px-4">
            <div className="flex-1"></div>
            <button 
                onClick={reset}
                className="p-3 bg-stone-100 text-stone-500 hover:bg-stone-200 rounded-full transition-colors flex items-center justify-center shadow-inner"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[16rem] mt-8 bg-stone-100 h-2 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (count / activeDhikr.target) * 100)}%` }}
            ></div>
        </div>
      </div>
    </div>
  );
}
