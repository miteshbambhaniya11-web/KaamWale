import React, { useState, useEffect } from 'react';
import { KaamWaleDB } from '../db';
import type { Vendor, Booking, FraudLog, ServiceCategory } from '../db';

interface AdminPortalProps {
  onNotification: (msg: string) => void;
  onExit: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNotification, onExit }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fraudLogs, setFraudLogs] = useState<FraudLog[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  
  // Navigation tabs for Global Admin
  const [currentTab, setCurrentTab] = useState<'stats' | 'kyc' | 'fraud' | 'disputes' | 'cms'>('stats');

  // CMS Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatPrice, setNewCatPrice] = useState<number>(299);
  const [newCatIcon, setNewCatIcon] = useState('🛠️');

  const loadAdminData = () => {
    setVendors(KaamWaleDB.getVendors());
    setBookings(KaamWaleDB.getBookings());
    setFraudLogs(KaamWaleDB.getFraudLogs());
    setCategories(KaamWaleDB.getCategories());
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Global actions
  const handleApproveVendorGlobal = (vendorId: string) => {
    const list = KaamWaleDB.getVendors();
    const idx = list.findIndex(v => v.id === vendorId);
    if (idx !== -1) {
      list[idx].kycStatus = 'approved';
      list[idx].trustScore = Math.min(list[idx].trustScore + 10, 100);
      KaamWaleDB.saveVendors(list);
      onNotification(`Vendor ${list[idx].name} approved via HQ override!`);
      loadAdminData();
    }
  };

  const handleRejectVendor = (vendorId: string) => {
    const list = KaamWaleDB.getVendors();
    const idx = list.findIndex(v => v.id === vendorId);
    if (idx !== -1) {
      list[idx].kycStatus = 'rejected';
      KaamWaleDB.saveVendors(list);
      onNotification(`Vendor ${list[idx].name} application rejected.`);
      loadAdminData();
    }
  };

  const handleIssueRefund = (bookingId: string) => {
    const list = KaamWaleDB.getBookings();
    const idx = list.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      list[idx].status = 'refunded';
      list[idx].disputeStatus = 'resolved';
      list[idx].refundAmount = list[idx].price;
      KaamWaleDB.saveBookings(list);
      onNotification(`UPI Refund of ₹${list[idx].price} processed successfully to customer!`);
      loadAdminData();
    }
  };

  const handleCloseDispute = (bookingId: string) => {
    const list = KaamWaleDB.getBookings();
    const idx = list.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      list[idx].disputeStatus = 'resolved';
      KaamWaleDB.saveBookings(list);
      onNotification(`Dispute ticket closed.`);
      loadAdminData();
    }
  };

  const handleResolveFraud = (logId: string) => {
    const logs = KaamWaleDB.getFraudLogs();
    const idx = logs.findIndex(l => l.id === logId);
    if (idx !== -1) {
      logs[idx].status = 'resolved';
      KaamWaleDB.saveFraudLogs(logs);
      onNotification('Fraud warning resolved.');
      loadAdminData();
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const newId = newCatName.toLowerCase().replace(/\s+/g, '-');
    const newCat: ServiceCategory = {
      id: newId,
      nameEn: newCatName,
      nameHi: `कस्टम ${newCatName}`,
      nameGu: `કસ્ટમ ${newCatName}`,
      icon: newCatIcon,
      descriptionEn: `On-demand ${newCatName} service`,
      descriptionHi: `मांग पर ${newCatName} सेवा`,
      descriptionGu: `ઓન-ડિમાન્ડ ${newCatName} સેવા`,
      basePrice: newCatPrice,
      priceUnit: 'service',
      problems: [newCatName.toLowerCase()],
      isQuoteBased: false,
      jobChecklistEn: ['Verify requirement details', 'Execute work steps', 'Clean area and inspect result'],
      jobChecklistHi: ['आवश्यकता विवरणों की पुष्टि करें', 'कार्य चरणों को पूरा करें', 'सफाई करें और परिणामों का निरीक्षण करें'],
      jobChecklistGu: ['કામની વિગતો ચકાસો', 'પગલાંઓ પૂર્ણ કરો', 'જગ્યા સાફ કરો અને કામ તપાસો']
    };

    const updated = [...categories, newCat];
    KaamWaleDB.saveCategories(updated);
    onNotification(`Category "${newCatName}" added to directory.`);
    setNewCatName('');
    setNewCatPrice(299);
    loadAdminData();
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter(c => c.id !== catId);
    KaamWaleDB.saveCategories(updated);
    onNotification(`Category ${catId} deleted.`);
    loadAdminData();
  };
  const totalCompleted = bookings.filter(b => b.status === 'completed').length;
  const pendingKycCount = vendors.filter(v => v.kycStatus === 'pending').length;
  const activeDisputes = bookings.filter(b => b.disputeStatus === 'pending').length;

  return (
    <div className="admin-layout">
      <>
          <div className="admin-sidebar">
            <div>
              <h2 style={{ color: 'white', marginBottom: 4 }}>🛡️ HQ Admin</h2>
              <span style={{ fontSize: 11, opacity: 0.6 }}>KaamWale HQ Suite</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <div className={`admin-nav-item ${currentTab === 'stats' ? 'active' : ''}`} onClick={() => setCurrentTab('stats')}>
                📊 Operational Analytics
              </div>
              <div className={`admin-nav-item ${currentTab === 'kyc' ? 'active' : ''}`} onClick={() => setCurrentTab('kyc')}>
                👤 Document KYC Approvals ({pendingKycCount})
              </div>
              <div className={`admin-nav-item ${currentTab === 'fraud' ? 'active' : ''}`} onClick={() => setCurrentTab('fraud')}>
                🚨 AI Fraud Warnings ({fraudLogs.filter(f => f.status === 'pending').length})
              </div>
              <div className={`admin-nav-item ${currentTab === 'disputes' ? 'active' : ''}`} onClick={() => setCurrentTab('disputes')}>
                ⚠️ Complaint Resolution ({activeDisputes})
              </div>
              <div className={`admin-nav-item ${currentTab === 'cms' ? 'active' : ''}`} onClick={() => setCurrentTab('cms')}>
                ⚙️ Category CMS Manager
              </div>
            </div>
            
            <button className="btn-danger" style={{ marginTop: 'auto' }} onClick={onExit}>
              🚪 Logout Admin
            </button>
          </div>

          <div className="admin-content">
            {/* stats */}
            {currentTab === 'stats' && (
              <div className="animated-item">
                <h2>📊 Platform Performance Dashboard</h2>
                <div className="stats-row" style={{ marginTop: 20 }}>
                  <div className="stat-box">
                    <div className="stat-value">{bookings.length}</div>
                    <div className="stat-label">Total Ordered Bookings</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{vendors.length}</div>
                    <div className="stat-label">Verified Karigars Registry</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{totalCompleted}</div>
                    <div className="stat-label">Jobs Completed</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{activeDisputes}</div>
                    <div className="stat-label">Pending Complaint Tickets</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                  <div className="glass-card">
                    <h3>📍 Hyperlocal Area Heatmap (Ahmedabad)</h3>
                    <div style={{ background: '#e2e8f0', height: 260, borderRadius: 12, position: 'relative', marginTop: 16, overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: '20%', left: '35%', width: 70, height: 70, background: 'rgba(239, 68, 68, 0.5)', borderRadius: '50%', filter: 'blur(10px)' }}></div>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 90, height: 90, background: 'rgba(239, 68, 68, 0.7)', borderRadius: '50%', filter: 'blur(12px)' }}></div>
                      
                      <div style={{ position: 'absolute', top: '18%', left: '37%', fontSize: 11, background: 'white', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>Vastrapur (High Orders)</div>
                      <div style={{ position: 'absolute', top: '48%', left: '52%', fontSize: 11, background: 'white', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>Satellite (Critical)</div>
                      <div style={{ position: 'absolute', top: '35%', left: '15%', fontSize: 11, background: 'white', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>Bodakdev (Normal)</div>
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3>⏱️ Service SLA Status</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                      <div>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                          <span>KYC Verification SLA</span>
                          <strong>98.2% (Target: &gt;95%)</strong>
                        </div>
                        <div style={{ background: '#e2e8f0', height: 6, borderRadius: 3, marginTop: 6 }}>
                          <div style={{ background: 'var(--accent)', width: '98%', height: '100%', borderRadius: 3 }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                          <span>Technician On-Time Rate</span>
                          <strong>94.6%</strong>
                        </div>
                        <div style={{ background: '#e2e8f0', height: 6, borderRadius: 3, marginTop: 6 }}>
                          <div style={{ background: 'var(--primary)', width: '94%', height: '100%', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Approvals */}
            {currentTab === 'kyc' && (
              <div className="animated-item">
                <h2>👤 Identity Document KYC Approvals</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Karigar Details</th>
                      <th>Registered Skill</th>
                      <th>AI Scan Confidence Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map(v => (
                      <tr key={v.id}>
                        <td><img src={v.photo} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} alt="v" /></td>
                        <td>
                          <strong>{v.name}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Phone: {v.phone}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-sub)' }}>Aadhaar: {v.kycDetails?.aadhaarNo} | PAN: {v.kycDetails?.panNo}</div>
                        </td>
                        <td><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{v.skills.join(', ')}</span></td>
                        <td>
                          <span className={`alert-pill ${v.kycDetails && v.kycDetails.aiVerificationScore > 85 ? 'low' : 'medium'}`}>
                            AI Verify: {v.kycDetails?.aiVerificationScore}%
                          </span>
                          {v.kycDetails?.aiFlags && v.kycDetails.aiFlags.length > 0 && (
                            <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 4 }}>Flags: {v.kycDetails.aiFlags.join(', ')}</div>
                          )}
                        </td>
                        <td>
                          {v.kycStatus === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleApproveVendorGlobal(v.id)}>Approve</button>
                              <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleRejectVendor(v.id)}>Reject</button>
                            </div>
                          ) : (
                            <strong style={{ color: v.kycStatus === 'approved' ? 'green' : 'red' }}>{v.kycStatus.toUpperCase()}</strong>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Fraud logs */}
            {currentTab === 'fraud' && (
              <div className="animated-item">
                <h2>🚨 AI Fraud & platform Bypass Logs</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Order ID</th>
                      <th>Risk Rating</th>
                      <th>Warning Flags Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudLogs.map(log => (
                      <tr key={log.id}>
                        <td><code>{log.id}</code></td>
                        <td><strong>#{log.bookingId}</strong></td>
                        <td><span className="alert-pill high">{log.riskScore}% Risk</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{log.reason}</span></td>
                        <td>
                          {log.status === 'pending' ? (
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleResolveFraud(log.id)}>Close Warning</button>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Disputes */}
            {currentTab === 'disputes' && (
              <div className="animated-item">
                <h2>⚠️ Dispute & Refund Resolution Tickets</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order Reference</th>
                      <th>Customer Dispute description</th>
                      <th>Amount</th>
                      <th>Operational Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.filter(b => b.disputeStatus === 'pending').map(b => (
                      <tr key={b.id}>
                        <td><strong>#{b.id}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-sub)' }}>{b.subcategoryName}</span></td>
                        <td><span style={{ color: 'var(--danger)' }}>"{b.disputeReason}"</span></td>
                        <td><strong>₹{b.price}</strong></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleIssueRefund(b.id)}>💸 Process UPI Refund</button>
                            <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => handleCloseDispute(b.id)}>Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.filter(b => b.disputeStatus === 'pending').length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-sub)' }}>All tickets resolved.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* CMS Category Manager */}
            {currentTab === 'cms' && (
              <div className="animated-item">
                <h2>⚙️ Category CMS Directory Engine</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginTop: 16 }}>
                  <div className="glass-card">
                    <h3>➕ Add New Category</h3>
                    <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                      <div className="form-group">
                        <label>Category Title:</label>
                        <input type="text" className="form-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Base visit fee (₹):</label>
                        <input type="number" className="form-input" value={newCatPrice} onChange={e => setNewCatPrice(Number(e.target.value))} required />
                      </div>
                      <div className="form-group">
                        <label>Select Icon Emoji:</label>
                        <select className="form-input" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}>
                          <option value="🔧">🔧 Tool Fix</option>
                          <option value="🧹">🧹 Cleaning</option>
                          <option value="🧱">🧱 Masonry Kadia</option>
                          <option value="🪵">🪵 Carpentry</option>
                        </select>
                      </div>
                      <button type="submit" className="btn-primary">Add Category</button>
                    </form>
                  </div>

                  <div className="glass-card">
                    <h3>Active Marketplace Categories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, maxHeight: 350, overflowY: 'auto' }}>
                      {categories.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: 8, background: '#f8fafc', borderRadius: 6, border: '1px solid var(--card-border)' }}>
                          <span style={{ fontSize: 13 }}>{c.icon} <strong>{c.nameEn}</strong> (Base: ₹{c.basePrice})</span>
                          <button className="btn-danger" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => handleDeleteCategory(c.id)}>Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
    </div>
  );
};
