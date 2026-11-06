import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sprout, Globe, User, ShieldCheck, MapPin } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAuthModal }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const KARNATAKA_DISTRICTS = [
    'Mysuru', 'Mandya', 'Bengaluru Urban', 'Bengaluru Rural', 'Belagavi',
    'Dharwad', 'Hassan', 'Shivamogga', 'Kalaburagi', 'Vijayapura',
    'Ballari', 'Kolar', 'Chikkaballapura', 'Tumakuru', 'Chitradurga',
    'Davanagere', 'Haveri', 'Gadag', 'Bagalkote', 'Raichur', 'Koppal',
    'Udupi', 'Dakshina Kannada', 'Uttara Kannada', 'Kodagu', 'Chikkamagaluru'
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-light)' }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: 'var(--primary-900)', color: '#ffffff', padding: '0.35rem 1rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏛️ Government of Karnataka Agricultural Advisory Service</span>
          <span style={{ opacity: 0.6 }}>|</span>
          <span style={{ color: '#fde047' }}>AGMARKNET Verified Mandi Feeds</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={12} color="#fde047" />
            {user?.district || 'Karnataka State'}
          </span>
          <button
            onClick={toggleLanguage}
            style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: 'none', padding: '0.15rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <Globe size={12} />
            {language === 'en' ? 'ಕನ್ನಡ (KN)' : 'English (EN)'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.25rem' }}>
        {/* Brand */}
        <div
          onClick={() => setCurrentTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-700), var(--primary-900))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-900)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              KRISHIMITRA
              <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>AI 2.0</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {language === 'en' ? 'Karnataka Agricultural Intelligence' : 'ಕರ್ನಾಟಕ ಕೃಷಿ ಬೆಲೆ ಮುನ್ಸೂಚನೆ'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {[
            { id: 'home', label: t('navHome') },
            { id: 'prices', label: t('navPrices') },
            { id: 'forecast', label: t('navForecast') },
            { id: 'recommend', label: t('navRecommend') },
            { id: 'sell_advice', label: t('navSellAdvice') },
            { id: 'alerts', label: t('navAlerts') },
            { id: 'admin', label: t('navAdmin'), icon: ShieldCheck }
          ].map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  color: isActive ? 'var(--primary-700)' : 'var(--text-main)',
                  border: 'none',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.icon && <tab.icon size={15} />}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Auth CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  {user?.full_name.split(' ')[0]}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  📍 {user?.district}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <User size={16} />
              {t('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
