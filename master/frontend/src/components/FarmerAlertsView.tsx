import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { subscribeToAlerts } from '../services/api';
import { Bell, Smartphone, CheckCircle, Shield, Send, MessageSquare } from 'lucide-react';

export const FarmerAlertsView: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '9845012345');
  const [district, setDistrict] = useState(user?.district || 'Mysuru');
  const [selectedCrop, setSelectedCrop] = useState('Ragi');
  const [smsLang, setSmsLang] = useState<'en' | 'kn'>('kn');
  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);

  const CROPS_LIST = [
    'Ragi', 'Tomato', 'Onion', 'Tur (Red Gram)', 'Maize', 'Paddy', 'Arecanut', 'Bengal Gram', 'Coffee', 'Chilli'
  ];

  const handleSubscribeAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await subscribeToAlerts({
        mobile_number: mobileNumber,
        district,
        crop_name: selectedCrop,
        language: smsLang
      });
      setSuccessResponse(res);
    } catch (err) {
      console.error(err);
      alert('SMS dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', color: '#047857', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Bell size={15} />
            DLT Registered Transactional SMS Gateway (KMITRA)
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-900)' }}>
            {t('smsAlertTitle')}
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            {language === 'en'
              ? 'Receive automated SMS notifications whenever crop prices surge, decline, or when an AI Sell/Delay window is identified.'
              : 'ಬೆಲೆ ಏರಿಳಿತ ಮತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯ ಮಾರಾಟದ ಶಿಫಾರಸುಗಳನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಎಸ್.ಎಂ.ಎಸ್ ರೂಪದಲ್ಲಿ ಪಡೆಯಿರಿ.'}
          </p>
        </div>

        {/* SMS Form Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSubscribeAndSend}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  {language === 'en' ? 'Farmer Mobile Number' : 'ರೈತರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b' }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder={t('mobilePlaceholder')}
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    className="input-control"
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  {language === 'en' ? 'District' : 'ಜಿಲ್ಲೆ'}
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="input-control"
                >
                  <option value="Mysuru">Mysuru</option>
                  <option value="Mandya">Mandya</option>
                  <option value="Belagavi">Belagavi</option>
                  <option value="Kalaburagi">Kalaburagi</option>
                  <option value="Dharwad">Dharwad</option>
                  <option value="Kolar">Kolar</option>
                  <option value="Shivamogga">Shivamogga</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  {language === 'en' ? 'Primary Crop' : 'ಮುಖ್ಯ ಬೆಳೆ'}
                </label>
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="input-control"
                >
                  {CROPS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                  {language === 'en' ? 'Preferred SMS Language' : 'ಸಂದೇಶದ ಭಾಷೆ'}
                </label>
                <select
                  value={smsLang}
                  onChange={e => setSmsLang(e.target.value as 'en' | 'kn')}
                  className="input-control"
                >
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', borderRadius: '10px' }}
              disabled={loading}
            >
              <Send size={18} />
              {loading ? 'Dispatched to Gateway...' : t('sendSmsBtn')}
            </button>
          </form>
        </div>

        {/* Live Delivery Receipt Log */}
        {successResponse && (
          <div className="card" style={{ padding: '1.75rem', background: '#f0fdf4', border: '1px solid #86efac' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={22} color="#16a34a" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d' }}>
                SMS Notification Dispatched Successfully!
              </h3>
            </div>

            <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>PHONE: +91 {mobileNumber}</span>
                <span>STATUS: DELIVERED (ACK)</span>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5, fontFamily: smsLang === 'kn' ? "'Noto Sans Kannada', sans-serif" : 'inherit' }}>
                {smsLang === 'kn' ? successResponse.alert.message_kn : successResponse.alert.message_en}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#166534', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Gateway: Transactional Indian SMS Provider (DLT Verified)</span>
              <span>Sender ID: KMITRA</span>
              <span>Timestamp: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
