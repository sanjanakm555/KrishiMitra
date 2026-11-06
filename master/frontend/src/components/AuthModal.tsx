import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { loginFarmer, registerFarmer } from '../services/api';
import { X, User, Lock, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const { language } = useLanguage();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form
  const [fullName, setFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [district, setDistrict] = useState('Mysuru');
  const [taluk, setTaluk] = useState('Nanjangud');
  const [primaryCrop, setPrimaryCrop] = useState('Ragi');
  const [soilType, setSoilType] = useState('Red Loamy');
  const [landArea, setLandArea] = useState(3.0);
  const [prefLang, setPrefLang] = useState('kn');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginFarmer(mobile, password);
      login({
        id: data.user_id,
        full_name: data.full_name,
        mobile_number: mobile,
        role: data.role,
        district: data.district,
        preferred_language: data.preferred_language,
        token: data.access_token
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your mobile number and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerFarmer({
        full_name: fullName,
        mobile_number: regMobile,
        password: regPassword,
        district,
        taluk,
        primary_crop: primaryCrop,
        soil_type: soilType,
        land_area_acres: landArea,
        preferred_language: prefLang
      });
      login({
        id: data.user_id,
        full_name: data.full_name,
        mobile_number: regMobile,
        role: data.role,
        district: data.district,
        preferred_language: data.preferred_language,
        token: data.access_token
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Mobile number may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoFarmer = () => {
    setMobile('9845012345');
    setPassword('farmer123');
  };

  const setDemoAdmin = () => {
    setMobile('9876543210');
    setPassword('admin123');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-900)' }}>
            🌾 KrishiMitra Access
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Karnataka Farmer & Administrative Portal
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', background: '#f1f5f9', borderRadius: '8px', padding: '0.25rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: tab === 'login' ? '#ffffff' : 'transparent', color: tab === 'login' ? 'var(--primary-800)' : '#64748b', boxShadow: tab === 'login' ? 'var(--shadow-sm)' : 'none' }}
          >
            Farmer Login
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            style={{ padding: '0.5rem', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: tab === 'register' ? '#ffffff' : 'transparent', color: tab === 'register' ? 'var(--primary-800)' : '#64748b', boxShadow: tab === 'register' ? 'var(--shadow-sm)' : 'none' }}
          >
            Register Land
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  placeholder="e.g. 9845012345"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            {/* Demo Quick Fills for Evaluator */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                QUICK ACCESS DEMO CREDENTIALS:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={setDemoFarmer}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                >
                  🌾 Farmer Demo
                </button>
                <button
                  type="button"
                  onClick={setDemoAdmin}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                >
                  🛡️ Admin Demo
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Chennappa Gowda"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-control"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Mobile</label>
                <input
                  type="tel"
                  placeholder="10 digits"
                  value={regMobile}
                  onChange={e => setRegMobile(e.target.value)}
                  className="input-control"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Password</label>
                <input
                  type="password"
                  placeholder="Secret password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="input-control"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>District</label>
                <select value={district} onChange={e => setDistrict(e.target.value)} className="input-control">
                  <option value="Mysuru">Mysuru</option>
                  <option value="Mandya">Mandya</option>
                  <option value="Belagavi">Belagavi</option>
                  <option value="Hassan">Hassan</option>
                  <option value="Kalaburagi">Kalaburagi</option>
                  <option value="Kolar">Kolar</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Soil Type</label>
                <select value={soilType} onChange={e => setSoilType(e.target.value)} className="input-control">
                  <option value="Red Loamy">Red Loamy</option>
                  <option value="Black Soil">Black Soil</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Primary Crop</label>
                <input
                  type="text"
                  placeholder="e.g. Ragi / Tomato"
                  value={primaryCrop}
                  onChange={e => setPrimaryCrop(e.target.value)}
                  className="input-control"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>Land Area (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={landArea}
                  onChange={e => setLandArea(parseFloat(e.target.value))}
                  className="input-control"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Farmer Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
