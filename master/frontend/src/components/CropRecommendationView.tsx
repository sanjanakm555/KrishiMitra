import React, { useState } from 'react';
import { RecommendationResponse } from '../types';
import { getCropRecommendations } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sprout, CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export const CropRecommendationView: React.FC = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [district, setDistrict] = useState(user?.district || 'Mysuru');
  const [soilType, setSoilType] = useState('Red Loamy');
  const [season, setSeason] = useState('Kharif');
  const [soilPh, setSoilPh] = useState(6.8);
  const [nitrogen, setNitrogen] = useState(75);
  const [phosphorus, setPhosphorus] = useState(48);
  const [potassium, setPotassium] = useState(55);
  const [waterAvail, setWaterAvail] = useState('Medium');
  const [prevCrop, setPrevCrop] = useState('Paddy');
  const [rainfall, setRainfall] = useState(850);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResponse | null>(null);

  const SOIL_TYPES = [
    'Red Loamy', 'Black Soil', 'Laterite', 'Coastal Alluvium', 'Sandy Loam', 'Clay Loam'
  ];

  const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Whole Year'];
  const WATER_LEVELS = ['Low', 'Medium', 'High'];

  const PREV_CROPS = [
    'None / Fallow', 'Paddy', 'Ragi', 'Maize', 'Sugarcane', 'Cotton',
    'Tomato', 'Tur (Red Gram)', 'Groundnut', 'Potato', 'Onion'
  ];

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getCropRecommendations({
        district,
        soil_type: soilType,
        season,
        nitrogen,
        phosphorus,
        potassium,
        soil_pH: soilPh,
        rainfall,
        water_availability: waterAvail,
        previous_crop: prevCrop
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agronomic Intelligence • Soft-Voting Ensemble Classifier
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
            {t('cropAdvisorTitle')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {language === 'en'
              ? 'Multi-variable AI model evaluating soil chemistry, seasonal water availability, and crop rotation principles to suggest resilient crops.'
              : 'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ, ಮಳೆ ಪ್ರಮಾಣ ಮತ್ತು ಬೆಳೆ ಪರಿವರ್ತನಾ ನಿಯಮಗಳನ್ನು ಆಧರಿಸಿ ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಸೂಚಿಸುವ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ವ್ಯವಸ್ಥೆ.'}
          </p>
        </div>

        {/* Input Form Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
          <form onSubmit={handleRecommend}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  {language === 'en' ? 'Karnataka District' : 'ಜಿಲ್ಲೆ'}
                </label>
                <select value={district} onChange={e => setDistrict(e.target.value)} className="input-control">
                  <option value="Mysuru">Mysuru</option>
                  <option value="Mandya">Mandya</option>
                  <option value="Belagavi">Belagavi</option>
                  <option value="Kalaburagi">Kalaburagi</option>
                  <option value="Dharwad">Dharwad</option>
                  <option value="Hassan">Hassan</option>
                  <option value="Shivamogga">Shivamogga</option>
                  <option value="Kolar">Kolar</option>
                  <option value="Chikkaballapura">Chikkaballapura</option>
                  <option value="Tumakuru">Tumakuru</option>
                  <option value="Vijayapura">Vijayapura</option>
                  <option value="Ballari">Ballari</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  {t('soilType')}
                </label>
                <select value={soilType} onChange={e => setSoilType(e.target.value)} className="input-control">
                  {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  {t('season')}
                </label>
                <select value={season} onChange={e => setSeason(e.target.value)} className="input-control">
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  {t('previousCrop')}
                </label>
                <select value={prevCrop} onChange={e => setPrevCrop(e.target.value)} className="input-control">
                  {PREV_CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  {t('waterAvailability')}
                </label>
                <select value={waterAvail} onChange={e => setWaterAvail(e.target.value)} className="input-control">
                  {WATER_LEVELS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  Soil pH: <strong style={{ color: 'var(--primary-700)' }}>{soilPh}</strong>
                </label>
                <input
                  type="range"
                  min="5.0"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={e => setSoilPh(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-700)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  Nitrogen (N) kg/ha: <strong>{nitrogen}</strong>
                </label>
                <input
                  type="range"
                  min="30"
                  max="140"
                  value={nitrogen}
                  onChange={e => setNitrogen(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-700)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                  Annual Rainfall (mm): <strong>{rainfall}</strong>
                </label>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="50"
                  value={rainfall}
                  onChange={e => setRainfall(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-700)' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '10px' }}
                disabled={loading}
              >
                <Sparkles size={18} />
                {loading ? 'Evaluating Agro-ecological Suitability...' : t('getRecommendations')}
              </button>
            </div>
          </form>
        </div>

        {/* Results Container */}
        {results && (
          <div>
            {/* Crop Rotation Advice Alert */}
            <div className="card" style={{ padding: '1.25rem', background: '#f0fdf4', border: '1px solid #86efac', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <ShieldCheck size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#14532d', marginBottom: '0.25rem' }}>
                    {t('rotationAdviceTitle')}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
                    {results.crop_rotation_advice}
                  </p>
                </div>
              </div>
            </div>

            {/* Ranked Recommendations List */}
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-900)', marginBottom: '1.25rem' }}>
              {language === 'en' ? 'Top Ranked Suitable Crops for Your Land' : 'ನಿಮ್ಮ ಭೂಮಿಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳ ಪಟ್ಟಿ'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {results.recommendations.map((rec, idx) => (
                <div key={rec.crop_name} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Rank Badge & Image */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: idx === 0 ? '#f59e0b' : 'var(--primary-800)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                      #{idx + 1}
                    </div>
                    <img
                      src={rec.crop_image}
                      alt={rec.crop_name}
                      style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                      onError={(e: any) => { e.target.src = '/crops/ragi.jpg'; }}
                    />
                  </div>

                  {/* Crop Info */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                        {rec.crop_name}
                      </h4>
                      <span style={{ fontSize: '0.9rem', color: 'var(--earth-700)', fontWeight: 600 }}>
                        {rec.kannada_name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                      <span style={{ background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#475569' }}>
                        {rec.category}
                      </span>
                      <span style={{ background: '#ecfdf5', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#047857' }}>
                        Water: {rec.water_requirement}
                      </span>
                      <span style={{ background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600, color: '#92400e' }}>
                        Range: {rec.expected_price_range}
                      </span>
                    </div>

                    {/* Explainability bullets */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {rec.reasons.map((r, rIdx) => (
                        <div key={rIdx} style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0 }} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suitability Gauge */}
                  <div style={{ textAlign: 'center', minWidth: '130px', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {t('suitabilityScore')}
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: rec.suitability_score > 85 ? '#059669' : '#d97706', marginTop: '0.15rem' }}>
                      {rec.suitability_score}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Model Confidence Score
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scientific Disclaimer */}
            <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <span>
                <strong>Note:</strong> Suitability scores represent agro-climatic model confidence based on Karnataka agricultural soil surveys and historical yields, not guaranteed commercial profit.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
