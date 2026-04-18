/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Heart, 
  HandHelping, 
  BookOpen, 
  ShieldCheck, 
  Phone, 
  MessageCircle,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Doua {
  id: string;
  title: string;
  arabic: string;
  french: string;
  wolof?: string;
  category: 'protection' | 'invocation' | 'daily' | 'lieux' | 'etudes' | 'transport' | 'hadith';
}

const WELCOME_QUOTES = [
  { text: "Invoquez-Moi, Je vous exaucerai.", source: "Coran 40:60" },
  { text: "N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?", source: "Coran 13:28" },
  { text: "Celui qui se souvient de son Seigneur et celui qui ne s'en souvient pas sont comparables au vivant et au mort.", source: "Hadith" },
  { text: "La patience est une lumière.", source: "Hadith" },
  { text: "Certes, la prière préserve de la turpitude et du blâmable.", source: "Coran 29:45" }
];

// --- Data ---
const DOUAS: Doua[] = [
  {
    id: '1',
    title: 'Invocation du matin',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    french: "Nous sommes au matin et la royauté appartient à Allah, Louange à Allah.",
    category: 'daily'
  },
  {
    id: '2',
    title: 'Protection contre le mal',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
    french: "Au nom d'Allah, tel qu'en compagnie de Son Nom rien ne peut nuire sur terre ni au ciel.",
    category: 'protection'
  },
  {
    id: '3',
    title: 'Avant de dormir',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    french: "En Ton nom, ô Allah, je meurs et je vis.",
    category: 'daily'
  },
  {
    id: '4',
    title: 'Après la prière (1)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ (ثَلَاثاً) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    french: "Je demande pardon à Allah (3 fois). Ô Allah ! Tu es la Paix et la paix vient de Toi. Béni sois-Tu, ô Détenteur de la Majesté et de la Générosité.",
    category: 'invocation'
  },
  {
    id: '5',
    title: 'Ayat Al-Kursi (Protection)',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    french: "Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même...",
    category: 'protection'
  },
  {
    id: '6',
    title: 'Doua pour les parents',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    french: "Seigneur ! Fais-leur, à tous deux, miséricorde comme ils m'ont élevé tout petit.",
    category: 'invocation'
  },
  {
    id: '7',
    title: 'Doua pour la subsistance',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    french: "Ô Allah, je Te demande une science utile, une subsistance licite et une œuvre agréée.",
    category: 'invocation'
  },
  {
    id: '8',
    title: 'Après la prière (2)',
    arabic: 'سُبْحَانَ اللَّهِ (33) الْحَمْدُ لِلَّهِ (33) اللَّهُ أَكْبَرُ (33)',
    french: "Gloire à Allah (33 fois), Louange à Allah (33 fois), Allah est le plus Grand (33 fois).",
    category: 'invocation'
  },
  {
    id: '9',
    title: 'Entrer à la maison',
    arabic: 'بِسْـمِ اللهِ وَلَجْنـا، وَبِسْـمِ اللهِ خَـرَجْنـا، وَعَلـى رَبِّنـا تَوَكّلْـنا',
    french: "Au nom d'Allah nous entrons, au nom d'Allah nous sortons, et en notre Seigneur nous plaçons notre confiance.",
    category: 'lieux'
  },
  {
    id: '10',
    title: 'Sortir de la maison',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    french: "Au nom d'Allah, je place ma confiance en Allah. Il n'y a de force ni de puissance qu'en Allah.",
    category: 'lieux'
  },
  {
    id: '11',
    title: 'Entrer aux toilettes',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ',
    french: "Ô Allah, je cherche refuge auprès de Toi contre les démons mâles et femelles.",
    category: 'lieux'
  },
  {
    id: '12',
    title: 'Sortir des toilettes',
    arabic: 'غُفْرَانَكَ',
    french: "Je Te demande pardon (Ô Allah).",
    category: 'lieux'
  },
  {
    id: '13',
    title: 'Entrer à la mosquée',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    french: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
    category: 'lieux'
  },
  {
    id: '14',
    title: 'Sortir de la mosquée',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    french: "Ô Allah, je Te demande de Ta grâce.",
    category: 'lieux'
  },
  {
    id: '15',
    title: 'Entrer au marché / boutique',
    arabic: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، يُحيي ويُميت، وهو حي لا يموت، بيده الخير، وهو على كل شيء قدير',
    french: "Il n'y a de divinité digne d'être adorée qu'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange. Il donne la vie et donne la mort. Il est Vivant et ne meurt jamais. Le bien est dans Sa main et Il est Omnipotent.",
    category: 'lieux'
  },
  {
    id: '16',
    title: 'Faciliter une tâche (Examen, Concours)',
    arabic: 'اللَّهُمَّ لاَ سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً',
    french: "Ô Allah, il n'y a de chose facile que ce que Tu rends facile, et si Tu le veux, Tu peux rendre la chose difficile facile.",
    category: 'etudes'
  },
  {
    id: '17',
    title: 'Pour la science (Élève, Chercheur)',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    french: "Ô mon Seigneur, accroît mes connaissances !",
    category: 'etudes'
  },
  {
    id: '18',
    title: 'Avant un examen (Ouvrir la poitrine)',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    french: "Seigneur, ouvre-moi ma poitrine, et facilite ma mission, et dénoue un nœud en ma langue, afin qu'ils comprennent mes paroles.",
    category: 'etudes'
  },
  {
    id: '19',
    title: 'Monter dans un véhicule / transport',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    french: "Gloire à Celui qui a mis ceci à notre service alors que nous n'étions pas capables de le dominer. Et c'est vers notre Seigneur que nous retournerons.",
    wolof: "Ndamm yal nay ñeel kiy dogal lii ci sunu loxo, te ñun munuñuko woon, te ci sunu Boroom lañuy dellu.",
    category: 'transport'
  },
  {
    id: '20',
    title: 'Les actes et les intentions (Hadith)',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    french: "Les actes ne valent que par les intentions, et chacun n'a pour lui que ce qu'il a eu l'intention de faire.",
    wolof: "Jëf yi ci yéene lañuy wéet, te nit ku nekk la mu yéene rekk lay am.",
    category: 'hadith'
  },
  {
    id: '21',
    title: 'Le bon comportement (Hadith)',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    french: "Les croyants qui ont la foi la plus parfaite sont ceux qui ont le meilleur comportement.",
    wolof: "Ñi gën a mat ngëm ci jullit ñi, ñoo di ñi gën a rafet jikkk.",
    category: 'hadith'
  },
  {
    id: '22',
    title: 'Le sourire comme aumône (Hadith)',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    french: "Ton sourire face à ton frère est une aumône.",
    wolof: "Ree ci kanamu sa mbokk sadax la.",
    category: 'hadith'
  },
  {
    id: '23',
    title: 'Parler en bien ou se taire (Hadith)',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    french: "Que celui qui croit en Allah et au Jour dernier dise du bien ou qu'il se taise.",
    wolof: "Kuy gëm Yallah ak bésub mujj ba, na wax lu baax mba mu noppi.",
    category: 'hadith'
  },
  {
    id: '24',
    title: 'La propreté et la purification (Hadith)',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    french: "La purification est la moitié de la foi.",
    wolof: "Set (lab) dafa set wecc ci ngëm.",
    category: 'hadith'
  }
];

