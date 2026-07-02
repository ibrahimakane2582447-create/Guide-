import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, MapPin, Volume2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const Card = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
  <motion.div 
    whileTap={onClick ? { scale: 0.97 } : undefined}
    whileHover={onClick ? { y: -2 } : undefined}
    onClick={onClick}
    className={`rounded-3xl cursor-pointer transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const PRAYER_NAMES_DEFAULT: Record<string, { wolof: string, arabic: string }> = {
  Fajr: { wolof: 'Souba', arabic: 'الفجر' },
  Dhuhr: { wolof: 'Tisbar', arabic: 'الظهر' },
  Asr: { wolof: 'Takusan', arabic: 'العصر' },
  Maghrib: { wolof: 'Timis', arabic: 'المغرب' },
  Isha: { wolof: 'Gueewe', arabic: 'العشاء' },
};

const DAYS_WOLOF = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface PrayerTimes {
  [key: string]: string;
}

export function PrayersAndAlarms() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [todayStr, setTodayStr] = useState('');

  // Customizable Names State
  const [customPrayerNames, setCustomPrayerNames] = useState<Record<string, { wolof: string, arabic: string }>>(() => {
    const saved = localStorage.getItem('alihsan-custom-prayer-names');
    return saved ? JSON.parse(saved) : PRAYER_NAMES_DEFAULT;
  });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingTimes, setEditingTimes] = useState<PrayerTimes>({});
  const [editingNames, setEditingNames] = useState<Record<string, { wolof: string, arabic: string }>>({});

  // Audio state
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);

  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceFriday = (dayOfWeek + 2) % 7;
    
    const lastFriday = new Date(now);
    lastFriday.setDate(now.getDate() - daysSinceFriday);
    
    const nextThursday = new Date(lastFriday);
    nextThursday.setDate(lastFriday.getDate() + 6);
    
    const formatD = (d: Date) => `${DAYS_WOLOF[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
    
    setCurrentDateStr(`Semaine du ${formatD(lastFriday)} au ${formatD(nextThursday)}`);
    setTodayStr(`Aujourd'hui : ${formatD(now)}`);
  }, []);

  const fetchPrayerTimes = (forceGeolocation = false) => {
    setLoading(true);
    setError('');

    // If we have cached times and aren't forcing geolocation, reuse them
    if (!forceGeolocation) {
      const cachedTimes = localStorage.getItem('alihsan-prayer-times');
      const cachedDate = localStorage.getItem('alihsan-prayer-date');
      const today = new Date().toDateString();

      if (cachedTimes && cachedDate === today) {
        try {
          setPrayerTimes(JSON.parse(cachedTimes));
          setLoading(false);
          return;
        } catch (e) {
          // Fall back to fetch if parse fails
        }
      }
    }
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
            const data = await res.json();
            if (data && data.data && data.data.timings) {
              const timings = data.data.timings;
              setPrayerTimes(timings);
              localStorage.setItem('alihsan-prayer-times', JSON.stringify(timings));
              localStorage.setItem('alihsan-prayer-date', new Date().toDateString());
            }
          } catch (err) {
            setError('Erreur lors du chargement des heures de prière.');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          // If geolocation is blocked or fails, check if we have ANY cached times to load as fallback
          const cachedTimes = localStorage.getItem('alihsan-prayer-times');
          if (cachedTimes) {
            try {
              setPrayerTimes(JSON.parse(cachedTimes));
              setLoading(false);
              return;
            } catch (e) {}
          }
          setError('Veuillez autoriser la géolocalisation pour obtenir les heures de prière ou ajustez-les manuellement.');
          setLoading(false);
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée par votre appareil.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes(false);
  }, []);

  // Set up event listeners for the global background audio
  useEffect(() => {
    const audioEl = document.getElementById('adhan-notification-audio') as HTMLAudioElement;
    
    const handleEnded = () => {
      setIsPlayingAdhan(false);
    };

    const handlePause = () => {
      setIsPlayingAdhan(false);
    };

    const handlePlay = () => {
      setIsPlayingAdhan(true);
    };

    if (audioEl) {
      audioEl.addEventListener('ended', handleEnded);
      audioEl.addEventListener('pause', handlePause);
      audioEl.addEventListener('play', handlePlay);
      // Synchronize initial state
      setIsPlayingAdhan(!audioEl.paused);
    }

    return () => {
      if (audioEl) {
        audioEl.removeEventListener('ended', handleEnded);
        audioEl.removeEventListener('pause', handlePause);
        audioEl.removeEventListener('play', handlePlay);
      }
    };
  }, []);

  const playAdhanPreview = () => {
    const audioEl = document.getElementById('adhan-notification-audio') as HTMLAudioElement;
    if (!audioEl) {
      console.error('Global audio element adhan-notification-audio not found in DOM.');
      return;
    }

    if (!audioEl.paused) {
      audioEl.pause();
      setIsPlayingAdhan(false);
    } else {
      audioEl.currentTime = 0;
      audioEl.volume = 1.0;
      audioEl.muted = false;
      audioEl.play()
        .then(() => {
          setIsPlayingAdhan(true);
        })
        .catch(e => {
          console.error('Audio play failed:', e);
        });
    }
  };

  const startEditing = () => {
    if (prayerTimes) {
      setEditingTimes({ ...prayerTimes });
      setEditingNames({ ...customPrayerNames });
      setIsEditing(true);
    } else {
      // Initialize with empty or default times if none exist
      const defaultTimes: PrayerTimes = {
        Fajr: '05:30',
        Dhuhr: '13:00',
        Asr: '16:30',
        Maghrib: '19:15',
        Isha: '20:30'
      };
      setEditingTimes(defaultTimes);
      setEditingNames({ ...customPrayerNames });
      setIsEditing(true);
    }
  };

  const saveEdits = () => {
    setPrayerTimes(editingTimes);
    setCustomPrayerNames(editingNames);
    localStorage.setItem('alihsan-prayer-times', JSON.stringify(editingTimes));
    localStorage.setItem('alihsan-prayer-date', new Date().toDateString());
    localStorage.setItem('alihsan-custom-prayer-names', JSON.stringify(editingNames));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-24">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Heures de Prière
          </h2>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={saveEdits}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  title="Sauvegarder"
                >
                  <Check className="w-3.5 h-3.5" /> Enregistrer
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border border-stone-200 dark:border-stone-700"
                  title="Annuler"
                >
                  <X className="w-3.5 h-3.5" /> Annuler
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={startEditing}
                  className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 hover:bg-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1"
                  title="Modifier les heures et noms"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Personnaliser
                </button>
                <button 
                  onClick={() => fetchPrayerTimes(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 p-2 rounded-full transition-colors"
                  title="Actualiser la position"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-stone-700 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
            <p className="font-medium text-sm">Recherche de votre position...</p>
          </div>
        ) : error && !prayerTimes ? (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-6 rounded-3xl text-sm border border-red-100 dark:border-red-900/50 text-center shadow-sm">
            <p className="font-semibold mb-3">{error}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => fetchPrayerTimes(true)} className="bg-red-100 dark:bg-red-900/40 hover:bg-red-200 px-4 py-2 rounded-xl font-bold transition-colors text-xs">Réessayer la position</button>
              <button onClick={startEditing} className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 px-4 py-2 rounded-xl font-bold transition-colors text-xs">Ajuster manuellement</button>
            </div>
          </div>
        ) : prayerTimes ? (
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-3xl border border-emerald-900 shadow-xl shadow-emerald-900/10 mb-8">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-600 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-emerald-900 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col mb-6">
                <span className="text-emerald-50 font-bold text-xl mb-1">{currentDateStr}</span>
                <span className="text-emerald-200/90 font-medium">{todayStr}</span>
                <span className="text-emerald-400/80 text-[11px] font-bold tracking-wide mt-1 uppercase">Heures de prière locales</span>
              </div>

              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  playAdhanPreview();
                }}
                className="flex justify-between items-center p-4 mb-6 bg-emerald-900/40 hover:bg-emerald-900/60 active:scale-[0.99] rounded-2xl border border-emerald-700/50 backdrop-blur-sm cursor-pointer transition-all select-none"
                title="Cliquer pour écouter l'Adhan de Bilal"
              >
                <span className="text-sm font-bold text-emerald-100 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
                  Voix de Bilal (Adhan de Médine)
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    playAdhanPreview();
                  }}
                  className={`text-xs px-4 py-2 rounded-full font-bold transition-all shadow-sm ${
                    isPlayingAdhan 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-emerald-50 text-emerald-900 hover:bg-white'
                  }`}
                >
                  {isPlayingAdhan ? "Arrêter l'audio" : "Tester l'audio"}
                </button>
              </div>
              
              <div className="space-y-3">
                {isEditing ? (
                  ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => (
                    <div key={key} className="bg-emerald-900/50 backdrop-blur-sm p-4 rounded-2xl border border-emerald-700/60 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">{key}</span>
                        <input
                          type="text"
                          value={editingNames[key]?.arabic || ''}
                          onChange={(e) => setEditingNames({
                            ...editingNames,
                            [key]: { ...editingNames[key], arabic: e.target.value }
                          })}
                          placeholder="Nom Arabe"
                          className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-sm text-right font-arabic text-emerald-100 max-w-[140px] focus:outline-none focus:border-emerald-400"
                          dir="rtl"
                        />
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <input
                          type="text"
                          value={editingNames[key]?.wolof || ''}
                          onChange={(e) => setEditingNames({
                            ...editingNames,
                            [key]: { ...editingNames[key], wolof: e.target.value }
                          })}
                          placeholder="Nom Wolof"
                          className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-base font-bold text-white max-w-[160px] focus:outline-none focus:border-emerald-400"
                        />
                        <input
                          type="text"
                          value={editingTimes[key] || ''}
                          onChange={(e) => setEditingTimes({
                            ...editingTimes,
                            [key]: e.target.value
                          })}
                          placeholder="00:00"
                          className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-lg font-mono font-black text-center text-emerald-100 max-w-[110px] focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((key) => (
                    <div key={key} className="flex justify-between items-center bg-emerald-900/40 backdrop-blur-sm p-4 rounded-2xl border border-emerald-700/50 shadow-sm transition-transform hover:scale-[1.01]">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-emerald-800 text-emerald-300 rounded-full flex items-center justify-center border border-emerald-700/50">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-emerald-50">{customPrayerNames[key]?.wolof || PRAYER_NAMES_DEFAULT[key].wolof}</span>
                          <span className="text-xs font-semibold text-emerald-200/60 tracking-wider uppercase">{key}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-arabic text-xl text-emerald-100/90" dir="rtl">
                          {customPrayerNames[key]?.arabic || PRAYER_NAMES_DEFAULT[key].arabic}
                        </span>
                        <span className="text-2xl font-black text-white tracking-tight">
                          {prayerTimes[key]}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
