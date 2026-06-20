import React, { useState, useEffect } from 'react';
import { KaamWaleDB, SERVICE_CATEGORIES } from '../db';
import type { Vendor, Booking, ChatMessage } from '../db';

interface VendorPortalProps {
  lang: 'en' | 'hi' | 'gu';
  onNotification: (msg: string) => void;
  currentVendor: Vendor | null;
  onLogin: (v: Vendor) => void;
  onLogout: () => void;
}

export const VendorPortal: React.FC<VendorPortalProps> = ({ 
  lang, 
  onNotification, 
  currentVendor, 
  onLogin, 
  onLogout 
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Sign In inputs
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Registration Inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSkill, setRegSkill] = useState('home-repair');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regRefName, setRegRefName] = useState('');
  const [regRefPhone, setRegRefPhone] = useState('');

  // Active flows
  const [vendorBookings, setVendorBookings] = useState<Booking[]>([]);
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Quote bids
  const [openBids, setOpenBids] = useState<Booking[]>([]);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [bidNote, setBidNote] = useState('');

  // Tab views
  const [vendorTab, setVendorTab] = useState<'jobs' | 'bids' | 'earnings'>('jobs');

  // Translations
  const t = {
    en: {
      onboardTitle: "Karigar (Service Partner) Registration",
      fullName: "Full Name",
      phone: "Mobile Number",
      skillSelect: "Select Main Skill",
      aadhaarNo: "Aadhaar Card Number (XXXX-XXXX-XXXX)",
      panNo: "PAN Card Number",
      referenceName: "Local Reference Shop/Person Name",
      referencePhone: "Reference Phone Number",
      submitKyc: "Submit & Start KYC Scan",
      pendingKyc: "Verification Pending Approval",
      pendingKycDesc: "Manual verification pending. AI KYC Analysis complete:",
      score: "AI KYC Confidence Score",
      jobList: "Active Calendar",
      earningsTitle: "Earnings Ledger & Settlements",
      profileTitle: "Partner Profile Details",
      acceptJob: "Accept Job",
      rejectJob: "Decline",
      payout: "Net Payout",
      location: "Customer Location",
      enRouteBtn: "Start Riding (En Route)",
      whatsappGpsBtn: "Simulate WhatsApp Location Sharing",
      startJobBtn: "Start Service",
      completeJobBtn: "Mark Completed",
      beforeProofRequired: "Upload BEFORE Service Photo",
      afterProofRequired: "Upload AFTER Service Photo",
      checklistTitle: "Complete Job Checklist First",
      totalEarnings: "Total Earned",
      completedJobs: "Completed Jobs",
      rating: "Rating",
      whatsappLocationActive: "WhatsApp GPS stream: ACTIVE ✅",
      chatLabel: "Customer Chat (Translating)",
      bidTitle: "Custom Shifting & Pooja leads (Bidding)",
      submitBid: "Submit Price Bid",
      loginTitle: "Karigar (Vendor) Operations Portal",
      phoneLabel: "Enter Registered Mobile Number",
      otpLabel: "Enter 4-digit OTP (Use 1234)",
      sendOtp: "Send OTP",
      verifyOtp: "Sign In",
      createAccount: "Register as new Karigar",
      backToLogin: "Back to Login",
      preloadedTitle: "Fast login (Test Preloaded profiles):",
      kycDetails: "Identity Credentials"
    },
    hi: {
      onboardTitle: "नया कारीगर पंजीकरण",
      fullName: "पूरा नाम",
      phone: "मोबाइल नंबर",
      skillSelect: "मुख्य कौशल",
      aadhaarNo: "आधार कार्ड नंबर (XXXX-XXXX-XXXX)",
      panNo: "पैन कार्ड नंबर",
      referenceName: "स्थानीय संदर्भ नाम (दुकान/ठेकेदार)",
      referencePhone: "संदर्भ फोन नंबर",
      submitKyc: "सबमिट करें और केवाईसी शुरू करें",
      pendingKyc: "सत्यापन लंबित है",
      pendingKycDesc: "स्थानीय साथी पते का सत्यापन करेगा। एआई केवाईसी परिणाम:",
      score: "एआई केवाईसी स्कोर",
      jobList: "सक्रिय कैलेंडर",
      earningsTitle: "कमाई और निपटान बही",
      profileTitle: "पार्टनर प्रोफाइल विवरण",
      acceptJob: "स्वीकार करें",
      rejectJob: "अस्वीकार",
      payout: "कमाई",
      location: "ग्राहक का पता",
      enRouteBtn: "यात्रा शुरू करें (रास्ते में है)",
      whatsappGpsBtn: "व्हाट्सएप लोकेशन शेयरिंग सक्रिय करें",
      startJobBtn: "सेवा शुरू करें",
      completeJobBtn: "कार्य पूरा हुआ",
      beforeProofRequired: "काम शुरू करने से पहले का फोटो अपलोड करें",
      afterProofRequired: "काम खत्म होने के बाद का फोटो अपलोड करें",
      checklistTitle: "पहले कार्य चेकलिस्ट पूरी करें",
      totalEarnings: "कुल कमाई",
      completedJobs: "पूरे किए गए काम",
      rating: "रेटिंग",
      whatsappLocationActive: "व्हाट्सएप जीपीएस सक्रिय है ✅",
      chatLabel: "ग्राहक चैट (अनुवाद सक्रिय)",
      bidTitle: "कस्टम लीड प्राप्त करें (बोली)",
      submitBid: "बोली लगाएं",
      loginTitle: "कारीगर (विक्रेता) संचालन पोर्टल",
      phoneLabel: "पंजीकृत मोबाइल नंबर दर्ज करें",
      otpLabel: "4-अंकीय ओटीपी दर्ज करें (1234 का उपयोग करें)",
      sendOtp: "ओटीपी भेजें",
      verifyOtp: "लॉगिन करें",
      createAccount: "नए कारीगर के रूप में पंजीकरण करें",
      backToLogin: "लॉगिन पर वापस जाएं",
      preloadedTitle: "त्वरित लॉगिन (परीक्षण हेतु):",
      kycDetails: "पहचान प्रमाण पत्र"
    },
    gu: {
      onboardTitle: "નવું કારીગર રજીસ્ટ્રેશન",
      fullName: "પૂરું નામ",
      phone: "મોબાઈલ નંબર",
      skillSelect: "મુખ્ય કૌશલ્ય",
      aadhaarNo: "આધાર કાર્ડ નંબર (XXXX-XXXX-XXXX)",
      panNo: "PAN કાર્ડ નંબર",
      referenceName: "સ્થાનિક સંદર્ભ દુકાનદાર/ઓળખીતા નું નામ",
      referencePhone: "સંદર્ભ નો ફોન નંબર",
      submitKyc: "દસ્તાવેજો મોકલો અને KYC સ્કેન કરો",
      pendingKyc: "ચકાસણી ચાલુ છે",
      pendingKycDesc: "મૅન્યુઅલ ચકાસણી બાકી છે. AI KYC વિગત:",
      score: "AI KYC સ્કોર",
      jobList: "ચાલુ કામોનું કેલેન્ડર",
      earningsTitle: "કમાણી બુક અને સેટલમેન્ટ",
      profileTitle: "પાર્ટનર પ્રોફાઇલ વિગત",
      acceptJob: "કામ સ્વીકારો",
      rejectJob: "ના મંજૂર",
      payout: "કમાણી રકમ",
      location: "ગ્રાહકનું સરનામું",
      enRouteBtn: "નીકળ્યા (રસ્તામાં છે)",
      whatsappGpsBtn: "વોટ્સએપ લોકેશન શેરિંગ ચાલુ કરો",
      startJobBtn: "કામ શરૂ કરો",
      completeJobBtn: "કામ પૂરું જાહેર કરો",
      beforeProofRequired: "કામ શરૂ કર્યા પહેલાનો ફોટો",
      afterProofRequired: "કામ પૂરું થયા પછીનો ફોટો",
      checklistTitle: "પહેલા કામની ચેકલિસ્ટ પૂરી કરો",
      totalEarnings: "કુલ કમાણી",
      completedJobs: "પૂર્ણ કરેલ કામો",
      rating: "રેટિંગ",
      whatsappLocationActive: "વોટ્સએપ જીપીએસ ચાલુ છે ✅",
      chatLabel: "ગ્રાહક સાથે ચેટ (ભાષાંતર ચાલુ)",
      bidTitle: "ગ્રાહકના ભાવપત્રક (બીડિંગ)",
      submitBid: "બીડ સબમિટ કરો",
      loginTitle: "કારીગર (વેન્ડર) ઓપરેશન પોર્ટલ",
      phoneLabel: "મોબાઈલ નંબર એન્ટર કરો",
      otpLabel: "૪ આંકડાનો OTP કોડ (૧૨૩૪ વાપરો)",
      sendOtp: "OTP મોકલો",
      verifyOtp: "લોગિન કરો",
      createAccount: "નવા કારીગર તરીકે જોડાઓ",
      backToLogin: "પાછા લોગિન પર જાઓ",
      preloadedTitle: "ટેસ્ટ લોગિન (પસંદ કરો):",
      kycDetails: "ઓળખપત્ર દસ્તાવેજો"
    }
  };

  const loadVendorData = () => {
    const list = KaamWaleDB.getVendors();
    setVendors(list);

    if (currentVendor) {
      const updated = list.find(v => v.id === currentVendor.id);
      if (updated) {
        // Load bookings assigned to this vendor
        const allBookings = KaamWaleDB.getBookings();
        const myJobs = allBookings.filter(b => b.vendorId === updated.id);
        setVendorBookings(myJobs.reverse());

        // Load open bookings requesting quotes matching skills
        const quoteJobs = allBookings.filter(
          b => b.quoteRequested && updated.skills.includes(b.categoryId)
        );
        setOpenBids(quoteJobs);
      }
    }
  };

  useEffect(() => {
    loadVendorData();
    const interval = setInterval(loadVendorData, 3000);
    return () => clearInterval(interval);
  }, [currentVendor?.id]);

  useEffect(() => {
    if (selectedJob) {
      const updated = vendorBookings.find(b => b.id === selectedJob.id);
      if (updated) setSelectedJob(updated);
    }
  }, [vendorBookings]);

  // Authenticate Vendor functions
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

    const list = KaamWaleDB.getVendors();
    const existing = list.find(v => v.phone.includes(phoneInput.trim()));

    if (existing) {
      onLogin(existing);
      setShowOtpField(false);
      setPhoneInput('');
      setOtpInput('');
    } else {
      setIsRegisterMode(true);
    }
  };

  const handleSelectPreloadedVendor = (v: Vendor) => {
    onLogin(v);
    setShowOtpField(false);
    setPhoneInput('');
    setOtpInput('');
    onNotification(`Fast logged in as Karigar ${v.name}`);
  };

  // Form submit -> Starts AI Scan checks
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regAadhaar || !regPan) {
      onNotification('Please fill in all identity fields.');
      return;
    }

    const aiKyc = KaamWaleDB.aiVerifyKyc(regAadhaar, regPan, regRefName);

    const newVendor: Vendor = {
      id: 'v-' + Math.floor(1000 + Math.random() * 9000),
      name: regName,
      phone: regPhone,
      photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=150',
      kycStatus: 'pending',
      kycDetails: {
        aadhaarNo: regAadhaar,
        panNo: regPan.toUpperCase(),
        referenceName: regRefName || 'Self Employed',
        referencePhone: regRefPhone || regPhone,
        documentPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300',
        selfiePhotoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=150',
        aiVerificationScore: aiKyc.score,
        aiFlags: aiKyc.flags
      },
      trustScore: Math.floor(aiKyc.score * 0.9),
      rating: 0,
      completedJobsCount: 0,
      completionRate: 100,
      responseTime: '15 mins',
      skills: [regSkill],
      experienceYears: 4,
      serviceAreas: ['Satellite', 'Jodhpur'],
      location: { lat: 23.029, lng: 72.505 },
      isOnline: true
    };

    KaamWaleDB.updateVendor(newVendor);
    onLogin(newVendor);
    setIsRegisterMode(false);
    setPhoneInput('');
    setOtpInput('');
    onNotification('Application received. AI documents scan completed. Admin verification pending.');
  };

  // Chat message send
  const handleSendMessage = () => {
    if (!selectedJob || !chatInput.trim()) return;

    const translations = KaamWaleDB.aiTranslateMessage(chatInput);

    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      sender: 'vendor',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      translation: translations
    };

    const updatedJob = {
      ...selectedJob,
      chatHistory: [...selectedJob.chatHistory, newMsg]
    };

    KaamWaleDB.updateBooking(updatedJob);
    
    // AI checks
    const fraudReport = KaamWaleDB.aiScanBookingForFraud(updatedJob);
    if (fraudReport.riskScore > 50) {
      const logs = KaamWaleDB.getFraudLogs();
      logs.push({
        id: 'f-' + Date.now(),
        bookingId: updatedJob.id,
        riskScore: fraudReport.riskScore,
        reason: fraudReport.reason,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'pending'
      });
      KaamWaleDB.saveFraudLogs(logs);
      onNotification('AI Threat Detected: Platform bypass warnings logged.');
    }

    setSelectedJob(updatedJob);
    setChatInput('');
    loadVendorData();
  };

  const toggleLocationSharing = () => {
    if (!selectedJob) return;
    const updated = {
      ...selectedJob,
      gpsStreamActive: !selectedJob.gpsStreamActive,
      lastGpsUpdate: new Date().toLocaleTimeString()
    };
    KaamWaleDB.updateBooking(updated);
    onNotification(
      updated.gpsStreamActive 
      ? 'WhatsApp Location sharing simulated. Customer can track live GPS.'
      : 'WhatsApp Location sharing stopped.'
    );
    setSelectedJob(updated);
    loadVendorData();
  };

  const updateJobStatus = (status: Booking['status']) => {
    if (!selectedJob) return;

    if (status === 'started' && !selectedJob.beforePhoto) {
      selectedJob.beforePhoto = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200';
      onNotification('Before service photo captured.');
    }

    if (status === 'completed') {
      const pendingTasks = Object.values(selectedJob.checklistState).some(done => !done);
      if (pendingTasks) {
        onNotification('Error: Please complete all itemized checklist points first!');
        return;
      }
      if (!selectedJob.afterPhoto) {
        selectedJob.afterPhoto = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=200';
        onNotification('After service completion photo verified.');
      }
    }

    const updated: Booking = {
      ...selectedJob,
      status,
      warrantyStatus: status === 'completed' ? 'active' : selectedJob.warrantyStatus
    };

    if (status === 'completed' && currentVendor) {
      const vend = {
        ...currentVendor,
        completedJobsCount: currentVendor.completedJobsCount + 1,
        trustScore: Math.min(currentVendor.trustScore + 2, 100)
      };
      KaamWaleDB.updateVendor(vend);
      onLogin(vend);
    }

    KaamWaleDB.updateBooking(updated);
    setSelectedJob(updated);
    onNotification(`Job status updated to ${status}`);
    loadVendorData();
  };

  const handleToggleChecklist = (task: string) => {
    if (!selectedJob) return;
    const updatedState = {
      ...selectedJob.checklistState,
      [task]: !selectedJob.checklistState[task]
    };
    const updated = {
      ...selectedJob,
      checklistState: updatedState
    };
    KaamWaleDB.updateBooking(updated);
    setSelectedJob(updated);
    loadVendorData();
  };

  const handleSubmitBid = (jobId: string) => {
    if (bidPrice <= 0) {
      onNotification('Please enter a price bid.');
      return;
    }
    const bookings = KaamWaleDB.getBookings();
    const idx = bookings.findIndex(b => b.id === jobId);
    if (idx !== -1 && currentVendor) {
      const offers = bookings[idx].quoteOffers || [];
      if (!offers.some(o => o.vendorId === currentVendor.id)) {
        offers.push({
          vendorId: currentVendor.id,
          price: bidPrice,
          note: bidNote || 'Can complete this work perfectly.'
        });
        bookings[idx].quoteOffers = offers;
        KaamWaleDB.saveBookings(bookings);
        onNotification('Price bid sent.');
        setBidPrice(0);
        setBidNote('');
        loadVendorData();
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      
      {/* NOT LOGGED IN VENDOR VIEW */}
      {!currentVendor ? (
        <div className="auth-panel animated-item">
          <h2 className="auth-title">🛠️ {t[lang].loginTitle}</h2>
          
          {/* Preloaded accounts */}
          {!isRegisterMode && (
            <div style={{ background: '#fff', padding: 16, borderRadius: 8, margin: '16px 0', border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{t[lang].preloadedTitle}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {vendors.map(v => (
                  <button 
                    key={v.id} 
                    className="btn-ghost" 
                    style={{ fontSize: 12, padding: '6px 12px', textAlign: 'left' }} 
                    onClick={() => handleSelectPreloadedVendor(v)}
                  >
                    👤 {v.name} ({v.kycStatus === 'approved' ? '🟢 Live Partner' : '🟠 Verification Pending'})
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isRegisterMode ? (
            <div className="auth-form">
              <div className="form-group">
                <label>{t[lang].phoneLabel}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 9876543210"
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
                onClick={() => setIsRegisterMode(true)}
              >
                {t[lang].createAccount}
              </span>
            </div>
          ) : (
            /* Register vendor details */
            <div className="animated-item">
              <h3 style={{ marginBottom: 12 }}>{t[lang].onboardTitle}</h3>
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label>{t[lang].fullName}</label>
                  <input type="text" className="form-input" value={regName} onChange={e => setRegName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t[lang].phone}</label>
                  <input type="text" className="form-input" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t[lang].skillSelect}</label>
                  <select className="form-input" value={regSkill} onChange={e => setRegSkill(e.target.value)}>
                    {SERVICE_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t[lang].aadhaarNo}</label>
                  <input type="text" className="form-input" placeholder="1234-5678-9012" value={regAadhaar} onChange={e => setRegAadhaar(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t[lang].panNo}</label>
                  <input type="text" className="form-input" placeholder="ABCDE1234F" value={regPan} onChange={e => setRegPan(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{t[lang].referenceName}</label>
                  <input type="text" className="form-input" value={regRefName} onChange={e => setRegRefName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>{t[lang].referencePhone}</label>
                  <input type="text" className="form-input" value={regRefPhone} onChange={e => setRegRefPhone(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">
                  {t[lang].submitKyc}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setIsRegisterMode(false)}>
                  {t[lang].backToLogin}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* FULL SCREEN VENDOR DASHBOARD */
        <div className="vendor-dashboard-layout animated-item">
          
          {/* Header Stats bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--card-border)', marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>Karigar Account live</span>
              <h2>Welcome, {currentVendor.name}</h2>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <button 
                className="btn-ghost" 
                style={{ background: vendorTab === 'jobs' ? 'var(--primary-light)' : 'transparent', color: vendorTab === 'jobs' ? 'var(--primary)' : 'var(--text-sub)' }}
                onClick={() => { setVendorTab('jobs'); setSelectedJob(null); }}
              >
                📅 {t[lang].jobList}
              </button>
              <button 
                className="btn-ghost"
                style={{ background: vendorTab === 'bids' ? 'var(--primary-light)' : 'transparent', color: vendorTab === 'bids' ? 'var(--primary)' : 'var(--text-sub)' }}
                onClick={() => setVendorTab('bids')}
              >
                💼 Bids Leads ({openBids.length})
              </button>
              <button 
                className="btn-ghost"
                style={{ background: vendorTab === 'earnings' ? 'var(--primary-light)' : 'transparent', color: vendorTab === 'earnings' ? 'var(--primary)' : 'var(--text-sub)' }}
                onClick={() => setVendorTab('earnings')}
              >
                💰 {t[lang].earningsTitle.split(' ')[0]}
              </button>
            </div>
          </div>

          <div className="vendor-grid-wrapper">
            
            {/* LEFT SIDEBAR: PROFILE & KYC STATUS */}
            <div className="vendor-sidebar-card">
              <div style={{ textAlign: 'center' }}>
                <img src={currentVendor.photo} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} alt="profile" />
                <h4 style={{ marginTop: 8 }}>{currentVendor.name}</h4>
                <span className="alert-pill low" style={{ marginTop: 4 }}>Trust Score: {currentVendor.trustScore}%</span>
              </div>

              {/* KYC details */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                <strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>🛡️ {t[lang].kycDetails}</strong>
                <p style={{ fontSize: 11 }}>Status: <strong style={{ color: currentVendor.kycStatus === 'approved' ? 'green' : 'orange' }}>{currentVendor.kycStatus.toUpperCase()}</strong></p>
                <p style={{ fontSize: 11 }}>PAN: {currentVendor.kycDetails?.panNo}</p>
                
                {currentVendor.kycStatus === 'approved' ? (
                  <div style={{ marginTop: 8, padding: 8, background: '#f0fdf4', borderRadius: 4, fontSize: 10, color: '#166534' }}>
                    🟢 Background check approved by KaamWale HQ Compliance Team.
                  </div>
                ) : currentVendor.kycStatus === 'rejected' ? (
                  <div style={{ marginTop: 8, padding: 8, background: '#fef2f2', borderRadius: 4, fontSize: 10, color: '#991b1b' }}>
                    🔴 Documents rejected. Please upload valid Aadhaar/PAN details.
                  </div>
                ) : (
                  <div style={{ marginTop: 8, padding: 8, background: '#fffbeb', borderRadius: 4, fontSize: 10, color: '#b45309' }}>
                    🟡 Document inspection pending. AI KYC scanner verified.
                  </div>
                )}
              </div>

              <button className="btn-ghost" style={{ marginTop: 'auto' }} onClick={onLogout}>Sign Out</button>
            </div>

            {/* RIGHT WORKSPACE PANES */}
            <div className="vendor-content-pane">
              
              {/* TAB 1: JOBS CALENDAR */}
              {vendorTab === 'jobs' && (
                <div className="animated-item">
                  {!selectedJob ? (
                    <div>
                      <h3>📅 Scheduled Bookings</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                        {vendorBookings.map(job => (
                          <div 
                            key={job.id} 
                            className="glass-card" 
                            style={{ padding: 16, cursor: 'pointer', borderLeft: '4px solid var(--primary)' }}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between' }}>
                              <strong>Booking ID: #{job.id}</strong>
                              <span className="alert-pill low">{job.status}</span>
                            </div>
                            <p style={{ fontSize: 13, margin: '6px 0', fontWeight: 600 }}>{job.subcategoryName}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>🏠 {job.customerLocation}</p>
                            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)', marginTop: 8 }}>
                              <span>Time: {job.scheduledTime}</span>
                              <strong>Payout: ₹{job.price}</strong>
                            </div>
                          </div>
                        ))}
                        {vendorBookings.length === 0 && (
                          <p style={{ color: 'var(--text-sub)', fontSize: 13 }}>No jobs scheduled currently.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Detailed service execution workflow */
                    <div className="animated-item">
                      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setSelectedJob(null)}>⬅️ Back to Jobs</button>
                        <strong>Order ID: #{selectedJob.id}</strong>
                      </div>

                      <div className="glass-card" style={{ marginBottom: 16 }}>
                        <h4>{selectedJob.subcategoryName}</h4>
                        <p style={{ fontSize: 13, margin: '6px 0' }}>🏠 Customer Location: {selectedJob.customerLocation}</p>
                        <p style={{ fontSize: 13 }}>💵 Net Payout: <strong>₹{selectedJob.price}</strong></p>
                      </div>

                      {/* Work phases */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
                        {selectedJob.status === 'assigned' && (
                          <button className="btn-primary" onClick={() => updateJobStatus('en-route')}>
                            🛵 {t[lang].enRouteBtn}
                          </button>
                        )}

                        {selectedJob.status === 'en-route' && (
                          <>
                            <button className="btn-secondary" onClick={toggleLocationSharing}>
                              📍 {selectedJob.gpsStreamActive ? 'Stop WhatsApp Share' : t[lang].whatsappGpsBtn}
                            </button>
                            <button className="btn-primary" onClick={() => updateJobStatus('started')}>
                              🏁 {t[lang].startJobBtn}
                            </button>
                          </>
                        )}

                        {selectedJob.status === 'started' && (
                          <div>
                            <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>📋 Job Checklist items:</strong>
                            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 12 }}>
                              {Object.entries(selectedJob.checklistState).map(([task, checked]) => (
                                <label key={task} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '6px 0', cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={checked} 
                                    onChange={() => handleToggleChecklist(task)} 
                                  />
                                  <span>{task}</span>
                                </label>
                              ))}
                            </div>

                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => updateJobStatus('completed')}>
                              ✔️ {t[lang].completeJobBtn}
                            </button>
                          </div>
                        )}

                        {selectedJob.status === 'completed' && (
                          <div style={{ color: '#10b981', textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                            🎉 Work Completed successfully. Payout credited.
                          </div>
                        )}
                      </div>

                      {/* Chat */}
                      <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
                        <strong style={{ fontSize: 13 }}>💬 {t[lang].chatLabel}</strong>
                        <div className="chat-container" style={{ marginTop: 8 }}>
                          <div className="chat-messages">
                            {selectedJob.chatHistory.map(msg => (
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
                              placeholder="Reply..."
                              value={chatInput}
                              onChange={e => setChatInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={handleSendMessage}>Send</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: QUOTE BIDS */}
              {vendorTab === 'bids' && (
                <div className="animated-item">
                  <h3>💼 Received Custom Shifting & Pooja leads (Bidding)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    {openBids.map(bidJob => (
                      <div key={bidJob.id} className="glass-card" style={{ background: '#fffbeb', border: '1px solid #ffe8cc' }}>
                        <strong>Order Request #{bidJob.id}</strong>
                        <p style={{ fontSize: 13, margin: '6px 0', fontWeight: 600 }}>{bidJob.subcategoryName}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>Locality: {bidJob.customerLocation}</p>
                        
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <input 
                            type="number" 
                            placeholder="Price Bid (₹)" 
                            className="form-input"
                            style={{ flex: 1, padding: 8 }}
                            onChange={e => setBidPrice(Number(e.target.value))} 
                          />
                          <button className="btn-primary" style={{ padding: '10px' }} onClick={() => handleSubmitBid(bidJob.id)}>
                            Submit Price Bid
                          </button>
                        </div>
                      </div>
                    ))}
                    {openBids.length === 0 && (
                      <p style={{ color: 'var(--text-sub)', fontSize: 13 }}>No quote bidding requests available matching your skills.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: EARNINGS LEDGER */}
              {vendorTab === 'earnings' && (
                <div className="animated-item">
                  <h3>💰 {t[lang].earningsTitle}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                    <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, textAlign: 'center', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{t[lang].totalEarnings}</span>
                      <h2 style={{ color: '#10b981', fontSize: 32, marginTop: 6 }}>₹{currentVendor.completedJobsCount * 450}</h2>
                    </div>
                    <div style={{ background: '#f8fafc', padding: 20, borderRadius: 8, textAlign: 'center', border: '1px solid var(--card-border)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{t[lang].completedJobs}</span>
                      <h2 style={{ fontSize: 32, marginTop: 6 }}>{currentVendor.completedJobsCount}</h2>
                    </div>
                  </div>

                  <h4>Settlement Logs:</h4>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Batch Date</th>
                        <th>Settled Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>June-20-2026</td>
                        <td><strong>₹{currentVendor.completedJobsCount * 450}</strong></td>
                        <td><span className="alert-pill low">Transferred to UPI</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
