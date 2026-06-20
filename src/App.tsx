import { useState, useEffect } from 'react';
import { CustomerPortal } from './components/CustomerPortal';
import { VendorPortal } from './components/VendorPortal';
import { AdminPortal } from './components/AdminPortal';
import { KaamWaleDB } from './db';
import type { Customer, Vendor } from './db';

type AppRole = 'customer' | 'vendor' | 'admin';
type AppLang = 'en' | 'hi' | 'gu';

function App() {
  const [role, setRole] = useState<AppRole>('customer');
  const [lang, setLang] = useState<AppLang>('en');
  
  // Auth state
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  
  // Staff operations state
  const [showStaffLockModal, setShowStaffLockModal] = useState(false);
  const [staffPasscode, setStaffPasscode] = useState('');
  const [staffError, setStaffError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    KaamWaleDB.init();
    setCurrentCustomer(KaamWaleDB.getCurrentCustomer());
    setCurrentVendor(KaamWaleDB.getCurrentVendor());
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleStaffLogin = () => {
    const passcode = staffPasscode.trim().toLowerCase();
    if (passcode === 'admin' || passcode === 'admin123') {
      setRole('admin');
      setShowStaffLockModal(false);
      setStaffPasscode('');
      setStaffError('');
      triggerToast('Administrator operations dashboard unlocked.');
    } else {
      setStaffError('Invalid access passcode (Use "admin").');
    }
  };

  const handleCustomerLogin = (cust: Customer) => {
    KaamWaleDB.setCurrentCustomer(cust);
    setCurrentCustomer(cust);
    triggerToast(`Welcome back, ${cust.name}!`);
  };

  const handleCustomerLogout = () => {
    KaamWaleDB.setCurrentCustomer(null);
    setCurrentCustomer(null);
    triggerToast('Signed out successfully.');
  };

  const handleVendorLogin = (vend: Vendor) => {
    KaamWaleDB.setCurrentVendor(vend);
    setCurrentVendor(vend);
    triggerToast(`Welcome back Karigar, ${vend.name}!`);
  };

  const handleVendorLogout = () => {
    KaamWaleDB.setCurrentVendor(null);
    setCurrentVendor(null);
    triggerToast('Logged out of Karigar panel.');
  };

  return (
    <div className="app-container">
      {/* Top Utility Bar */}
      <div className="top-utility-bar">
        <div className="utility-left">
          <span>📍 Hyperlocal Home Services | India 🇮🇳</span>
        </div>
        <div className="utility-right">
          <span className="utility-link" onClick={() => setRole('vendor')}>
            🧑 Become a Karigar Partner
          </span>
          <span className="utility-divider">|</span>
          <span className="utility-link" onClick={() => setShowStaffLockModal(true)}>
            🔒 Staff Operations Portal
          </span>
        </div>
      </div>

      {/* Landing Page Header */}
      <header className="landing-header">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setRole('customer')}>
          <img src="/logo.png" alt="KaamWale Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--card-border)' }} />
          <div className="brand-logo-txt">
            Kaam<span>Wale</span>
          </div>
        </div>

        <nav className="nav-links">
          <span className={`nav-item-link ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
            🏠 Home & Services
          </span>
          <a href="#service-search-area" className="nav-item-link" style={{ textDecoration: 'none' }}>
            ✨ Features & Trust
          </a>
          <a href="#about-us" className="nav-item-link" style={{ textDecoration: 'none' }}>
            📖 About
          </a>
          <a href="#contact-us" className="nav-item-link" style={{ textDecoration: 'none' }}>
            📞 Contact
          </a>
          
          {role === 'admin' && (
            <span 
              className="nav-item-link active" 
              style={{ color: 'var(--secondary)', fontWeight: 700 }}
              onClick={() => { setRole('customer'); triggerToast('Staff session closed.'); }}
            >
              🔒 Exit Staff Desk
            </span>
          )}
          {role === 'vendor' && (
            <span 
              className="nav-item-link active" 
              style={{ color: 'var(--secondary)', fontWeight: 700 }}
              onClick={() => { setRole('customer'); triggerToast('Partner session closed.'); }}
            >
              🛵 Exit Karigar Desk
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12 }}>
            <select 
              className="lang-select"
              style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}
              value={lang}
              onChange={(e) => setLang(e.target.value as AppLang)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>
        </nav>
      </header>

      {/* Main Workspace */}
      <main className="main-workspace">
        {role === 'customer' && (
          <CustomerPortal 
            lang={lang} 
            onNotification={triggerToast} 
            currentCustomer={currentCustomer}
            onLogin={handleCustomerLogin}
            onLogout={handleCustomerLogout}
          />
        )}
        
        {role === 'vendor' && (
          <VendorPortal 
            lang={lang} 
            onNotification={triggerToast} 
            currentVendor={currentVendor}
            onLogin={handleVendorLogin}
            onLogout={handleVendorLogout}
          />
        )}
        
        {role === 'admin' && (
          <AdminPortal 
            onNotification={triggerToast} 
            onExit={() => { setRole('customer'); triggerToast('Staff session closed.'); }} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div>
          © 2026 KaamWale Local Services Network India. All Rights Reserved.
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {role === 'admin' && (
            <button 
              className="btn-danger" 
              style={{ padding: '4px 8px', fontSize: 10 }}
              onClick={() => { setRole('customer'); triggerToast('Staff session closed.'); }}
            >
              Exit Staff Workspace
            </button>
          )}
          <span className="staff-link" onClick={() => setShowStaffLockModal(true)}>
            🔒 Staff Login
          </span>
        </div>
      </footer>

      {/* Staff Lock Modal */}
      {showStaffLockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="glass-card animated-item" style={{ background: 'white', width: 360, padding: 24 }}>
            <h3>🛡️ Administrative Security Screen</h3>
            <p style={{ fontSize: 12, color: 'var(--text-sub)', margin: '8px 0' }}>
              Enter operational passcode: (Use <strong>"admin"</strong> for Global Admin)
            </p>
            
            <input 
              type="password" 
              className="form-input" 
              placeholder="Passcode..." 
              style={{ width: '100%', margin: '12px 0' }}
              value={staffPasscode}
              onChange={(e) => setStaffPasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStaffLogin()}
            />

            {staffError && (
              <p style={{ color: 'var(--danger)', fontSize: 11, marginBottom: 12 }}>{staffError}</p>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={handleStaffLogin}>
                Verify Code
              </button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setShowStaffLockModal(false); setStaffError(''); setStaffPasscode(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div 
          className="animated-item"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#0f172a',
            color: 'white',
            padding: '14px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 10000,
            borderLeft: '4px solid var(--secondary)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          <span>🔔</span> {toastMessage}
          <button 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              fontWeight: 700, 
              marginLeft: 10,
              opacity: 0.7
            }}
            onClick={() => setToastMessage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
