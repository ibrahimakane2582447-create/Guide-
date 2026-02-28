/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Heart, 
  Droplets, 
  HandHelping, 
  BookOpen, 
  ShieldCheck, 
  Phone, 
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Step {
  title: string;
  description: string;
  arabic?: string;
  imageUrl: string;
  crop?: { x: number, y: number, zoom: number };
}

interface Doua {
  id: string;
  title: string;
  arabic: string;
  french: string;
  category: 'protection' | 'invocation' | 'daily' | 'lieux' | 'etudes';
}

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
  }
];

const WUDU_IMG = 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/2026/02/28/13/05/59/2jfk4bxd32xbnhsbotwnbg-155752067421/image_1.jpeg';
const PRAYER_IMG = 'https://storage.googleapis.com/aistudio-user-content-prod-eu-west2/2026/02/28/13/05/59/2jfk4bxd32xbnhsbotwnbg-155752067421/image_0.jpeg';

const WUDU_STEPS: Step[] = [
  { title: 'L\'intention (Niyyah)', description: 'Formuler l\'intention dans son cœur et dire "Bismillah".', imageUrl: WUDU_IMG, crop: { x: 0, y: 0, zoom: 3 } },
  { title: 'Laver les mains', description: 'Laver les mains jusqu\'aux poignets trois fois, en passant entre les doigts.', imageUrl: WUDU_IMG, crop: { x: 0, y: 0, zoom: 3 } },
  { title: 'Rincer la bouche', description: 'Prendre de l\'eau avec la main droite et rincer la bouche trois fois.', imageUrl: WUDU_IMG, crop: { x: 50, y: 0, zoom: 3 } },
  { title: 'Rincer le nez', description: 'Inspirer de l\'eau par le nez et l\'expulser avec la main gauche trois fois.', imageUrl: WUDU_IMG, crop: { x: 100, y: 0, zoom: 3 } },
  { title: 'Laver le visage', description: 'Laver tout le visage trois fois, du front au menton et d\'une oreille à l\'autre.', imageUrl: WUDU_IMG, crop: { x: 0, y: 50, zoom: 3 } },
  { title: 'Laver les bras', description: 'Laver les bras jusqu\'aux coudes trois fois, en commençant par le bras droit.', imageUrl: WUDU_IMG, crop: { x: 50, y: 50, zoom: 3 } },
  { title: 'Essuyer la tête', description: 'Passer les mains mouillées sur la tête, de l\'avant vers l\'arrière puis revenir.', imageUrl: WUDU_IMG, crop: { x: 100, y: 50, zoom: 3 } },
  { title: 'Essuyer les oreilles', description: 'Essuyer l\'intérieur des oreilles avec les index et l\'extérieur avec les pouces.', imageUrl: WUDU_IMG, crop: { x: 0, y: 100, zoom: 3 } },
  { title: 'Laver les pieds', description: 'Laver les pieds jusqu\'aux chevilles trois fois, en commençant par le pied droit.', imageUrl: WUDU_IMG, crop: { x: 50, y: 100, zoom: 3 } },
];

const GHUSL_STEPS: Step[] = [
  { title: 'L\'intention', description: 'Avoir l\'intention de se purifier pour Allah.', imageUrl: WUDU_IMG, crop: { x: 0, y: 0, zoom: 3 } },
  { title: 'Laver les mains', description: 'Laver les mains trois fois.', imageUrl: WUDU_IMG, crop: { x: 0, y: 0, zoom: 3 } },
  { title: 'Laver les parties privées', description: 'Laver soigneusement les parties privées avec la main gauche.', imageUrl: WUDU_IMG, crop: { x: 50, y: 50, zoom: 3 } },
  { title: 'Faire le Wudu', description: 'Faire ses ablutions comme pour la prière (on peut laisser les pieds pour la fin).', imageUrl: WUDU_IMG, crop: { x: 50, y: 0, zoom: 3 } },
  { title: 'Laver la tête', description: 'Verser de l\'eau sur la tête trois fois en frottant bien les racines.', imageUrl: WUDU_IMG, crop: { x: 100, y: 50, zoom: 3 } },
  { title: 'Laver le corps (Droit)', description: 'Verser de l\'eau sur tout le côté droit du corps.', imageUrl: WUDU_IMG, crop: { x: 0, y: 100, zoom: 3 } },
  { title: 'Laver le corps (Gauche)', description: 'Verser de l\'eau sur tout le côté gauche du corps.', imageUrl: WUDU_IMG, crop: { x: 0, y: 100, zoom: 3 } },
];

