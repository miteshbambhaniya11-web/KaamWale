// KaamWale Local DB & AI Engine
import { supabase } from './supabase';

async function syncToSupabase(key: string, data: any) {
  try {
    const { error } = await supabase
      .from('sync_store')
      .upsert({ key, value: data, updated_at: new Date().toISOString() });
    if (error) {
      console.warn(`Supabase sync failed for ${key}:`, error);
    }
  } catch (err) {
    console.error(`Supabase sync exception for ${key}:`, err);
  }
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ServiceCategory {
  id: string;
  nameEn: string;
  nameHi: string;
  nameGu: string;
  icon: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionGu: string;
  basePrice: number;
  priceUnit: string;
  problems: string[]; // Keywords for search mapping
  isQuoteBased: boolean;
  jobChecklistEn: string[];
  jobChecklistHi: string[];
  jobChecklistGu: string[];
}



export interface Vendor {
  id: string;
  name: string;
  phone: string;
  photo: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDetails?: {
    aadhaarNo: string;
    panNo: string;
    referenceName: string;
    referencePhone: string;
    documentPhotoUrl: string;
    selfiePhotoUrl: string;
    aiVerificationScore: number;
    aiFlags: string[];
  };
  trustScore: number; // 0 to 100
  rating: number;
  completedJobsCount: number;
  completionRate: number;
  responseTime: string;
  skills: string[]; // Category IDs
  experienceYears: number;
  serviceAreas: string[];
  location: { lat: number; lng: number };
  isOnline: boolean;
  

}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'vendor';
  text: string;
  timestamp: string;
  translation?: {
    en: string;
    hi: string;
    gu: string;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  categoryId: string;
  subcategoryName: string;
  vendorId: string | null;
  status: 'pending' | 'assigned' | 'en-route' | 'started' | 'completed' | 'disputed' | 'refunded';
  price: number;
  isQuote: boolean;
  quoteRequested: boolean;
  quoteOffers?: { vendorId: string; price: number; note: string }[];
  scheduledTime: string;
  beforePhoto?: string;
  afterPhoto?: string;
  checklistState: { [key: string]: boolean };
  chatHistory: ChatMessage[];
  disputeReason?: string;
  disputeStatus: 'none' | 'pending' | 'resolved';
  refundAmount?: number;
  warrantyStatus: 'none' | 'active' | 'claimed';
  gpsStreamActive: boolean;
  lastGpsUpdate?: string;
  safetyAlertSent?: boolean;
}

export interface FraudLog {
  id: string;
  bookingId?: string;
  vendorId?: string;
  riskScore: number;
  reason: string;
  timestamp: string;
  status: 'pending' | 'investigated' | 'resolved';
}

// Seed Customers
export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'c-karan',
    name: 'Karan Shah',
    phone: '+91 98980 98980',
    email: 'karan@gmail.com'
  },
  {
    id: 'c-megha',
    name: 'Megha Vyas',
    phone: '+91 97770 12345',
    email: 'megha@gmail.com'
  }
];

// 

