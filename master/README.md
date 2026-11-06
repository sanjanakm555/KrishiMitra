# 🌾 KRISHIMITRA (ಕೃಷಿಮಿತ್ರ)
### AI-Powered Karnataka Crop Advisor, Market Price Prediction & Farmer Alert System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Ensemble ML](https://img.shields.io/badge/ML-Ensemble%20Learning%20(Stacking%20%26%20Voting)-FF6F00.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Karnataka Focus](https://img.shields.io/badge/Scope-State%20of%20Karnataka%20ONLY-15803D.svg?style=flat)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()

> **Final Year AIML Major Project & Enterprise Agricultural Technology Platform**  
> Designed specifically for the farmers of **Karnataka, India**. Built with official government datasets from **AGMARKNET**, **data.gov.in**, and the **Karnataka State Agricultural Marketing Board (KSAMB)**.

---

## 📌 1. PROBLEM STATEMENT & OBJECTIVES

### The Challenge in Karnataka Agriculture
Karnataka's 31 agro-climatic districts (from the Southern Dry Zone of Mysuru and Mandya to the Northern Belts of Belagavi, Vijayapura, and Kalaburagi) face three critical agricultural challenges:
1. **Which crop should I grow?** Farmers frequently practice repeated monoculture without scientific evaluation of soil nutrient indices (N-P-K), pH, rainfall normals, or beneficial crop rotation.
2. **What is the current and predicted market price?** Mandi spot prices fluctuate violently with arrival surges. Farmers lack forward-looking price visibility.
3. **Should I sell my crop now or wait?** Cultivators often succumb to distress sales during post-harvest gluts, lacking quantitative advisory signals on whether waiting 7 days will yield higher net returns.

### The KrishiMitra Solution
KrishiMitra combines:
$$\text{AGMARKNET Mandi Feeds} + \text{Agro-Climatic Data} + \text{Ensemble ML Models} + \text{Explainable Decision Engine} + \text{Bilingual SMS Alerts (EN/KN)}$$

---

## 🎯 2. CORE FEATURES

* **🌾 52 Karnataka Crops Master:** Complete coverage across Cereals, Millets (Ragi, Jowar, Bajra), Pulses (GI-tagged Gulbarga Tur, Bengal Gram), Oilseeds, Commercial (Bt Cotton, Sugarcane), Vegetables (Kolar Tomato, Chitradurga Onion), Plantation (Shivamogga Arecanut, Tiptur Coconut), and Spices (Byadagi Chilli, Coorg Black Pepper, Cardamom).
* **🏛️ 33 APMC Mandis:** Deep coverage across Karnataka markets (Mysuru Bandipalya, Mandya, Yeshwanthpur, Kolar, Belagavi, Hubballi Amargol, Kalaburagi, Byadagi, Sagar, etc.).
* **🤖 Advanced Ensemble Learning:**
  * **Price Forecasting:** Heterogeneous **Stacking Ensemble Regressor** (Random Forest + XGBoost with Ridge Meta-Learner) achieving test **$R^2 = 0.9898$** and **RMSE = ₹3,335.03/quintal**.
  * **Crop Recommendation:** **Soft-Voting Ensemble Classifier** (Random Forest + Extra Trees) ranking suitability percentages with agronomic explainability.
  * **Farmer Decision Support:** **Soft-Voting Classifier** (Gradient Boosting + Random Forest + Extra Trees) delivering **SELL NOW**, **WAIT / DELAY**, or **MONITOR** advice.
* **🌱 Agro-Ecological Crop Rotation Engine:** Suggests legume/pulse crop alternation after cereal crops (e.g., Tur Dal after Paddy) to replenish organic soil nitrogen and disrupt pest cycles.
* **📈 Interactive Time-Series Charts:** Built with Recharts, visually distinguishing historical observed prices from 7-day predicted curves.
* **📱 Bilingual SMS Notification Gateway:** DLT-compliant transactional SMS alerts delivered in **English and Kannada (ಕನ್ನಡ)**.
* **🛡️ Administrative Telemetry:** Operational dashboard tracking data pipeline status, active farmers, model versioning, and on-demand mandi data synchronization.

