import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'kn';

interface Translations {
  [key: string]: {
    en: string;
    kn: string;
  };
}

const TRANSLATIONS: Translations = {
  appName: {
    en: 'KrishiMitra',
    kn: 'ಕೃಷಿಮಿತ್ರ'
  },
  tagline: {
    en: 'AI Farming Intelligence for Karnataka',
    kn: 'ಕರ್ನಾಟಕದ ರೈತರಿಗೆ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ'
  },
  navHome: { en: 'Home', kn: 'ಮುಖಪುಟ' },
  navPrices: { en: 'Market Prices', kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು' },
  navForecast: { en: 'Price Forecast', kn: 'ಬೆಲೆ ಮುನ್ಸೂಚನೆ' },
  navRecommend: { en: 'Crop Advisor', kn: 'ಬೆಳೆ ಶಿಫಾರಸು' },
  navSellAdvice: { en: 'Sell / Wait Advisor', kn: 'ಮಾರಾಟ / ಕಾಯುವ ಸಲಹೆ' },
  navAlerts: { en: 'SMS Alerts', kn: 'ಎಸ್.ಎಂ.ಎಸ್ ಎಚ್ಚರಿಕೆಗಳು' },
  navAdmin: { en: 'Admin Panel', kn: 'ಆಡಳಿತ ಮಂಡಳಿ' },
  login: { en: 'Farmer Login', kn: 'ರೈತರ ಲಾಗಿನ್' },
  logout: { en: 'Logout', kn: 'ಲಾಗ್ ಔಟ್' },
  register: { en: 'Register Land', kn: 'ಹೊಸ ನೋಂದಣಿ' },
  welcome: { en: 'Namaskara, Farmer', kn: 'ನಮಸ್ಕಾರ, ರೈತ ಮಿತ್ರರೇ' },
  districtLabel: { en: 'Selected District', kn: 'ಆಯ್ದ ಜಿಲ್ಲೆ' },
  searchCrops: { en: 'Search 50+ Karnataka crops...', kn: '೫೦+ ಕರ್ನಾಟಕದ ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...' },
  allCategories: { en: 'All Categories', kn: 'ಎಲ್ಲಾ ವರ್ಗಗಳು' },
  modalPrice: { en: 'Modal Price', kn: 'ಮಾದರಿ ಬೆಲೆ' },
  minPrice: { en: 'Min', kn: 'ಕನಿಷ್ಠ' },
  maxPrice: { en: 'Max', kn: 'ಗರಿಷ್ಠ' },
  arrivalQty: { en: 'Market Arrival', kn: 'ಮಾರುಕಟ್ಟೆ ಆವಕ' },
  lastUpdated: { en: 'Last Updated', kn: 'ಕೊನೆಯ ನವೀಕರಣ' },
  predictTitle: { en: '7-Day Price Forecast & Trend', kn: '೭ ದಿನಗಳ ಬೆಲೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಪ್ರವೃತ್ತಿ' },
  sellNow: { en: 'SELL NOW', kn: 'ಈಗಲೇ ಮಾರಾಟ ಮಾಡಿ' },
  waitDelay: { en: 'WAIT / DELAY', kn: 'ಮಾರಾಟ ಮುಂದೂಡಿ' },
  monitor: { en: 'MONITOR MARKET', kn: 'ಮಾರುಕಟ್ಟೆ ಗಮನಿಸಿ' },
  cropAdvisorTitle: { en: 'Soil Suitability & Crop Rotation Engine', kn: 'ಮಣ್ಣಿನ ಸೂಕ್ತತೆ ಮತ್ತು ಬೆಳೆ ಪರಿವರ್ತನಾ ಸಲಹೆ' },
  soilType: { en: 'Soil Type', kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ' },
  season: { en: 'Season', kn: 'ಋತು / ಹಂಗಾಮು' },
  previousCrop: { en: 'Previous Crop (Rotation)', kn: 'ಹಿಂದಿನ ಬೆಳೆ (ಪರಿವರ್ತನೆ)' },
  waterAvailability: { en: 'Water Availability', kn: 'ನೀರಿನ ಲಭ್ಯತೆ' },
  getRecommendations: { en: 'Generate AI Recommendations', kn: 'ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ' },
  suitabilityScore: { en: 'Suitability Score', kn: 'ಸೂಕ್ತತೆಯ ಅಂಕ' },
  rotationAdviceTitle: { en: 'Agronomic Crop Rotation Insight', kn: 'ಬೆಳೆ ಪರಿವರ್ತನೆಯ ಕೃಷಿ ವೈಜ್ಞಾನಿಕ ಸಲಹೆ' },
  smsAlertTitle: { en: 'Subscribe to SMS Price & Weather Alerts', kn: 'ಬೆಲೆ ಮತ್ತು ಹವಾಮಾನ ಎಸ್.ಎಂ.ಎಸ್ ಎಚ್ಚರಿಕೆಗೆ ಚಂದಾದಾರರಾಗಿ' },
  mobilePlaceholder: { en: 'Enter 10-digit mobile number', kn: '೧೦ ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' },
  sendSmsBtn: { en: 'Dispatch Test SMS Alert', kn: 'ಪರೀಕ್ಷಾರ್ಥ ಎಸ್.ಎಂ.ಎಸ್ ಕಳುಹಿಸಿ' },
  dataSourceTitle: { en: 'Official Data Transparency', kn: 'ಅಧಿಕೃತ ದತ್ತಾಂಶ ಪಾರದರ್ಶಕತೆ' },
  dataSourceText: { en: 'Real historical market prices sourced from AGMARKNET & Karnataka Department of Agricultural Marketing.', kn: 'ಅಧಿಕೃತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಆಗ್ಮಾರ್ಕ್ನೆಟ್ ಮತ್ತು ಕರ್ನಾಟಕ ಕೃಷಿ ಮಾರಾಟ ಇಲಾಖೆಯಿಂದ ಪಡೆಯಲಾಗಿದೆ.' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('km_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('km_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'kn' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