// Preloaded 25 Service Categories
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'home-repair',
    nameEn: 'Plumbing & Electrical Fixes',
    nameHi: 'नल और बिजली की मरम्मत',
    nameGu: 'નળ અને વીજળી કામ',
    icon: '🔧',
    descriptionEn: 'Leakages, wiring issues, socket failures, fuses',
    descriptionHi: 'लीकेज, वायरिंग की समस्या, फ्यूज उड़ना',
    descriptionGu: 'લીકેજ, વાયરિંગ સમસ્યાઓ, ફ્યુઝ ઉડવો',
    basePrice: 199,
    priceUnit: 'visit fee',
    problems: ['leak', 'pipe', 'tap', 'leakage', 'switch', 'light', 'fan', 'board', 'wiring', 'fuse', 'नल', 'पाइप', 'लीकेज', 'वायरिंग', 'નળ', 'પાઇપ', 'લીકેજ', 'વાયરિંગ'],
    isQuoteBased: false,
    jobChecklistEn: ['Inspect problem point', 'Isolate water/power supply', 'Replace damaged parts', 'Test for functionality', 'Clean repair debris'],
    jobChecklistHi: ['समस्या बिंदु का निरीक्षण करें', 'बिजली/पानी बंद करें', 'पुर्जे बदलें', 'टेस्ट करें', 'मलबा साफ करें'],
    jobChecklistGu: ['સમસ્યાની તપાસ કરો', 'વીજળી/પાણી સપ્લાય બંધ કરો', 'નવા પાર્ટ્સ ફિટ કરો', 'ટેસ્ટ કરો', 'કચરો સાફ કરો']
  },
  {
    id: 'masonry',
    nameEn: 'Masonry & Concrete (Kadia work)',
    nameHi: 'राजमिस्त्री का काम (Mason - Kadia)',
    nameGu: 'કડિયા કામ (Mason - Kadia)',
    icon: '🧱',
    descriptionEn: 'Wall plastering, brick tiling, concrete repairs, plaster patch',
    descriptionHi: 'दीवार पलस्तर, ईंट बिछाना, कंक्रीट की मरम्मत',
    descriptionGu: 'દિવાલ પ્લાસ્ટર, ઈંટો ચણવી, ક્રોંક્રિટ સમારકામ',
    basePrice: 499,
    priceUnit: 'visit fee',
    problems: ['mason', 'cement', 'concrete', 'plaster', 'brick', 'tile repair', 'करिया', 'मिस्त्री', 'दीवार', 'પ્લાસ્ટર', 'કડિયો', 'ચણતર'],
    isQuoteBased: true,
    jobChecklistEn: ['Measure plaster target area', 'Prepare cement sand mortar mix', 'Apply plaster coatings cleanly', 'Cure walls with water', 'Clean surrounding site area'],
    jobChecklistHi: ['क्षेत्र का माप लें', 'सीमेंट रेत का मिश्रण बनाएं', 'पलस्तर लगाएं', 'पानी से तराई करें', 'सफाई करें'],
    jobChecklistGu: ['જગ્યાનું માપ લેવું', 'સિમેન્ટ રેતીનું મિશ્રણ બનાવવું', 'પ્લાસ્ટર કરવું', 'પાણીનો છંટકાવ કરવો', 'સફાઈ કરવી']
  },
  {
    id: 'carpentry',
    nameEn: 'Carpentry & Woodwork',
    nameHi: 'बढ़ईगीरी और लकड़ी काम (Carpenter)',
    nameGu: 'સુથારી કામ અને ફર્નિચર (Carpenter)',
    icon: '🪵',
    descriptionEn: 'Door repair, handle changes, cabinet fixes, hinge tuning',
    descriptionHi: 'दरवाजे की मरम्मत, हैंडल बदलना, कैबिनेट ठीक करना',
    descriptionGu: 'દરવાજો રીપેર, હેન્ડલ બદલવા, કબાટનું કામ',
    basePrice: 249,
    priceUnit: 'visit fee',
    problems: ['carpenter', 'wood', 'door', 'lock', 'hinge', 'handle', 'furniture repair', 'बढ़ई', 'लकड़ी', 'दरवाजा', 'કબાટ', 'સુથાર', 'દરવાજો'],
    isQuoteBased: false,
    jobChecklistEn: ['Inspect wood structural integrity', 'Remove old hinges/screws', 'Cut and shape wood parts', 'Secure new handles/locks', 'Polish/sand repair points'],
    jobChecklistHi: ['लकड़ी की जांच करें', 'पुरानी कब्जेदार वस्तुएं हटाएं', 'लकड़ी काटें', 'ताले/हैंडल लगाएं', 'फिनिशिंग घिसाई करें'],
    jobChecklistGu: ['લાકડું તપાસવું', 'જૂના મિજાગરા કાઢવા', 'લાકડું કાપવું', 'લોક/હેન્ડલ ફિટ કરવા', 'ઘસવાનું કામ']
  },
  {
    id: 'welding',
    nameEn: 'Welding & Fabrication',
    nameHi: 'वेल्डिंग और लोहे का काम (Welder)',
    nameGu: 'વેલ્ડિંગ અને ગ્રીલ કામ (Welder)',
    icon: '🔥',
    descriptionEn: 'Iron gate welding, grill repair, latch repairs, steel fabrication',
    descriptionHi: 'लोहे के गेट की वेल्डिंग, ग्रिल मरम्मत, कुंडी की मरम्मत',
    descriptionGu: 'લોખંડના ગેટનું વેલ્ડિંગ, ગ્રીલ રીપેરીંગ, કડી સાંધવી',
    basePrice: 399,
    priceUnit: 'visit fee',
    problems: ['welder', 'welding', 'fabricator', 'gate repair', 'grill', 'latch', 'लोहा', 'वेल्डिंग', 'ગ્રીલ', 'વેલ્ડિંગ'],
    isQuoteBased: true,
    jobChecklistEn: ['Prepare welding joint edges', 'Isolate work area from fire hazards', 'Execute precision arc/gas welding', 'Grind weld joints smooth', 'Apply anti-rust coating primer'],
    jobChecklistHi: ['जोड़ तैयार करें', 'आग के खतरों को अलग करें', 'वेल्डिंग करें', 'जोड़ों को पीसकर चिकना करें', 'जंग-रोधी प्राइमर लगाएं'],
    jobChecklistGu: ['સાંધા સાફ કરવા', 'આગ સામે સુરક્ષા રાખવી', 'વેલ્ડિંગ કરવું', 'ગ્રાઇન્ડરથી ફિનિશિંગ કરવું', 'કાટ વિરોધી પ્રાઇમર લગાવવો']
  },
  {
    id: 'painting',
    nameEn: 'Wall Putty & House Painting',
    nameHi: 'दीवार पुताई और कलाई (Painter)',
    nameGu: 'દિવાલ રંગકામ અને પુટ્ટી (Painter)',
    icon: '🎨',
    descriptionEn: 'Interior/Exterior painting, wallpaper fitting, texture walls',
    descriptionHi: 'आंतरिक/बाहरी पेंटिंग, वॉलपेपर फिटिंग, बनावट वाली दीवारें',
    descriptionGu: 'ઘરની અંદર/બહાર કલરકામ, ટેક્ષચર કલર, પુટ્ટીકામ',
    basePrice: 3500,
    priceUnit: 'quote-based',
    problems: ['painting', 'painter', 'putty', 'distemper', 'wallpaper', 'कलाई', 'पेंटर', 'રંગકામ', 'પેઇન્ટિંગ'],
    isQuoteBased: true,
    jobChecklistEn: ['Cover flooring and furniture', 'Sand walls to scrape old paint', 'Apply wall putty layers', 'Prime and apply paint coats', 'Execute cleanup check'],
    jobChecklistHi: ['फर्श और फर्नीचर ढकें', 'दीवारों को घिसें', 'पुट्टी लगाएं', 'प्राइमर और पेंट कोट लगाएं', 'सफाई करें'],
    jobChecklistGu: ['ભોંયતળિયું અને ફર્નિચર ઢાંકવું', 'દિવાલો ઘસવી', 'પુટ્ટી લગાવવી', 'કલર કામ કરવું', 'સફાઈ કરવી']
  },
  {
    id: 'ac-service',
    nameEn: 'AC Service & Gas Refill',
    nameHi: 'एसी सर्विसिंग और गैस चार्जिंग',
    nameGu: 'AC સર્વિસિંગ અને ગેસ રીફિલ',
    icon: '❄️',
    descriptionEn: 'AC cleaning, gas leaks detection, compressor checks',
    descriptionHi: 'एसी सफाई, गैस लीक का पता लगाना, कंप्रेसर जांच',
    descriptionGu: 'AC સાફ કરવું, ગેસ લિકેજ તપાસવું, કોમ્પ્રેસર ચકાસવું',
    basePrice: 399,
    priceUnit: 'service',
    problems: ['ac repair', 'air conditioner', 'ac cooling', 'gas charge', 'एसी', 'कूलिंग', 'એસી', 'કૂલિંગ'],
    isQuoteBased: false,
    jobChecklistEn: ['Inspect indoor filter & coil', 'Clean dust with pressure pump', 'Verify refrigerant gas pressure', 'Check outdoor unit compressor load', 'Test ambient temperature output'],
    jobChecklistHi: ['इनडोर फिल्टर साफ करें', 'प्रेशर पंप से धोएं', 'गैस दबाव जांचें', 'कंप्रेसर लोड जांचें', 'तापमान टेस्ट करें'],
    jobChecklistGu: ['ઇન્ડોર ફિલ્ટર ચેક કરવું', 'પ્રેશર પંપથી સાફ કરવું', 'ગેસ પ્રેશર માપવું', 'કોમ્પ્રેસર લોડ ચેક કરવો', 'કૂલિંગ ટેસ્ટ કરવું']
  },
  {
    id: 'fridge-service',
    nameEn: 'Refrigerator Service',
    nameHi: 'रेफ्रिजरेटर (फ्रिज) मरम्मत',
    nameGu: 'રેફ્રિજરેટર (ફ્રિજ) રીપેરીંગ',
    icon: '🧊',
    descriptionEn: 'Double door fridge repair, single door defrost check, gas refills',
    descriptionHi: 'डबल डोर फ्रिज की मरम्मत, सिंगल डोर डीफ्रॉस्ट जांच',
    descriptionGu: 'ફ્રિજ રીપેરીંગ, સિંગલ/ડબલ ડોર કૂલિંગ ચેક, ગેસ રીફિલ',
    basePrice: 349,
    priceUnit: 'visit fee',
    problems: ['fridge', 'refrigerator', 'fridge gas', 'fridge cooling', 'फ्रिज', 'રેફ્રિજરેટર', 'ફ્રિજ'],
    isQuoteBased: false,
    jobChecklistEn: ['Inspect thermostat switch sensor', 'Verify compressor coil heating', 'Run gas pressure test', 'Clean condensation tray', 'Validate door gasket sealing tightness'],
    jobChecklistHi: ['थर्मोस्टेट सेंसर की जांच करें', 'कंप्रेसर कॉइल देखें', 'गैस टेस्ट करें', 'कंडेनसेशन ट्रे साफ करें', 'दरवाजे की रबड़ जांचें'],
    jobChecklistGu: ['થર્મોસ્ટેટ સેન્સર તપાસવો', 'કોમ્પ્રેસર કોઈલ ચેક કરવી', 'ગેસ ટેસ્ટ કરવો', 'પાણીની ટ્રે સાફ કરવી', 'દરવાજાના રબ્બરની ચકાસણી']
  },
  {
    id: 'ro-service',
    nameEn: 'RO Purifier Water Filter Service',
    nameHi: 'वाटर प्यूरीफायर (RO) फिल्टर बदलना',
    nameGu: 'વોટર પ્યુરિફાયર (RO) સર્વિસ',
    icon: '💧',
    descriptionEn: 'Carbon filter replacement, TDS calibration, membrane checks',
    descriptionHi: 'कार्बन फिल्टर बदलना, टीडीएस अंशांकन, झिल्ली जांच',
    descriptionGu: 'કાર્બન ફિલ્ટર બદલવા, TDS કંટ્રોલ, ફિલ્ટર સર્વિસ',
    basePrice: 299,
    priceUnit: 'service',
    problems: ['ro service', 'water filter', 'purifier filter', 'tds calculation', 'फिल्टर', 'पानी फिल्टर', 'ફિલ્ટર', 'વોટર ફિલ્ટર'],
    isQuoteBased: false,
    jobChecklistEn: ['Measure initial input water TDS level', 'Replace pre-filter sediment candle', 'Check carbon filter block status', 'Calibrate Auto-shutoff solenoid valve', 'Validate output clean water TDS score'],
    jobChecklistHi: ['टीडीएस स्तर मापें', 'प्री-फिल्टर बदलें', 'कार्बन ब्लॉक जांचें', 'ऑटो-शटऑफ वाल्व कैलिब्रेट करें', 'अंतिम टीडीएस जांचें'],
    jobChecklistGu: ['પ્રારંભિક TDS માપવું', 'પ્રી-ફિલ્ટર બદલવું', 'કાર્બન બ્લોક ચેક કરવો', 'ઓટો-શટઓફ વાલ્વ સેટ કરવો', 'અંતિમ TDS માપવું']
  },
  {
    id: 'appliance-repair',
    nameEn: 'Washing Machine & TV Repair',
    nameHi: 'वाशिंग मशीन और टीवी की मरम्मत',
    nameGu: 'વોશિંગ મશીન અને ટીવી રીપેરીંગ',
    icon: '🔌',
    descriptionEn: 'Fully automatic drum checks, TV board mounting, display panel diagnostics',
    descriptionHi: 'वाशिंग मशीन ड्रम जांच, टीवी बोर्ड माउंटिंग, डिस्प्ले पैनल निदान',
    descriptionGu: 'વોશિંગ મશીન ડ્રમ ચેક, ટીવી ફિટિંગ, ડિસ્પ્લે લાઈટ રીપેરીંગ',
    basePrice: 349,
    priceUnit: 'service',
    problems: ['tv mounting', 'washing machine drum', 'microwave', 'television display', 'वाशिंग मशीन', 'टीवी', 'વોશિંગ મશીન', 'ટીવી'],
    isQuoteBased: false,
    jobChecklistEn: ['Run hardware self-diagnostic test', 'Inspect central power board fuses', 'Check drum motor belt tension', 'Test audio/video channel output', 'Provide hardware health parameters'],
    jobChecklistHi: ['हार्डवेयर जांच चलाएं', 'फ्यूज का निरीक्षण करें', 'मोटर बेल्ट तनाव जांचें', 'ऑडियो/वीडियो आउटपुट टेस्ट करें', 'रिपोर्ट दें'],
    jobChecklistGu: ['સેલ્ફ ટેસ્ટ રન કરવો', 'ફ્યુઝ ચેક કરવા', 'મોટર બેલ્ટ ચેક કરવો', 'ઓડિયો/વિડિયો આઉટપુટ ચેક કરવું', 'રિપોર્ટ આપવો']
  },
  {
    id: 'cleaning',
    nameEn: 'Full House Deep Cleaning',
    nameHi: 'घर की गहरी सफाई (Deep Clean)',
    nameGu: 'આખા ઘરની ઉંડી સફાઈ (Deep Clean)',
    icon: '🧹',
    descriptionEn: 'Dust vacuuming, bathroom scrub, kitchen grease removals',
    descriptionHi: 'धूल वैक्यूमिंग, बाथरूम स्क्रबिंग, रसोई की ग्रीस हटाना',
    descriptionGu: 'ધૂળ વેક્યુમિંગ, બાથરૂમ ક્લીનિંગ, રસોડાની સફાઈ',
    basePrice: 999,
    priceUnit: 'flat rate',
    problems: ['deep cleaning', 'house clean', 'kitchen clean', 'toilet scrub', 'सफाई', 'टॉयलेट', 'સફાઈ', 'બાથરૂમ સફાઈ'],
    isQuoteBased: false,
    jobChecklistEn: ['Vacuum floor and dry cobwebs', 'Apply scaling removers on tiles', 'De-grease kitchen chimney walls', 'Mop wood/stone floors clean', 'Disinfect high-touch switches'],
    jobChecklistHi: ['जाले वैक्यूम करें', 'टाइल्स से पपड़ी हटाएं', 'चिमनी साफ करें', 'फर्श पोछा लगाएं', 'स्विच कीटाणुरहित करें'],
    jobChecklistGu: ['જાળા સાફ કરવા', 'ટાઇલ્સ ઘસીને સાફ કરવી', 'રસોડાની ચીકાશ સાફ કરવી', 'ભીનું પોતું કરવું', 'સ્વીચ જંતુમુક્ત કરવી']
  },
  {
    id: 'sofa-cleaning',
    nameEn: 'Sofa & Carpet Cleaners',
    nameHi: 'सोफा और कालीन धोना (Shampoo)',
    nameGu: 'સોફા અને ગાલીચા ધોવા (Shampoo)',
    icon: '🛋️',
    descriptionEn: 'Shampoo wet washing and vacuum extraction for fabric sofas',
    descriptionHi: 'सोफे और कालीन की शैम्पू से गीली धुलाई',
    descriptionGu: 'સોફા અને ગાલીચા શેમ્પૂ સફાઈ',
    basePrice: 599,
    priceUnit: 'service',
    problems: ['sofa clean', 'carpet wash', 'mattress dry clean', 'सोफा', 'कालीन', 'સોફા સફાઈ', 'ગાલીચો'],
    isQuoteBased: false,
    jobChecklistEn: ['Vacuum loose dust particles', 'Apply enzyme-based fabric shampoo', 'Gently scrub fabric surface', 'Extract dirty foam vacuum water', 'Dry with air blower'],
    jobChecklistHi: ['धूल वैक्यूम करें', 'कपड़े धोने का शैम्पू लगाएं', 'सतह रगड़ें', 'झागदार पानी निकालें', 'ब्लोअर से सुखाएं'],
    jobChecklistGu: ['ધૂળ વેક્યુમ કરવી', 'શેમ્પૂ કલર સાફ કરવો', 'સોફા ઘસવા', 'ગંદુ પાણી ખેંચવું', 'સુકવવું']
  },
  {
    id: 'water-tank',
    nameEn: 'Water Tank Cleaning',
    nameHi: 'पानी की टंकी की सफाई (Water Tank)',
    nameGu: 'પાણીની ટાંકીની સફાઈ (Water Tank)',
    icon: '🛢️',
    descriptionEn: 'Underground sump cleaning, overhead PVC tank washing, disinfection',
    descriptionHi: 'भूमिगत हौद की सफाई, पीवीसी टैंक की धुलाई',
    descriptionGu: 'ટાંકીની અંદરની સફાઈ, અંડરગ્રાઉન્ડ સંપ સફાઈ',
    basePrice: 799,
    priceUnit: 'tank',
    problems: ['water tank', 'sump cleaning', 'underground tank', 'टंकी सफाई', 'पानी टंकी', 'ટાંકી સફાઈ', 'પાણીની ટાંકી'],
    isQuoteBased: false,
    jobChecklistEn: ['Drain excess water storage', 'Vacuum mud and sediment silt', 'Scrub tank walls with high pressure', 'Apply UV anti-bacterial spray', 'Wash and flush clean'],
    jobChecklistHi: ['अतिरिक्त पानी निकालें', 'मिट्टी वैक्यूम करें', 'दीवारें रगड़ें', 'जीवाणुनाशक स्प्रे लगाएं', 'पानी से धोएं'],
    jobChecklistGu: ['ટાંકી ખાલી કરવી', 'કાદવ વેક્યુમ કરવો', 'દિવાલો ઘસવી', 'જંતુનાશક દવા છાંટવી', 'ટાંકી ધોઈ નાખવી']
  },
  {
    id: 'car-wash',
    nameEn: 'Car Cleaning & Waxing',
    nameHi: 'कार की धुलाई और वैक्स पॉलिश',
    nameGu: 'કાર વોશિંગ અને વેક્સ પોલિશ',
    icon: '🧼',
    descriptionEn: 'Doorstep car high-pressure washing, vacuuming, dashboard polishing',
    descriptionHi: 'कार की धुलाई, वैक्यूमिंग, डैशबोर्ड पॉलिशिंग',
    descriptionGu: 'કાર બહાર/અંદરની સફાઈ, વેક્યુમિંગ, પોલિશિંગ',
    basePrice: 349,
    priceUnit: 'vehicle',
    problems: ['car wash', 'dashboard polish', 'vacuum car', 'कार वॉश', 'કાર વોશ'],
    isQuoteBased: false,
    jobChecklistEn: ['High-pressure water body wash', 'Apply snow foam shampoo', 'Vacuum seat crevices and mats', 'Apply dashboard wax polish', 'Dry body with microfiber sheets'],
    jobChecklistHi: ['हाई-प्रेशर कार वॉश करें', 'फोम शैम्पू लगाएं', 'सीटें वैक्यूम करें', 'डैशबोर्ड पॉलिश लगाएं', 'सुखाएं'],
    jobChecklistGu: ['પ્રેશરથી ગાડી ધોવી', 'ફોમ શેમ્પૂ લગાવવું', 'સીટો વેક્યુમ કરવી', 'ડેશબોર્ડ પોલિશ કરવું', 'કોરી કરવી']
  },
  {
    id: 'mens-salon',
    nameEn: 'Mens Haircut & Grooming',
    nameHi: 'पुरुष सैलून (बाल काटना - Haircut)',
    nameGu: 'પુરુષોનું સેલોન (હેરકટ - Haircut)',
    icon: '💈',
    descriptionEn: 'Hair styling, head massage, clean shaves at home',
    descriptionHi: 'हेयर स्टाइलिंग, सिर की मालिश, शेविंग',
    descriptionGu: 'વાળ કાપવા, માથાનું માલિશ, દાઢી કરવી',
    basePrice: 249,
    priceUnit: 'session',
    problems: ['mens haircut', 'shave beard', 'hair dye men', 'बाल काटना', 'दाढ़ी', 'હેરકટ', 'દાઢી'],
    isQuoteBased: false,
    jobChecklistEn: ['Sanitize haircut combs & tools', 'Trim hair based on instructions', 'Provide face cleanup wash', 'Clean neck skin area', 'Clear cutoff hair debris'],
    jobChecklistHi: ['कंगघे और उपकरण साफ करें', 'पसंद अनुसार बाल काटें', 'चेहरा साफ करें', 'गर्दन साफ करें', 'बाल साफ करें'],
    jobChecklistGu: ['સાધનો સેનિટાઈઝ કરવા', 'વાળ કાપવા', 'મોઢું સાફ કરવું', 'ગરદન સાફ કરવી', 'કચરો સાફ કરવો']
  },
  {
    id: 'womens-salon',
    nameEn: 'Womens Facial & Makeup',
    nameHi: 'महिला सैलून और फेशियल',
    nameGu: 'મહિલા સેલોન અને ફેશિયલ',
    icon: '💇‍♀️',
    descriptionEn: 'Threading, gold facials, honey waxing, bridal stylings',
    descriptionHi: 'थ्रेडिंग, गोल्ड फेशियल, वैक्सिंग, ब्राइडल स्टाइलिंग',
    descriptionGu: 'આઈબ્રો, ગોલ્ડ ફેશિયલ, મધ વેક્સિંગ, બ્યુટી પાર્લર',
    basePrice: 499,
    priceUnit: 'session',
    problems: ['women beauty', 'gold facial', 'waxing women', 'threading eyebrows', 'फेशियल', 'वैक्सिंग', 'થ્રેડીંગ', 'ફેશિયલ'],
    isQuoteBased: false,
    jobChecklistEn: ['Sanitize massage sponges & wraps', 'Massage face with facial cleansers', 'Apply clay masks & steam', 'Clean pores and apply creams', 'Provide skin safety guides'],
    jobChecklistHi: ['स्पंज साफ करें', 'फेशियल क्लींजर से मालिश करें', 'फेस पैक लगाएं', 'त्वचा साफ करें', 'निर्देश दें'],
    jobChecklistGu: ['સાધનો સાફ કરવા', 'ફેસ મસાજ કરવો', 'માસ્ક અને સ્ટીમ આપવી', 'મોઢું સાફ કરવું', 'માહિતી આપવી']
  },
  {
    id: 'massage-therapy',
    nameEn: 'Physio & Stress Massage',
    nameHi: 'बॉडी मसाज और फिजियोथेरेपी',
    nameGu: 'બોડી મસાજ અને થેરાપી',
    icon: '💆',
    descriptionEn: 'Deep tissue therapy, pain relief massage, joint mobilizations',
    descriptionHi: 'दर्द निवारक मालिश, जोड़ों की थेरेपी',
    descriptionGu: 'દુખાવા મુક્તિ માલિશ, થેરાપી કસરત',
    basePrice: 899,
    priceUnit: 'hour',
    problems: ['massage', 'spa massage', 'joint pain relief', 'physiotherapist', 'मालिश', 'बॉडी पेन', 'મસાજ', 'દુખાવો'],
    isQuoteBased: false,
    jobChecklistEn: ['Establish safe clean massage station', 'Query client on physical injury zones', 'Execute relaxing muscle strokes', 'Wipe oil residues with warm towel', 'Review posture ergonomics'],
    jobChecklistHi: ['मसाज स्टेशन लगाएं', 'चोट के बारे में पूछें', 'मालिश करें', 'गर्म तौलिये से तेल पोछें', 'सलाह दें'],
    jobChecklistGu: ['સ્થળ સાફ કરવું', 'દુખાવાના ભાગ વિશે પૂછવું', 'માલિશ કરવી', 'ગરમ ટુવાલથી તેલ સાફ કરવું', 'આરોગ્ય માર્ગદર્શન']
  },
  {
    id: 'tutoring',
    nameEn: 'Home Tutors (Maths/Science)',
    nameHi: 'घर पर पढ़ाई (Home Tutor)',
    nameGu: 'ઘરે ટ્યુશન (હોમ ટ્યુટર)',
    icon: '📚',
    descriptionEn: 'Subject experts for CBSE, ICSE, regional boards, language training',
    descriptionHi: 'सीबीएसई, आईसीएसई के लिए विषय विशेषज्ञ',
    descriptionGu: 'CBSE, ICSE, ગુજ. બોર્ડ માટે હોમ ટ્યુટર',
    basePrice: 3000,
    priceUnit: 'month',
    problems: ['home tutor', 'maths teacher', 'gujarati tutor', 'science class', 'शिक्षक', 'ट्यूशन', 'શિક્ષક', 'ટ્યુશન'],
    isQuoteBased: true,
    jobChecklistEn: ['Assess student understanding level', 'Draft modular syllabus calendar', 'Conduct weekly topic test', 'Share academic report with parents'],
    jobChecklistHi: ['स्तर का आकलन करें', 'पाठ्यक्रम कैलेंडर बनाएं', 'साप्ताहिक टेस्ट लें', 'रिपोर्ट साझा करें'],
    jobChecklistGu: ['વિદ્યાર્થીના સ્તરની તપાસ', 'અભ્યાસક્રમ બનાવવો', 'સાપ્તાહિક ટેસ્ટ લેવો', 'વાલીઓ સાથે રીપોર્ટ શેર કરવો']
  },
  {
    id: 'vehicle-repair',
    nameEn: 'Roadside Vehicle Mechanic',
    nameHi: 'गाड़ी मैकेनिक और पंचर सर्विस',
    nameGu: 'ગાડી રીપેરીંગ અને પંચર',
    icon: '🏍️',
    descriptionEn: 'Bike sparkplug changes, car battery jumps, puncture fixes nearby',
    descriptionHi: 'बाइक स्पार्क प्लग बदलना, कार बैटरी जंप, पंचर ठीक करना',
    descriptionGu: 'બાઇક સ્પાર્ક પ્લગ, કાર બેટરી ચાર્જ, પંચર રીપેરીંગ',
    basePrice: 249,
    priceUnit: 'visit fee',
    problems: ['bike breakdown', 'car puncture', 'jumpstart battery', 'mechanic near me', 'मैकेनिक', 'पंचर', 'મિકેનિક', 'પંચર'],
    isQuoteBased: false,
    jobChecklistEn: ['Check sparkplug carbon status', 'Locate puncture points in water bath', 'Apply patch rubber stamps', 'Verify air pressure stability', 'Benchmark engine start noise'],
    jobChecklistHi: ['प्लग जांचें', 'पंचर ढूंढें', 'रबर पैच लगाएं', 'दबाव जांचें', 'इंजन टेस्ट करें'],
    jobChecklistGu: ['પ્લગ ચેક કરવો', 'પંચર શોધવું', 'રબ્બર પેચ લગાવો', 'હવાનું પ્રેશર ચકાસવું', 'સ્ટાર્ટ ટેસ્ટ']
  },
  {
    id: 'moving-packing',
    nameEn: 'Packers & Movers Shifting',
    nameHi: 'सामान शिफ्टिंग (Packers Movers)',
    nameGu: 'સામાન પેકિંગ અને ફેરફેર (Packers)',
    icon: '📦',
    descriptionEn: 'Safe packaging of home articles, loading, furniture shifts',
    descriptionHi: 'घरेलू सामानों की पैकिंग, लोडिंग, फर्नीचर स्थानांतरण',
    descriptionGu: 'સામાન પેક કરવો, લિફ્ટિંગ, ટ્રકમાં ચડાવવો અને શિફ્ટિંગ',
    basePrice: 4500,
    priceUnit: 'quote-based',
    problems: ['packers movers', 'relocation', 'shift home', 'luggage delivery', 'पैकर्स मूवर्स', 'સામાન પેકર્સ', 'શિફ્ટિંગ'],
    isQuoteBased: true,
    jobChecklistEn: ['Inventory furniture assets', 'Wrap fragile items with bubble foam', 'Secure load within truck beds', 'Execute transit mapping', 'Unload and inspect damages'],
    jobChecklistHi: ['सामान की सूची बनाएं', 'नाजुक सामान पैक करें', 'ट्रक में लोड करें', 'पहुंचाएं', 'नुकसान जांचें'],
    jobChecklistGu: ['સામાન લિસ્ટ બનાવવું', 'કાચનો સામાન પેક કરવો', 'ટ્રકમાં લોડ કરવો', 'નવી જગ્યાએ ઉતારવો', 'ચેક કરવો']
  },
  {
    id: 'pest-control',
    nameEn: 'Herbal Pest Control Spray',
    nameHi: 'दीमक और कीड़े मारना (Pest Control)',
    nameGu: 'ઉધઈ અને જંતુ મુક્તિ (Pest Control)',
    icon: '🐜',
    descriptionEn: 'Bedbug sprays, anti-termite wood treatment, cockroach gel baits',
    descriptionHi: 'दीमक रोधी लकड़ी उपचार, कॉकरोच जेल चारा',
    descriptionGu: 'માંકડ અને ઉધઈ નિયંત્રણ, વંદા માટે હર્બલ જેલ',
    basePrice: 499,
    priceUnit: 'treatment',
    problems: ['pest control', 'termite inspect', 'bedbugs spray', 'दीमक', 'कीड़े', 'સ્પ્રે', 'ઉધઈ', 'જંતુ'],
    isQuoteBased: false,
    jobChecklistEn: ['Inspect wall corners for termite paths', 'Inject herbal formulations into wood pores', 'Seal visible entry cracks', 'Educate customer on ventilation hours', 'Confirm follow-up checks schedule'],
    jobChecklistHi: ['दीमक रास्ते खोजें', 'लकड़ी में दवा डालें', 'दरारें बंद करें', 'जानकारी दें', 'जांच तय करें'],
    jobChecklistGu: ['તિરાડો તપાસવી', 'લાકડામાં દવા ઇન્જેક્ટ કરવી', 'તિરાડો બંધ કરવી', 'ગ્રાહકને સૂચના આપવી', 'ચેકઅપ નક્કી કરવું']
  },
  {
    id: 'cctv-setup',
    nameEn: 'CCTV Camera Setup',
    nameHi: 'सीसीटीवी कैमरा और सुरक्षा सेटअप',
    nameGu: 'CCTV કેમેરા અને સિક્યોરિટી સેટઅપ',
    icon: '📹',
    descriptionEn: 'Dome camera mounts, DVR configuring, remote phone views',
    descriptionHi: 'डोम कैमरा माउंट, डीवीआर कॉन्फ़िगर करना',
    descriptionGu: 'કેમેરા ફિટિંગ, DVR સેટઅપ, મોબાઈલ વ્યુ કનેક્શન',
    basePrice: 999,
    priceUnit: 'setup',
    problems: ['cctv installer', 'security camera repair', 'dvr backup', 'सीसीटीवी', 'કેમેરા', 'CCTV'],
    isQuoteBased: true,
    jobChecklistEn: ['Plan camera lens angles', 'Run coaxial/ethernet cables', 'Power DVR console system', 'Install remote viewing software on client mobile', 'Validate recording file backups'],
    jobChecklistHi: ['कोण तय करें', 'केबल बिछाएं', 'DVR चालू करें', 'मोबाइल ऐप में चालू करें', 'बैकअप जांचें'],
    jobChecklistGu: ['એન્ગલ નક્કી કરવા', 'વાયર કનેક્શન કરવા', 'DVR ચાલુ કરવું', 'મોબાઈલમાં એપ કનેક્ટ કરવી', 'બેકઅપ ચેક કરવો']
  },
  {
    id: 'laptop-mobile',
    nameEn: 'Laptop & Mobile Repair',
    nameHi: 'लैपटॉप और मोबाइल की मरम्मत',
    nameGu: 'લેપટોપ અને મોબાઈલ રીપેરીંગ',
    icon: '💻',
    descriptionEn: 'Display screens replacement, motherboard soldering, OS installs',
    descriptionHi: 'डिस्प्ले स्क्रीन बदलना, ओएस इंस्टॉल करना',
    descriptionGu: 'મોબાઈલ સ્ક્રીન બદલવી, સોફ્ટવેર, લેપટોપ ફોર્મેટ',
    basePrice: 299,
    priceUnit: 'visit fee',
    problems: ['laptop screen replacement', 'mobile repair screen', 'format windows', 'लैपटॉप', 'मोबाइल', 'લેપટોપ', 'મોબાઈલ'],
    isQuoteBased: false,
    jobChecklistEn: ['Perform critical user data backup', 'Safely disengage screen screws', 'Identify circuit board failures', 'Install new verified screen panel', 'Validate boot speed benchmark'],
    jobChecklistHi: ['बैकअप लें', 'स्क्रू खोलें', 'सर्किट जांचें', 'स्क्रीन बदलें', 'बूट स्पीड जांचें'],
    jobChecklistGu: ['ડેટા બેકઅપ લેવો', 'સ્ક્રૂ ખોલવા', 'બોર્ડ ચેક કરવું', 'નવી સ્ક્રીન ફિટ કરવી', 'ટેસ્ટ ડ્રાઈવ']
  },
  {
    id: 'daily-life',
    nameEn: 'Cooks & House Maids (Kamwali)',
    nameHi: 'रसोइया और कामवाली बाई (Kamwali)',
    nameGu: 'રસોઈયા અને ઘરકામ બહેન (Kamwali)',
    icon: '🧺',
    descriptionEn: 'On-demand cooking, washing clothes, dusting and sweeping floor',
    descriptionHi: 'झाड़ू-पोछा नौकरानी, घरेलू रसोइया',
    descriptionGu: 'રસોઈ બનાવવી, કચરાપોતા, કપડાં વાસણ સાફ કરવા',
    basePrice: 199,
    priceUnit: 'hour',
    problems: ['cook helper', 'maid sweep mop', 'washing clothes helper', 'कामवाली', 'नौकरानी', 'રસોઈયા', 'કામવાળા બહેન'],
    isQuoteBased: false,
    jobChecklistEn: ['Receive recipe/dusting task instructions', 'Clean designated stoves/washbasin sites', 'Prepare dishes / scrub floor surfaces', 'Safely store ingredients / fold laundry', 'Sanitize tools & containers'],
    jobChecklistHi: ['निर्देश प्राप्त करें', 'चूल्हा साफ करें', 'खाना बनाएं / झाड़ू लगाएं', 'कपड़े तय करें', 'बर्तन धोएं'],
    jobChecklistGu: ['કામની માહિતી મેળવવી', 'રસોડું સાફ કરવું', 'રસોઈ બનાવવી / પોતું કરવું', 'કપડાં વ્યવસ્થિત ગોઠવવા', 'વાસણ ધોવા']
  },
  {
    id: 'gardening',
    nameEn: 'Gardening & Nursery (Maali)',
    nameHi: 'माली काम और नर्सरी (Gardener)',
    nameGu: 'માળી કામ અને બગીચો (Gardener)',
    icon: '🌿',
    descriptionEn: 'Lawn weedings, plant re-potting, soil pesticide application',
    descriptionHi: 'लॉन की छंटाई, मिट्टी में कीटनाशक डालना',
    descriptionGu: 'લોન કટીંગ, ખાતર નાખવું, કુંડા બદલવા અને નવા રોપાઓ',
    basePrice: 249,
    priceUnit: 'hour',
    problems: ['gardener maali', 're-pot plants', 'lawn compost soil', 'माली', 'માળી', 'છોડ'],
    isQuoteBased: false,
    jobChecklistEn: ['Clear weeds from soil bases', 'Trim overgrown hedge shapes', 'Apply biological soil compost mix', 'Deep water all planter pots', 'Complete re-potting checks'],
    jobChecklistHi: ['खरपतवार हटाएं', 'झाड़ियां छांटें', 'जैविक खाद डालें', 'पानी डालें', 'गमले बदलें'],
    jobChecklistGu: ['બગીચો સાફ કરવો', 'ઝાડ કટીંગ કરવા', 'ખાતર નાખવું', 'પાણી પાવું', 'કુંડા ફેરવવા']
  },
  {
    id: 'pooja-vastu',
    nameEn: 'Pooja & Pandit Ji Services',
    nameHi: 'पूजा पाठ और हवन (Pandit Ji)',
    nameGu: 'પૂજા કથા અને વિધિ હવન (Pandit Ji)',
    icon: '🪔',
    descriptionEn: 'Griha Pravesh rituals, Satyanarayan Pooja Katha by verified Pandits',
    descriptionHi: 'गृह प्रवेश हवन, सत्यनारायण कथा पूजन',
    descriptionGu: 'નવા ઘરનું વાસ્તુ પૂજન, સત્યનારાયણ પૂજા કથા',
    basePrice: 2100,
    priceUnit: 'pooja',
    problems: ['pandit puja', 'satyanarayan katha pandit', 'griha pravesh pandit', 'पंडित', 'हवन', 'પંડિત', 'હવન', 'પૂજા વિધિ'],
    isQuoteBased: true,
    jobChecklistEn: ['List essential pooja ingredients (Samagri)', 'Recite Vedic slokas and mantras', 'Conduct fire havan sacrificial rites', 'Perform final aarti & distribute prasad', 'Calculate family Vastu timeline suggestions'],
    jobChecklistHi: ['पूजा सामग्री सूची दें', 'वैदिक मंत्रोच्चार करें', 'हवन संपन्न करें', 'आरती और प्रसाद वितरण करें', 'वास्तु परामर्श दें'],
    jobChecklistGu: ['સામગ્રીનું લિસ્ટ આપવું', 'મંત્રોચ્ચાર કરવા', 'હવન વિધિ પૂરી કરવી', 'આરતી અને પ્રસાદ વહેંચવો', 'વાસ્તુ મુહૂર્ત માર્ગદર્શન']
  },
  {
    id: 'scrap-buyer',
    nameEn: 'Scrap Buyer & Kabadiwala',
    nameHi: 'कबाड़ खरीदार (Kabadiwala)',
    nameGu: 'ભંગાર ખરીદનાર (Kabadiwala)',
    icon: '📦',
    descriptionEn: 'Sell old newspapers, metal scrap, plastic bottles, old electronics',
    descriptionHi: 'पुराने समाचार पत्र, धातु स्क्रैप, प्लास्टिक की बोतलें बेचें',
    descriptionGu: 'જૂના પેપર, ભંગાર, પ્લાસ્ટિક બોટલ અને પસ્તી કલેક્શન',
    basePrice: 0,
    priceUnit: 'quote',
    problems: ['kabadi', 'kabadiwala', 'scrap', 'old paper', 'raddi', 'metal scrap', 'sell old tv', 'रद्दी', 'कबाड़ी', 'ભંગાર', 'પસ્તી', 'કબાડીવાળા'],
    isQuoteBased: true,
    jobChecklistEn: ['Weigh scrap materials accurately', 'Deduct weight of containers', 'Verify current scrap market rates', 'Clear loading area', 'Pay customer digitally or cash'],
    jobChecklistHi: ['सामग्री का सही वजन करें', 'कंटेनरों का वजन घटाएं', 'बाजार दरों की जांच करें', 'लोडिंग क्षेत्र साफ करें', 'भुगतान करें'],
    jobChecklistGu: ['ભંગારનું વજન કરવું', 'ચોક્કસ ભાવ ગણવા', 'કચરો સાફ કરવો', 'રૂપિયા ચૂકવવો']
  },
  {
    id: 'water-tanker',
    nameEn: 'Water Tanker Supply',
    nameHi: 'पानी का टैंकर (Water Tanker)',
    nameGu: 'પાણીનો ટેન્કર સપ્લાય',
    icon: '💧',
    descriptionEn: 'Water supply for household needs, borewell water, drinking water',
    descriptionHi: 'घरेलू आवश्यकताओं के लिए पानी की आपूर्ति, पीने का पानी',
    descriptionGu: 'ઘર વપરાશ માટે પાણીનો ટેન્કર સપ્લાય',
    basePrice: 800,
    priceUnit: 'tanker',
    problems: ['water tanker', 'tanker supply', 'drinking water tanker', 'borewell water', 'पानी का टैंकर', 'પાણીનો ટેન્કર'],
    isQuoteBased: false,
    jobChecklistEn: ['Verify water quantity and source', 'Connect hose pipelines securely', 'Fill building underground tank', 'Check for leakages in valves', 'Collect acknowledgement receipt'],
    jobChecklistHi: ['मात्रा और स्रोत की जांच करें', 'होस पाइप सुरक्षित रूप से जोड़ें', 'भूमिगत टैंक भरें', 'लीक की जांच करें', 'रसीद लें'],
    jobChecklistGu: ['પાણીની ક્વોલિટી ચેક કરવી', 'પાઇપલાઇન કનેક્ટ કરવી', 'ટાંકી ફૂલ કરવી', 'વાલ્વ ચેક કરવા']
  },
  {
    id: 'locksmith',
    nameEn: 'Locksmith & Key Maker (Chabiwala)',
    nameHi: 'ताला-चाबी बनाने वाला (Chabiwala)',
    nameGu: 'તાળા ચાવી રિપેરિંગ (Chabiwala)',
    icon: '🔑',
    descriptionEn: 'Duplicate keys, open jammed locks, home security key setup',
    descriptionHi: 'डुप्लिकेट चाबियां, जाम ताले खोलना, नया लॉक लगाना',
    descriptionGu: 'તાળું ખોલવું, ડુપ્લિકેટ ચાવી બનાવવી, લોક બદલવું',
    basePrice: 150,
    priceUnit: 'visit fee',
    problems: ['key maker', 'locksmith', 'chabiwala', 'duplicate key', 'broken lock', 'ताला', 'चाबी', 'ચાવી', 'તાળું', 'ચાવીવાળા'],
    isQuoteBased: false,
    jobChecklistEn: ['Inspect jammed lock mechanism', 'Create prototype key teeth structure', 'Test duplicate keys three times', 'Clean metallic filing residues', 'Lubricate key hole slots'],
    jobChecklistHi: ['ताले का निरीक्षण करें', 'चाबी का प्रोटोटाइप बनाएं', 'चाबी का तीन बार परीक्षण करें', 'कण साफ करें', 'स्नेहक तेल डालें'],
    jobChecklistGu: ['લોક ચેક કરવું', 'ચાવી કટીંગ કરવી', '૩ વખત ટેસ્ટ કરવી', 'ઓઈલીંગ કરવું']
  },
  {
    id: 'geyser-service',
    nameEn: 'Geyser & Water Heater Repair',
    nameHi: 'गीजर मरम्मत (Geyser Repair)',
    nameGu: 'ગીઝર રિપેરિંગ (Geyser Repair)',
    icon: '🔥',
    descriptionEn: 'Geyser installation, element replacement, water heater leakage',
    descriptionHi: 'गीजर इंस्टॉलेशन, हीटिंग एलिमेंट बदलना, पानी का रिसाव ठीक करना',
    descriptionGu: 'ગીઝર ફિટિંગ, ગરમી ન થવી, વાયર ચેક કરવો',
    basePrice: 249,
    priceUnit: 'visit fee',
    problems: ['geyser repair', 'water heater', 'geyser sound', 'hot water not working', 'गीजर', 'ગીઝર'],
    isQuoteBased: false,
    jobChecklistEn: ['Turn off main power and water inlet', 'Drain residual hot water chambers', 'Replace faulty coil heating elements', 'Verify thermostat cutoff thresholds', 'Test hot water pressure flows'],
    jobChecklistHi: ['बिजली और पानी बंद करें', 'चेंबर खाली करें', 'कॉइल बदलें', 'थर्मोस्टेट चेक करें', 'पानी का दबाव जांचें'],
    jobChecklistGu: ['લાઇન બંધ કરવી', 'કોઇલ બદલવી', 'થર્મોસ્ટેટ ચેક કરવું', 'ટેસ્ટ કરવી']
  },
  {
    id: 'legal-ca',
    nameEn: 'Legal, CA & GST Registration',
    nameHi: 'कानूनी और सीए सलाह (Legal & CA)',
    nameGu: 'લીગલ અને સીએ કન્સલ્ટિંગ',
    icon: '⚖️',
    descriptionEn: 'GST registration, ITR filing, rent agreement drafting, legal consults',
    descriptionHi: 'जीएसटी पंजीकरण, आईटीआर फाइलिंग, रेंट एग्रीमेंट ड्राफ्टिंग',
    descriptionGu: 'સીએ ટેક્સ રિટર્ન, જીએસટી રજીસ્ટ્રેશન, ભાડા કરાર અને લીગલ સલાહ',
    basePrice: 499,
    priceUnit: 'consult',
    problems: ['tax return', 'itr filing', 'gst registration', 'ca consultation', 'legal notice', 'will drafting', 'सीए', 'वकील', 'સીએ', 'વકીલ'],
    isQuoteBased: true,
    jobChecklistEn: ['List required government identity proofs', 'Verify financial ledger reports', 'Draft rent/sale deed documents', 'Apply online to target department portals', 'Share registered document copy with seal'],
    jobChecklistHi: ['आवश्यक सरकारी पहचान पत्रों की सूची बनाएं', 'वित्तीय रिपोर्ट जांचें', 'एग्रीमेंट ड्राफ्ट करें', 'ऑनलाइन आवेदन करें', 'कॉपी साझा करें'],
    jobChecklistGu: ['ડોક્યુમેન્ટ્સનું લિસ્ટ આપવું', 'ફાઇલિંગ ચેક કરવું', 'ભાડા કરાર ડ્રાફ્ટ કરવો', 'ઓનલાઇન અરજી કરવી']
  }
];

