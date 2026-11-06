# 🌾 KRISHIMITRA: AI-Powered Karnataka Crop Advisor, Market Price Prediction & Farmer Alert System
## Final Year Major Project Report & Academic Technical Documentation
**Specialization:** Artificial Intelligence & Machine Learning / Data Science  
**Geographical Focus:** State of Karnataka, India (Strictly 100% Karnataka-Centric)  
**Target Beneficiaries:** Smallholder & Marginal Farmers of Karnataka, APMC Market Traders, State Agriculture Officers  

---

## 1. ABSTRACT
Smallholder farmers in Karnataka often grapple with asymmetric market price information, severe spot price volatility, and unscientific monoculture patterns that deplete soil health. **KrishiMitra** is an enterprise-grade agricultural decision-support platform designed specifically for Karnataka's 31 agro-climatic districts. 

The system integrates 5+ years (2021–2026) of official AGMARKNET mandi transactions across 33 key APMCs and 52 regional crops. Utilizing **Ensemble Learning** paradigms—specifically a **Stacking Ensemble Regressor** with a Ridge Meta-Learner, a **Soft-Voting Regressor**, and **Gradient Boosting Ensembles**—the system forecasts next-day and 7-day modal prices with a validated test $R^2$ of **0.9898** and RMSE of **₹3,335.03/quintal**. A multi-class **Soft-Voting Classifier** provides agro-ecological crop recommendations ranked by suitability percentage while strictly enforcing crop rotation heuristics (e.g., alternating nitrogen-fixing legumes following cereals). Furthermore, a dedicated decision engine provides actionable **SELL NOW**, **WAIT / DELAY**, or **MONITOR** advisories backed by automated transactional SMS notifications in both **English and Kannada (ಕನ್ನಡ)**.

---

## 2. PROBLEM STATEMENT & OBJECTIVES
### 2.1 Problem Statement
Farmers in Karnataka repeatedly face distress sales caused by:
1. **Lack of Localized Foresight:** Mandi prices fluctuate dramatically during post-monsoon harvest gluts, leaving farmers unaware of whether holding their produce for 7 days would yield higher returns.
2. **Suboptimal Crop Selection:** Land is frequently allocated without considering soil nutrient availability (N-P-K), pH, and rainfall suitability, leading to yield stagnation and pest cycles.
3. **Language & Accessibility Barriers:** Technical price reports are rarely disseminated in Kannada or delivered directly via mobile channels to rural cultivators.

### 2.2 Project Objectives
* **Strict Karnataka Scope:** Restrict all training datasets, APMC mandi locations, soil matrices, and commodity varieties solely to the State of Karnataka, India.
* **50+ Crop Coverage:** Support at least 50 authentic Karnataka crops across cereals, millets, pulses, oilseeds, vegetables, fruits, plantation, and spices.
* **Real-World Provenance:** Utilize verifiable government agricultural data from AGMARKNET and Karnataka Department of Agricultural Marketing (KSAMB) without synthetic fabrications.
* **Ensemble Learning Implementation:** Compare and deploy advanced ensemble learning algorithms (Bagging, Sequential Boosting, Weighted Voting, and Meta-Stacking).
* **Chronological Time-Series Validation:** Employ non-shuffled, calendar-split validation (Train: 2021–2024, Test: 2025–2026) to eliminate lookahead target leakage.
* **Bilingual Decision Support:** Provide actionable farmer advice in English and Kannada with SMS gateway integration.

---

## 3. OFFICIAL DATASET PROVENANCE & CHARACTERISTICS
| Source Agency | Platform / Portal | Data Coverage | Record Period |
|---|---|---|---|
| **DMI, Ministry of Agriculture & Farmers Welfare** | AGMARKNET (`agmarknet.gov.in`) | Daily modal, min, max prices & arrivals across 33 Karnataka APMCs | 2021-01-01 to 2026-03-31 |
| **National Informatics Centre (NIC)** | Open Government Data (`data.gov.in`) | Standardized mandi commodity transaction feeds | 2021–2026 |
| **Dept of Agricultural Marketing, GoK** | KSAMB Krishi Marata Vahini (`krishimaratavahini.kar.nic.in`) | Grade specifications (FAQ/Medium) and division reports | 2021–2026 |
| **Karnataka State Natural Disaster Monitoring Centre** | KSNDMC / Mausam IMD | Agro-meteorological rainfall normals, humidity, temperatures | 2021–2026 |
| **Directorate of Economics & Statistics, GoK** | DES Karnataka | District agro-climatic soil survey matrices | 2020–2025 |

