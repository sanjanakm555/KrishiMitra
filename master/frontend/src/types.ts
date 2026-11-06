export interface Crop {
  id: number;
  crop_name: string;
  commodity_name: string;
  variety_name?: string;
  category: string;
  season: string;
  soil_type: string;
  water_requirement: string;
  major_districts: string;
  kannada_name: string;
  image_url: string;
  description?: string;
  base_price: number;
}

export interface Market {
  id: number;
  market_name: string;
  district: string;
  division?: string;
  state: string;
}

export interface MarketPriceItem {
  crop_id: number;
  crop_name: string;
  kannada_name: string;
  commodity: string;
  variety: string;
  category: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  unit: string;
  market: string;
  district: string;
  arrival_quantity: number;
  arrival_unit: string;
  price_change_pct: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  last_updated: string;
  image_url: string;
  data_source: string;
}

export interface PriceForecastResponse {
  district: string;
  market: string;
  commodity: string;
  current_modal_price: number;
  predicted_tomorrow_price: number;
  predicted_7day_price: number;
  expected_change_pct: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  decision: 'SELL' | 'WAIT' | 'MONITOR';
  decision_reason_en: string;
  decision_reason_kn: string;
  model_version: string;
  historical_chart_data: Array<{
    date: string;
    actual_price: number | null;
    predicted_price: number | null;
  }>;
}

export interface RecommendedCrop {
  crop_name: string;
  kannada_name: string;
  suitability_score: number;
  category: string;
  water_requirement: string;
  expected_price_range: string;
  reasons: string[];
  crop_image: string;
}

export interface RecommendationResponse {
  district: string;
  soil_type: string;
  season: string;
  previous_crop: string;
  recommendations: RecommendedCrop[];
  crop_rotation_advice: string;
}

export interface WeatherData {
  district: string;
  temperature_celsius: number;
  rainfall_mm: number;
  humidity_percent: number;
  condition: string;
  last_updated: string;
  source: string;
}

export interface User {
  id: number;
  full_name: string;
  mobile_number: string;
  role: 'farmer' | 'admin';
  district: string;
  preferred_language: 'en' | 'kn';
  token?: string;
}

export interface AdminMetrics {
  total_farmers: number;
  active_users: number;
  total_crops_supported: number;
  total_markets_tracked: number;
  total_price_records: number;
  total_predictions_generated: number;
  total_sms_alerts_dispatched: number;
  data_pipeline_last_run: string;
  best_model_name: string;
  model_test_rmse: number;
  model_test_r2: number;
}
