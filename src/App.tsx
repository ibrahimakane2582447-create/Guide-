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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Doua {
  id: string;
  title: string;
  arabic: string;
  french: string;
  wolof?: string;
  reporter?: string;
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
  const [view, setView] = useState<'welcome' | 'home' | 'douas' | 'hadiths' | 'help'>('welcome');
  const [douaFilter, setDouaFilter] = useState<'all' | 'daily' | 'protection' | 'invocation' | 'lieux' | 'etudes' | 'transport'>('all');
  const [welcomeQuote, setWelcomeQuote] = useState(WELCOME_QUOTES[0]);
  const [donationTarget, setDonationTarget] = useState<{name: string, number: string} | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Select a random quote on component mount
    const randomIndex = Math.floor(Math.random() * WELCOME_QUOTES.length);
    setWelcomeQuote(WELCOME_QUOTES[randomIndex]);
  }, []);

  const openWhatsApp = (number: string, name: string) => {
    const message = encodeURIComponent(`Assalamou Alaykoum Oustaz ${name}, j'ai besoin d'aide ou de conseils concernant ma pratique religieuse.`);
    window.open(`https://wa.me/${number.replace(/\s+/g, '')}?text=${message}`, '_blank');
  };

  const makeCall = (number: string) => {
    window.open(`tel:${number.replace(/\s+/g, '')}`, '_self');
  };

  if (view === 'welcome') {
    return (
      <div 
        className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
      >
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

              <Card onClick={() => setView('hadiths')} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Quote className="text-blue-600 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800">Hadiths & Sagesses</h3>
                  <p className="text-sm text-stone-500">Trésors prophétiques</p>
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
                {['all', 'daily', 'protection', 'invocation', 'lieux', 'transport', 'etudes'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDouaFilter(f as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      douaFilter === f ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    {f === 'all' ? 'Tous' : f === 'lieux' ? 'Lieux' : f === 'etudes' ? 'Études & Examens' : f === 'transport' ? 'Véhicules & Transport' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {DOUAS.filter(d => d.category !== 'hadith' && (douaFilter === 'all' || d.category === douaFilter)).map((doua) => (
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

                    {doua.reporter && (
                      <div className="pt-3 mt-4 border-t border-stone-50">
                        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider text-right">
                          {doua.reporter}
                        </p>
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
              {DOUAS.filter(d => d.category === 'hadith').map((hadith) => (
                <div key={hadith.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-stone-800">{hadith.title}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      Hadith
                    </span>
                  </div>
                  <p className="arabic-text text-2xl text-stone-900 mb-4 text-right leading-loose">{hadith.arabic}</p>
                  <div className="h-px bg-stone-100 mb-4" />
                  
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded uppercase mt-0.5">FR</span>
                      <p className="text-stone-600 text-sm italic leading-relaxed flex-1">"{hadith.french}"</p>
                    </div>
                    
                    {hadith.wolof && (
                      <div className="flex gap-2 items-start pt-1">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase mt-0.5">WO</span>
                        <p className="text-stone-600 text-sm italic leading-relaxed flex-1 text-emerald-900">"{hadith.wolof}"</p>
                      </div>
                    )}

                    {hadith.reporter && (
                      <div className="pt-3 mt-4 border-t border-stone-50">
                        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider text-right">
                          {hadith.reporter}
                        </p>
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
                
                <div className="flex flex-col gap-3">
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
                      <MessageCircle className="w-4 h-4" /> Poser question
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setDonationTarget({ name: 'Oustaz Kane', number: '77 090 31 09' })}
                    className="flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl font-medium hover:bg-amber-100 transition-colors"
                  >
                    <Gift className="w-4 h-4" /> Faire un don (Soutien)
                  </button>
                </div>
              </div>

              {/* Oustaz Ciss */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-lg text-stone-800 mb-4">Oustaz Ciss</h3>
                
                <div className="flex flex-col gap-3">
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
                      <MessageCircle className="w-4 h-4" /> Poser question
                    </button>
                  </div>

                  <button 
                    onClick={() => setDonationTarget({ name: 'Oustaz Ciss', number: '+221 76 261 30 15' })}
                    className="flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl font-medium hover:bg-amber-100 transition-colors"
                  >
                    <Gift className="w-4 h-4" /> Faire un don (Soutien)
                  </button>
                </div>
              </div>

              {/* Développeur App */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-lg text-stone-800 mb-4">Développeur App (Ibrahima Kane)</h3>
                
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => makeCall('+221 78 286 93 22')}
                      className="flex items-center justify-center gap-2 bg-stone-100 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-200 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Appeler
                    </button>
                    <button 
                      onClick={() => openWhatsApp('+221 78 286 93 22', 'Ibrahima')}
                      className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> Message
                    </button>
                  </div>

                  <button 
                    onClick={() => setDonationTarget({ name: 'Développeur Ibrahima Kane', number: '+221 78 286 93 22' })}
                    className="flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl font-medium hover:bg-amber-100 transition-colors"
                  >
                    <Gift className="w-4 h-4" /> Faire un don (Soutien)
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
        <button onClick={() => setView('hadiths')} className={`flex flex-col items-center gap-1 ${view === 'hadiths' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <Quote className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Hadiths</span>
        </button>
        <button onClick={() => setView('help')} className={`flex flex-col items-center gap-1 ${view === 'help' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <HandHelping className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Aide</span>
        </button>
      </nav>

      {/* Donation Modal */}
      <AnimatePresence>
        {donationTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative shadow-2xl"
            >
              <button 
                onClick={() => { setDonationTarget(null); setCopied(false); }} 
                className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-stone-900 mb-2">Faire un don</h3>
              <p className="text-stone-500 text-sm mb-6">Soutenez {donationTarget.name} via Wave ou Orange Money.</p>

              <div className="bg-stone-50 rounded-2xl p-4 text-center border border-stone-100 mb-6">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-1">Numéro de transfert</span>
                <span className="text-2xl font-bold tracking-wider text-stone-800">{donationTarget.number}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#EBF3FF] border border-[#B8D5FF] rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="font-extrabold text-[#1123D6] text-xl">wave</span>
                  <span className="text-[10px] text-blue-600 font-medium uppercase mt-1">Sénégal</span>
                </div>
                <div className="bg-[#FFF4EB] border border-[#FFD9B8] rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="font-extrabold text-[#FF6600] text-xl">orange</span>
                  <span className="text-[10px] text-orange-600 font-medium uppercase mt-1">Money</span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(donationTarget.number.replace(/\s+/g, ''));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md shadow-stone-200'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Numéro copié !' : 'Copier le numéro'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
