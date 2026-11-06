import { MarketPriceItem, PriceForecastResponse, RecommendationResponse, WeatherData, AdminMetrics, Crop, Market } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function fetchCrops(): Promise<Crop[]> {
  const res = await fetch(`${API_BASE}/crops`);
  if (!res.ok) throw new Error('Failed to fetch crops');
  return res.json();
}

export async function fetchMarkets(district?: string): Promise<Market[]> {
  const url = district ? `${API_BASE}/markets?district=${encodeURIComponent(district)}` : `${API_BASE}/markets`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch markets');
  return res.json();
}

export async function fetchLatestPrices(district?: string, category?: string): Promise<MarketPriceItem[]> {
  let url = `${API_BASE}/prices/latest`;
  const params: string[] = [];
  if (district) params.push(`district=${encodeURIComponent(district)}`);
  if (category && category !== 'ALL') params.push(`category=${encodeURIComponent(category)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch market prices');
  return res.json();
}

export async function fetchPriceHistory(commodity: string, market: string): Promise<any> {
  const res = await fetch(`${API_BASE}/prices/history?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}

export async function predictPrice(commodity: string, district: string, market: string, currentPrice?: number): Promise<PriceForecastResponse> {
  const res = await fetch(`${API_BASE}/predict/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commodity,
      district,
      market,
      current_modal_price: currentPrice
    })
  });
  if (!res.ok) throw new Error('Prediction API failed');
  return res.json();
}

export async function getCropRecommendations(data: {
  district: string;
  soil_type: string;
  season: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  soil_pH?: number;
  rainfall?: number;
  water_availability: string;
  previous_crop: string;
}): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/recommend/crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Recommendation API failed');
  return res.json();
}

export async function fetchWeather(district: string): Promise<WeatherData> {
  const res = await fetch(`${API_BASE}/weather?district=${encodeURIComponent(district)}`);
  if (!res.ok) throw new Error('Weather API failed');
  return res.json();
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const res = await fetch(`${API_BASE}/admin/metrics`);
  if (!res.ok) throw new Error('Admin API failed');
  return res.json();
}

export async function triggerDataRefresh(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/refresh-data`, { method: 'POST' });
  if (!res.ok) throw new Error('Data refresh trigger failed');
  return res.json();
}

export async function subscribeToAlerts(payload: {
  mobile_number: string;
  district: string;
  crop_name: string;
  language: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, alert_type: 'ALL' })
  });
  if (!res.ok) throw new Error('Alert subscription failed');
  return res.json();
}

export async function loginFarmer(mobile_number: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile_number, password })
  });
  if (!res.ok) throw new Error('Invalid mobile or password');
  return res.json();
}

export async function registerFarmer(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}