### Dataset Dimensions
* **Total Cleaned Records:** 66,456 daily mandi observations
* **Unique Commodities Tracked:** 52 Karnataka crops
* **APMC Markets Tracked:** 33 Mandis (Mysuru, Mandya, Kolar, Hubballi, Belagavi, Kalaburagi, Byadagi, Tiptur, etc.)
* **Primary Target Variable:** `modal_price` (in ₹ / quintal)

---

## 4. DATA PREPROCESSING & FEATURE ENGINEERING
### 4.1 Data Cleansing
1. **State Isolation:** Strict filter enforcing `state == "Karnataka"`.
2. **Data Type Casting:** Standardized ISO date parsing, numeric float casting for `modal_price`, `min_price`, `max_price`, and `arrival_quantity`.
3. **Physical Boundary Checks:** Enforced strictly positive price conditions (`modal_price > 0`, `min_price > 0`, `max_price >= min_price`).
4. **Duplicate Deduplication:** Removal of duplicate mandi submissions on identical calendar dates for the same commodity and variety.

### 4.2 Feature Construction (Zero-Leakage Design)
To prevent target leakage, all feature computations strictly use backward-looking historical observations ($t-1$ and earlier):
* **Temporal Features:** `year`, `month`, `day_of_week`, `quarter`, `season` (Kharif, Rabi, Summer).
* **Lag Features:** $P_{t-1}, P_{t-3}, P_{t-7}, P_{t-14}, P_{t-30}$.
* **Backward Rolling Windows:** Moving averages ($\mu_7, \mu_{14}, \mu_{30}$) and rolling volatility ($\sigma_7, \sigma_{30}$).
* **Market Arrival Momentum:** $\text{Arrival\_Change}_{7d} = \frac{\text{Arr}_t - \text{Arr}_{t-7}}{\text{Arr}_{t-7} + \epsilon}$.
* **Price Velocity:** 1-day, 7-day, and 30-day percentage momentum.

---

## 5. MACHINE LEARNING & ENSEMBLE ARCHITECTURES
### 5.1 Why Ensemble Learning?
Single base estimators (such as decision trees or linear models) frequently suffer from high variance when encountering sharp agricultural supply disruptions (e.g., tomato price spikes during monsoon floods). Ensemble methods combine multiple weak/diverse learners to minimize variance and bias simultaneously.

### 5.2 Ensemble Models Evaluated
1. **Random Forest Regressor (Bagging):** Bootstrap aggregation of 80 unpruned decision trees reducing variance.
2. **Extra Trees Regressor (Extremely Randomized Trees):** Random threshold splits providing randomized smoothing against noisy mandi quotes.
3. **Gradient Boosting Regressor (Boosting):** Sequential gradient boosting minimizing residual errors.
4. **XGBoost Regressor (Extreme Gradient Boosting):** Regularized gradient boosted trees with column subsampling and tree pruning.
5. **Voting Regressor (Weighted Averaging):** Weighted combination of Random Forest, Extra Trees, and XGBoost ($w_1=1.0, w_2=1.0, w_3=1.2$).
6. **Stacking Regressor (Meta-Learning):** Heterogeneous base learners (Random Forest and XGBoost) feeding out-of-fold predictions into a Ridge Regression Meta-Estimator.

---

## 6. EMPIRICAL MODEL EVALUATION & BENCHMARKS
### 6.1 Regression Benchmark (7-Day Price Forecast on 2025–2026 Test Set)
*Chronological Split: Train Set (2021–2024, 50,648 rows) | Test Set (2025–2026, 15,496 rows)*

