import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Sparkles, Sprout, Bell, Shield, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { language } = useLanguage();

  const TICKER_ITEMS = [
    { name: 'Ragi (ರಾಗಿ)', price: '₹3,650', change: '+3.8%', up: true },
    { name: 'Tomato (ಟೊಮೆಟೊ)', price: '₹2,400', change: '+5.2%', up: true },
    { name: 'Onion (ಈರುಳ್ಳಿ)', price: '₹2,100', change: '-2.1%', up: false },
    { name: 'Tur Dal (ತೊಗರಿ)', price: '₹9,200', change: '+1.4%', up: true },
    { name: 'Maize (ಮೆಕ್ಕೆಜೋಳ)', price: '₹2,220', change: '+0.5%', up: true },
    { name: 'Arecanut (ಅಡಿಕೆ)', price: '₹48,500', change: '+2.1%', up: true },
    { name: 'Paddy (ಭತ್ತ)', price: '₹2,350', change: '+0.8%', up: true },
    { name: 'Coffee (ಕಾಫಿ)', price: '₹31,000', change: '+1.9%', up: true }
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fafc 100%)', paddingTop: '3rem', paddingBottom: '3.5rem', borderBottom: '1px solid var(--border-light)' }}>
      {/* Live Market Ticker */}
      <div style={{ background: '#064e3b', color: '#ffffff', padding: '0.6rem 0', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'inline-flex', gap: '2.5rem', animation: 'marquee 25s linear infinite' }}>
          <span style={{ fontWeight: 700, color: '#fde047', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            🔴 LIVE KARNATAKA APMC SPOT PRICES:
          </span>
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{item.price}/qtl</span>
              <span style={{ color: item.up ? '#4ade80' : '#f87171', fontWeight: 600, fontSize: '0.75rem' }}>
                {item.up ? '▲' : '▼'} {item.change}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#d1fae5', color: '#065f46', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Sparkles size={16} />
            {language === 'en' ? 'State Agriculture & Marketing Intelligence Platform' : 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಕೃಷಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬುದ್ಧಿಮತ್ತೆ ವೇದಿಕೆ'}
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#064e3b', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            🌾 Smart Farming. 📈 Smarter Decisions.<br />
            <span style={{ color: '#059669' }}>🤖 Powered by AI Ensembles.</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '720px', marginInline: 'auto' }}>
            {language === 'en'
              ? 'Empowering Karnataka farmers with official AGMARKNET mandi prices, time-series forecasting, soil suitability analysis, and actionable sell-or-hold decision support.'
              : 'ಕರ್ನಾಟಕದ ರೈತರಿಗೆ ನಿಖರವಾದ ಆಗ್ಮಾರ್ಕ್ನೆಟ್ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು, ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಬೆಳೆ ಮುನ್ಸೂಚನೆ, ಮಣ್ಣಿನ ಸೂಕ್ತತೆ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಮಾರಾಟದ ಸಲಹೆಗಳನ್ನು ಒಂದೇ ಸೂರಿನಡಿ ಒದಗಿಸುತ್ತದೆ.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('prices')}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', borderRadius: '12px' }}
            >
              <TrendingUp size={18} />
              {language === 'en' ? 'Explore 52 Karnataka Crops' : '೫೨ ಬೆಳೆಗಳ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ವೀಕ್ಷಿಸಿ'}
            </button>
            <button
              onClick={() => onNavigate('recommend')}
              className="btn btn-outline"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', borderRadius: '12px', background: '#ffffff' }}
            >
              <Sprout size={18} />
              {language === 'en' ? 'AI Crop Recommendation' : 'ಮಣ್ಣಿಗೆ ತಕ್ಕ ಬೆಳೆ ಶಿಫಾರಸು'}
            </button>
            <button
              onClick={() => onNavigate('forecast')}
              className="btn btn-earth"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', borderRadius: '12px' }}
            >
              <Sparkles size={18} />
              {language === 'en' ? '7-Day Price Forecast' : '೭ ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆ'}
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '3.5rem' }}>
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', background: '#ffffff' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>52+</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'en' ? 'Karnataka Crops Tracked' : 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಬೆಳೆಗಳು'}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', background: '#ffffff' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>33</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'en' ? 'APMC Mandis Covered' : 'ಎ.ಪಿ.ಎಂ.ಸಿ ಮಾರುಕಟ್ಟೆಗಳು'}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', background: '#ffffff' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)' }}>0.9898</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'en' ? 'Ensemble R² Accuracy' : 'ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆರ್² ನಿಖರತೆ'}
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', background: '#ffffff' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--earth-700)' }}>66,400+</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'en' ? 'Historical Agmarknet Records' : 'ಐತಿಹಾಸಿಕ ದಾಖಲೆಗಳು'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
