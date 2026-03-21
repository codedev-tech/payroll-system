import { useEffect, useMemo, useState } from 'react';
import { analyticsApi, extractData, payrollSettingsApi } from '../api';
import '../styles/pages/payroll.css';

export default function Payroll() {
  const [statsPayload, setStatsPayload] = useState(null);
  const [recentPayroll, setRecentPayroll] = useState([]);
  const [settings, setSettings] = useState({ tax_rate: 0.08, philhealth_rate: 0.03 });
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currency = (value) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  useEffect(() => {
    let isMounted = true;

    const loadPayroll = async () => {
      try {
        setLoading(true);
        setError('');

        const [payrollResponse, settingsResponse] = await Promise.all([
          analyticsApi.payroll(),
          payrollSettingsApi.get(),
        ]);
        const data = extractData(payrollResponse);
        const settingsData = extractData(settingsResponse);

        if (isMounted) {
          setStatsPayload(data?.stats || null);
          setRecentPayroll(Array.isArray(data?.recent_payroll) ? data.recent_payroll : []);
          setSettings({
            tax_rate: Number(settingsData?.tax_rate ?? 0.08),
            philhealth_rate: Number(settingsData?.philhealth_rate ?? 0.03),
          });
        }
      } catch {
        if (isMounted) {
          setError('Unable to load payroll analytics.');
          setStatsPayload(null);
          setRecentPayroll([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPayroll();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRateField = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveRates = async (event) => {
    event.preventDefault();

    try {
      setSavingSettings(true);
      await payrollSettingsApi.update({
        tax_rate: Number(settings.tax_rate),
        philhealth_rate: Number(settings.philhealth_rate),
      });
    } catch {
      setError('Unable to save payroll rates.');
    } finally {
      setSavingSettings(false);
    }
  };

  const stats = useMemo(() => [
    { label: 'Total Salary', value: currency(statsPayload?.gross_pay ?? 0), color: '', icon: <i className="bi bi-graph-up-arrow"></i> },
    { label: 'Deduction', value: currency(statsPayload?.deduction ?? 0), color: 'danger', icon: <i className="bi bi-graph-down-arrow"></i> },
    { label: 'Net Pay', value: currency(statsPayload?.net_pay ?? 0), color: 'success', icon: <i className="bi bi-wallet2"></i> },
  ], [statsPayload]);

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Run Payroll</h1>
        <p className="text-muted">Process and manage employee payroll</p>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}
      
      <div className="page-body">
        <div className="card border-0 shadow-sm mb-4">
          <h2 className="h6 mb-3">Payroll Rates (HR/Admin)</h2>
          <form className="row g-3 align-items-end" onSubmit={saveRates}>
            <div className="col-md-4">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="form-control"
                name="tax_rate"
                value={Number(settings.tax_rate || 0) * 100}
                onChange={(event) => handleRateField({
                  target: {
                    name: 'tax_rate',
                    value: Number(event.target.value || 0) / 100,
                  },
                })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">PhilHealth Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="form-control"
                name="philhealth_rate"
                value={Number(settings.philhealth_rate || 0) * 100}
                onChange={(event) => handleRateField({
                  target: {
                    name: 'philhealth_rate',
                    value: Number(event.target.value || 0) / 100,
                  },
                })}
              />
            </div>
            <div className="col-md-4 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? 'Saving...' : 'Save Rates'}
              </button>
            </div>
          </form>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-4">
          {stats.map((stat, i) => (
            <div className="col-12 col-md-4" key={i}>
              <div className="stat-card card--clickable h-100 border-0 shadow-sm">
                <div className="stat-card__info">
                  <span className="stat-card__label text-uppercase small text-muted">{stat.label}</span>
                  <span className={`stat-card__value h2 mb-0 ${stat.color ? `text-${stat.color}` : 'text-primary'}`}>
                    {stat.value}
                  </span>
                </div>
                <div className={`stat-card__icon stat-card__icon--${stat.color === 'danger' ? 'red' : stat.color === 'success' ? 'green' : 'blue'} rounded-3 p-3`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Card */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <h2 className="section-title h5 mb-4">Recent Payroll Activity</h2>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3">Employee</th>
                      <th className="border-0 py-3">Gross Pay</th>
                      <th className="border-0 py-3">Deduction</th>
                      <th className="border-0 py-3 text-end">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">Loading payroll...</td>
                      </tr>
                    )}
                    {!loading && recentPayroll.map((item, i) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{item.employee}</td>
                        <td className="text-secondary">{currency(item.gross_pay)}</td>
                        <td className="text-secondary">{currency(item.deduction)}</td>
                        <td className="fw-bold text-end text-primary">{currency(item.net_pay)}</td>
                      </tr>
                    ))}
                    {!loading && recentPayroll.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">No payroll records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
