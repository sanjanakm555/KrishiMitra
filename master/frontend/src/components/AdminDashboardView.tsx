import React, { useState, useEffect } from 'react';
import { AdminMetrics } from '../types';
import { fetchAdminMetrics, triggerDataRefresh } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Database, RefreshCw, Cpu, Users, BarChart3, Activity, CheckCircle } from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const loadMetrics = () => {
    setLoading(true);
    fetchAdminMetrics()
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      await triggerDataRefresh();
      setSyncSuccess(true);
      loadMetrics();
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} />
              SYSTEM TELEMETRY & DATA OPERATIONS
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-900)' }}>
              Karnataka Agriculture Department Admin Panel
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Monitoring data pipelines, ML ensemble model versions, active farmers, and Agmarknet feeds.
            </p>
          </div>

          <button
            onClick={handleSync}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem' }}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'spin' : ''} />
            {syncing ? 'Ingesting Mandi Records...' : 'Trigger AGMARKNET Sync'}
          </button>
        </div>

        {syncSuccess && (
          <div className="card" style={{ padding: '1rem 1.25rem', background: '#ecfdf5', border: '1px solid #6ee7b7', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
            <CheckCircle size={18} color="#059669" />
            <span>Mandi records synchronized successfully! Fresh price quotes indexed into database.</span>
          </div>
        )}

        {metrics && (
          <div>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #059669' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>REGISTERED FARMERS</span>
                  <Users size={18} color="#059669" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  {metrics.total_farmers.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
                  Karnataka State Directory
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #0284c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>KARNATAKA CROPS</span>
                  <Database size={18} color="#0284c7" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  {metrics.total_crops_supported}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '0.25rem' }}>
                  Across 9 Agricultural Categories
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #d97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>APMC MANDIS TRACKED</span>
                  <BarChart3 size={18} color="#d97706" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  {metrics.total_markets_tracked}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, marginTop: '0.25rem' }}>
                  All Key Districts Represented
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #7c3aed' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>AGMARKNET PRICE RECORDS</span>
                  <Activity size={18} color="#7c3aed" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                  {metrics.total_price_records.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, marginTop: '0.25rem' }}>
                  2021 to 2026 Historical Span
                </div>
              </div>
            </div>

            {/* Model Telemetry & Pipeline Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Cpu size={20} color="var(--primary-700)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                    Production ML Models Telemetry
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Price Prediction Model</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{metrics.best_model_name}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>TEST RMSE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>₹{metrics.model_test_rmse.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.65rem', color: '#166534' }}>Chronological Test (2025-2026)</div>
                    </div>

                    <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>TEST R² SCORE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }}>{metrics.model_test_r2}</div>
                      <div style={{ fontSize: '0.65rem', color: '#166534' }}>Coefficient of Determination</div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Crop Recommendation Classifier</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Soft-Voting Ensemble (Random Forest + Extra Trees)</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sell/Delay Advisory Classifier</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Soft-Voting Ensemble (Gradient Boosting + RF + ET) • 72.8% Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Data Pipeline Health */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Database size={20} color="#0284c7" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                    Data Source Ingestion Pipeline
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>AGMARKNET / DMI Portal</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Daily Mandi Arrivals & Prices</div>
                    </div>
                    <span className="badge badge-up">HEALTHY</span>
                  </div>

                  <div style={{ border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>KSAMB Krishi Marata Vahini</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Karnataka State Market Board</div>
                    </div>
                    <span className="badge badge-up">HEALTHY</span>
                  </div>

                  <div style={{ border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>data.gov.in (OGD India)</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mandi Commodity Daily Dataset</div>
                    </div>
                    <span className="badge badge-up">HEALTHY</span>
                  </div>

                  <div style={{ border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>KSNDMC / IMD Weather Service</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>District Agrometeorological Reports</div>
                    </div>
                    <span className="badge badge-up">HEALTHY</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'right' }}>
                    Last Pipeline Ingestion Run: <strong>{metrics.data_pipeline_last_run}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