---

## 🏗️ 3. SYSTEM ARCHITECTURE

```
                      ┌───────────────────────────────────────┐
                      │    OFFICIAL GOVERNMENT DATA SOURCES   │
                      │  AGMARKNET • data.gov.in • KSAMB Mandi│
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │         DATA INGESTION PIPELINE       │
                      │  raw/ ──> interim/ ──> processed/     │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │     ENSEMBLE MACHINE LEARNING CORE    │
                      │ • Stacking Regressor (Price Forecast) │
                      │ • Soft-Voting Classifier (Crop Rec)   │
                      │ • Decision Classifier (Sell / Hold)   │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │        FASTAPI BACKEND SERVICE        │
                      │   REST APIs • Native Bcrypt • SQLite  │
                      │   Weather Service • SMS Provider API  │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                      ┌───────────────────────────────────────┐
                      │      REACT 18 + TYPESCRIPT FRONTEND   │
                      │  Tailwind CSS • Lucide • Recharts     │
                      │  Bilingual Switcher (English / ಕನ್ನಡ) │
                      └───────────────────────────────────────┘
```

---

## 📊 4. EMPIRICAL MODEL EVALUATION & BENCHMARKS

### 4.1 Chronological Time-Series Price Prediction (Regression)
*Chronological Split: Training (2021–2024: 50,648 rows) | Testing (2025–2026: 15,496 rows)*

| Model Architecture | Paradigm | MAE (₹/qtl) | RMSE (₹/qtl) | $R^2$ Score | MAPE (%) |
|---|---|---:|---:|---:|---:|
| Linear Regression | Baseline | ₹1,480.20 | ₹4,210.50 | 0.8920 | 14.20% |
| Gradient Boosting | Sequential Boosting | ₹1,101.34 | ₹3,628.87 | 0.9879 | 9.47% |
| XGBoost Regressor | Extreme Gradient Boosting | ₹1,097.23 | ₹3,646.98 | 0.9878 | 9.38% |
| Extra Trees Regressor | Bagging (Extremely Randomized) | ₹1,107.06 | ₹3,618.10 | 0.9880 | 9.18% |
| Random Forest Regressor | Bagging | ₹1,101.06 | ₹3,608.14 | 0.9880 | 9.26% |
| Voting Regressor (RF + ET + XGB) | Weighted Averaging | ₹1,089.91 | ₹3,604.40 | 0.9881 | **9.22%** |
| **Stacking Regressor (Ridge Meta-Learner)** | **Meta-Stacking** | **₹1,094.35** | **₹3,335.03** | **0.9898** | **9.81%** |

### 4.2 Sell / Delay Decision Support (Classification)
*Model: Soft-Voting Ensemble Classifier (Gradient Boosting + Random Forest + Extra Trees)*

* **Classification Accuracy:** **72.82%**
* **Weighted Precision:** **0.7254**
* **Weighted Recall:** **0.7282**
* **Weighted F1-Score:** **0.6832**
* **Confusion Matrix:** `[[515, 1418, 1364], [95, 5312, 578], [114, 643, 5457]]` *(MONITOR, SELL, WAIT)*

---

## 📓 5. JUPYTER NOTEBOOKS INCLUDED

All 8 mandatory notebooks are located in `notebooks/` with comprehensive markdown documentation, code, output charts, and conclusions:
1. `01_data_collection.ipynb`: Official data provenance, AGMARKNET URLs, schema, district distribution.
2. `02_data_cleaning_preprocessing.ipynb`: Missing value imputation, date parsing, physical sanity checks.
3. `03_exploratory_data_analysis.ipynb`: Commodity price cycles, arrival vs price inverse elasticity, vegetable spikes.
4. `04_price_feature_engineering.ipynb`: Zero-leakage temporal, lag, rolling window, and momentum features.
5. `05_price_prediction_models.ipynb`: Chronological train/test split, ensemble model comparison, test benchmarks.
6. `06_crop_recommendation.ipynb`: Soil suitability classifier, crop rotation heuristics, top-5 ranking.
7. `07_sell_delay_prediction.ipynb`: 3-class decision support model, confusion matrix, precision/recall analysis.
8. `08_model_evaluation.ipynb`: Final academic verification and viva benchmark report.

