import { useEffect, useMemo, useState } from 'react';
import { analyticsApi, extractData } from '../api';
import { getAuthUser } from '../utils/auth';
import '../styles/pages/dashboard.css';

export default function Dashboard() {
  const authUser = getAuthUser();
  const greetingName = authUser?.role === 'admin'
    ? 'Admin'
    : (authUser?.first_name || authUser?.name || 'there');
  const [statsPayload, setStatsPayload] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currency = (value) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await analyticsApi.dashboard();
        const data = extractData(response);

        if (isMounted) {
          setStatsPayload(data?.stats || null);
          setRecentActivity(Array.isArray(data?.recent_activity) ? data.recent_activity : []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load dashboard analytics.');
          setStatsPayload(null);
          setRecentActivity([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return [
      { label: 'Total Employees', value: statsPayload?.total_employees ?? 0, icon: <i className="bi bi-people"></i>, color: 'blue' },
      { label: 'Total Payroll', value: currency(statsPayload?.total_payroll ?? 0), icon: <i className="bi bi-cash-stack"></i>, color: 'green' },
      { label: 'Pending Payroll', value: statsPayload?.pending_payroll ?? 0, icon: <i className="bi bi-clock-history"></i>, color: 'orange' },
      { label: 'Active Employees', value: statsPayload?.active_employees ?? 0, icon: <i className="bi bi-check-circle"></i>, color: 'green' },
    ];
  }, [statsPayload]);

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Dashboard</h1>
        <p className="text-muted">Welcome back <span className="greeting-admin">{greetingName}</span>! Here's your payroll overview.</p>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}
      
      <div className="page-body">
        {/* Stats Row */}
        <div className="row g-4 mb-4">
          {stats.map((stat, i) => (
            <div className="col-12 col-sm-6 col-xl-3" key={i}>
              <div className="stat-card card--clickable h-100 border-0 shadow-sm">
                <div className="stat-card__info">
                  <span className="stat-card__label text-uppercase small text-muted">{stat.label}</span>
                  <span className="stat-card__value h2 mb-0">{stat.value}</span>
                </div>
                <div className={`stat-card__icon stat-card__icon--${stat.color} rounded-3 p-3`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Row */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <h2 className="section-title h5 mb-4">Recent Activity</h2>
              <div className="table-responsive">
                <table className="data-table table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-top-0">Employee</th>
                      <th className="border-top-0">Action</th>
                      <th className="border-top-0">Date</th>
                      <th className="border-top-0 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">Loading analytics...</td>
                      </tr>
                    )}
                    {!loading && recentActivity.map((item, i) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{item.employee}</td>
                        <td className="text-secondary">{item.action}</td>
                        <td className="text-secondary">{item.date}</td>
                        <td className="fw-bold text-end">{currency(item.amount)}</td>
                      </tr>
                    ))}
                    {!loading && recentActivity.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">No recent activity available.</td>
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