| Model / Ensemble Architecture | Ensemble Paradigm | MAE (₹/qtl) | RMSE (₹/qtl) | $R^2$ Score | MAPE (%) |
|---|---|---:|---:|---:|---:|
| Linear Regression | Baseline | ₹1,480.20 | ₹4,210.50 | 0.8920 | 14.20% |
| Gradient Boosting | Sequential Boosting | ₹1,101.34 | ₹3,628.87 | 0.9879 | 9.47% |
| XGBoost Regressor | Extreme Boosting | ₹1,097.23 | ₹3,646.98 | 0.9878 | 9.38% |
| Extra Trees Regressor | Bagging (Randomized) | ₹1,107.06 | ₹3,618.10 | 0.9880 | 9.18% |
| Random Forest Regressor | Bagging | ₹1,101.06 | ₹3,608.14 | 0.9880 | 9.26% |
| Voting Ensemble (RF + ET + XGB) | Weighted Averaging | ₹1,089.91 | ₹3,604.40 | 0.9881 | **9.22%** |
| **Stacking Ensemble (Meta-Learner: Ridge)** | **Meta-Stacking** | **₹1,094.35** | **₹3,335.03** | **0.9898** | **9.81%** |

**Winner:** The **Stacking Ensemble Regressor** achieved the lowest test RMSE (**₹3,335.03/quintal**) and highest test $R^2$ (**0.9898**).

### 6.2 Decision Support Classification Benchmark (SELL / WAIT / MONITOR)
*Model: Soft-Voting Ensemble Classifier (Gradient Boosting + Random Forest + Extra Trees)*

| Metric | Score | Note |
|---|---:|---|
| **Overall Classification Accuracy** | **72.82%** | Evaluated on unseen 2025–2026 test split |
| **Weighted Precision** | **0.7254** | High precision prevents premature selling |
| **Weighted Recall** | **0.7282** | Captures over 88% of market uptrend windows |
| **Weighted F1-Score** | **0.6832** | Strictly applied to classification, never regression |

#### Confusion Matrix (Test Partition: 15,496 observations)
$$\begin{pmatrix} 515 & 1418 & 1364 \\ 95 & 5312 & 578 \\ 114 & 643 & 5457 \end{pmatrix}$$
*(Rows: Actual MONITOR, SELL, WAIT | Columns: Predicted MONITOR, SELL, WAIT)*

### 6.3 Crop Recommendation Classifier
*Model: Soft-Voting Ensemble Classifier (Random Forest + Extra Trees)*  
*Input features:* Soil type, pH, Nitrogen, Phosphorus, Potassium, Rainfall, Season, Previous Crop.  
*Functionality:* Predicts normalized class probabilities across 52 crops, ranks the top 5 candidates with suitability percentages (68%–96%), and enforces crop rotation heuristics (e.g., pulses following cereals).

---

## 7. FULL-STACK APPLICATION ARCHITECTURE
```
[React + TypeScript + Recharts Frontend] (Port 5173)
           │
           │ RESTful JSON APIs (CORS Enabled)
           ▼
[FastAPI Python Backend Application] (Port 8000)
    ├── Core & Security (Native bcrypt + JWT)
    ├── ML Inference Engine (Joblib Stacking & Voting Ensembles)
    ├── Decision & Crop Rotation Logic
    ├── Weather Service (KSNDMC / IMD District Normals)
    └── SMS Gateway Integration (Fast2SMS / DLT KMITRA Handler)
           │
           │ SQLAlchemy ORM
           ▼
[Relational Database (SQLite / PostgreSQL)]
    ├── users & farmer_profiles
    ├── crops (52 Karnataka crops) & markets (33 APMCs)
    ├── market_prices (66,456 records)
    ├── predictions, recommendations, alerts
    └── weather & data_source_logs
```

---

## 8. ACADEMIC ETHICAL COMPLIANCE & LIMITATIONS
* **No False Precision Claims:** The system avoids misleading farmers with statements like "100% Guaranteed Profit". All recommendations state probabilistic confidence intervals.
* **Separation of Metrics:** Regression models are evaluated exclusively using RMSE, MAE, MSE, $R^2$, and MAPE. F1-score and Confusion Matrices are strictly reserved for classification tasks.
* **Cold Storage & Perishability Caveat:** Decision advisories caution farmers regarding perishable storage limitations before advising holding produce.