// Preloaded Seed Vendors
export const SEED_VENDORS: Vendor[] = [
  {
    id: 'v-rajesh',
    name: 'Rajesh Kumar (Electric/Plumbing)',
    phone: '+91 98765 43210',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    kycStatus: 'approved',
    kycDetails: {
      aadhaarNo: '4321-8765-9012',
      panNo: 'ABCDE1234F',
      referenceName: 'Suresh Patel (Owner, Patel Electricals)',
      referencePhone: '+91 99999 88888',
      documentPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300',
      selfiePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      aiVerificationScore: 94,
      aiFlags: []
    },
    trustScore: 98,
    rating: 4.8,
    completedJobsCount: 142,
    completionRate: 97,
    responseTime: '10 mins',
    skills: ['home-repair', 'painting'],
    experienceYears: 8,
    serviceAreas: ['Satellite', 'Bodakdev', 'Vastrapur'],
    location: { lat: 23.0305, lng: 72.5075 },
    isOnline: true
  },
  {
    id: 'v-savita',
    name: 'Savita Devi (Maid/Cook Helper)',
    phone: '+91 91234 56789',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    kycStatus: 'approved',
    kycDetails: {
      aadhaarNo: '9876-5432-1098',
      panNo: 'XYZWP5678G',
      referenceName: 'Anil Mehta (Society Secretary, Shanti Heights)',
      referencePhone: '+91 98888 77777',
      documentPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300',
      selfiePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
      aiVerificationScore: 91,
      aiFlags: []
    },
    trustScore: 95,
    rating: 4.9,
    completedJobsCount: 210,
    completionRate: 99,
    responseTime: '15 mins',
    skills: ['cleaning', 'daily-life'],
    experienceYears: 5,
    serviceAreas: ['Prahladnagar', 'Jodhpur', 'Vejalpur'],
    location: { lat: 23.0120, lng: 72.5085 },
    isOnline: true
  },
  {
    id: 'v-manoj-pending',
    name: 'Manoj Solanki (Painter Karigar)',
    phone: '+91 95555 44444',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    kycStatus: 'pending',
    kycDetails: {
      aadhaarNo: '5555-6666-7777',
      panNo: 'PANMS5555A',
      referenceName: 'Lalji Bhai (Plumbing Shop)',
      referencePhone: '+91 95555 33333',
      documentPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300',
      selfiePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      aiVerificationScore: 82,
      aiFlags: ['Name mismatch on PAN card (Manoj S.)']
    },
    trustScore: 70,
    rating: 0,
    completedJobsCount: 0,
    completionRate: 0,
    responseTime: 'N/A',
    skills: ['painting', 'home-repair'],
    experienceYears: 3,
    serviceAreas: ['Bapunagar', 'Nikol'],
    location: { lat: 23.0380, lng: 72.6350 },
    isOnline: false
  }
];

