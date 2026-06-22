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
  ArrowLeft,
  Quote,
  Gift,
  X,
  Copy,
  Check,
  Lightbulb,
  Volume2,
  Droplets,
  Camera,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
import { AudioRecorder } from './components/AudioRecorder';
import { Dhikr } from './components/Dhikr';

// --- Types ---
interface Doua {
  id: string;
  title: string;
  arabic: string;
  phonetic?: string;
  french: string;
  wolof?: string;
  reporter?: string;
  category: 'protection' | 'invocation' | 'daily' | 'lieux' | 'etudes' | 'transport' | 'hadith';
}

interface AblutionStep {
  step: number;
  title: string;
  description: string;
  wolof: string;
}

const ABLUTIONS_PETIT: AblutionStep[] = [
  { step: 1, title: 'Intention (Niyyah)', description: 'Avoir l\'intention de faire ses ablutions pour la prière et dire "Bismillah".', wolof: 'Am yéene def njapp ngir julli, ne "Bismillah".' },
  { step: 2, title: 'Mains', description: 'Laver les mains jusqu\'aux poignets, 3 fois.', wolof: 'Raxas say loxo ba ci say tikkuju-loxo, ñatti yoon.' },
  { step: 3, title: 'Bouche', description: 'Se rincer la bouche, 3 fois.', wolof: 'Gàllaxndiku (raxas sa gémmiñ), ñatti yoon.' },
  { step: 4, title: 'Nez', description: 'Inhaler l\'eau dans le nez et l\'expulser, 3 fois.', wolof: 'Saañu (dugal ndox ci sa bakkan te guénne ko), ñatti yoon.' },
  { step: 5, title: 'Visage', description: 'Laver le visage entier (du front au menton, d\'une oreille à l\'autre), 3 fois.', wolof: 'Raxas sa kanam yepp (dale ko ci tool ba ci sa xabe), ñatti yoon.' },
  { step: 6, title: 'Bras', description: 'Laver le bras droit jusqu\'au coude inclus (3x), puis le gauche (3x).', wolof: 'Raxas sa loxo ndeyjoor ba ci sa coñc (3x), teg ci loxo càmmooñ (3x).' },
  { step: 7, title: 'Tête', description: 'Passer les mains mouillées de l\'avant de la tête vers l\'arrière et revenir, 1 fois.', wolof: 'Masap sa bopp (fóom sa bopp ak ndox), benn yoon.' },
  { step: 8, title: 'Oreilles', description: 'Nettoyer l\'intérieur et l\'extérieur des oreilles, 1 fois.', wolof: 'Masap say nopp (biir ak biti), benn yoon.' },
  { step: 9, title: 'Pieds', description: 'Laver le pied droit jusqu\'aux chevilles incluses (3x), puis le gauche (3x).', wolof: 'Raxas sa tànk ndeyjoor ba ci sa tikkuju-tànk (3x), teg ci bu càmmooñ (3x).' },
  { step: 10, title: 'Doua (Fin)', description: 'Dire l\'invocation de fin : "Ach-hadou an la ilaha illallah..."', wolof: 'Ñaan bi ciy top : "Ach-hadou an la ilaha illallah..."' }
];

const ABLUTIONS_GRAND: AblutionStep[] = [
  { step: 1, title: 'Intention (Niyyah)', description: 'Avoir l\'intention de se purifier (Janaba, menstrues...) et dire "Bismillah".', wolof: 'Am yéene laab (ci janaba, mbaa mbirum jigéen) ne "Bismillah".' },
  { step: 2, title: 'Mains & Parties intimes', description: 'Laver les mains 3 fois, puis laver les parties intimes avec la main gauche.', wolof: 'Raxas say loxo 3 yoon, raxas say awra ak loxo càmmooñ.' },
  { step: 3, title: 'Ablutions mineures', description: 'Faire les ablutions mineures comme pour la prière (sans se laver les pieds ou avec, selon l\'école).', wolof: 'Def njapp mu sell mi nga xamne mooy njappum julli.' },
  { step: 4, title: 'Tête', description: 'Verser de l\'eau sur la tête 3 fois en frictionnant les cheveux jusqu\'aux racines.', wolof: 'Sotti ndox ci sa bopp 3 yoon, di xasaat say kawar ba ndox mi di àgg ci tàtt yi.' },
  { step: 5, title: 'Côté droit', description: 'Verser de l\'eau et laver tout le côté droit du corps (de haut en bas).', wolof: 'Sotti ndox te raxas wàllu ndeyjooru yaram gi yépp.' },
  { step: 6, title: 'Côté gauche', description: 'Verser de l\'eau et laver tout le côté gauche du corps.', wolof: 'Sotti ndox te raxas wàllu càmmooñu yaram gi yépp.' },
  { step: 7, title: 'Tout le corps', description: 'S\'assurer que l\'eau a touché chaque partie du corps sans exception.', wolof: 'Na la wóor ne ndox mi romb na fu nekk ci sa yaram.' }
];

const WELCOME_QUOTES = [
  { text: "Invoquez-Moi, Je vous exaucerai.", source: "Coran 40:60" },
  { text: "N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?", source: "Coran 13:28" },
  { text: "Celui qui se souvient de son Seigneur et celui qui ne s'en souvient pas sont comparables au vivant et au mort.", source: "Hadith" },
  { text: "La patience est une lumière.", source: "Hadith" },
  { text: "Certes, la prière préserve de la turpitude et du blâmable.", source: "Coran 29:45" }
];

