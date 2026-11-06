import React, { useState, useEffect } from 'react';
import { MarketPriceItem } from '../types';
import { fetchLatestPrices } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, MapPin } from 'lucide-react';

interface MarketPricesViewProps {
  onSelectCropForForecast: (cropName: string, commodity: string, market: string, price: number) => void;
}

export const MarketPricesView: React.FC<MarketPricesViewProps> = ({ onSelectCropForForecast }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [prices, setPrices] = useState<MarketPriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState(user?.district || 'Mysuru');

  const CATEGORIES = [
    'ALL', 'Cereals', 'Millets', 'Pulses', 'Oilseeds', 'Commercial', 'Vegetables', 'Fruits', 'Plantation', 'Spices'
  ];

  const DISTRICTS = [
    'All Districts', 'Mysuru', 'Mandya', 'Bengaluru Urban', 'Bengaluru Rural', 'Belagavi',
    'Dharwad', 'Hassan', 'Shivamogga', 'Kalaburagi', 'Vijayapura', 'Ballari', 'Kolar',
    'Chikkaballapura', 'Tumakuru', 'Chitradurga', 'Davanagere', 'Haveri', 'Gadag',
    'Bagalkote', 'Raichur', 'Koppal', 'Udupi', 'Dakshina Kannada', 'Uttara Kannada', 'Kodagu', 'Chikkamagaluru'
  ];

  const loadData = () => {
    setLoading(true);
    const distParam = selectedDistrict === 'All Districts' ? undefined : selectedDistrict;
    fetchLatestPrices(distParam, selectedCategory)
      .then(data => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedDistrict]);

  const filteredPrices = prices.filter(p => {
    const matchesSearch = 
      p.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.kannada_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AGMARKNET Verified • Karnataka State Feeds
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              {t('navPrices')}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {language === 'en'
                ? `Showing authentic daily APMC prices across 52 Karnataka crops. Values are dynamically fetched from the database.`
                : `ಕರ್ನಾಟಕದ ೫೨ ಪ್ರಮುಖ ಬೆಳೆಗಳ ಅಧಿಕೃತ ದೈನಂದಿನ ಎ.ಪಿ.ಎಂ.ಸಿ ಬೆಲೆಗಳ ಪಟ್ಟಿ. ದತ್ತಾಂಶವನ್ನು ನೇರವಾಗಿ ಡೇಟಾಬೇಸ್‌ನಿಂದ ಪಡೆಯಲಾಗಿದೆ.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={loadData}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {language === 'en' ? 'Refresh Feeds' : 'ನವೀಕರಿಸಿ'}
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder={t('searchCrops')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* District Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary-700)" />
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="input-control"
              >
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Records count badge */}
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === 'en' ? 'Found' : 'ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳು'}: <strong style={{ color: 'var(--primary-800)' }}>{filteredPrices.length}</strong>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginTop: '1rem', paddingBottom: '0.25rem' }}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: active ? 'var(--primary-700)' : '#f1f5f9',
                    color: active ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Crop Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary-600)' }} />
            <div>Loading verified market prices from database...</div>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No crops found</div>
            <div>Try adjusting your search query or selecting a different district.</div>
          </div>
        ) : (
          <div className="grid-crops">
            {filteredPrices.map(item => {
              const isUp = item.trend === 'UP';
              const isDown = item.trend === 'DOWN';
              return (
                <div key={item.crop_id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Crop Header Image */}
                  <div style={{ position: 'relative', height: '140px', background: '#064e3b', overflow: 'hidden' }}>
                    <img
                      src={item.image_url}
                      alt={item.crop_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: any) => {
                        // Fallback placeholder if image not found
                        e.target.src = '/crops/ragi.jpg';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                      <span className={`badge ${isUp ? 'badge-up' : isDown ? 'badge-down' : 'badge-stable'}`}>
                        {isUp && <ArrowUpRight size={14} />}
                        {isDown && <ArrowDownRight size={14} />}
                        {!isUp && !isDown && <Minus size={14} />}
                        {item.price_change_pct > 0 ? `+${item.price_change_pct}%` : `${item.price_change_pct}%`}
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', color: '#f8fafc', fontWeight: 600 }}>
                      📍 {item.market}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-900)', lineHeight: 1.2 }}>
                            {item.crop_name}
                          </h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--earth-700)', fontWeight: 600 }}>
                            {item.kannada_name}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {item.category}
                        </span>
                      </div>

                      {/* Modal Price Highlight */}
                      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.65rem 0.85rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
                          Current Modal Price
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532d', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          ₹{item.modal_price.toLocaleString('en-IN')}
                          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#166534' }}>/ quintal</span>
                        </div>
                      </div>

                      {/* Min / Max & Arrival details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                        <div>
                          <div>Min</div>
                          <strong style={{ color: '#0f172a' }}>₹{item.min_price.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <div>Max</div>
                          <strong style={{ color: '#0f172a' }}>₹{item.max_price.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <div>Arrivals</div>
                          <strong style={{ color: '#0f172a' }}>{item.arrival_quantity} T</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata & Button */}
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Updated: {item.last_updated}</span>
                        <span>{item.variety}</span>
                      </div>

                      <button
                        onClick={() => onSelectCropForForecast(item.crop_name, item.commodity, item.market, item.modal_price)}
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.55rem 0.75rem' }}
                      >
                        {language === 'en' ? 'Predict 7-Day Trend' : '೭ ದಿನಗಳ ಪ್ರವೃತ್ತಿ ಊಹಿಸಿ'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