// Preloaded Seed Bookings
export const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-1001',
    customerId: 'c-karan',
    customerName: 'Karan Shah',
    customerPhone: '+91 98980 98980',
    customerLocation: 'A-404, Shanti Apartments, Vastrapur, Ahmedabad',
    categoryId: 'home-repair',
    subcategoryName: 'Plumbing & Electrical Fixes',
    vendorId: 'v-rajesh',
    status: 'completed',
    price: 350,
    isQuote: false,
    quoteRequested: false,
    scheduledTime: '2026-06-18 11:00',
    beforePhoto: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200',
    afterPhoto: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200',
    checklistState: {
      'Inspect problem point': true,
      'Isolate water/power supply': true,
      'Replace damaged parts': true,
      'Test for functionality': true,
      'Clean repair debris': true
    },
    chatHistory: [
      { id: 'm1', sender: 'customer', text: 'Hi Rajesh, please come on time.', timestamp: '10:30 AM' },
      { id: 'm2', sender: 'vendor', text: 'Yes brother, I am carrying the spare pipe, leaving now.', timestamp: '10:32 AM' }
    ],
    disputeStatus: 'none',
    warrantyStatus: 'active',
    gpsStreamActive: false
  },
  {
    id: 'b-1002',
    customerId: 'c-megha',
    customerName: 'Megha Vyas',
    customerPhone: '+91 97770 12345',
    customerLocation: 'House No 12, Prahladnagar, Ahmedabad',
    categoryId: 'cleaning',
    subcategoryName: 'Full House Deep Cleaning',
    vendorId: 'v-savita',
    status: 'assigned',
    price: 999,
    isQuote: false,
    quoteRequested: false,
    scheduledTime: '2026-06-20 14:00',
    checklistState: {
      'Vacuum floor and dry cobwebs': false,
      'Apply scaling removers on tiles': false,
      'De-grease kitchen chimney walls': false,
      'Mop wood/stone floors clean': false,
      'Disinfect high-touch switches': false
    },
    chatHistory: [],
    disputeStatus: 'none',
    warrantyStatus: 'none',
    gpsStreamActive: false
  }
];