const PRAYER_STEPS: Step[] = [
  { title: 'Takbir Al-Ihram', description: 'Lever les mains aux oreilles et dire "Allahu Akbar".', arabic: 'اللَّهُ أَكْبَرُ', imageUrl: PRAYER_IMG, crop: { x: 0, y: 35, zoom: 4 } },
  { title: 'Al-Qiyam', description: 'Poser la main droite sur la gauche sur la poitrine. Réciter la Fatiha et une autre sourate.', imageUrl: PRAYER_IMG, crop: { x: 25, y: 35, zoom: 4 } },
  { title: 'Ruku (Inclinaison)', description: 'S\'incliner le dos droit, mains sur les genoux. Dire 3x "Subhana Rabbiyal Adhim".', arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', imageUrl: PRAYER_IMG, crop: { x: 50, y: 35, zoom: 4 } },
  { title: 'I\'tidal (Redressement)', description: 'Se redresser en disant "Sami\' Allahu liman hamidah" puis "Rabbana wa lakal hamd".', arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ', imageUrl: PRAYER_IMG, crop: { x: 75, y: 35, zoom: 4 } },
  { title: 'Sujud (Prosternation)', description: 'Se prosterner au sol (front, nez, mains, genoux, pieds). Dire 3x "Subhana Rabbiyal A\'la".', arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', imageUrl: PRAYER_IMG, crop: { x: 100, y: 35, zoom: 4 } },
  { title: 'Jalsa (Assise)', description: 'S\'asseoir entre les deux prosternations. Dire "Rabbighfir li".', arabic: 'رَبِّ اغْفِرْ لِي', imageUrl: PRAYER_IMG, crop: { x: 0, y: 60, zoom: 4 } },
  { title: 'Second Sujud', description: 'Effectuer une deuxième prosternation identique à la première.', imageUrl: PRAYER_IMG, crop: { x: 25, y: 60, zoom: 4 } },
  { title: 'Tashahhud', description: 'S\'asseoir pour le témoignage de foi final.', arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ...', imageUrl: PRAYER_IMG, crop: { x: 50, y: 60, zoom: 4 } },
  { title: 'Taslim (Salutation)', description: 'Tourner la tête à droite puis à gauche en disant "Assalamu alaykum wa rahmatullah".', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', imageUrl: PRAYER_IMG, crop: { x: 87, y: 60, zoom: 4 } },
];

// --- Components ---

const CroppedImage = ({ src, crop, onClick }: { src: string, crop?: { x: number, y: number, zoom: number }, onClick?: () => void }) => {
  if (!crop) {
    return <img src={src} className="w-full h-56 object-cover cursor-pointer" onClick={onClick} referrerPolicy="no-referrer" />;
  }
  return (
    <div className="w-full h-56 overflow-hidden relative bg-stone-100 cursor-pointer" onClick={onClick}>
      <img 
        src={src} 
        alt="Demonstration"
        className="absolute max-w-none"
        style={{
          width: `${crop.zoom * 100}%`,
          left: `${-crop.x * (crop.zoom - 1)}%`,
          top: `${-crop.y * (crop.zoom - 1)}%`,
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

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
  const [view, setView] = useState<'welcome' | 'home' | 'ablutions' | 'prayer' | 'douas' | 'help'>('welcome');
  const [ablutionType, setAblutionType] = useState<'wudu' | 'ghusl'>('wudu');
  const [douaFilter, setDouaFilter] = useState<'all' | 'daily' | 'protection' | 'invocation' | 'lieux' | 'etudes'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
          <p className="text-stone-600 mb-10 leading-relaxed">
            "Certes, la prière préserve de la turpitude et du blâmable." <br/>
            <span className="italic text-sm opacity-75">— Coran 29:45</span>
          </p>
          <p className="text-stone-500 mb-12">
            Apprenez les bases de votre foi avec sérénité et précision.
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
          {view === 'ablutions' && "Ablutions"}
          {view === 'prayer' && "La Prière"}
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
              <Card onClick={() => setView('ablutions')} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Droplets className="text-blue-600 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800">Ablutions</h3>
                  <p className="text-sm text-stone-500">Wudu & Grandes Ablutions</p>
                </div>
                <ChevronRight className="text-stone-300 w-5 h-5" />
              </Card>

              <Card onClick={() => setView('prayer')} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-emerald-600 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800">La Prière</h3>
                  <p className="text-sm text-stone-500">Guide étape par étape</p>
                </div>
                <ChevronRight className="text-stone-300 w-5 h-5" />
              </Card>

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

          {view === 'ablutions' && (
            <motion.div 
              key="ablutions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
                <button 
                  onClick={() => setAblutionType('wudu')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${ablutionType === 'wudu' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-500'}`}
                >
                  Wudu (Petit)
                </button>
                <button 
                  onClick={() => setAblutionType('ghusl')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${ablutionType === 'ghusl' ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-500'}`}
                >
                  Ghusl (Grand)
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  {ablutionType === 'wudu' 
                    ? "Le Wudu est nécessaire pour chaque prière si vous l'avez perdu." 
                    : "Le Ghusl est obligatoire après un état d'impureté majeure."}
                </p>
              </div>

              {(ablutionType === 'wudu' ? WUDU_STEPS : GHUSL_STEPS).map((step, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                  <CroppedImage src={step.imageUrl} crop={step.crop} onClick={() => setSelectedImage(step.imageUrl)} />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <h3 className="font-bold text-stone-800">{step.title}</h3>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'prayer' && (
            <motion.div 
              key="prayer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800">Suivez ces étapes pour accomplir une unité de prière (Rakat) et la conclusion.</p>
              </div>

              {PRAYER_STEPS.map((step, idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
                  <CroppedImage src={step.imageUrl} crop={step.crop} onClick={() => setSelectedImage(step.imageUrl)} />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <h3 className="font-bold text-stone-800">{step.title}</h3>
                    </div>
                    {step.arabic && (
                      <p className="arabic-text text-2xl text-emerald-700 mb-3 text-right leading-loose">{step.arabic}</p>
                    )}
                    <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  Invocations après la prière
                </h3>
                <div className="space-y-4">
                  {DOUAS.filter(d => d.title.includes('Après la prière')).map((doua) => (
                    <div key={doua.id} className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm">
                      <p className="arabic-text text-xl text-stone-900 mb-2 text-right">{doua.arabic}</p>
                      <p className="text-stone-500 text-xs italic">{doua.french}</p>
                    </div>
                  ))}
                </div>
              </div>
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
                {['all', 'daily', 'protection', 'invocation', 'lieux', 'etudes'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDouaFilter(f as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      douaFilter === f ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : f === 'lieux' ? 'Lieux' : f === 'etudes' ? 'Études & Examens' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {DOUAS.filter(d => douaFilter === 'all' || d.category === douaFilter).map((doua) => (
                <div key={doua.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-stone-800">{doua.title}</h3>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      doua.category === 'protection' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {doua.category}
                    </span>
                  </div>
                  <p className="arabic-text text-2xl text-stone-900 mb-4 text-right leading-loose">{doua.arabic}</p>
                  <div className="h-px bg-stone-100 mb-4" />
                  <p className="text-stone-600 text-sm italic leading-relaxed">"{doua.french}"</p>
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

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <img 
                src={selectedImage} 
                alt="Zoomed Demonstration" 
                className="max-w-none w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              Fermer
            </button>
            <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-sm pointer-events-none">
              Pincez pour zoomer
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
