import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language } = useLanguage();

  return (
    <footer style={{ background: '#064e3b', color: '#e2e8f0', paddingTop: '3rem', paddingBottom: '2.5rem', borderTop: '4px solid #059669' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Sprout size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>KRISHIMITRA</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              {language === 'en'
                ? 'AI-Powered Karnataka Crop Advisor, Market Price Prediction & Farmer Alert System.'
                : 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಕೃಷಿ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ.'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fde047', marginBottom: '0.75rem' }}>
              Official Data Sources
            </h4>
            <ul style={{ listStyle: 'none', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>• AGMARKNET (agmarknet.gov.in)</li>
              <li>• Open Government Data India (data.gov.in)</li>
              <li>• KSAMB Krishi Marata Vahini</li>
              <li>• KSNDMC & IMD Meteorological Network</li>
              <li>• Karnataka DES Agro-climatic Census</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fde047', marginBottom: '0.75rem' }}>
              State Helpline & APMC Support
            </h4>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div>Kisan Call Centre: <strong>1800-180-1551</strong> (Toll Free)</div>
              <div>Karnataka Raitha Sahayavani: <strong>1800-425-3553</strong></div>
              <div>Operating Hours: 06:00 AM – 10:00 PM (Daily)</div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Ribbon */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: '#ffffff' }}>Scientific Advisory Disclaimer:</strong> KrishiMitra utilizes official historical Agmarknet records, ensemble regression, and soil suitability heuristics to generate decision-support signals. Agricultural spot prices depend on real-time market arrivals, weather disturbances, and transportation logistics. Predictions are estimates and do not guarantee future commercial realization.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', color: '#64748b' }}>
            <span>© 2026 KrishiMitra. Karnataka State AIML Major Project.</span>
            <span>Dedicated to Karnataka Annadata Farmers 🌾</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