// --- Components ---

const Card = ({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-white rounded-2xl p-5 shadow-sm border border-stone-100 cursor-pointer hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [view, setView] = useState<'welcome' | 'home' | 'douas' | 'help'>('welcome');
  const [douaFilter, setDouaFilter] = useState<'all' | 'daily' | 'protection' | 'invocation' | 'lieux' | 'etudes' | 'transport' | 'hadith'>('all');
  const [welcomeQuote, setWelcomeQuote] = useState(WELCOME_QUOTES[0]);

  useEffect(() => {
    // Select a random quote on component mount
    const randomIndex = Math.floor(Math.random() * WELCOME_QUOTES.length);
    setWelcomeQuote(WELCOME_QUOTES[randomIndex]);
  }, []);

  const openWhatsApp = (number: string, name: string) => {
    const message = encodeURIComponent(`Assalamou Alaykoum Oustaz ${name}, j'ai besoin d'aide concernant ma pratique religieuse.`);
    window.open(`https://wa.me/${number.replace(/\s+/g, '')}?text=${message}`, '_blank');
  };

  const makeCall = (number: string) => {
    window.open(`tel:${number.replace(/\s+/g, '')}`, '_self');
  };

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200">
            <Heart className="text-white w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-4">Bienvenue sur Al-Ihsan</h1>
          <p className="text-stone-600 mb-10 leading-relaxed min-h-[5rem]">
            "{welcomeQuote.text}" <br/>
            <span className="italic text-sm opacity-75">— {welcomeQuote.source}</span>
          </p>
          <p className="text-stone-500 mb-12">
            Votre recueil quotidien de douas et d'invocations pour chaque instant de la vie.
          </p>
          <button 
            onClick={() => setView('home')}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors"
          >
            Commencer mon guide
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="bg-white border-bottom border-stone-100 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
        {view !== 'home' ? (
          <button onClick={() => setView('home')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-stone-600" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <h2 className="text-lg font-bold text-stone-800">
          {view === 'home' && "Guide Muslim"}
          {view === 'douas' && "Douas & Invocations"}
          {view === 'help' && "Besoin d'aide"}
        </h2>
        <div className="w-10" />
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-4"
            >
              <Card onClick={() => setView('douas')} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-amber-600 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800">Douas & Invocations</h3>
                  <p className="text-sm text-stone-500">Protections quotidiennes</p>
                </div>
                <ChevronRight className="text-stone-300 w-5 h-5" />
              </Card>

              <Card onClick={() => setView('help')} className="flex items-center gap-4 border-emerald-200 bg-emerald-50/30">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <HandHelping className="text-emerald-700 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900">Besoin d'aide ?</h3>
                  <p className="text-sm text-emerald-700">Contacter un Oustaz</p>
                </div>
                <ChevronRight className="text-emerald-300 w-5 h-5" />
              </Card>
            </motion.div>
          )}

          {view === 'douas' && (
            <motion.div 
              key="douas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['all', 'daily', 'protection', 'invocation', 'lieux', 'transport', 'etudes', 'hadith'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDouaFilter(f as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      douaFilter === f ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : f === 'lieux' ? 'Lieux' : f === 'etudes' ? 'Études & Examens' : f === 'hadith' ? 'Hadiths & Sagesses' : f === 'transport' ? 'Véhicules & Transport' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {DOUAS.filter(d => douaFilter === 'all' || d.category === douaFilter).map((doua) => (
                <div key={doua.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-stone-800">{doua.title}</h3>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      doua.category === 'protection' ? 'bg-red-50 text-red-600' : 
                      doua.category === 'hadith' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {doua.category}
                    </span>
                  </div>
                  <p className="arabic-text text-2xl text-stone-900 mb-4 text-right leading-loose">{doua.arabic}</p>
                  <div className="h-px bg-stone-100 mb-4" />
                  
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-600 text-sm italic leading-relaxed flex-1">"{doua.french}"</p>
                    </div>
                    
                    {doua.wolof && (
                      <div className="flex gap-2 items-start pt-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase mt-0.5">WO</span>
                        <p className="text-stone-600 text-sm italic leading-relaxed flex-1 text-emerald-900">"{doua.wolof}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'help' && (
            <motion.div 
              key="help"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <p className="text-stone-600">Nos Oustaz sont à votre disposition pour toute question religieuse.</p>
              </div>

              {/* Oustaz Kane */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-lg text-stone-800 mb-4">Oustaz Kane</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => makeCall('770903109')}
                    className="flex items-center justify-center gap-2 bg-stone-100 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Appeler
                  </button>
                  <button 
                    onClick={() => openWhatsApp('770903109', 'Kane')}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Oustaz Ciss */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-lg text-stone-800 mb-4">Oustaz Ciss</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => makeCall('+221 76 261 30 15')}
                    className="flex items-center justify-center gap-2 bg-stone-100 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Appeler
                  </button>
                  <button 
                    onClick={() => openWhatsApp('+221 76 261 30 15', 'Ciss')}
                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>

              <div className="pt-10 text-center border-t border-stone-200">
                <p className="text-stone-400 text-sm font-medium uppercase tracking-widest">Ibrahima Kane</p>
                <p className="text-stone-400 text-xs">Diamaguene, Dakar</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-6 py-3 flex justify-around items-center z-10">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Guide</span>
        </button>
        <button onClick={() => setView('douas')} className={`flex flex-col items-center gap-1 ${view === 'douas' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <ShieldCheck className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Douas</span>
        </button>
        <button onClick={() => setView('help')} className={`flex flex-col items-center gap-1 ${view === 'help' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <HandHelping className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Aide</span>
        </button>
      </nav>
    </div>
  );
}
