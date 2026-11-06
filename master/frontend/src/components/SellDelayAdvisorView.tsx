import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { predictPrice, fetchCrops, fetchMarkets } from '../services/api';
import { Crop, Market, PriceForecastResponse } from '../types';
import { Scale, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Check } from 'lucide-react';

export const SellDelayAdvisorView: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('Finger Millet');
  const [selectedCommodity, setSelectedCommodity] = useState('Finger Millet');
  const [selectedMarket, setSelectedMarket] = useState('Mysuru APMC (Bandipalya)');
  const [currentPrice, setCurrentPrice] = useState(3650);
  const [decision, setDecision] = useState<PriceForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCrops().then(data => {
      setCrops(data);
      if (data.length > 0) {
        setSelectedCrop(data[0].crop_name);
        setSelectedCommodity(data[0].commodity_name);
        setCurrentPrice(data[0].base_price);
      }
    }).catch(console.error);

    fetchMarkets().then(setMarkets).catch(console.error);
  }, []);

  const handleCropChange = (cropName: string) => {
    const match = crops.find(c => c.crop_name === cropName);
    if (match) {
      setSelectedCrop(cropName);
      setSelectedCommodity(match.commodity_name);
      setCurrentPrice(match.base_price);
    }
  };

  const evaluateDecision = async () => {
    setLoading(true);
    try {
      const res = await predictPrice(selectedCommodity, user?.district || 'Mysuru', selectedMarket, currentPrice);
      setDecision(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCommodity && selectedMarket) {
      evaluateDecision();
    }
  }, [selectedCommodity, selectedMarket]);

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Decision Support System • Karnataka APMCs
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
            {language === 'en' ? 'Should I Sell My Crop Now or Wait?' : 'ನನ್ನ ಬೆಳೆಯನ್ನು ಈಗಲೇ ಮಾರಾಟ ಮಾಡಬೇಕೇ ಅಥವಾ ಕಾಯಬೇಕೇ?'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {language === 'en'
              ? 'AI-driven sell-or-hold recommendation engine combining 7-day multi-step forecasts, arrival volumes, and price volatility.'
              : '೭ ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಆವಕವನ್ನು ಪರಿಗಣಿಸಿ ಮಾರಾಟ ಅಥವಾ ಕಾಯುವಿಕೆಯ ನಿಖರ ಸಲಹೆ.'}
          </p>
        </div>

        {/* Input Parameters Card */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                {language === 'en' ? 'Harvested Crop' : 'ಕಟಾವು ಮಾಡಿದ ಬೆಳೆ'}
              </label>
              <select
                value={selectedCrop}
                onChange={e => handleCropChange(e.target.value)}
                className="input-control"
              >
                {crops.map(c => (
                  <option key={c.id} value={c.crop_name}>
                    {c.crop_name} ({c.kannada_name.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                {language === 'en' ? 'Target APMC Mandi' : 'ಮಂಡಿ ಮಾರುಕಟ್ಟೆ'}
              </label>
              <select
                value={selectedMarket}
                onChange={e => setSelectedMarket(e.target.value)}
                className="input-control"
              >
                {markets.map(m => (
                  <option key={m.id} value={m.market_name}>
                    {m.market_name} ({m.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                {language === 'en' ? 'Current Offered Price (₹/qtl)' : 'ಪ್ರಸ್ತುತ ಆಫರ್ ಬೆಲೆ (₹/ಕ್ವಿಂ)'}
              </label>
              <input
                type="number"
                value={currentPrice}
                onChange={e => setCurrentPrice(Number(e.target.value))}
                className="input-control"
              />
            </div>

            <div>
              <button
                onClick={evaluateDecision}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem 1rem' }}
                disabled={loading}
              >
                <Scale size={16} />
                {loading ? 'Analyzing Market Risk...' : (language === 'en' ? 'Evaluate Decision' : 'ಸಲಹೆ ಪರಿಶೀಲಿಸಿ')}
              </button>
            </div>
          </div>
        </div>

        {/* Decision Output Card */}
        {decision && (
          <div>
            <div
              className="card"
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                background: decision.decision === 'WAIT'
                  ? 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)'
                  : decision.decision === 'SELL'
                  ? 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)'
                  : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                border: `2px solid ${decision.decision === 'WAIT' ? '#10b981' : decision.decision === 'SELL' ? '#ef4444' : '#94a3b8'}`,
                marginBottom: '2rem'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.5rem' }}>
                AI AGRICULTURAL DECISION ENGINE
              </div>

              <div
                style={{
                  fontSize: '2.75rem',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: decision.decision === 'WAIT' ? '#047857' : decision.decision === 'SELL' ? '#b91c1c' : '#334155',
                  marginBottom: '0.75rem'
                }}
              >
                {decision.decision === 'WAIT' ? '⏳ WAIT / DELAY SELLING' : decision.decision === 'SELL' ? '⚡ CONSIDER SELLING NOW' : '🔍 MONITOR DAILY ARRIVALS'}
              </div>

              <div style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {language === 'en' ? decision.decision_reason_en : decision.decision_reason_kn}
              </div>

              {/* Price comparison ribbon */}
              <div style={{ display: 'inline-flex', gap: '2rem', background: '#ffffff', padding: '1rem 2rem', borderRadius: '14px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CURRENT PRICE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>₹{decision.current_modal_price.toLocaleString('en-IN')}/qtl</div>
                </div>

                <div style={{ borderLeft: '1px solid #e2e8f0' }} />

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PROJECTED 7-DAY PRICE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: decision.expected_change_pct > 0 ? '#15803d' : '#b91c1c' }}>
                    ₹{decision.predicted_7day_price.toLocaleString('en-IN')}/qtl
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #e2e8f0' }} />

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>EXPECTED SHIFT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: decision.expected_change_pct > 0 ? '#15803d' : '#b91c1c' }}>
                    {decision.expected_change_pct > 0 ? `+${decision.expected_change_pct}%` : `${decision.expected_change_pct}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Advisory Guidelines */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-900)' }}>Storage Capacity Check</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  If delaying sale for perishables (like Tomato or Onion), verify adequate cold storage or drying yards to prevent post-harvest spoilage.
                </p>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={18} color="#d97706" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-900)' }}>APMC Arrival Volume</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Heavy arrival surges (&gt;500 tonnes) in neighbouring mandis can create unexpected supply gluts. Check our live market tab daily.
                </p>
              </div>

              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={18} color="#0284c7" />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-900)' }}>Model Confidence</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Model validation achieved 72.8% classification accuracy on 2025-2026 test datasets. Consult official mandi agents before large commitments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
