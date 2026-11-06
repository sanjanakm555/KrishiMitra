import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WeatherWidget } from './components/WeatherWidget';
import { MarketPricesView } from './components/MarketPricesView';
import { PriceForecastView } from './components/PriceForecastView';
import { CropRecommendationView } from './components/CropRecommendationView';
import { SellDelayAdvisorView } from './components/SellDelayAdvisorView';
import { FarmerAlertsView } from './components/FarmerAlertsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  // Forecast view navigation parameters
  const [forecastCrop, setForecastCrop] = useState('Finger Millet');
  const [forecastCommodity, setForecastCommodity] = useState('Finger Millet');
  const [forecastMarket, setForecastMarket] = useState('Mysuru APMC (Bandipalya)');

  const handleSelectCropForForecast = (cropName: string, commodity: string, market: string, price: number) => {
    setForecastCrop(cropName);
    setForecastCommodity(commodity);
    setForecastMarket(market);
    setCurrentTab('forecast');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main District Weather Quick Bar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '0.75rem 0' }}>
        <div className="container">
          <WeatherWidget district={user?.district || 'Mysuru'} />
        </div>
      </div>

      {/* Tab Views */}
      <main style={{ flex: 1 }}>
        {currentTab === 'home' && (
          <div>
            <HeroSection onNavigate={setCurrentTab} />
            <MarketPricesView onSelectCropForForecast={handleSelectCropForForecast} />
          </div>
        )}

        {currentTab === 'prices' && (
          <MarketPricesView onSelectCropForForecast={handleSelectCropForForecast} />
        )}

        {currentTab === 'forecast' && (
          <PriceForecastView
            initialCrop={forecastCrop}
            initialCommodity={forecastCommodity}
            initialMarket={forecastMarket}
          />
        )}

        {currentTab === 'recommend' && (
          <CropRecommendationView />
        )}

        {currentTab === 'sell_advice' && (
          <SellDelayAdvisorView />
        )}

        {currentTab === 'alerts' && (
          <FarmerAlertsView />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView />
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
