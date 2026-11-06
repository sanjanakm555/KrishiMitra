# 🚀 KrishiMitra Deployment & Operational Manual

This guide provides instructions to run **KrishiMitra** locally on your machine, deploy via Docker containers, or deploy to production cloud providers (Render, Railway, Vercel, AWS EC2).

---

## 📋 System Prerequisites
* **Python:** 3.10 or 3.11+
* **Node.js:** v18, v20, or v22+
* **npm:** 9+
* **Git**
* *(Optional for Containers)* **Docker & Docker Compose**

---

## 💻 1. HOW TO RUN ON LOCALHOST

### Step 1: Clone or Open the Repository
```bash
cd c:/Users/Administrator/Desktop/master
```

### Step 2: Set Up Python Backend Environment
1. Create and activate a virtual environment (recommended):
   ```powershell
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install all backend and ML dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy the environment configuration:
   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

### Step 3: Train / Verify Machine Learning Models (Optional)
Pre-trained models and datasets are already generated and saved in `models/` and `data/`. If you want to re-train the models from scratch:
```bash
# Ingest and clean raw Agmarknet records
python ml/generate_datasets.py
python ml/preprocessing.py
python ml/feature_engineering.py

# Train Ensemble Learning Models
python ml/train_price_models.py
python ml/train_crop_recommender.py
python ml/train_sell_delay.py
```

### Step 4: Run the Backend API Server
```bash
# Run FastAPI via Uvicorn
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
* Backend API will be available at: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**
* ReDoc API Documentation: **http://127.0.0.1:8000/redoc**

### Step 5: Set Up and Run the Frontend Web Application
Open a second terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
* Frontend Web App will be available at: **http://127.0.0.1:5173**

### Step 6: Log In with Demo Credentials
* **Demo Farmer:**
  - Mobile: `9845012345`
  - Password: `farmer123`
* **Demo Administrator:**
  - Mobile: `9876543210`
  - Password: `admin123`

---

## 🐳 2. HOW TO RUN WITH DOCKER & DOCKER COMPOSE

Run the full-stack system in isolated containers with a single command:

```bash
# Build and run containers
docker-compose up --build -d

# View status
docker-compose ps

# View backend logs
docker-compose logs -f backend
```
* **Frontend Web App:** `http://localhost:5173`
* **Backend API:** `http://localhost:8000`

To stop the containers:
```bash
docker-compose down
```

---

## ☁️ 3. HOW TO DEPLOY TO CLOUD (Render & Vercel)

### Option A: Deploy Backend on Render (Free / Web Service)
1. Push your repository to GitHub or GitLab.
2. In [Render](https://render.com), click **New + -> Web Service**.
3. Select your repository.
4. Configure the service:
   * **Name:** `krishimitra-api`
   * **Runtime:** Python 3
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, set:
   * `SECRET_KEY`: `krishimitra_super_secret_jwt_key_karnataka_2026_aiml`
   * `APP_ENV`: `production`
6. Deploy! Render will provide your public URL (e.g., `https://krishimitra-api.onrender.com`).

### Option B: Deploy Frontend on Vercel
1. In `frontend/src/services/api.ts`, update `API_BASE` to your public Render URL:
   ```typescript
   const API_BASE = 'https://krishimitra-api.onrender.com/api';
   ```
2. In [Vercel](https://vercel.com), click **Add New -> Project**.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Click **Deploy**. Vercel will build and serve your app globally on an HTTPS domain.

---

## 🛡️ 4. ENTERPRISE VM DEPLOYMENT (Ubuntu / AWS EC2)

1. Provision an Ubuntu 22.04 LTS instance with at least 2 GB RAM.
2. Clone repository:
   ```bash
   git clone <repo-url> /opt/krishimitra
   cd /opt/krishimitra
   ```
3. Create Python virtual environment and install packages:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. Create a Systemd service file `/etc/systemd/system/krishimitra.service`:
   ```ini
   [Unit]
   Description=KrishiMitra FastAPI Service
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/opt/krishimitra
   ExecStart=/opt/krishimitra/venv/bin/python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
5. Enable and start service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now krishimitra
   ```
6. Build frontend and configure Nginx reverse proxy:
   ```bash
   cd /opt/krishimitra/frontend
   npm install && npm run build
   sudo cp -r dist/* /var/www/html/
   ```
7. Configure SSL with Certbot:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```
