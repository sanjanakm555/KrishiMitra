import React, { useEffect, useState } from 'react';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/api';
import { CloudRain, Sun, Cloud, Droplets, Thermometer, Wind } from 'lucide-react';

interface WeatherWidgetProps {
  district: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ district }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchWeather(district)
      .then(data => {
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [district]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '1rem', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading agro-weather observations for {district}...</div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agrometeorological Bulletin
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            {weather.district} Agro-Climate
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.8)', padding: '0.35rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, color: '#0369a1' }}>
          <Sun size={16} color="#eab308" />
          {weather.condition}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.75)', padding: '0.65rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#64748b' }}>
            <Thermometer size={14} color="#ef4444" />
            Temperature
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {weather.temperature_celsius}°C
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.75)', padding: '0.65rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#64748b' }}>
            <CloudRain size={14} color="#0284c7" />
            Precipitation
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {weather.rainfall_mm} mm
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.75)', padding: '0.65rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#64748b' }}>
            <Droplets size={14} color="#059669" />
            Humidity
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {weather.humidity_percent}%
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
        <span>Source: {weather.source}</span>
        <span>Updated: {weather.last_updated}</span>
      </div>
    </div>
  );
};
