import React, { useState, useEffect } from 'react';
import { KaamWaleDB } from '../db';
import type { ServiceCategory, Vendor, Booking, ChatMessage, Customer } from '../db';

interface CustomerPortalProps {
  lang: 'en' | 'hi' | 'gu';
  onNotification: (msg: string) => void;
  currentCustomer: Customer | null;
  onLogin: (cust: Customer) => void;
  onLogout: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ 
  lang, 
  onNotification, 
  currentCustomer, 
  onLogin, 
  onLogout 
}) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMatch, setAiMatch] = useState<{ categoryId: string; subcategory: string; confidence: number } | null>(null);
  
  // Auth States
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [newName, setNewName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Booking details
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [matchingVendors, setMatchingVendors] = useState<Vendor[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [customerAddress, setCustomerAddress] = useState('A-404, Shanti Apartments, Vastrapur, Ahmedabad');
  const [scheduledTime, setScheduledTime] = useState('2026-06-20 16:00');
  const [isQuoteRequest, setIsQuoteRequest] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState('');

  // AI Estimator
  const [complexitySize, setComplexitySize] = useState<'light' | 'medium' | 'heavy'>('light');
  const [showAiEstimate, setShowAiEstimate] = useState(false);
  const [estimatedCostObj, setEstimatedCostObj] = useState<{ materialCost: number; laborHours: number; totalEstimated: number } | null>(null);

  // Active bookings list
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showHistoryTab, setShowHistoryTab] = useState(false);

  // Support
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  // Contact form mock state
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // Translations
  const t = {
    en: {
      searchPlaceholder: "Search by problem (e.g. 'pipe leakage', 'AC sound', 'Pandit', 'Sofa deep cleaning')...",
      aiDiagnosing: "AI Diagnostics suggested category:",
      confidence: "Confidence Match",
      categoriesTitle: "Exhaustive Local Services Directory",
      availablePros: "Verified Service Partners (Karigars) In Your Locality",
      experience: "yrs exp",
      trustScore: "Trust Score",
      rating: "Rating",
      distance: "Distance",
      price: "Price",
      quoteBased: "Quote-based",
      requestQuote: "Request Quotes",
      noPros: "No verified professionals found in your locality for this category.",
      bookingDetails: "Confirm Booking & Details",
      confirmBooking: "Confirm & Book",
      myBookings: "Active Tracking & History",
      tracking: "Live GPS Tracking",
      status: "Status",
      assigned: "Assigned",
      enRoute: "En Route",
      started: "Service Started",
      completed: "Service Completed",
      disputed: "Disputed",
      refunded: "Refunded",
      beforeAfter: "Before / After Visual Proofs",
      before: "Before",
      after: "After",
      checklist: "Task Itemized Checklist",
      chatTitle: "Secure Masked Chat",
      chatPlaceholder: "Type message to Karigar...",
      send: "Send",
      disputeButton: "Raise Dispute / Claim Refund",
      warrantyClaim: "Claim 15-day Warranty",
      whatsappLocation: "Syncing live WhatsApp tracking GPS...",
      submitDispute: "Raise Ticket",
      disputeDesc: "Please describe your issue (e.g. technician demanded offline charges):",
      warrantyActive: "15-Day Quality Warranty Active",
      loginTitle: "Verify Mobile Number",
      loginSubtitle: "Access bookings history, tracking details, and warranties",
      phoneLabel: "Enter 10-digit Phone Number",
      otpLabel: "Enter 4-digit OTP (Use 1234)",
      sendOtp: "Send OTP",
      verifyOtp: "Verify & Enter",
      registerNew: "Create Customer Account",
      registerBtn: "Register & Login",
      fullName: "Full Name",
      alreadyUser: "Already have account? Login",
      noAccount: "Don't have an account? Sign Up",
      safetyShare: "🛡️ Share Safety Link",
      safetyAlertSent: "Safety tracking SMS sent to emergency contacts! ✅",
      aiCalcTitle: "⚙️ AI Labor & Cost Estimator",
      aiComplexity: "Project Scope Complexity",
      lightScope: "Light Fix (Minor issue / Quick check)",
      medScope: "Standard Repair (Part replacement)",
      heavyScope: "Full Overhaul (Major replacement / Installation)",
      laborHoursEst: "Predicted Labor Duration:",
      materialsEst: "Estimated Material Costs:",
      totalEst: "Estimated Invoice Total:",
      calcBtn: "Calculate Estimate",
      heroHeadline: "Local Service Karigars for <span>Every Need</span>",
      heroSubtitle: "Connecting Tier 2 & Tier 3 India with verified local technicians, maids, painters, masons, and CAs under absolute trust.",
      featuresHeadline: "Features Built For <span>Your Trust</span>",
      contactHeadline: "Contact Local <span>Operations</span>",
      aboutHeadline: "About <span>KaamWale</span>",
      bookNow: "Book Instant Service"
    },
    hi: {
      searchPlaceholder: "समस्या खोजें (जैसे 'नल रिसाव', 'एसी आवाज', 'पंडित', 'सोफा सफाई')...",
      aiDiagnosing: "एआई डायग्नोसिस द्वारा सुझाया गया:",
      confidence: "मैच स्तर",
      categoriesTitle: "विस्तृत स्थानीय सेवा निर्देशिका",
      availablePros: "आपके इलाके में सत्यापित कारीगर (Karigars)",
      experience: "वर्ष अनुभव",
      trustScore: "ट्रस्ट स्कोर",
      rating: "रेटिंग",
      distance: "दूरी",
      price: "कीमत",
      quoteBased: "कोटेशन-आधारित",
      requestQuote: "कोटेशन का अनुरोध करें",
      noPros: "इस श्रेणी में आपके इलाके में कोई सत्यापित पेशेवर नहीं मिला।",
      bookingDetails: "बुकिंग की पुष्टि और विवरण",
      confirmBooking: "बुकिंग की पुष्टि करें",
      myBookings: "सक्रिय ट्रैकिंग और इतिहास",
      tracking: "लाइव जीपीएस ट्रैकिंग",
      status: "स्थिति",
      assigned: "सौंपा गया",
      enRoute: "रास्ते में है",
      started: "सेवा शुरू हो गई",
      completed: "सेवा पूरी हुई",
      disputed: "विवादित",
      refunded: "रिफंड किया गया",
      beforeAfter: "पहले और बाद के प्रमाण",
      before: "पहले",
      after: "बाद में",
      checklist: "कार्य चेकलिस्ट",
      chatTitle: "सुरक्षित चैट",
      chatPlaceholder: "कारीगर को संदेश भेजें...",
      send: "भेजें",
      disputeButton: "विवाद उठाएं / रिफंड दावा करें",
      warrantyClaim: "15-दिन की वारंटी दावा करें",
      whatsappLocation: "लाइव व्हाट्सएप ट्रैकिंग जीपीएस सिंक हो रहा है...",
      submitDispute: "टिकट उठाएं",
      disputeDesc: "कृपया अपनी समस्या का वर्णन करें (जैसे, छिपे हुए शुल्क):",
      warrantyActive: "15-दिन की गुणवत्ता वारंटी सक्रिय",
      loginTitle: "मोबाइल नंबर सत्यापित करें",
      loginSubtitle: "ऑर्डर ट्रैक करने और इतिहास देखने के लिए लॉग इन करें",
      phoneLabel: "10-अंकीय फोन नंबर दर्ज करें",
      otpLabel: "4-अंकीय ओटीपी दर्ज करें (1234 का उपयोग करें)",
      sendOtp: "ओटीपी भेजें",
      verifyOtp: "सत्यापित करें और दर्ज करें",
      registerNew: "नया ग्राहक खाता बनाएं",
      registerBtn: "पंजीकरण करें और लॉगिन करें",
      fullName: "पूरा नाम",
      alreadyUser: "पहले से खाता है? लॉगिन",
      noAccount: "खाता नहीं है? साइन अप",
      safetyShare: "🛡️ सुरक्षा साझा करें",
      safetyAlertSent: "सुरक्षा ट्रैकिंग लिंक आपातकालीन संपर्कों को भेजा गया! ✅",
      aiCalcTitle: "⚙️ एआई श्रम और लागत अनुमानक",
      aiComplexity: "कार्य की जटिलता",
      lightScope: "हल्की समस्या (मामूली रिसाव / त्वरित जांच)",
      medScope: "मानक मरम्मत (पुर्जे बदलना)",
      heavyScope: "पूर्ण नवीनीकरण (बड़ा प्रतिस्थापन)",
      laborHoursEst: "अनुमानित कार्य समय:",
      materialsEst: "सामग्री लागत:",
      totalEst: "कुल अनुमानित बिल:",
      calcBtn: "अनुमान की गणना करें",
      heroHeadline: "हर काम के लिए स्थानीय <span>कारीगर</span>",
      heroSubtitle: "सत्यापित स्थानीय तकनीशियनों, कामवाली बाई, पेंटर और पंडितों के साथ भारत को जोड़ना।",
      featuresHeadline: "विश्वास के लिए बनी <span>विशेषताएं</span>",
      contactHeadline: "स्थानीय <span>संचालन</span> से संपर्क करें",
      aboutHeadline: "हमारे <span>बारे में</span>",
      bookNow: "तुरंत सेवा बुक करें"
    },
    gu: {
      searchPlaceholder: "સમસ્યા લખો (દા.ત. 'નળ ટપકે છે', 'એસી અવાજ', 'પંડિતજી', 'સોફા વોશ')...",
      aiDiagnosing: "AI નિદાન દ્વારા સૂચવેલ સેવા:",
      confidence: "મેળ ખાતું સ્તર",
      categoriesTitle: "સ્થાનિક સેવાઓ ડિરેક્ટરી",
      availablePros: "તમારા વિસ્તારમાં ચકાસાયેલ કારીગરો (Karigars)",
      experience: "વર્ષનો અનુભવ",
      trustScore: "વિશ્વાસ સ્કોર",
      rating: "રેટિંગ",
      distance: "અંતર",
      price: "કિંમત",
      quoteBased: "અંદાજિત ભાવ",
      requestQuote: "ભાવ પત્રક મંગાવો",
      noPros: "આ કેટેગરીમાં તમારા વિસ્તારમાં કોઈ ચકાસાયેલ પ્રોફેશનલ મળ્યા નથી.",
      bookingDetails: "બુકિંગ વિગતો અને પુષ્ટિ",
      confirmBooking: "બુકિંગ પાકું કરો",
      myBookings: "મારી બુકિંગો અને હિસ્ટ્રી",
      tracking: "લાઇવ ટ્રેકિંગ",
      status: "સ્થિતિ",
      assigned: "સોંપાયેલ",
      enRoute: "રસ્તામાં છે",
      started: "સેવા ચાલુ થઈ",
      completed: "સેવા પૂર્ણ થઈ",
      disputed: "વિવાદિત",
      refunded: "રીફંડ ચૂકવાયું",
      beforeAfter: "પહેલા / પછીના ફોટા",
      before: "પહેલા",
      after: "પછી",
      checklist: "કામની ચેકલિસ્ટ",
      chatTitle: "સુરક્ષિત ચેટ",
      chatPlaceholder: "કારીગર સાથે વાતચીત...",
      send: "મોકલો",
      disputeButton: "ફરિયાદ દાખલ કરો / રીફંડ ક્લેમ",
      warrantyClaim: "વોરંટી ક્લેમ કરો",
      whatsappLocation: "લાઇવ વોટ્સએપ જીપીએસ લોકેશન કનેક્ટ થઈ રહ્યું છે...",
      submitDispute: "ફરિયાદ મોકલો",
      disputeDesc: "સમસ્યા જણાવો (દા.ત. કારીગરે છુપા ચાર્જ લીધા):",
      warrantyActive: "૧૫ દિવસની ગુણવત્તા વોરંટી ચાલુ છે",
      loginTitle: "મોબાઈલ નંબર ચકાસો",
      loginSubtitle: "ઓર્ડર ટ્રેકિંગ અને જૂનો ઇતિહાસ જોવા માટે લોગિન કરો",
      phoneLabel: "૧૦ આંકડાનો ફોન નંબર",
      otpLabel: "૪ આંકડાનો OTP કોડ (૧૨૩૪ વાપરો)",
      sendOtp: "OTP મોકલો",
      verifyOtp: "ચકાસણી કરો",
      registerNew: "નવું ગ્રાહક રજીસ્ટ્રેશન",
      registerBtn: "ખાતું બનાવો અને લોગિન",
      fullName: "પૂરું નામ",
      alreadyUser: "ખાતું છે? લોગિન કરો",
      noAccount: "ખાતું નથી? રજીસ્ટ્રેશન કરો",
      safetyShare: "🛡️ સુરક્ષા શેર કરો",
      safetyAlertSent: "ઇમરજન્સી કોન્ટેક્ટ્સ ને સુરક્ષા લિંક મોકલી અપાઈ છે! ✅",
      aiCalcTitle: "⚙️ AI કામ અને ખર્ચ અંદાજક",
      aiComplexity: "કામની જટિલતા",
      lightScope: "હળવું કામ (નાની લિકેજ / સામાન્ય તપાસ)",
      medScope: "સામાન્ય રીપેરિંગ (પાર્ટ્સ બદલવા)",
      heavyScope: "મોટું કામ (નવું ઇન્સ્ટોલેશન)",
      laborHoursEst: "ધારણા સમય:",
      materialsEst: "સામાનનો ખર્ચ:",
      totalEst: "કુલ અંદાજિત બિલ:",
      calcBtn: "અંદાજ મેળવો",
      heroHeadline: "દરેક કામ માટે સ્થાનિક <span>કારીગરો</span>",
      heroSubtitle: "ચકાસાયેલ સ્થાનિક ટેકનિશિયનો, ઘરકામ બહેનો, પેઇન્ટર્સ અને પંડિતજીઓ સાથે ભારત જોડાણ.",
      featuresHeadline: "વિશ્વાસ માટે બનેલી <span>ખાસિયતો</span>",
      contactHeadline: "લોકલ ઑપરેશન <span>સંપર્ક</span>",
      aboutHeadline: "અમારા <span>વિશે</span>",
      bookNow: "તુરંત સેવા બુક કરો"
    }
  };

  useEffect(() => {
    setCategories(KaamWaleDB.getCategories());
  }, []);

  const loadBookings = () => {
    if (currentCustomer) {
      const all = KaamWaleDB.getBookings();
      const my = all.filter(b => b.customerPhone === currentCustomer.phone);
      setActiveBookings(my.reverse());
    } else {
      setActiveBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
    const interval = setInterval(loadBookings, 3000);
    return () => clearInterval(interval);
  }, [currentCustomer]);

  useEffect(() => {
    if (selectedBooking) {
      const updated = activeBookings.find(b => b.id === selectedBooking.id);
      if (updated) setSelectedBooking(updated);
    }
  }, [activeBookings]);

  // Search autocomplete diagnostic check
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      const diagnostic = KaamWaleDB.aiDiagnoseProblem(val, lang);
      setAiMatch(diagnostic);
    } else {
      setAiMatch(null);
    }
  };

  const handleSelectCategory = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    const vendors = KaamWaleDB.getVendors().filter(
      v => v.skills.includes(cat.id) && v.kycStatus === 'approved'
    );
    setMatchingVendors(vendors);
    setAiMatch(null);
    setSearchQuery('');
    
    // Scroll to listings
    setTimeout(() => {
      document.getElementById('service-search-area')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Estimator Trigger
  const triggerAiEstimation = () => {
    if (!selectedCategory) return;
    const est = KaamWaleDB.aiEstimateCost(selectedCategory.id, complexitySize);
    setEstimatedCostObj(est);
  };

  const initiateBooking = (vendor: Vendor | null, quote = false) => {
    if (!currentCustomer) {
      setShowAuthModal(true);
      return;
    }
    setSelectedVendor(vendor);
    setIsQuoteRequest(quote);
    setShowBookingModal(true);
    setComplexitySize('light');
    setEstimatedCostObj(null);
    setShowAiEstimate(false);
  };

  const handleConfirmBooking = () => {
    if (!selectedCategory || !currentCustomer) return;

    let finalPrice = selectedCategory.basePrice;
    if (showAiEstimate && estimatedCostObj) {
      finalPrice = estimatedCostObj.totalEstimated;
    }

    const newBooking: Booking = {
      id: 'b-' + Math.floor(1000 + Math.random() * 9000),
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      customerLocation: customerAddress,
      categoryId: selectedCategory.id,
      subcategoryName: selectedCategory.nameEn + (showAiEstimate ? ` (${complexitySize.toUpperCase()})` : ''),
      vendorId: selectedVendor ? selectedVendor.id : null,
      status: selectedVendor ? 'assigned' : 'pending',
      price: selectedVendor ? finalPrice : 0,
      isQuote: selectedCategory.isQuoteBased || isQuoteRequest,
      quoteRequested: !selectedVendor && (selectedCategory.isQuoteBased || isQuoteRequest),
      quoteOffers: [],
      scheduledTime,
      checklistState: selectedCategory.jobChecklistEn.reduce((acc, task) => {
        acc[task] = false;
        return acc;
      }, {} as { [key: string]: boolean }),
      chatHistory: [],
      disputeStatus: 'none',
      warrantyStatus: 'none',
      gpsStreamActive: false
    };

    KaamWaleDB.updateBooking(newBooking);
    onNotification(`Booking ${newBooking.id} created successfully!`);
    setShowBookingModal(false);
    setSelectedCategory(null);
    setSelectedBooking(newBooking);
    setShowHistoryTab(true);
    loadBookings();
  };

  // Auth Methods
  const handleSendOtp = () => {
    if (phoneInput.length < 10) {
      onNotification('Please enter a valid 10-digit number.');
      return;
    }
    setShowOtpField(true);
    onNotification('Verification code simulated: 1234');
  };

  const handleVerifyOtp = () => {
    if (otpInput !== '1234') {
      onNotification('Invalid OTP. Use 1234.');
      return;
    }

    const list = KaamWaleDB.getCustomers();
    const existing = list.find(c => c.phone.includes(phoneInput.trim()));

    if (existing) {
      onLogin(existing);
      setShowAuthModal(false);
      setShowOtpField(false);
      setPhoneInput('');
      setOtpInput('');
    } else {
      setIsNewUser(true);
    }
  };

  const handleRegister = () => {
    if (!newName) {
      onNotification('Please enter your full name.');
      return;
    }

    const newCust: Customer = {
      id: 'c-' + Math.floor(1000 + Math.random() * 9000),
      name: newName,
      phone: phoneInput,
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@gmail.com`
    };

    const list = KaamWaleDB.getCustomers();
    list.push(newCust);
    KaamWaleDB.saveCustomers(list);
    
    onLogin(newCust);
    setIsNewUser(false);
    setShowAuthModal(false);
    setShowOtpField(false);
    setNewName('');
    setPhoneInput('');
    setOtpInput('');
  };

  // Send message
  const handleSendMessage = () => {
    if (!selectedBooking || !chatInput.trim()) return;

    const translations = KaamWaleDB.aiTranslateMessage(chatInput);
    
    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'customer',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      translation: translations
    };

    const updatedBooking = {
      ...selectedBooking,
      chatHistory: [...selectedBooking.chatHistory, newMsg]
    };

    KaamWaleDB.updateBooking(updatedBooking);

    const fraudReport = KaamWaleDB.aiScanBookingForFraud(updatedBooking);
    if (fraudReport.riskScore > 50) {
      const logs = KaamWaleDB.getFraudLogs();
      logs.push({
        id: 'f-' + Date.now(),
        bookingId: updatedBooking.id,
        riskScore: fraudReport.riskScore,
        reason: fraudReport.reason,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'pending'
      });
      KaamWaleDB.saveFraudLogs(logs);
      onNotification('AI Warning: suspicious bypass coordinates generated.');
    }

    setSelectedBooking(updatedBooking);
    setChatInput('');
    loadBookings();
  };

  const handleDisputeSubmit = () => {
    if (!selectedBooking) return;
    const updated = {
      ...selectedBooking,
      status: 'disputed' as const,
      disputeStatus: 'pending' as const,
      disputeReason: supportMessage
    };
    KaamWaleDB.updateBooking(updated);
    onNotification('Ticket raised for operations desk.');
    setShowSupportModal(false);
    setSupportMessage('');
    loadBookings();
  };

  const handleWarrantyClaim = () => {
    if (!selectedBooking) return;
    const updated = {
      ...selectedBooking,
      warrantyStatus: 'claimed' as const
    };
    KaamWaleDB.updateBooking(updated);
    onNotification('Warranty claim registered. A support agent has been assigned.');
    loadBookings();
  };

  const handleAcceptQuote = (offer: { vendorId: string; price: number }) => {
    if (!selectedBooking) return;
    const updated: Booking = {
      ...selectedBooking,
      vendorId: offer.vendorId,
      status: 'assigned',
      price: offer.price,
      quoteRequested: false
    };
    KaamWaleDB.updateBooking(updated);
    onNotification('Technician bid accepted.');
    loadBookings();
  };

  const triggerSafetyShare = () => {
    if (!selectedBooking) return;
    const updated = {
      ...selectedBooking,
      safetyAlertSent: true
    };
    KaamWaleDB.updateBooking(updated);
    setSelectedBooking(updated);
    onNotification(t[lang].safetyAlertSent);
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return catId;
    return lang === 'hi' ? cat.nameHi : lang === 'gu' ? cat.nameGu : cat.nameEn;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* Tab selections for Customer Portal */}
      <div style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', padding: '10px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            style={{ padding: '6px 12px', background: !showHistoryTab ? 'var(--primary)' : 'transparent', color: !showHistoryTab ? 'white' : 'var(--text-sub)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            onClick={() => { setShowHistoryTab(false); setSelectedBooking(null); }}
          >
            🏠 KaamWale Home & Search
          </button>
          
          {currentCustomer && (
            <button 
              style={{ padding: '6px 12px', background: showHistoryTab ? 'var(--primary)' : 'transparent', color: showHistoryTab ? 'white' : 'var(--text-sub)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              onClick={() => setShowHistoryTab(true)}
            >
              📋 {t[lang].myBookings} ({activeBookings.length})
            </button>
          )}
        </div>

        <div>
          {currentCustomer ? (
            <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              👤 Signed in: <strong>{currentCustomer.name}</strong>
              <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={onLogout}>Sign Out</button>
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setShowAuthModal(true)}>
              🔒 Customer Sign In
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: LANDING PAGE & SERVICES SEARCH */}
      {!showHistoryTab && (
        <div className="animated-item">
          
          {/* HERO BANNER SECTION */}
          <section className="hero-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <h1 className="hero-title" style={{ fontSize: '2.5rem', lineHeight: '1.2', margin: 0 }} dangerouslySetInnerHTML={{ __html: t[lang].heroHeadline }}></h1>
              <p className="hero-subtitle" style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-sub)' }}>{t[lang].heroSubtitle}</p>
              
              {/* Search inputs */}
              <div className="hero-search-wrapper" id="service-search-area" style={{ margin: '10px 0 0 0', width: '100%', maxWidth: '500px' }}>
                <span style={{ fontSize: 20 }}>🔍</span>
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder={t[lang].searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* AI Diagnostics suggestions */}
              {aiMatch && (
                <div className="glass-card animated-item" style={{ width: '100%', maxWidth: '500px', margin: '10px 0 0 0', padding: 12, borderLeft: '4px solid var(--secondary)', background: 'white', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      💡 <strong>{t[lang].aiDiagnosing}</strong>{' '}
                      <span 
                        className="btn-primary" 
                        style={{ padding: '2px 8px', fontSize: 11, borderRadius: 4, background: 'var(--primary)' }} 
                        onClick={() => handleSelectCategory(categories.find(c => c.id === aiMatch.categoryId)!)}
                      >
                        {getCategoryName(aiMatch.categoryId)}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{t[lang].confidence}: <strong>{aiMatch.confidence}%</strong></span>
                  </div>
                </div>
              )}
            </div>

            <div className="hero-graphic-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img 
                src="/hero_banner.png" 
                alt="KaamWale Home Services Banner" 
                style={{ 
                  width: '100%', 
                  maxWidth: '480px', 
                  height: 'auto', 
                  borderRadius: '24px', 
                  boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)',
                  border: '4px solid white',
                  background: 'white'
                }} 
              />
            </div>
          </section>

          {/* SERVICE DIRECTORY GRID */}
          {!selectedCategory && (
            <section className="services-section">
              <div className="section-title-wrap">
                <h2>{t[lang].categoriesTitle}</h2>
                <p>Verify prices, labor checklists, and read references before booking.</p>
              </div>

              <div className="categories-grid">
                {categories.map(cat => (
                  <div key={cat.id} className="category-card" onClick={() => handleSelectCategory(cat)}>
                    <div className="category-icon-wrapper">{cat.icon}</div>
                    <h3>{lang === 'hi' ? cat.nameHi : lang === 'gu' ? cat.nameGu : cat.nameEn}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>
                      {cat.isQuoteBased ? t[lang].quoteBased : `₹${cat.basePrice} ${cat.priceUnit}`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Category listings and local professionals */}
          {selectedCategory && (
            <section className="services-section animated-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button className="btn-ghost" onClick={() => setSelectedCategory(null)}>⬅️ Back to Categories</button>
                <h2>{lang === 'hi' ? selectedCategory.nameHi : lang === 'gu' ? selectedCategory.nameGu : selectedCategory.nameEn}</h2>
              </div>

              <h3 style={{ marginBottom: 16 }}>{t[lang].availablePros}</h3>

              {selectedCategory.isQuoteBased ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 36, maxWidth: 600, margin: '0 auto' }}>
                  <span style={{ fontSize: 36 }}>📬</span>
                  <h4 style={{ margin: '12px 0' }}>Request custom pricing quotation bids</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 20 }}>Placing a quote request alerts nearby verified partners who will bid their rates based on your job specifications.</p>
                  <button className="btn-primary" onClick={() => initiateBooking(null, true)}>
                    📬 {t[lang].requestQuote}
                  </button>
                </div>
              ) : matchingVendors.length === 0 ? (
                <p style={{ color: 'var(--text-sub)' }}>{t[lang].noPros}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
                  {matchingVendors.map(vendor => (
                    <div key={vendor.id} className="glass-card" style={{ display: 'flex', gap: 20 }}>
                      <img src={vendor.photo} alt={vendor.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: 0 }}>{vendor.name}</h4>
                          <span className="alert-pill low">🛡️ Checked</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{vendor.experienceYears} Years Exp | Area: {vendor.serviceAreas.join(', ')}</p>
                        
                        <div style={{ display: 'flex', gap: 12, margin: '8px 0', fontSize: 12 }}>
                          <span>⭐ {vendor.rating || 'N/A'}</span>
                          <span>Trust Score: <strong>{vendor.trustScore}%</strong></span>
                        </div>


                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                          <strong style={{ color: 'var(--primary)' }}>₹{selectedCategory.basePrice}</strong>
                          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => initiateBooking(vendor)}>
                            {t[lang].bookNow}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MARKETING FEATURES SHOWCASE */}
          <section className="features-section">
            <div className="section-title-wrap">
              <h2 dangerouslySetInnerHTML={{ __html: t[lang].featuresHeadline }}></h2>
              <p>KaamWale resolves trust issues by providing transparent, guaranteed local service solutions.</p>
            </div>

            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="feature-box">
                <span className="feature-icon">🛡️</span>
                <h3>100% Verified Local Experts</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>Strict verification process with Aadhaar, PAN, and independent criminal background check clearances.</p>
              </div>
              <div className="feature-box">
                <span className="feature-icon">🏷️</span>
                <h3>No Hidden Charges / Fixed Pricing</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>Get upfront flat rates before booking, or receive direct competitive bids from nearby technicians.</p>
              </div>
              <div className="feature-box">
                <span className="feature-icon">🔒</span>
                <h3>15-Day Quality Warranty</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>Free rework or full refund guarantee if the serviced issue returns within 15 days of booking completion.</p>
              </div>
              <div className="feature-box">
                <span className="feature-icon">🚨</span>
                <h3>Live Emergency Safety Tracker</h3>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>Includes real-time safety tracking alerts, masked contact calling, and SMS sharing link with emergency contacts.</p>
              </div>
            </div>
          </section>

          {/* APP STORES DOWNLOADS SECTION */}
          <section className="apps-section">
            <h2>Download KaamWale Apps</h2>
            <p style={{ marginTop: 8, opacity: 0.9 }}>Get verified local Karigars and manage calendars on the go.</p>
            <div className="apps-buttons">
              <a href="#play" className="mock-app-btn" onClick={() => onNotification('Customer App Store download simulated.')}>
                <span>🤖</span> Play Store (Customer)
              </a>
              <a href="#play" className="mock-app-btn" onClick={() => onNotification('Partner App Store download simulated.')}>
                <span>🛵</span> Play Store (Karigar)
              </a>
            </div>
          </section>

          {/* ABOUT & CONTACT FORMS */}
          <section className="about-section" id="about-us">
            <div className="section-title-wrap">
              <h2 dangerouslySetInnerHTML={{ __html: t[lang].aboutHeadline }}></h2>
              <p>The trusted all-in-one local service platform for every need.</p>
            </div>
            
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.6 }}>
              KaamWale combines transparent upfront pricing with high-fidelity customer safety protocols. Unlike basic listing portals that share your phone number with ten vendors who call you repeatedly, KaamWale matches you with single verified technicians, secures your chat using masked numbers, and backs every service with a 15-day quality warranty.
            </div>

            <div className="contact-form-card" id="contact-us">
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>{t[lang].contactHeadline}</h3>
              <div className="form-group">
                <label>Your Name:</label>
                <input type="text" className="form-input" value={contactName} onChange={e => setContactName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Message / Operational Request:</label>
                <textarea className="form-input" style={{ height: 80 }} value={contactMsg} onChange={e => setContactMsg(e.target.value)} />
              </div>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => { onNotification('Message sent. Local operations coordinator will call you back.'); setContactMsg(''); setContactName(''); }}>
                Send Message
              </button>
            </div>
          </section>

        </div>
      )}

      {/* VIEW 2: BOOKINGS HISTORY & ACTIVE tracking */}
      {showHistoryTab && currentCustomer && (
        <div className="customer-portal-main animated-item">
          <h2>📋 Active Tracking & Bookings History</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginTop: 20 }}>
            {/* List */}
            <div>
              <h4 style={{ marginBottom: 12 }}>My Bookings List:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeBookings.map(b => (
                  <div 
                    key={b.id} 
                    className="glass-card" 
                    style={{ padding: 12, cursor: 'pointer', borderLeft: selectedBooking?.id === b.id ? '4px solid var(--primary)' : '1px solid var(--card-border)' }}
                    onClick={() => setSelectedBooking(b)}
                  >
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                      <strong>ID: #{b.id}</strong>
                      <span className="alert-pill low">{b.status}</span>
                    </div>
                    <p style={{ fontSize: 12, margin: '4px 0' }}>{b.subcategoryName}</p>
                    <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)' }}>
                      <span>Scheduled: {b.scheduledTime}</span>
                      <strong>₹{b.price}</strong>
                    </div>
                  </div>
                ))}
                {activeBookings.length === 0 && (
                  <p style={{ color: 'var(--text-sub)', fontSize: 13 }}>No bookings recorded yet.</p>
                )}
              </div>
            </div>

            {/* Selected Booking panel */}
            <div>
              {selectedBooking ? (
                <div className="glass-card animated-item" style={{ borderTop: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <h3>Order #{selectedBooking.id}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{selectedBooking.subcategoryName} | Date: {selectedBooking.scheduledTime}</p>
                    </div>
                    <span className="alert-pill medium">{selectedBooking.status}</span>
                  </div>

                  {/* Safety sharing */}
                  <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', background: 'var(--primary-light)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, alignSelf: 'center' }}>🔒 Safety features active for this job.</span>
                    {!selectedBooking.safetyAlertSent ? (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: 'var(--primary)' }} onClick={triggerSafetyShare}>
                        {t[lang].safetyShare}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Sent live tracker to contacts ✅</span>
                    )}
                  </div>

                  {/* Quotes offer list */}
                  {selectedBooking.quoteRequested && selectedBooking.quoteOffers && selectedBooking.quoteOffers.length > 0 && (
                    <div style={{ background: 'var(--secondary-light)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                      <h4 style={{ color: 'var(--primary)', marginBottom: 8 }}>📬 Received Vendor Quotations:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selectedBooking.quoteOffers.map(offer => {
                          const vend = KaamWaleDB.getVendors().find(v => v.id === offer.vendorId);
                          return (
                            <div key={offer.vendorId} style={{ background: 'white', padding: 10, borderRadius: 6, display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <strong>{vend?.name}</strong> (Trust Score: 🛡️ {vend?.trustScore})
                                <p style={{ fontSize: 11, color: '#64748b' }}>"{offer.note}"</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <strong style={{ color: 'var(--primary)' }}>₹{offer.price}</strong>
                                <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleAcceptQuote(offer)}>Accept</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {(selectedBooking.status === 'en-route' || selectedBooking.status === 'started') && (
                    <div style={{ marginBottom: 16 }}>
                      <h4>🗺️ {t[lang].tracking}</h4>
                      {selectedBooking.gpsStreamActive ? (
                        <p style={{ fontSize: 11, color: '#10b981' }}>🛰️ {t[lang].whatsappLocation}</p>
                      ) : (
                        <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>Waiting for technician location share stream...</p>
                      )}
                      
                      <div className="tracking-map-simulator">
                        <div className="map-background-grid"></div>
                        <div className="map-route-line"></div>
                        <div className="map-marker customer">🏠</div>
                        <div 
                          className={`map-marker vendor ${selectedBooking.gpsStreamActive ? 'moving' : ''}`}
                          style={{ left: selectedBooking.gpsStreamActive ? '65%' : '10%' }}
                        >
                          🛵
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Proofs */}
                  {selectedBooking.status === 'completed' && (
                    <div style={{ margin: '16px 0' }}>
                      <h4>📷 {t[lang].beforeAfter}</h4>
                      <div className="proofs-comparison-container">
                        <div className="proof-card">
                          <img src={selectedBooking.beforePhoto || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=150'} alt="before" className="proof-img" />
                          <div className="proof-label" style={{ background: '#fee2e2', color: '#990000' }}>{t[lang].before}</div>
                        </div>
                        <div className="proof-card">
                          <img src={selectedBooking.afterPhoto || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=150'} alt="after" className="proof-img" />
                          <div className="proof-label" style={{ background: '#d1fae5', color: '#006600' }}>{t[lang].after}</div>
                        </div>
                      </div>

                      <div style={{ background: '#d1fae5', border: '1px solid #10b981', padding: 12, borderRadius: 8, marginTop: 12, display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#065f46' }}>🛡️ <strong>{t[lang].warrantyActive}</strong></span>
                        {selectedBooking.warrantyStatus === 'none' && (
                          <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: '#10b981' }} onClick={handleWarrantyClaim}>
                            {t[lang].warrantyClaim}
                          </button>
                        )}
                        {selectedBooking.warrantyStatus === 'claimed' && (
                          <span style={{ fontSize: 11, color: '#b45309' }}>Claim processing...</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Checklist */}
                  <div style={{ margin: '16px 0' }}>
                    <h4>✅ {t[lang].checklist}</h4>
                    <div style={{ padding: 8, background: '#f8fafc', borderRadius: 8 }}>
                      {Object.entries(selectedBooking.checklistState).map(([task, checked]) => (
                        <div key={task} className="checklist-item">
                          <span>{checked ? '🟢' : '⚪'}</span>
                          <span style={{ textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text-sub)' : 'var(--text-main)' }}>
                            {task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat */}
                  {selectedBooking.vendorId && (
                    <div style={{ margin: '16px 0' }}>
                      <h4>💬 {t[lang].chatTitle}</h4>
                      <div className="chat-container">
                        <div className="chat-messages">
                          {selectedBooking.chatHistory.map(msg => (
                            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                              <div>{msg.text}</div>
                              {msg.translation && (
                                <div className="chat-translation">
                                  🌐 {lang === 'hi' ? msg.translation.hi : lang === 'gu' ? msg.translation.gu : msg.translation.en}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="chat-input-area">
                          <input
                            type="text"
                            className="chat-input"
                            placeholder={t[lang].chatPlaceholder}
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                          />
                          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleSendMessage}>
                            {t[lang].send}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                    {selectedBooking.disputeStatus === 'none' && selectedBooking.status !== 'refunded' && (
                      <button className="btn-danger" style={{ fontSize: 12 }} onClick={() => setShowSupportModal(true)}>
                        ⚠️ {t[lang].disputeButton}
                      </button>
                    )}

                    {selectedBooking.disputeStatus === 'pending' && (
                      <span className="alert-pill medium">Dispute under investigation</span>
                    )}

                    {selectedBooking.status === 'refunded' && (
                      <span className="alert-pill high">Refunded ₹{selectedBooking.price} to UPI Wallet</span>
                    )}

                    <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setSelectedBooking(null)}>
                      Close Panel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-sub)' }}>Select a booking card from the history menu to track or review.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Login Modal */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="auth-panel animated-item" style={{ margin: 0 }}>
            <h2 className="auth-title">👷 Customer login</h2>
            <p className="auth-subtitle">{t[lang].loginSubtitle}</p>

            {!isNewUser ? (
              <div className="auth-form">
                <div className="form-group">
                  <label>{t[lang].phoneLabel}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 9898098980"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                  />
                </div>
                
                {showOtpField && (
                  <div className="form-group animated-item">
                    <label>{t[lang].otpLabel}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                    />
                  </div>
                )}

                {showOtpField ? (
                  <button className="btn-primary" onClick={handleVerifyOtp}>
                    {t[lang].verifyOtp}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleSendOtp}>
                    {t[lang].sendOtp}
                  </button>
                )}

                <span 
                  style={{ textAlign: 'center', fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, marginTop: 12 }}
                  onClick={() => { setIsNewUser(true); setShowOtpField(false); }}
                >
                  {t[lang].noAccount}
                </span>
                
                <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setShowAuthModal(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="auth-form">
                <h4 style={{ textAlign: 'center', color: 'var(--text-sub)' }}>{t[lang].registerNew}</h4>
                <div className="form-group">
                  <label>{t[lang].fullName}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Karan Shah"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{t[lang].phoneLabel}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                  />
                </div>
                <button className="btn-primary" onClick={handleRegister}>
                  {t[lang].registerBtn}
                </button>
                
                <span 
                  style={{ textAlign: 'center', fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, marginTop: 12 }}
                  onClick={() => setIsNewUser(false)}
                >
                  {t[lang].alreadyUser}
                </span>
                
                <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setShowAuthModal(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Form dialog */}
      {showBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card animated-item" style={{ background: 'white', width: 440, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>✍️ {t[lang].bookingDetails}</h3>
            
            <div style={{ margin: '12px 0' }}>
              <label style={{ fontSize: 11, fontWeight: 600 }}>Service Location Address:</label>
              <textarea style={{ width: '100%', padding: 8, margin: '4px 0', border: '1px solid #ccc', borderRadius: 4, fontSize: 12 }} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />
            </div>

            <div style={{ margin: '12px 0' }}>
              <label style={{ fontSize: 11, fontWeight: 600 }}>Scheduled Date/Time:</label>
              <input type="text" style={{ width: '100%', padding: 8, margin: '4px 0', border: '1px solid #ccc', borderRadius: 4, fontSize: 12 }} value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
            </div>

            {/* AI Cost Estimator Form */}
            {selectedCategory && !isQuoteRequest && (
              <div className="ai-estimator-box">
                <h4>{t[lang].aiCalcTitle}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
                  <input
                    type="checkbox"
                    id="trigger-ai-calc"
                    checked={showAiEstimate}
                    onChange={e => {
                      setShowAiEstimate(e.target.checked);
                      if (e.target.checked) triggerAiEstimation();
                    }}
                  />
                  <label htmlFor="trigger-ai-calc" style={{ fontSize: 12, cursor: 'pointer' }}>Calculate custom estimate instead of standard base price</label>
                </div>

                {showAiEstimate && (
                  <div className="animated-item" style={{ marginTop: 10, borderTop: '1px dashed #ffe8cc', paddingTop: 10 }}>
                    <label style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>{t[lang].aiComplexity}:</label>
                    <select
                      style={{ width: '100%', padding: 6, fontSize: 12, border: '1px solid #ffd8a8', borderRadius: 4, outline: 'none' }}
                      value={complexitySize}
                      onChange={e => {
                        setComplexitySize(e.target.value as any);
                        const est = KaamWaleDB.aiEstimateCost(selectedCategory.id, e.target.value as any);
                        setEstimatedCostObj(est);
                      }}
                    >
                      <option value="light">{t[lang].lightScope}</option>
                      <option value="medium">{t[lang].medScope}</option>
                      <option value="heavy">{t[lang].heavyScope}</option>
                    </select>

                    {estimatedCostObj && (
                      <div className="animated-item" style={{ marginTop: 10, fontSize: 12, background: 'white', padding: 8, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <span>{t[lang].laborHoursEst}</span>
                          <strong>{estimatedCostObj.laborHours} hours</strong>
                        </div>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <span>{t[lang].materialsEst}</span>
                          <strong>₹{estimatedCostObj.materialCost}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 4, fontWeight: 700, color: 'var(--primary)' }}>
                          <span>{t[lang].totalEst}</span>
                          <span>₹{estimatedCostObj.totalEstimated}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isQuoteRequest && (
              <div style={{ margin: '12px 0' }}>
                <label style={{ fontSize: 11, fontWeight: 600 }}>Explain your needs for bidding:</label>
                <textarea style={{ width: '100%', padding: 8, margin: '4px 0', border: '1px solid #ccc', borderRadius: 4, fontSize: 12 }} placeholder="e.g. Packers Shifting 2 BHK flat household goods to Bapunagar next Sunday." value={quoteDetails} onChange={e => setQuoteDetails(e.target.value)} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmBooking}>
                {t[lang].confirmBooking}
              </button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowBookingModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Dispute Modal */}
      {showSupportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="glass-card animated-item" style={{ background: 'white', width: 400, padding: 24 }}>
            <h3>⚠️ Raise Dispute Resolution Ticket</h3>
            <p style={{ fontSize: 12, color: 'var(--text-sub)', margin: '8px 0' }}>
              {t[lang].disputeDesc}
            </p>
            
            <textarea
              style={{ width: '100%', height: 80, padding: 8, border: '1px solid #ccc', borderRadius: 4, margin: '12px 0', fontSize: 12 }}
              value={supportMessage}
              onChange={e => setSupportMessage(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-danger" style={{ flex: 1 }} onClick={handleDisputeSubmit}>
                {t[lang].submitDispute}
              </button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowSupportModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
