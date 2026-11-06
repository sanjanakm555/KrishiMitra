import React, { useState, useEffect } from 'react';
import { PriceForecastResponse, Crop, Market } from '../types';
import { fetchCrops, fetchMarkets, predictPrice, fetchPriceHistory } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus, Info, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface PriceForecastViewProps {
  initialCrop?: string;
  initialCommodity?: string;
  initialMarket?: string;
}

export const PriceForecastView: React.FC<PriceForecastViewProps> = ({
  initialCrop = 'Finger Millet',
  initialCommodity = 'Finger Millet',
  initialMarket = 'Mysuru APMC (Bandipalya)'
}) => {
  const { language, t } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState(initialCommodity);
  const [selectedDistrict, setSelectedDistrict] = useState('Mysuru');
  const [selectedMarket, setSelectedMarket] = useState(initialMarket);
  const [forecast, setForecast] = useState<PriceForecastResponse | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCrops().then(setCrops).catch(console.error);
    fetchMarkets().then(setMarkets).catch(console.error);
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const pred = await predictPrice(selectedCommodity, selectedDistrict, selectedMarket);
      setForecast(pred);

      const hist = await fetchPriceHistory(selectedCommodity, selectedMarket);
      const combined = [
        ...hist.history.map((h: any) => ({
          date: h.display_date,
          actual: h.actual_price,
          movingAvg: h.moving_avg_7d,
          forecast: null
        })),
        ...hist.future_forecast.map((f: any) => ({
          date: f.display_date,
          actual: null,
          movingAvg: null,
          forecast: f.predicted_price
        }))
      ];
      setChartData(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [selectedCommodity, selectedMarket]);

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Machine Learning Forecasting • Time-Series Ensemble
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
            {t('predictTitle')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {language === 'en'
              ? 'Multi-horizon price projection powered by Stacking & Voting ensemble algorithms evaluated on chronological Karnataka mandi data.'
              : 'ಕರ್ನಾಟಕದ ಅಧಿಕೃತ ಮಂಡಿ ದಾಖಲೆಗಳಲ್ಲಿ ಪರೀಕ್ಷಿಸಲಾದ ಎನ್ಸೆಂಬಲ್ ಯಂತ್ರ ಕಲಿಕೆಯ ಮುನ್ಸೂಚನೆ.'}
          </p>
        </div>

        {/* Selection Controls */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                {language === 'en' ? 'Select Crop / Commodity' : 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ'}
              </label>
              <select
                value={selectedCommodity}
                onChange={e => setSelectedCommodity(e.target.value)}
                className="input-control"
              >
                {crops.map(c => (
                  <option key={c.id} value={c.commodity_name}>
                    {c.crop_name} ({c.kannada_name.split(' ')[0]}) - {c.commodity_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>
                {language === 'en' ? 'Select APMC Market' : 'ಎ.ಪಿ.ಎಂ.ಸಿ ಮಾರುಕಟ್ಟೆ'}
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
              <button
                onClick={runPrediction}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.65rem 1rem' }}
                disabled={loading}
              >
                <Sparkles size={16} />
                {loading ? 'Running Ensemble Models...' : (language === 'en' ? 'Compute Forecast' : 'ಮುನ್ಸೂಚನೆ ಪಡೆಯಿರಿ')}
              </button>
            </div>
          </div>
        </div>

        {forecast && (
          <div>
            {/* Forecast Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.25rem', background: '#ffffff' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  CURRENT MODAL PRICE
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-900)', marginTop: '0.25rem' }}>
                  ₹{forecast.current_modal_price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Spot quote at {forecast.market}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                  PREDICTED TOMORROW PRICE
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', marginTop: '0.25rem' }}>
                  ₹{forecast.predicted_tomorrow_price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.25rem' }}>
                  Next trading session projection
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e' }}>
                  PREDICTED 7-DAY PRICE
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', marginTop: '0.25rem' }}>
                  ₹{forecast.predicted_7day_price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {forecast.expected_change_pct > 0 ? (
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>▲ +{forecast.expected_change_pct}% expected</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>▼ {forecast.expected_change_pct}% expected</span>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: forecast.decision === 'WAIT' ? '#ecfdf5' : forecast.decision === 'SELL' ? '#fef2f2' : '#f8fafc', border: `1px solid ${forecast.decision === 'WAIT' ? '#6ee7b7' : forecast.decision === 'SELL' ? '#fca5a5' : '#cbd5e1'}` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  AI ADVISORY DECISION
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: forecast.decision === 'WAIT' ? '#065f46' : forecast.decision === 'SELL' ? '#991b1b' : '#334155', marginTop: '0.25rem' }}>
                  {forecast.decision === 'WAIT' ? 'WAIT / DELAY' : forecast.decision === 'SELL' ? 'SELL NOW' : 'MONITOR'}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '0.25rem' }}>
                  {forecast.decision === 'WAIT' ? 'Upward momentum expected' : forecast.decision === 'SELL' ? 'Downside price pressure' : 'Neutral band (±3%)'}
                </div>
              </div>
            </div>

            {/* Interactive Chart Container */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                    Price Trajectory: Actual Observations vs 7-Day Predicted Curve
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Solid Green = Historical Observed Prices | Dotted Orange = Multi-Step Ensemble Forecast
                  </p>
                </div>
                <div style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 600, color: '#475569' }}>
                  Architecture: {forecast.model_version}
                </div>
              </div>

              <div style={{ width: '100%', height: '360px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      domain={['auto', 'auto']}
                      tickFormatter={v => `₹${v}`}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `₹${Number(value).toLocaleString('en-IN')}/qtl`,
                        name === 'actual' ? 'Actual Observed Price' : name === 'forecast' ? 'Ensemble Predicted Price' : '7-Day Moving Avg'
                      ]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Modal Price (₹)"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#059669' }}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      name="7-Day Moving Avg"
                      stroke="#0284c7"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Predicted 7-Day Forecast (₹)"
                      stroke="#d97706"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 5, fill: '#d97706' }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explainable Decision Support Card */}
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderLeft: '6px solid var(--primary-700)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Info size={20} color="var(--primary-700)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                  {language === 'en' ? 'Decision Logic & Explainability Rationale' : 'ತೀರ್ಮಾನದ ವಿವರಣೆ ಮತ್ತು ಕೃಷಿ ವೈಜ್ಞಾನಿಕ ಹಿನ್ನೆಲೆ'}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.35rem' }}>
                    ENGLISH ADVISORY
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                    {forecast.decision_reason_en}
                  </p>
                </div>

                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.35rem' }}>
                    ಕನ್ನಡ ಸಲಹೆ (KANNADA ADVISORY)
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5, fontFamily: "'Noto Sans Kannada', sans-serif" }}>
                    {forecast.decision_reason_kn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