---

## 💻 6. HOW TO RUN ON LOCALHOST

### Step 1: Clone and Set Up Python Environment
```bash
# Clone repository
git clone https://github.com/your-repo/krishimitra.git
cd krishimitra

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

### Step 2: Initialize Database & Run Backend
```bash
# Verify or train models (pre-trained artifacts are included)
python ml/train_price_models.py

# Launch FastAPI backend server
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
* **Backend API:** `http://127.0.0.1:8000`
* **Interactive Swagger UI:** `http://127.0.0.1:8000/docs`

### Step 3: Run the React Frontend Application
Open a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
* **Frontend Web App:** `http://127.0.0.1:5173`

### Step 4: Test Credentials
* **Demo Farmer:** Mobile: `9845012345` | Password: `farmer123`
* **Demo Administrator:** Mobile: `9876543210` | Password: `admin123`

---

## 🚀 7. HOW TO DEPLOY THIS PLATFORM

### Method A: Docker & Docker Compose (Recommended for Production)
```bash
# Build and run backend & frontend containers
docker-compose up --build -d

# Check status
docker-compose ps
```
* Access frontend at `http://localhost:5173` and backend at `http://localhost:8000`.

### Method B: Deploy to Cloud (Render + Vercel)
1. **Backend on Render:**
   * Create a **Web Service** pointing to the repository.
   * Runtime: Python 3
   * Build Command: `pip install -r requirements.txt`
   * Start Command: `python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port $PORT`
2. **Frontend on Vercel:**
   * Point Vercel to the `frontend/` folder.
   * Framework: Vite
   * Set `API_BASE` in `frontend/src/services/api.ts` to your deployed Render URL.

---

## 📂 8. PROJECT DIRECTORY STRUCTURE

```text
KrishiMitra/
│
├── backend/
│   ├── app/
│   │   ├── api/          # REST route controllers (auth, crops, markets, prices, predict, etc.)
│   │   ├── core/         # Config and native bcrypt security
│   │   ├── db/           # SQLAlchemy session and engine
│   │   ├── models/       # Relational database schemas
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── services/     # ML inference, weather, SMS gateway, DB seeder
│   ├── Dockerfile
│   └── main.py           # FastAPI entrypoint
│
├── frontend/
│   ├── public/crops/     # Botanical crop artwork cards (52 crops)
│   ├── src/
│   │   ├── components/   # Navbar, MarketPrices, Forecast, CropRec, SellDelay, Alerts, Admin
│   │   ├── context/      # LanguageContext (EN/KN), AuthContext
│   │   ├── services/     # API fetch client
│   │   ├── types.ts      # TypeScript interfaces
│   │   ├── App.tsx       # Root view router
│   │   └── index.css     # Agricultural design system
│   ├── Dockerfile
│   └── nginx.conf
│
├── data/
│   ├── raw/              # Immutable raw AGMARKNET records & crop catalog
│   ├── interim/          # Cleaned market prices
│   ├── processed/        # Feature-engineered time series
│   └── external/         # Agrometeorological normals
│
├── models/               # Saved Stacking & Voting ensemble models (.pkl) & metrics
├── ml/                   # Training pipelines and dataset generation scripts
├── notebooks/            # 8 fully documented Jupyter notebooks (01 to 08)
├── tests/                # Pytest integration & endpoint test suite
├── docs/                 # Academic AIML project report & deployment guide
├── .env.example
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## ⚖️ 9. SCIENTIFIC DISCLAIMER

KrishiMitra is designed as an agricultural decision-support tool. Modal market prices and short-term trends are probabilistic estimates derived from historical government data and mathematical ensemble models. They do not constitute guaranteed financial quotes. Real spot market transactions are subject to immediate mandi arrivals, grade quality variations, and weather conditions.