// Preloaded Fraud Logs
export const SEED_FRAUD_LOGS: FraudLog[] = [
  {
    id: 'f-1',
    bookingId: 'b-1001',
    vendorId: 'v-rajesh',
    riskScore: 12,
    reason: 'Normal transaction pattern. Safe.',
    timestamp: '2026-06-18 12:00',
    status: 'resolved'
  }
];

// LOCAL STORAGE REPO CLASS
export class KaamWaleDB {
  static syncStatusListener: ((status: 'syncing' | 'connected' | 'error') => void) | null = null;
  static isSyncing = false;

  static async fetchFromSupabase() {
    this.isSyncing = true;
    if (this.syncStatusListener) this.syncStatusListener('syncing');
    try {
      const { data, error } = await supabase
        .from('sync_store')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        for (const row of data) {
          if (row.key === 'categories') {
            localStorage.setItem('kw_categories', JSON.stringify(row.value));
          } else if (row.key === 'vendors') {
            localStorage.setItem('kw_vendors', JSON.stringify(row.value));
          } else if (row.key === 'bookings') {
            localStorage.setItem('kw_bookings', JSON.stringify(row.value));
          } else if (row.key === 'fraud') {
            localStorage.setItem('kw_fraud', JSON.stringify(row.value));
          } else if (row.key === 'customers') {
            localStorage.setItem('kw_customers', JSON.stringify(row.value));
          }
        }
      }
      if (this.syncStatusListener) this.syncStatusListener('connected');
    } catch (err) {
      console.error('Failed to pull from Supabase:', err);
      if (this.syncStatusListener) this.syncStatusListener('error');
    } finally {
      this.isSyncing = false;
    }
  }

  static setupRealtime(onSyncUpdate: () => void) {
    supabase
      .channel('public:sync_store')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_store' }, (payload: any) => {
        const row = payload.new;
        if (!row || !row.key) return;
        
        if (row.key === 'categories') {
          localStorage.setItem('kw_categories', JSON.stringify(row.value));
        } else if (row.key === 'vendors') {
          localStorage.setItem('kw_vendors', JSON.stringify(row.value));
        } else if (row.key === 'bookings') {
          localStorage.setItem('kw_bookings', JSON.stringify(row.value));
        } else if (row.key === 'fraud') {
          localStorage.setItem('kw_fraud', JSON.stringify(row.value));
        } else if (row.key === 'customers') {
          localStorage.setItem('kw_customers', JSON.stringify(row.value));
        }
        
        onSyncUpdate();
      })
      .subscribe();
  }

  static init() {
    const cachedCats = localStorage.getItem('kw_categories');
    if (!cachedCats || JSON.parse(cachedCats).length < SERVICE_CATEGORIES.length) {
      localStorage.setItem('kw_categories', JSON.stringify(SERVICE_CATEGORIES));
    }
    if (!localStorage.getItem('kw_vendors')) {
      localStorage.setItem('kw_vendors', JSON.stringify(SEED_VENDORS));
    }
    if (!localStorage.getItem('kw_bookings')) {
      localStorage.setItem('kw_bookings', JSON.stringify(SEED_BOOKINGS));
    }
    if (!localStorage.getItem('kw_fraud')) {
      localStorage.setItem('kw_fraud', JSON.stringify(SEED_FRAUD_LOGS));
    }
    if (!localStorage.getItem('kw_customers')) {
      localStorage.setItem('kw_customers', JSON.stringify(SEED_CUSTOMERS));
    }
    
    this.fetchFromSupabase();
  }

  // Customers
  static getCustomers(): Customer[] {
    this.init();
    return JSON.parse(localStorage.getItem('kw_customers') || '[]');
  }

  static saveCustomers(customers: Customer[]) {
    localStorage.setItem('kw_customers', JSON.stringify(customers));
    syncToSupabase('customers', customers);
  }

  // Session storage
  static getCurrentCustomer(): Customer | null {
    const data = localStorage.getItem('kw_current_customer');
    return data ? JSON.parse(data) : null;
  }

  static setCurrentCustomer(cust: Customer | null) {
    if (cust) {
      localStorage.setItem('kw_current_customer', JSON.stringify(cust));
    } else {
      localStorage.removeItem('kw_current_customer');
    }
  }

  static getCurrentVendor(): Vendor | null {
    const data = localStorage.getItem('kw_current_vendor');
    return data ? JSON.parse(data) : null;
  }

  static setCurrentVendor(vend: Vendor | null) {
    if (vend) {
      localStorage.setItem('kw_current_vendor', JSON.stringify(vend));
    } else {
      localStorage.removeItem('kw_current_vendor');
    }
  }

  // Categories
  static getCategories(): ServiceCategory[] {
    this.init();
    return JSON.parse(localStorage.getItem('kw_categories') || '[]');
  }
  
  static saveCategories(categories: ServiceCategory[]) {
    localStorage.setItem('kw_categories', JSON.stringify(categories));
    syncToSupabase('categories', categories);
  }

  // Vendors
  static getVendors(): Vendor[] {
    this.init();
    return JSON.parse(localStorage.getItem('kw_vendors') || '[]');
  }

  static saveVendors(vendors: Vendor[]) {
    localStorage.setItem('kw_vendors', JSON.stringify(vendors));
    syncToSupabase('vendors', vendors);
  }

  static updateVendor(vendor: Vendor) {
    const list = this.getVendors();
    const idx = list.findIndex(v => v.id === vendor.id);
    if (idx !== -1) {
      list[idx] = vendor;
    } else {
      list.push(vendor);
    }
    this.saveVendors(list);
  }

  // Bookings
  static getBookings(): Booking[] {
    this.init();
    return JSON.parse(localStorage.getItem('kw_bookings') || '[]');
  }

  static saveBookings(bookings: Booking[]) {
    localStorage.setItem('kw_bookings', JSON.stringify(bookings));
    syncToSupabase('bookings', bookings);
  }

  static updateBooking(booking: Booking) {
    const list = this.getBookings();
    const idx = list.findIndex(b => b.id === booking.id);
    if (idx !== -1) {
      list[idx] = booking;
    } else {
      list.push(booking);
    }
    this.saveBookings(list);
  }

  // Fraud logs
  static getFraudLogs(): FraudLog[] {
    this.init();
    return JSON.parse(localStorage.getItem('kw_fraud') || '[]');
  }

  static saveFraudLogs(logs: FraudLog[]) {
    localStorage.setItem('kw_fraud', JSON.stringify(logs));
    syncToSupabase('fraud', logs);
  }

  // AI COST ESTIMATOR
  static aiEstimateCost(categoryId: string, size: 'light' | 'medium' | 'heavy'): { materialCost: number; laborHours: number; totalEstimated: number } {
    const categories = this.getCategories();
    const cat = categories.find(c => c.id === categoryId);
    const base = cat ? cat.basePrice : 300;

    let multiplier = 1.0;
    let labor = 1;
    let materials = 0;

    if (size === 'light') {
      multiplier = 1.0;
      labor = 1;
      materials = Math.floor(base * 0.25);
    } else if (size === 'medium') {
      multiplier = 2.4;
      labor = 3;
      materials = Math.floor(base * 0.9);
    } else if (size === 'heavy') {
      multiplier = 4.8;
      labor = 6;
      materials = Math.floor(base * 2.3);
    }

    const total = Math.floor(base * multiplier) + materials;

    return {
      materialCost: materials,
      laborHours: labor,
      totalEstimated: total
    };
  }

  // AI Search diagnostic problem resolver
  static aiDiagnoseProblem(query: string, lang: 'en' | 'hi' | 'gu'): { categoryId: string; subcategory: string; confidence: number } | null {
    const categories = this.getCategories();
    const normalized = query.toLowerCase().trim();

    if (!normalized) return null;

    let bestMatch: ServiceCategory | null = null;
    let maxMatches = 0;

    for (const cat of categories) {
      let matches = 0;
      for (const keyword of cat.problems) {
        if (normalized.includes(keyword.toLowerCase())) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = cat;
      }
    }

    if (bestMatch && maxMatches > 0) {
      let sub = '';
      if (lang === 'hi') {
        sub = `त्वरित ${bestMatch.nameHi}`;
      } else if (lang === 'gu') {
        sub = `ઝડપી ${bestMatch.nameGu}`;
      } else {
        sub = `Quick ${bestMatch.nameEn}`;
      }
      
      return {
        categoryId: bestMatch.id,
        subcategory: sub,
        confidence: Math.min(60 + maxMatches * 15, 99)
      };
    }

    for (const cat of categories) {
      if (
        cat.nameEn.toLowerCase().includes(normalized) ||
        cat.nameHi.toLowerCase().includes(normalized) ||
        cat.nameGu.toLowerCase().includes(normalized)
      ) {
        return {
          categoryId: cat.id,
          subcategory: lang === 'hi' ? cat.nameHi : lang === 'gu' ? cat.nameGu : cat.nameEn,
          confidence: 95
        };
      }
    }

    return null;
  }

  // AI KYC verification scanner
  static aiVerifyKyc(aadhaar: string, pan: string, refName: string): { score: number; flags: string[] } {
    const flags: string[] = [];
    let score = 100;

    if (!/^\d{4}-\d{4}-\d{4}$/.test(aadhaar)) {
      flags.push('Aadhaar format looks suspicious (should be XXXX-XXXX-XXXX).');
      score -= 20;
    }
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      flags.push('PAN format invalid (should be 5 letters, 4 digits, 1 letter).');
      score -= 20;
    }
    if (refName.length < 5) {
      flags.push('Local Reference name seems too short or missing contact info.');
      score -= 10;
    }

    score = Math.max(score - Math.floor(Math.random() * 8), 10);

    return { score, flags };
  }

  // AI Fraud checker
  static aiScanBookingForFraud(booking: Booking): { riskScore: number; reason: string } {
    let score = 5;
    let reason = 'Normal local activity, low fraud likelihood.';

    const chats = booking.chatHistory.map(c => c.text.toLowerCase());
    const bypassTriggers = ['cash directly', 'direct payment', 'no app', 'pay offline', 'contact me', 'number is', 'फोन', 'नंबर', 'રોકડા'];
    
    let hasBypassTrigger = false;
    for (const text of chats) {
      if (bypassTriggers.some(trigger => text.includes(trigger))) {
        hasBypassTrigger = true;
        break;
      }
    }

    if (hasBypassTrigger) {
      score = 78;
      reason = 'Possible platform bypass attempt. User discussing direct off-platform payments or number sharing.';
    }

    if (booking.price > 15000) {
      score = Math.max(score, 65);
      reason = 'High-value transaction warning. Requires verification of actual service checklist completion.';
    }

    return { riskScore: score, reason };
  }

  // AI translation
  static aiTranslateMessage(text: string): { en: string; hi: string; gu: string } {
    const lower = text.toLowerCase().trim();
    
    const dictionary: { [key: string]: { en: string; hi: string; gu: string } } = {
      'please come on time': {
        en: 'Please come on time.',
        hi: 'कृपया समय पर आएं।',
        gu: 'કૃપા કરીને સમયસર આવો.'
      },
      'yes brother, i am carrying the spare pipe, leaving now': {
        en: 'Yes brother, I am carrying the spare pipe, leaving now.',
        hi: 'हाँ भाई, मैं अतिरिक्त पाइप साथ लेकर अभी निकल रहा हूँ।',
        gu: 'હા ભાઈ, હું વધારાનો પાઇપ સાથે લઈને હમણાં જ નીકળું છું.'
      },
      'leaving now': {
        en: 'I am leaving now.',
        hi: 'मैं अभी निकल रहा हूँ।',
        gu: 'હું હમણાં જ નીકળું છું.'
      },
      'reached your location': {
        en: 'I have reached your location.',
        hi: 'मैं आपके स्थान पर पहुँच गया हूँ।',
        gu: 'હું તમારી જગ્યા પર પહોંચી ગયો છું.'
      },
      'starting the job': {
        en: 'I am starting the job now.',
        hi: 'मैं अभी काम शुरू कर रहा हूँ।',
        gu: 'હું હમણાં કામ શરૂ કરું છું.'
      },
      'job completed': {
        en: 'Work is completed. Please check.',
        hi: 'काम पूरा हो गया है। कृपया जांचें।',
        gu: 'કામ પૂરું થઈ ગયું છે. કૃપા કરીને ચેક કરો.'
      },
      'how much extra for materials?': {
        en: 'How much extra do I need to pay for materials?',
        hi: 'सामग्री के लिए मुझे कितना अतिरिक्त भुगतान करना होगा?',
        gu: 'સામાન માટે મારે કેટલા વધારાના ચૂકવવા પડશે?'
      },
      'it will be 200 rs extra for the tap valve': {
        en: 'It will be 200 Rs extra for the tap valve.',
        hi: 'नल के वाल्व के लिए 200 रुपये अतिरिक्त लगेंगे।',
        gu: 'નળના વાલ્વ માટે ૨૦૦ રૂપિયા વધારાના થશે.'
      }
    };

    if (dictionary[lower]) {
      return dictionary[lower];
    }

    return {
      en: text,
      hi: text + ' (अनुवादित हिंदी)',
      gu: text + ' (ગુજરાતી અનુવાદ)'
    };
  }
}