const normalizeStr = (str: string) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// --- Data ---
const DOUAS: Doua[] = [
  {
    id: 'ihsan-1',
    title: 'L’excellence dans l’adoration',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    phonetic: 'Allahumma a’inni ‘ala dhikrika wa shukrika wa husni ‘ibadatik',
    french: 'Ô Allah, aide-moi à T’invoquer, à Te remercier, et à T’adorer avec excellence.',
    category: 'daily'
  },
  {
    id: 'ihsan-2',
    title: 'La sincérité pure',
    arabic: 'اللَّهُمَّ اجْعَلْ عَمَلِي كُلَّهُ صَالِحًا وَاجْعَلْهُ لِوَجْهِكَ خَالِصًا',
    phonetic: 'Allahumma aj’al ‘amali kullahu salihan waj’alhu li wajhika khalisan',
    french: 'Ô Allah, rends toutes mes actions bonnes et fais-les uniquement pour Toi.',
    category: 'invocation'
  },
  {
    id: 'ihsan-3',
    title: 'Le cœur présent',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    phonetic: 'Rabbi ishrah li sadri wa yassir li amri',
    french: 'Seigneur, ouvre-moi ma poitrine et facilite-moi ma tâche.',
    category: 'invocation'
  },
  {
    id: 'ihsan-4',
    title: 'La piété quotidienne',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    phonetic: 'Allahumma inni as’aluka al-huda wa at-tuqa wal-‘afafa wal-ghina',
    french: 'Ô Allah, je Te demande la guidance, la piété, la chasteté et l’indépendance.',
    category: 'daily'
  },
  {
    id: 'ihsan-5',
    title: 'La belle part',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    phonetic: 'Rabbana atina fi d-dunya hasanatan wa fi al-akhirati hasanatan wa qina ‘adhaba an-nar',
    french: 'Seigneur, accorde-nous le bien ici-bas et le bien dans l’au-delà, et protège-nous du feu.',
    category: 'invocation'
  },
  {
    id: '1',
    title: 'Invocation du matin',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    french: "Nous sommes au matin et la royauté appartient à Allah, Louange à Allah.",
    wolof: "Yewwu nanu te nguur gi yépp Yàlla ko moom, cant yépp ñeel na Yàlla.",
    category: 'daily'
  },
  {
    id: '2',
    title: 'Protection contre le mal',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
    french: "Au nom d'Allah, tel qu'en compagnie de Son Nom rien ne peut nuire sur terre ni au ciel.",
    wolof: "Ci turu Yàlla mi nga xam ne ludul mbir ci kaw suuf walla ci asamaan munu la lor ci ànd ak turam.",
    category: 'protection'
  },
  {
    id: '3',
    title: 'Avant de dormir',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    french: "En Ton nom, ô Allah, je meurs et je vis.",
    wolof: "Ci sa tur yaw Yàlla, laay dee te ci sa tur laay dund.",
    category: 'daily'
  },
  {
    id: '4',
    title: 'Après la prière (1)',
    arabic: 'أَسْتَغْفِرُ اللَّهَ (ثَلَاثاً) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    french: "Je demande pardon à Allah (3 fois). Ô Allah ! Tu es la Paix et la paix vient de Toi. Béni sois-Tu, ô Détenteur de la Majesté et de la Générosité.",
    wolof: "Maa ngiy jéggalu Yàlla (3 yoon). Yaw Yàlla, yaay jàmm te ci yaw la jàmm di jóge. Barkeel nga, yaw mi moom màggal gi ak teddnga gi.",
    category: 'invocation'
  },
  {
    id: '5',
    title: 'Ayat Al-Kursi (Protection)',
    arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    french: "Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même...",
    wolof: "Yàlla ! Amul leneen luñuy jaamu ludul Moom, miy dund tey sax-dàqq...",
    category: 'protection'
  },
  {
    id: '6',
    title: 'Doua pour les parents',
    arabic: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    french: "Seigneur ! Fais-leur, à tous deux, miséricorde comme ils m'ont élevé tout petit.",
    wolof: "Sama Boroom ! Yërëm leen ñaar ñépp, ni nu ma yaroowe woon ma nekk xale.",
    category: 'invocation'
  },
  {
    id: '7',
    title: 'Doua pour la subsistance',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    french: "Ô Allah, je Te demande une science utile, une subsistance licite et une œuvre agréée.",
    wolof: "Yaw Yàlla, maa ngi lay ñaan xam-xam bu njariñ, wërsëg wu sell ak jëf ju nu nangou.",
    category: 'invocation'
  },
  {
    id: '8',
    title: 'Après la prière (2)',
    arabic: 'سُبْحَانَ اللَّهِ (33) الْحَمْدُ لِلَّهِ (33) اللَّهُ أَكْبَرُ (33)',
    french: "Gloire à Allah (33 fois), Louange à Allah (33 fois), Allah est le plus Grand (33 fois).",
    wolof: "Sell na Yàlla (33), Cant ñeel na Yàlla (33), Yàlla a gëna màgg (33).",
    category: 'invocation'
  },
  {
    id: '9',
    title: 'Entrer à la maison',
    arabic: 'بِسْـمِ اللهِ وَلَجْنـا، وَبِسْـمِ اللهِ خَـرَجْنـا، وَعَلـى رَبِّنـا تَوَكّلْـنا',
    french: "Au nom d'Allah nous entrons, au nom d'Allah nous sortons, et en notre Seigneur nous plaçons notre confiance.",
    wolof: "Ci turu Yàlla lanu dugg, ci turu Yàlla lanu guenn, te ci sunu Boroom lanu wéeru.",
    category: 'lieux'
  },
  {
    id: '10',
    title: 'Sortir de la maison',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    french: "Au nom d'Allah, je place ma confiance en Allah. Il n'y a de force ni de puissance qu'en Allah.",
    wolof: "Ci turu Yàlla, wéeru naa ci Yàlla. Amul kàttan ak doole ludul ci Yàlla.",
    category: 'lieux'
  },
  {
    id: '11',
    title: 'Entrer aux toilettes',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ',
    french: "Ô Allah, je cherche refuge auprès de Toi contre les démons mâles et femelles.",
    wolof: "Yaw Yàlla, maa ngi daw làqu ci yaw, di tàccu seytane yu góor ak yu jigéen yi.",
    category: 'lieux'
  },
  {
    id: '12',
    title: 'Sortir des toilettes',
    arabic: 'غُفْرَانَكَ',
    french: "Je Te demande pardon (Ô Allah).",
    wolof: "Yàlla, maa ngi lay ñaan nga jéggal ma.",
    category: 'lieux'
  },
  {
    id: '13',
    title: 'Entrer à la mosquée',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    french: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
    wolof: "Yaw Yàlla, ubbil ma bunti sa yërmande.",
    category: 'lieux'
  },
  {
    id: '14',
    title: 'Sortir de la mosquée',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    french: "Ô Allah, je Te demande de Ta grâce.",
    wolof: "Yaw Yàlla, maa ngi lay ñaan ci sa ngënéel.",
    category: 'lieux'
  },
  {
    id: '15',
    title: 'Entrer au marché / boutique',
    arabic: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، يُحيي ويُميت، وهو حي لا يموت، بيده الخير، وهو على كل شيء قدير',
    french: "Il n'y a de divinité digne d'être adorée qu'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange. Il donne la vie et donne la mort. Il est Vivant et ne meurt jamais. Le bien est dans Sa main et Il est Omnipotent.",
    wolof: "Amul beneen Yàlla budul moom kese, amul kook bokkal. Moom moo moom nguur gi, moo moom cant gi, mooy dundal teyek rey, dund la buy dul dee. Aw yiw ci loxoom la nekk, te Moom ci kaw mbir mu nekk mën na ko.",
    category: 'lieux'
  },
  {
    id: '16',
    title: 'Faciliter une tâche (Examen, Concours)',
    arabic: 'اللَّهُمَّ لاَ سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً',
    french: "Ô Allah, il n'y a de chose facile que ce que Tu rends facile, et si Tu le veux, Tu peux rendre la chose difficile facile.",
    wolof: "Yaw Yàlla, amul luy yomb ludul loo def mu yomb, te yaw booy bëgge luy jafe def ko muy yomb.",
    category: 'etudes'
  },
  {
    id: '17',
    title: 'Pour la science (Élève, Chercheur)',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    french: "Ô mon Seigneur, accroît mes connaissances !",
    wolof: "Sama Boroom, yokkal ma xam-xam !",
    category: 'etudes'
  },
  {
    id: '18',
    title: 'Avant un examen (Ouvrir la poitrine)',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
    french: "Seigneur, ouvre-moi ma poitrine, et facilite ma mission, et dénoue un nœud en ma langue, afin qu'ils comprennent mes paroles.",
    wolof: "Sama Boroom, léralal ma sama dënn, tey yombalal ma sama mbir, te nga fekki lëng ko ci sama làmmiñ, ndax ñu mën a dégg sama wax.",
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
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '21',
    title: 'Le bon comportement (Hadith)',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    french: "Les croyants qui ont la foi la plus parfaite sont ceux qui ont le meilleur comportement.",
    wolof: "Ñi gën a mat ngëm ci jullit ñi, ñoo di ñi gën a rafet jikkk.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '22',
    title: 'Le sourire comme aumône (Hadith)',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    french: "Ton sourire face à ton frère est une aumône.",
    wolof: "Ree ci kanamu sa mbokk sadax la.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '23',
    title: 'Parler en bien ou se taire (Hadith)',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    french: "Que celui qui croit en Allah et au Jour dernier dise du bien ou qu'il se taise.",
    wolof: "Kuy gëm Yallah ak bésub mujj ba, na wax lu baax mba mu noppi.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '24',
    title: 'La propreté et la purification (Hadith)',
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    french: "La purification est la moitié de la foi.",
    wolof: "Set (lab) dafa set wecc ci ngëm.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '25',
    title: 'La miséricorde (Hadith)',
    arabic: 'مَنْ لَا يَرْحَمْ لَا يُرْحَمْ',
    french: "Celui qui ne fait pas miséricorde, on ne lui fera pas miséricorde.",
    wolof: "Ku yërmuwul (ñàkk yërmande), duñu ko yërëm.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '26',
    title: 'La religion c\'est le bon conseil (Hadith)',
    arabic: 'الدِّينُ النَّصِيحَةُ',
    french: "La religion, c'est le bon conseil (la sincérité).",
    wolof: "Diine mooy kàddu gu rafet (walla laabiire).",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '27',
    title: 'L\'amour pour son frère (Hadith)',
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    french: "Aucun de vous ne sera un véritable croyant tant qu'il n'aimera pas pour son frère ce qu'il aime pour lui-même.",
    wolof: "Kenn ci yeen dëggalul ngëmam, li feek bëggul ngir mbokkam li mu bëgg ngir boppam.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '28',
    title: 'Dire la vérité (Hadith)',
    arabic: 'عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ',
    french: "Accrochez-vous à la vérité, car la vérité mène à la piété.",
    wolof: "Dëng-kàddu leen ci dëgg, ndax dëgg dafay jëme ci mbàax (sell).",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '29',
    title: 'Éviter la colère (Hadith)',
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    french: "Le fort n'est pas celui qui terrasse ses adversaires, le fort est celui qui se maîtrise lorsqu'il est en colère.",
    wolof: "Ku am doole du kiy daan nit ñi ci bëre, waaye ku am doole mooy kiy téye boppam bu meré.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '30',
    title: 'L\'importance de la mère (Hadith)',
    arabic: 'الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ',
    french: "Le Paradis se trouve sous les pieds des mères.",
    wolof: "Àjjana mi ngi ci ron tanki ndey yi.",
    reporter: "Rapporté par Ibn Majah et An-Nasa'i",
    category: 'hadith'
  },
  {
    id: '31',
    title: 'L\'aumône et la richesse (Hadith)',
    arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
    french: "L'aumône ne diminue en rien la richesse.",
    wolof: "Sadax du wàññi alal mukk.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '32',
    title: 'Chercher le savoir (Hadith)',
    arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    french: "La recherche de la science est une obligation pour chaque musulman.",
    wolof: "Wut xam-xam farata la ci lu jullit bu nekk.",
    reporter: "Rapporté par Ibn Majah",
    category: 'hadith'
  },
  {
    id: '33',
    title: 'Repentir et pardon (Hadith)',
    arabic: 'كُلُّ بَنِي آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ',
    french: "Tous les fils d'Adam commettent des péchés et les meilleurs d'entre eux sont ceux qui se repentent.",
    wolof: "Doom Aadama yépp ay bàkkaarkat lañu, waaye ñi gën ci bàkkaarkat yi, ñoo di ñiy tuub.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '34',
    title: 'S\'éloigner des futilités (Hadith)',
    arabic: 'مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ',
    french: "L'un des bons aspects de l'Islam d'une personne est qu'elle délaisse ce qui ne la regarde pas.",
    wolof: "Ci baaxug jullitug nit, mooy mu bàyyi li ko yeewul.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '35',
    title: 'La douceur (Hadith)',
    arabic: 'إِنَّ الرِّفْقَ لَا يَكُونُ فِي شَيْءٍ إِلَّا زَانَهُ',
    french: "La douceur ne se trouve pas dans une chose sans l'embellir.",
    wolof: "Rafet-jikko du nekk ci lenn ludul daf koy taaral.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '36',
    title: 'Aider son frère (Hadith)',
    arabic: 'وَاللَّهُ فِي عَوْنِ الْعَبْدِ مَا كَانَ الْعَبْدُ فِي عَوْنِ أَخِيهِ',
    french: "Allah vient en aide au serviteur tant que le serviteur vient en aide à son frère.",
    wolof: "Yàlla mi ngi dimbali jaam bi, la feek jaam bi mi ngi dimbali mbokkam.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '37',
    title: 'La modération et la santé (Hadith)',
    arabic: 'مَنْ أَصْبَحَ مِنْكُمْ آمِنًا فِي سِرْبِهِ مُعَافًى فِي جَسَدِهِ... كَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا',
    french: "Celui qui se réveille en sécurité parmi les siens et en bonne santé... c'est comme si on lui avait donné le monde.",
    wolof: "Ku yewwu jàmm ci seen biir, am wërgiyaram... mel na ni ñu jox ko àddina si yépp.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '38',
    title: 'Ne pas mépriser le bien (Hadith)',
    arabic: 'لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا',
    french: "Ne méprise aucune bonne action, même minime.",
    wolof: "Bul xeeb lenn ci mbàax (sell).",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '39',
    title: 'La prière comme lumière (Hadith)',
    arabic: 'الصَّلَاةُ نُورٌ',
    french: "La prière est une lumière.",
    wolof: "Julli, leer la.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '40',
    title: 'Le bon voisinage (Hadith)',
    arabic: 'خَيْرُ الْجِيرَانِ عِنْدَ اللَّهِ خَيْرُهُمْ لِجَارِهِ',
    french: "Le meilleur des voisins auprès d'Allah est celui qui est le meilleur envers son voisin.",
    wolof: "Yéen ñi gën a baax ci seen dëkkandoo, ñoo di ñi gën ci Yàlla.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '41',
    title: 'Pudeur et foi (Hadith)',
    arabic: 'الْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ',
    french: "La pudeur est une branche de la foi.",
    wolof: "Kersa, cér la ci mbirum ngëm.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '42',
    title: 'L\'invocation est l\'adoration (Hadith)',
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    french: "L'invocation, c'est l'adoration.",
    wolof: "Ñaan, mooy jaamu Yàlla dëgg-dëgg.",
    reporter: "Rapporté par Abou Daoud",
    category: 'hadith'
  },
  {
    id: '43',
    title: 'Propager la paix (Hadith)',
    arabic: 'أَفْشُوا السَّلَامَ بَيْنَكُمْ',
    french: "Répandez le salut (le Salam) entre vous.",
    wolof: "Tasaare leen nuyyoo ba (As-Salam) ci seen biir.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '44',
    title: 'Modestie et élévation (Hadith)',
    arabic: 'مَنْ تَوَاضَعَ لِلَّهِ رَفَعَهُ اللَّهُ',
    french: "Celui qui fait preuve d'humilité pour Allah, Allah l'élève.",
    wolof: "Ku wàññi boppam ngir Yàlla, Yàlla dina ko yékkatí.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '45',
    title: 'Sagesse de Abou Bakr (Radiyallahu anhu)',
    arabic: 'احْرِصْ عَلَى الْمَوْتِ، تُوهَبْ لَكَ الْحَيَاةُ',
    french: "Recherche la mort (en martyr pour Allah), la vie de l'au-delà te sera accordée.",
    wolof: "Wut woyof ci sa dund ak sa dee, dund gu baax dees na lako may.",
    reporter: "Parole de Abou Bakr As-Siddiq",
    category: 'hadith'
  },
  {
    id: '46',
    title: 'Sagesse de \'Umar ibn Al-Khattab',
    arabic: 'حَاسِبُوا أَنْفُسَكُمْ قَبْلَ أَنْ تُحَاسَبُوا',
    french: "Jugez-vous vous-mêmes avant d'être jugés.",
    wolof: "Xeytamaale leen seen jëfi bopp, balaa ñu leen di xeytamaale ëllëg.",
    reporter: "Parole de 'Umar ibn Al-Khattab",
    category: 'hadith'
  },
  {
    id: '47',
    title: 'Sagesse de \'Uthman ibn \'Affan',
    arabic: 'هَمُّ الدُّنْيَا ظُلْمَةٌ فِي الْقَلْبِ، وَهَمُّ الْآخِرَةِ نُورٌ فِي الْقَلْبِ',
    french: "Le souci de ce bas-monde est une obscurité dans le cœur, et le souci de l'au-delà y est une lumière.",
    wolof: "Xalaat ci àddina leundeum la ci xol, waaye xalaat ci àllaaxira leer la ci xol.",
    reporter: "Parole de 'Uthman ibn 'Affan",
    category: 'hadith'
  },
  {
    id: '48',
    title: 'Sagesse de \'Ali ibn Abi Talib',
    arabic: 'قِيمَةُ كُلِّ امْرِئٍ مَا يُحْسِنُهُ',
    french: "La valeur de chaque homme réside dans le bien qu'il sait accomplir.",
    wolof: "Pajug nit ku nekk ci li mu mën a def lu baax la nekk.",
    reporter: "Parole de 'Ali ibn Abi Talib",
    category: 'hadith'
  },
  {
    id: '49',
    title: 'Sagesse de Ibn Mas\'ud',
    arabic: 'الْيَقِينُ الْإِيمَانُ كُلُّهُ',
    french: "La certitude représente la foi tout entière.",
    wolof: "Kóolute mooy ngëm gi yépp, lëj-lëj amut ci.",
    reporter: "Parole de 'Abdullah ibn Mas'ud",
    category: 'hadith'
  },
  {
    id: '50',
    title: 'Miséricorde entre les croyants (Hadith)',
    arabic: 'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ',
    french: "L'image des croyants dans les liens d'amour, de miséricorde et de compassion qui les unissent, est celle d'un seul corps.",
    wolof: "Melo jullit ñi ci seen mbëggeel ak seen yërmande ñom ci seen biir mel na ni benn yaram.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '51',
    title: 'Le meilleur d\'entre vous (Hadith)',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    french: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.",
    wolof: "Ki gën ci yeen mooy ki jàng Alxuraan te di ko jàngale.",
    reporter: "Rapporté par Al-Bukhari",
    category: 'hadith'
  },
  {
    id: '52',
    title: 'Les actes ne valent que par les intentions (Hadith)',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    french: "Les actes ne valent que par leurs intentions.",
    wolof: "Jëf yi ci yéene lañuy wéy.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '53',
    title: 'La propreté et la foi (Hadith)',
    arabic: 'الطُّهُورُ شَطْرُ الْإِيمَانِ',
    french: "La pureté (propreté) est la moitié de la foi.",
    wolof: "Set (laab) mooy genn wàllu ngëm gi.",
    reporter: "Rapporté par Muslim",
    category: 'hadith'
  },
  {
    id: '54',
    title: 'Le sourire, une aumône (Hadith)',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    french: "Ton sourire en face de ton frère est une aumône.",
    wolof: "Sa ree ci kanamu sa mbokk, sadax (sarax) la.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  },
  {
    id: '55',
    title: 'La bonne parole (Hadith)',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    french: "Que celui qui croit en Allah et au Jour dernier dise du bien ou qu'il se taise.",
    wolof: "Ku gëm Yàlla ak Bis bu mujj ba, n'a wax lu baax mbaa mu noppi.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '56',
    title: 'L\'indulgence dans le commerce (Hadith)',
    arabic: 'رَحِمَ اللَّهُ رَجُلًا سَمْحًا إِذَا بَاعَ وَإِذَا اشْتَرَى وَإِذَا اقْتَضَى',
    french: "Qu'Allah fasse miséricorde à un homme indulgent (facile) quand il vend, quand il achète et quand il réclame son dû.",
    wolof: "Yàlla na Yàlla yërëm nit ku woyof ci njaay mi, ci njënd mi ak ci laajam.",
    reporter: "Rapporté par Al-Bukhari",
    category: 'hadith'
  },
  {
    id: '57',
    title: 'La force véritable (Hadith)',
    arabic: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ',
    french: "Le fort n'est pas celui qui abat les autres à la lutte, le fort est celui qui maîtrise son âme au moment de la colère.",
    wolof: "Kàttan du ci daan nit ñi ci bëre, ku am kàttan dëgg mooy ki mën a téye boppam bu meré.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '58',
    title: 'Ne te mets pas en colère (Hadith)',
    arabic: 'لَا تَغْضَبْ',
    french: "Ne te mets pas en colère.",
    wolof: "Bul kàddu (bul mer).",
    reporter: "Rapporté par Al-Bukhari",
    category: 'hadith'
  },
  {
    id: '59',
    title: 'Faciliter les choses (Hadith)',
    arabic: 'يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا',
    french: "Rendez les choses faciles et ne les rendez pas difficiles, annoncez la bonne nouvelle et ne rebutez pas les gens.",
    wolof: "Yombal-leen li ngeen di def te bu-leen ko xat-xatal, bégal-leen nit ñi te bu-leen leen dàq.",
    reporter: "Rapporté par Al-Bukhari et Muslim",
    category: 'hadith'
  },
  {
    id: '60',
    title: 'Le bon comportement (Hadith)',
    arabic: 'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    french: "Les croyants qui ont la foi la plus parfaite sont ceux qui ont le meilleur comportement.",
    wolof: "Jullit ñi gën a mat ci ngëm ñoo gën a rafet jikko.",
    reporter: "Rapporté par At-Tirmidhi",
    category: 'hadith'
  }
];

interface Conseil {
  id: string;
  title: string;
  french: string;
  wolof: string;
}

const CONSEILS: Conseil[] = [
  {
    id: '1',
    title: 'La Prière à l\'heure (Salat)',
    french: "Ne retardez jamais votre prière, car elle est la première chose sur laquelle nous serons interrogés. C'est le lien direct avec Allah et la source de paix intérieure.",
    wolof: "Bul maye sa julli mukk, ndax mooy mbir mi njëkk bees nuy laaj ëllëg. Mooy lëkkalekaay bi diggante jaam bi ak Yàlla, te mooy waral dalu xol."
  },
  {
    id: '2',
    title: 'Patience face aux épreuves (Sabr)',
    french: "Face aux difficultés, armez-vous de patience et de prière. Les épreuves purifient et élèvent en degré. N'oubliez pas qu'avec la difficulté vient la facilité.",
    wolof: "Ci jàfe-jàfe yi, màngal sa bopp ak muñ ak julli. Nattu yi dañuy laabal jëf ji, yokk yóob gi. Bul fàtte ne ci lu jàfe lay yombute di tágge."
  },
  {
    id: '3',
    title: 'Le Bon Comportement (Akhlaq)',
    french: "Le Prophète ﷺ a été envoyé pour parfaire les nobles caractères. Soyez doux, souriant, honnête et pardonnez à ceux qui vous font du tort. Le bon comportement pèse lourd sur la balance.",
    wolof: "Yónnent bi ﷺ ñëw na ngir matal jikko yi gën a rafet. Yàlaay woyof, di ree, di wax dëgg, te baal ñi la tooy. Jikko ju rafet dafay wees ci balaas bi ëllëg."
  },
  {
    id: '4',
    title: 'Garder les liens de parenté (Silat Ar-Rahm)',
    french: "Rendez visite à vos proches, même s'ils s'éloignent de vous. Maintenir les liens familiaux prolonge la vie et augmente la bénédiction dans la subsistance.",
    wolof: "Seeti sa mbokk yi, doonte dañu lay sori. Jokk mbokk dafay guddal dund gu barkeel, te mooy yokk wërsëg."
  },
  {
    id: '5',
    title: 'Éviter la Médisance (Gheebah)',
    french: "Ne parlez pas sur le dos des autres. La médisance détruit les bonnes actions comme le feu détruit le bois. Préoccupez-vous de vos propres défauts avant ceux des autres.",
    wolof: "Bul jëw kenn, bul wax ci wetu kenn. Jëw dafay yàq jëf yu baax yi ni safara di lakk matt. Yitteewo sa lëj-lëji bopp balaa ngay yitteewo lëj-lëji keneen."
  },
  {
    id: '6',
    title: 'La Constance dans les petites actions',
    french: "La meilleure des actions auprès d'Allah consiste à être constant, même si l'action est minime. Une petite lecture de Coran ou deux rakaats quotidiennes valent mieux qu'une grande action occasionnelle.",
    wolof: "Jëf ji Yàlla gën a bëgg mooy jëf ji nga xam ne dañ koy faral di def, donte tuuti la. Tuuti Alxuraan mbaa ñaari ràkkaa yoo faral di def, ñoo gën jëf ju rey joo def te duñ ko faral."
  },
  {
    id: '7',
    title: 'Le Repentir (Tawbah)',
    french: "Ne désespérez jamais de la miséricorde d'Allah. Quel que soit le péché, revenez à Lui sincèrement. Le Seigneur pardonne tous les péchés à ceux qui se repentent.",
    wolof: "Bul des mukk ci mbaarum Yàlla. Bépp bàkkaar boo man a def, déllool ci moom ak dëgg-dëgg. Boroom bi dafay baal yépp bàkkaar ci ñi tuub."
  }
];

// --- Components ---

const Card = ({ children, onClick, className = "", style }: { children: React.ReactNode, onClick?: () => void, className?: string, style?: React.CSSProperties }) => (
  <motion.div 
    whileTap={{ scale: 0.97 }}
    whileHover={{ y: -2 }}
    onClick={onClick}
    style={style}
    className={`rounded-3xl p-5 transition-all duration-300 cursor-pointer ${className}`}
  >
    {children}
  </motion.div>
);

export default function App() {
  const [view, setView] = useState<'welcome' | 'home' | 'douas' | 'hadiths' | 'conseils' | 'dhikr' | 'help' | 'ablutions_petit' | 'ablutions_grand'>('welcome');
  const [douaFilter, setDouaFilter] = useState<'all' | 'favorites' | 'daily' | 'protection' | 'invocation' | 'lieux' | 'etudes' | 'transport'>('all');
  const [hadithFilter, setHadithFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [welcomeQuote, setWelcomeQuote] = useState(WELCOME_QUOTES[0]);
  const [donationTarget, setDonationTarget] = useState<{name: string, number: string} | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState<string>('Notification' in window ? Notification.permission : 'denied');

  const handleCapture = (id: string, fileName: string) => {
    setIsCapturing(id);
    setTimeout(async () => {
      const element = document.getElementById(id);
      if (!element) {
        setIsCapturing(null);
        return;
      }
      try {
        const dataUrl = await htmlToImage.toPng(element, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          filter: (node) => {
            if (node instanceof HTMLElement) {
              return node.getAttribute('data-html2canvas-ignore') !== 'true';
            }
            return true;
          }
        });
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Erreur lors de la capture', err);
      } finally {
        setIsCapturing(null);
      }
    }, 150);
  };

  const speak = (text: string, lang: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (playingId === id) {
        window.speechSynthesis.cancel();
        setPlayingId(null);
        return;
      }
      
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // Load voices immediately in case they are ready
      let voices = window.speechSynthesis.getVoices();
      let voice = voices.find(v => v.lang.startsWith(lang) || v.lang.startsWith(lang.substring(0, 2)));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setPlayingId(id);
      };
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = (e) => {
          console.error("Speech error", e);
          setPlayingId(null);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Votre navigateur ne supporte pas la lecture audio.");
    }
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('alihsan-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('alihsan-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Select a random quote on component mount
    const randomIndex = Math.floor(Math.random() * WELCOME_QUOTES.length);
    setWelcomeQuote(WELCOME_QUOTES[randomIndex]);

    // Service Worker & Notifications
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        // Show daily dua if not shown today and permission is granted
        if (Notification.permission === 'granted') {
          const lastDate = localStorage.getItem('alihsan-last-notif-date');
          const today = new Date().toDateString();
          
          if (lastDate !== today) {
            // Schedule or show locally if possible. Wait a bit to not spam on open.
            setTimeout(() => {
              const randomDua = DOUAS[Math.floor(Math.random() * DOUAS.length)];
              reg.showNotification("Dua du jour", {
                body: randomDua.french,
                icon: '/icon.jpg',
                badge: '/icon.jpg'
              });
              localStorage.setItem('alihsan-last-notif-date', today);
            }, 5000);
          }
        }
      }).catch((error) => console.log('SW registration failed:', error));
    }
  }, []);

  const openWhatsApp = (number: string, name: string) => {
    const message = encodeURIComponent(`Assalamou Alaykoum Oustaz ${name}, j'ai besoin d'aide ou de conseils concernant ma pratique religieuse.`);
    window.open(`https://wa.me/${number.replace(/\s+/g, '')}?text=${message}`, '_blank');
  };

  const makeCall = (number: string) => {
    window.open(`tel:${number.replace(/\s+/g, '')}`, '_self');
  };

  useEffect(() => {
    setSearchQuery('');
  }, [view]);

  if (view === 'welcome') {
    return (
      <div 
        className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center pattern-bg relative overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-stone-50/50 via-transparent to-stone-50 pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full relative z-10"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 bg-emerald-700 rounded-3xl rotate-3 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-900/20"
          >
            <Heart className="text-emerald-50 w-10 h-10 -rotate-3" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-serif font-bold text-stone-900 mb-6"
          >
            Al-Ihsan
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 mb-12 shadow-xl shadow-stone-200/50 border border-white"
          >
            <h2 className="text-stone-800 font-serif text-xl italic mb-3 leading-relaxed">
              "{welcomeQuote.text}"
            </h2>
            <div className="w-12 h-0.5 bg-emerald-200 mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-bold text-emerald-700">
              {welcomeQuote.source}
            </p>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => setView('home')}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-stone-900/20 hover:bg-stone-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Ouvrir mon guide
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-stone-50 pb-24"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
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
          {view === 'hadiths' && "Hadiths & Sagesses"}
          {view === 'conseils' && "Conseils Religieux"}
          {view === 'dhikr' && "Dhikr & Tasbih"}
          {view === 'help' && "Besoin d'aide"}
          {view === 'ablutions_petit' && "Petites Ablutions"}
          {view === 'ablutions_grand' && "Grandes Ablutions"}
        </h2>
        <div className="w-10" />
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              <Card onClick={() => setView('douas')} className="col-span-2 relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 min-h-[160px] border border-emerald-900 shadow-xl shadow-emerald-900/10">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-600 rounded-full mix-blend-multiply filter blur-2xl opacity-60"></div>
                <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-emerald-900 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-emerald-700/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/30">
                      <ShieldCheck className="text-emerald-100 w-6 h-6" />
                    </div>
                    <div className="bg-emerald-900/40 backdrop-blur-md p-2 rounded-full border border-emerald-500/20">
                      <ChevronRight className="text-emerald-300 w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-serif font-bold text-3xl text-emerald-50 mb-1">Douas</h3>
                    <p className="text-emerald-200/80 text-sm font-medium tracking-wide">Invocations & Protections</p>
                  </div>
                </div>
              </Card>

              <Card onClick={() => setView('ablutions_petit')} className="col-span-2 md:col-span-1 flex flex-col justify-between p-5 min-h-[150px] bg-teal-50 shadow-sm border border-teal-100 group hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white shadow-sm text-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">Petites Ablutions</h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">Pour la prière</p>
                </div>
              </Card>

              <Card onClick={() => setView('ablutions_grand')} className="col-span-2 md:col-span-1 flex flex-col justify-between p-5 min-h-[150px] bg-cyan-50 shadow-sm border border-cyan-100 group hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white shadow-sm text-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets className="w-5 h-5 fill-cyan-100" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">Grandes Ablutions</h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">Purification complète</p>
                </div>
              </Card>

              <Card onClick={() => setView('hadiths')} className="flex flex-col justify-between p-5 min-h-[150px] bg-sky-50 shadow-sm border border-sky-100 group">
                <div className="w-10 h-10 bg-white shadow-sm text-sky-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Quote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">Hadiths</h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">Trésors prophétiques</p>
                </div>
              </Card>

              <Card onClick={() => setView('conseils')} className="flex flex-col justify-between p-5 min-h-[150px] bg-indigo-50 shadow-sm border border-indigo-100 group">
                <div className="w-10 h-10 bg-white shadow-sm text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">Conseils</h3>
                  <p className="text-xs text-stone-500 mt-1 font-medium">Rappels précieux</p>
                </div>
              </Card>

              <Card onClick={() => setView('help')} className="col-span-2 flex items-center gap-5 p-5 bg-white border border-stone-200 hover:border-amber-200 shadow-sm">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                  <HandHelping className="text-amber-600 w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 text-lg">Besoin d'aide ?</h3>
                  <p className="text-sm text-stone-500 font-medium">Contacter un Oustaz</p>
                </div>
                <ChevronRight className="text-stone-300 w-5 h-5 opacity-50 shrink-0" />
              </Card>

              {notifPerm === 'default' && (
                <Card 
                  onClick={() => {
                    Notification.requestPermission().then(permission => {
                      setNotifPerm(permission);
                      if (permission === 'granted') {
                        alert("Notifications activées avec succès !");
                      }
                    });
                  }} 
                  className="col-span-2 flex items-center gap-5 p-5 bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 cursor-pointer hover:border-emerald-300 shadow-sm transition-all"
                >
                  <div className="w-14 h-14 bg-white shadow-sm border border-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-800 text-lg">Activer les rappels</h3>
                    <p className="text-sm text-stone-500 font-medium">Recevoir une invocation par jour</p>
                  </div>
                </Card>
              )}
            </motion.div>
          )}

          {view === 'douas' && (
            <motion.div 
              key="douas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Rechercher une doua (français, phonétique, arabe)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-stone-700 bg-white shadow-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <span className="text-xl leading-none">&times;</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['all', 'favorites', 'daily', 'protection', 'invocation', 'lieux', 'transport', 'etudes'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDouaFilter(f as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      douaFilter === f ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : f === 'favorites' ? 'Favoris' : f === 'lieux' ? 'Lieux' : f === 'etudes' ? 'Études & Examens' : f === 'transport' ? 'Véhicules & Transport' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {DOUAS.filter(d => 
                d.category !== 'hadith' && 
                (douaFilter === 'all' || (douaFilter === 'favorites' ? favorites.includes(d.id) : d.category === douaFilter)) &&
                (searchQuery === '' || 
                  normalizeStr(d.title).includes(normalizeStr(searchQuery)) ||
                  normalizeStr(d.french).includes(normalizeStr(searchQuery)) ||
                  (d.phonetic && normalizeStr(d.phonetic).includes(normalizeStr(searchQuery))) ||
                  d.arabic.includes(searchQuery)
                )
              ).map((doua) => (
                <div key={doua.id} id={`capture-doua-${doua.id}`} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 hover:shadow-md transition-all duration-300 relative">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-serif font-bold text-xl text-emerald-950 pr-2">{doua.title}</h3>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${
                        doua.category === 'protection' ? 'bg-red-50 text-red-600' : 
                        doua.category === 'hadith' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {doua.category}
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2" data-html2canvas-ignore="true">
                        <button 
                          onClick={() => handleCapture(`capture-doua-${doua.id}`, `doua-${doua.id}`)} 
                          className="p-1.5 sm:p-2 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-emerald-500"
                          title="Capturer l'image"
                        >
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button onClick={(e) => toggleFavorite(doua.id, e)} className="p-1.5 sm:p-2 -mr-2 rounded-full hover:bg-stone-50 transition-colors">
                          <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${favorites.includes(doua.id) ? 'fill-emerald-500 text-emerald-500' : 'text-stone-300 hover:text-emerald-400'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <p className="arabic-text text-4xl md:text-5xl text-emerald-900 text-right leading-loose md:leading-loose opacity-90 flex-1 py-2">{doua.arabic}</p>
                    <button 
                      onClick={() => speak(doua.arabic!, 'ar-SA', `ar-${doua.id}`)}
                      className={`p-2 rounded-full ml-4 transition-colors shrink-0 ${playingId === `ar-${doua.id}` ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                      data-html2canvas-ignore="true"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mb-6" />
                  
                  <div className="space-y-4">
                    {doua.phonetic && (
                      <div className="flex gap-3 items-start">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase mt-0.5">PH</span>
                        <p className="text-stone-600 text-sm md:text-base leading-relaxed flex-1 italic text-emerald-800 font-medium">{doua.phonetic}</p>
                      </div>
                    )}
                    <div className="flex gap-3 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-600 text-sm md:text-base leading-relaxed flex-1 font-medium">"{doua.french}"</p>
                      <button 
                        onClick={() => speak(doua.french, 'fr-FR', `fr-${doua.id}`)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `fr-${doua.id}` ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                        data-html2canvas-ignore="true"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {doua.wolof && (
                      <div className="flex gap-3 items-start pt-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase mt-0.5">WO</span>
                        <p className="text-stone-600 text-sm md:text-base leading-relaxed flex-1 text-emerald-900 font-medium">"{doua.wolof}"</p>
                        <button 
                          onClick={() => speak(doua.wolof!, 'fr-FR', `wo-${doua.id}`)}
                          className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `wo-${doua.id}` ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                          data-html2canvas-ignore="true"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="pt-3 mt-4 border-t border-stone-50 flex items-center justify-between">
                      <AudioRecorder id={doua.id} />
                      {doua.reporter && (
                        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider text-right">
                          {doua.reporter}
                        </p>
                      )}
                    </div>
                    {isCapturing === `capture-doua-${doua.id}` && (
                      <div className="pt-4 mt-6 border-t border-stone-100 flex justify-center items-center w-full">
                        <span className="text-[11px] font-bold text-stone-400 tracking-widest flex items-center gap-2 uppercase">
                          <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                          alihsan.app
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'hadiths' && (
            <motion.div 
              key="hadiths"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Rechercher un hadith..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all text-stone-700 bg-white shadow-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <span className="text-xl leading-none">&times;</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-2">
                {['all', 'favorites'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setHadithFilter(f as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      hadithFilter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : 'Favoris'}
                  </button>
                ))}
              </div>

              {DOUAS.filter(d => 
                d.category === 'hadith' && 
                (hadithFilter === 'all' || favorites.includes(d.id)) &&
                (searchQuery === '' || 
                  normalizeStr(d.title).includes(normalizeStr(searchQuery)) ||
                  normalizeStr(d.french).includes(normalizeStr(searchQuery)) ||
                  (d.phonetic && normalizeStr(d.phonetic).includes(normalizeStr(searchQuery))) ||
                  d.arabic.includes(searchQuery)
                )
              ).map((hadith) => (
                <div key={hadith.id} id={`capture-hadith-${hadith.id}`} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 hover:shadow-md transition-all duration-300 relative">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-serif font-bold text-xl text-sky-950 pr-2">{hadith.title}</h3>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-sky-50 text-sky-600">
                        Hadith
                      </span>
                      <div className="flex items-center gap-1 sm:gap-2" data-html2canvas-ignore="true">
                        <button 
                          onClick={() => handleCapture(`capture-hadith-${hadith.id}`, `hadith-${hadith.id}`)} 
                          className="p-1.5 sm:p-2 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-sky-500"
                          title="Capturer l'image"
                        >
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button onClick={(e) => toggleFavorite(hadith.id, e)} className="p-1.5 sm:p-2 -mr-2 rounded-full hover:bg-stone-50 transition-colors">
                          <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${favorites.includes(hadith.id) ? 'fill-sky-500 text-sky-500' : 'text-stone-300 hover:text-sky-400'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <p className="arabic-text text-4xl md:text-5xl text-sky-900 text-right leading-loose md:leading-loose opacity-90 flex-1 py-2">{hadith.arabic}</p>
                    <button 
                      onClick={() => speak(hadith.arabic!, 'ar-SA', `ar-${hadith.id}`)}
                      className={`p-2 rounded-full ml-4 transition-colors shrink-0 ${playingId === `ar-${hadith.id}` ? 'bg-sky-100 text-sky-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                      data-html2canvas-ignore="true"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mb-6" />
                  
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-600 text-sm md:text-base leading-relaxed flex-1 font-medium">"{hadith.french}"</p>
                      <button 
                        onClick={() => speak(hadith.french, 'fr-FR', `fr-${hadith.id}`)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `fr-${hadith.id}` ? 'bg-sky-100 text-sky-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                        data-html2canvas-ignore="true"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {hadith.wolof && (
                      <div className="flex gap-3 items-start pt-2">
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded uppercase mt-0.5">WO</span>
                        <p className="text-stone-600 text-sm md:text-base leading-relaxed flex-1 text-sky-900 font-medium">"{hadith.wolof}"</p>
                        <button 
                          onClick={() => speak(hadith.wolof!, 'fr-FR', `wo-${hadith.id}`)}
                          className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `wo-${hadith.id}` ? 'bg-sky-100 text-sky-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                          data-html2canvas-ignore="true"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="pt-3 mt-4 border-t border-stone-50 flex items-center justify-between">
                      <AudioRecorder id={hadith.id} />
                      {hadith.reporter && (
                        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider text-right">
                          {hadith.reporter}
                        </p>
                      )}
                    </div>
                    {isCapturing === `capture-hadith-${hadith.id}` && (
                      <div className="pt-4 mt-6 border-t border-stone-100 flex justify-center items-center w-full">
                        <span className="text-[11px] font-bold text-stone-400 tracking-widest flex items-center gap-2 uppercase">
                          <Heart className="w-3 h-3 text-sky-500 fill-sky-500" />
                          alihsan.app
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'conseils' && (
            <motion.div 
              key="conseils"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {CONSEILS.map((conseil) => (
                <div key={conseil.id} id={`capture-conseil-${conseil.id}`} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 hover:shadow-md transition-all duration-300 relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 rounded-2xl shrink-0">
                        <Lightbulb className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="font-serif font-bold text-stone-900 text-xl leading-tight">{conseil.title}</h3>
                    </div>
                    <button 
                      onClick={() => handleCapture(`capture-conseil-${conseil.id}`, `conseil-${conseil.id}`)} 
                      className="p-1.5 sm:p-2 rounded-full hover:bg-stone-50 transition-colors text-stone-300 hover:text-indigo-500 shrink-0"
                      title="Capturer l'image"
                      data-html2canvas-ignore="true"
                    >
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex gap-3 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-700 text-base leading-relaxed flex-1 font-medium">{conseil.french}</p>
                    </div>
                    
                    <div className="flex gap-3 items-start pt-3 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase mt-0.5">WO</span>
                      <p className="text-stone-700 text-base leading-relaxed flex-1 text-indigo-900/90 font-medium">{conseil.wolof}</p>
                    </div>
                    {isCapturing === `capture-conseil-${conseil.id}` && (
                      <div className="pt-4 mt-6 border-t border-stone-100 flex justify-center items-center w-full">
                        <span className="text-[11px] font-bold text-stone-400 tracking-widest flex items-center gap-2 uppercase">
                          <Heart className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                          alihsan.app
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'dhikr' && (
            <motion.div 
              key="dhikr"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <Dhikr />
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

              {/* Développeur App */}
              <div className="bg-stone-900 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-stone-900/10">
                <h3 className="font-serif font-bold text-2xl mb-2 text-stone-50">Support Technique</h3>
                <p className="text-stone-400 mb-6 text-sm">Développeur App (Ibrahima Kane)</p>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => makeCall('+221 78 286 93 22')}
                      className="flex items-center justify-center gap-2 bg-stone-800 text-stone-100 py-3 md:py-4 rounded-2xl font-bold hover:bg-stone-700 transition-colors border border-stone-700"
                    >
                      <Phone className="w-5 h-5" /> Appeler
                    </button>
                    <button 
                      onClick={() => openWhatsApp('+221 78 286 93 22', 'Ibrahima')}
                      className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 md:py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-900/50"
                    >
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                  </div>

                  <button 
                    onClick={() => setDonationTarget({ name: 'Développeur Ibrahima Kane', number: '+221 78 286 93 22' })}
                    className="flex items-center justify-center gap-2 bg-amber-500 text-amber-950 py-3 md:py-4 rounded-2xl font-bold hover:bg-amber-400 transition-colors shadow-lg"
                  >
                    <Gift className="w-5 h-5" /> Soutenir le développeur
                  </button>
                </div>
              </div>

              <div className="h-px bg-stone-200 my-8"></div>

              {/* Oustaz Kane */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
                <h3 className="font-serif font-bold text-2xl text-stone-900 mb-6">Oustaz Kane</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => makeCall('770903109')}
                      className="flex items-center justify-center gap-2 bg-stone-100 text-stone-800 py-3 md:py-4 rounded-2xl font-bold hover:bg-stone-200 transition-colors shadow-sm"
                    >
                      <Phone className="w-5 h-5" /> Appeler
                    </button>
                    <button 
                      onClick={() => openWhatsApp('770903109', 'Kane')}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 md:py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setDonationTarget({ name: 'Oustaz Kane', number: '77 090 31 09' })}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 border border-amber-200 py-3 md:py-4 rounded-2xl font-bold hover:from-amber-100 hover:to-amber-100 transition-colors"
                  >
                    <Gift className="w-5 h-5" /> Faire un don (Soutien)
                  </button>
                </div>
              </div>

              {/* Oustaz Ciss */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
                <h3 className="font-serif font-bold text-2xl text-stone-900 mb-6">Oustaz Ciss</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => makeCall('+221 76 261 30 15')}
                      className="flex items-center justify-center gap-2 bg-stone-100 text-stone-800 py-3 md:py-4 rounded-2xl font-bold hover:bg-stone-200 transition-colors shadow-sm"
                    >
                      <Phone className="w-5 h-5" /> Appeler
                    </button>
                    <button 
                      onClick={() => openWhatsApp('+221 76 261 30 15', 'Ciss')}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 md:py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <MessageCircle className="w-5 h-5" /> Message
                    </button>
                  </div>

                  <button 
                    onClick={() => setDonationTarget({ name: 'Oustaz Ciss', number: '+221 76 261 30 15' })}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800 border border-amber-200 py-3 md:py-4 rounded-2xl font-bold hover:from-amber-100 hover:to-amber-100 transition-colors"
                  >
                    <Gift className="w-5 h-5" /> Faire un don (Soutien)
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {view === 'ablutions_petit' && (
            <motion.div 
              key="ablutions_petit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-teal-50 rounded-2xl p-6 mb-6 text-center shadow-inner">
                <Droplets className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-xl text-teal-950">Les Petites Ablutions</h3>
                <p className="text-teal-800 text-sm mt-2">La purification nécessaire avant chaque prièrerituelle (Salat).</p>
              </div>

              {ABLUTIONS_PETIT.map((step, index) => (
                <div key={index} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-8 h-8 bg-teal-100 text-teal-700 font-bold rounded-full flex items-center justify-center shrink-0">
                      {step.step}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-stone-900 mt-0.5">{step.title}</h3>
                  </div>
                  
                  <div className="space-y-4 ml-12">
                    <div className="flex gap-3 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-700 text-base leading-relaxed flex-1 font-medium">{step.description}</p>
                      <button 
                        onClick={() => speak(step.description, 'fr-FR', `fr-petit-${index}`)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `fr-petit-${index}` ? 'bg-teal-100 text-teal-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                        data-html2canvas-ignore="true"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex gap-3 items-start pt-3 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase mt-0.5">WO</span>
                      <p className="text-stone-700 text-base leading-relaxed flex-1 text-teal-900/90 font-medium">{step.wolof}</p>
                      <button 
                        onClick={() => speak(step.wolof, 'fr-FR', `wo-petit-${index}`)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `wo-petit-${index}` ? 'bg-teal-100 text-teal-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                        data-html2canvas-ignore="true"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {view === 'ablutions_grand' && (
            <motion.div 
              key="ablutions_grand"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-cyan-50 rounded-2xl p-6 mb-6 text-center shadow-inner">
                <Droplets className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-xl text-cyan-950">Les Grandes Ablutions (Janaba)</h3>
                <p className="text-cyan-800 text-sm mt-2">Le lavage rituel complet (Ghusl) nécessaire après l'impureté majeure.</p>
              </div>

              {ABLUTIONS_GRAND.map((step, index) => (
                <div key={index} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200">
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-8 h-8 bg-cyan-100 text-cyan-700 font-bold rounded-full flex items-center justify-center shrink-0">
                      {step.step}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-stone-900 mt-0.5">{step.title}</h3>
                  </div>
                  
                  <div className="space-y-4 ml-12">
                    <div className="flex gap-3 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-700 text-base leading-relaxed flex-1 font-medium">{step.description}</p>
                      <button 
                        onClick={() => speak(step.description, 'fr-FR', `fr-grand-${index}`)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `fr-grand-${index}` ? 'bg-cyan-100 text-cyan-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                        data-html2canvas-ignore="true"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex gap-3 items-start pt-3 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded uppercase mt-0.5">WO</span>
                      <p className="text-stone-700 text-base leading-relaxed flex-1 text-cyan-900/90 font-medium">{step.wolof}</p>
                      <button 
                        onClick={() => speak(step.wolof, 'fr-FR', `wo-grand-${index}`)}
                        className={`p-1.5 rounded-full transition-colors shrink-0 ${playingId === `wo-grand-${index}` ? 'bg-cyan-100 text-cyan-600' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                        data-html2canvas-ignore="true"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-2 py-3 flex justify-between items-center z-10">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 w-1/6 ${view === 'home' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center">Guide</span>
        </button>
        <button onClick={() => setView('douas')} className={`flex flex-col items-center gap-1 w-1/6 ${view === 'douas' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center">Douas</span>
        </button>
        <button onClick={() => setView('hadiths')} className={`flex flex-col items-center gap-1 w-1/6 ${view === 'hadiths' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <Quote className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center">Hadiths</span>
        </button>
        <button onClick={() => setView('dhikr')} className={`flex flex-col items-center gap-1 w-1/6 ${view === 'dhikr' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center">Dhikr</span>
        </button>
        <button onClick={() => setView('conseils')} className={`flex flex-col items-center gap-1 w-1/6 ${view === 'conseils' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center">Conseils</span>
        </button>
        <button onClick={() => setView('help')} className={`flex flex-col items-center gap-1 w-1/6 ${view === 'help' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <HandHelping className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase truncate w-full text-center">Aide</span>
        </button>
      </nav>

      {/* Donation Modal */}
      <AnimatePresence>
        {donationTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm relative shadow-2xl border border-white"
            >
              <button 
                onClick={() => { setDonationTarget(null); setCopied(false); setDonationAmount(''); }} 
                className="absolute top-6 right-6 p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Gift className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Faire un don</h3>
              <p className="text-stone-500 text-sm mb-8 leading-relaxed">Soutenez <strong className="text-stone-700">{donationTarget.name}</strong> via Wave ou Orange Money.</p>

              <div className="bg-stone-50 rounded-2xl p-5 text-center border border-stone-100 mb-6 inset-shadow-sm">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Numéro de transfert</span>
                <span className="text-3xl font-bold tracking-wider text-stone-800">{donationTarget.number}</span>
                
                <div className="mt-5 pt-5 border-t border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Montant du don (FCFA)</span>
                  <input 
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Saisir le montant"
                    className="w-full text-center bg-white border border-stone-200 rounded-xl py-3 text-xl font-bold text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all placeholder:font-normal placeholder:text-stone-300 mb-4"
                  />
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">Code secret (Pour USSD Orange)</span>
                  <input 
                    type="password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="****"
                    className="w-full text-center bg-white border border-stone-200 rounded-xl py-3 text-xl font-bold text-stone-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all placeholder:font-normal placeholder:text-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Wave Options */}
                <div className="flex flex-col gap-2 bg-[#F3f7FF] p-3 rounded-2xl border border-[#D5E5FF]">
                  <p className="text-[10px] text-blue-600 font-bold uppercase text-center w-full pb-1 mb-1 border-b border-[#D5E5FF]">Wave</p>
                  <button 
                    onClick={() => {
                      const number = donationTarget.number.replace(/\s+/g, '');
                      const localNumber = number.startsWith('+221') ? number.slice(4) : number.startsWith('221') ? number.slice(3) : number;
                      window.location.href = `wave://send?phone=${localNumber}&amount=${donationAmount}`;
                    }}
                    disabled={!donationAmount}
                    className="bg-white border border-[#B8D5FF] rounded-xl py-3 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span className="font-bold text-[#1123D6] text-sm leading-none">Fais le don (App)</span>
                  </button>
                  <button 
                    onClick={() => {
                      window.location.href = `tel:%232171%23`;
                    }}
                    disabled={!donationAmount}
                    className="bg-white border border-[#B8D5FF] rounded-xl py-3 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span className="font-bold text-[#1123D6] text-sm leading-none">Fais le don (#2171#)</span>
                  </button>
                </div>

                {/* Orange Options */}
                <div className="flex flex-col gap-2 bg-[#FFF9F3] p-3 rounded-2xl border border-[#FFE8D5]">
                  <p className="text-[10px] text-orange-600 font-bold uppercase text-center w-full pb-1 mb-1 border-b border-[#FFE8D5]">Orange Money</p>
                  <button 
                    onClick={() => {
                      const number = donationTarget.number.replace(/\s+/g, '');
                      const localNumber = number.startsWith('+221') ? number.slice(4) : number.startsWith('221') ? number.slice(3) : number;
                      // Fallback URI pour Max it / Orange Money
                      window.location.href = `omoney://send?phone=${localNumber}&amount=${donationAmount}`;
                    }}
                    disabled={!donationAmount}
                    className="bg-white border border-[#FFD9B8] rounded-xl py-3 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span className="font-bold text-[#FF6600] text-sm leading-none">Fais le don (App)</span>
                  </button>
                  <button 
                    onClick={() => {
                      const number = donationTarget.number.replace(/\s+/g, '');
                      const localNumber = number.startsWith('+221') ? number.slice(4) : number.startsWith('221') ? number.slice(3) : number;
                      // Encode # as %23 for the URL
                      if (secretCode) {
                        window.location.href = `tel:%23144%231*1*${localNumber}*${donationAmount}*${secretCode}%23`;
                      } else {
                        window.location.href = `tel:%23144%231*1*${localNumber}*${donationAmount}%23`;
                      }
                    }}
                    disabled={!donationAmount || !secretCode}
                    className="bg-white border border-[#FFD9B8] rounded-xl py-3 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span className="font-bold text-[#FF6600] text-sm leading-none flex flex-col items-center gap-1"><span>Fais le don (USSD)</span><span className="text-[9px] font-normal opacity-80">(Nécessite Code)</span></span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(donationTarget.number.replace(/\s+/g, ''));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Numéro copié !' : 'Copier le numéro manuellement'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
