import { useEffect, useMemo, useState } from 'react';
import { analyticsApi, extractData } from '../api';
import '../styles/pages/reports.css';

const statusClass = {
  Paid: 'badge--paid',
  Pending: 'badge--pending',
};

export default function Reports() {
  const [barData, setBarData] = useState([]);
  const [departmentCost, setDepartmentCost] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [hoveredDepartmentIndex, setHoveredDepartmentIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await analyticsApi.reports();
        const data = extractData(response);

        if (isMounted) {
          setBarData(Array.isArray(data?.payroll_expenses) ? data.payroll_expenses : []);
          setDepartmentCost(Array.isArray(data?.department_cost) ? data.department_cost : []);
          setMonthlyReport(Array.isArray(data?.monthly_report) ? data.monthly_report : []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load reports analytics.');
          setBarData([]);
          setDepartmentCost([]);
          setMonthlyReport([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const maxBar = useMemo(() => Math.max(1, ...barData.map((item) => Number(item.value || 0))), [barData]);
  const yAxisTicks = useMemo(() => {
    const maxRounded = Math.ceil(maxBar / 1000) * 1000;
    const step = Math.max(200, Math.floor(maxRounded / 10));
    const ticks = [];
    for (let value = maxRounded; value >= 0; value -= step) {
      ticks.push(value);
    }
    return ticks;
  }, [maxBar]);

  const currency = (value) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  const pieColors = ['#4a77d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const totalDepartmentCost = departmentCost.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const pieSegments = departmentCost.map((item, index) => {
    const previousTotal = departmentCost
      .slice(0, index)
      .reduce((sum, row) => sum + Number(row.value || 0), 0);
    const startPercent = totalDepartmentCost > 0 ? (previousTotal / totalDepartmentCost) * 100 : 0;
    const endPercent = totalDepartmentCost > 0 ? ((previousTotal + Number(item.value || 0)) / totalDepartmentCost) * 100 : 0;
    return `${pieColors[index % pieColors.length]} ${startPercent}% ${endPercent}%`;
  });
  const pieBackground = pieSegments.length > 0
    ? `conic-gradient(${pieSegments.join(',')})`
    : 'conic-gradient(#334155 0% 100%)';

  const hoveredDepartment = hoveredDepartmentIndex !== null
    ? departmentCost[hoveredDepartmentIndex]
    : null;

  const pieHoverTitle = departmentCost.length > 0
    ? departmentCost.map((item) => `${item.label}: ${currency(item.value)}`).join('\n')
    : 'No department cost data.';

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Reports</h1>
        <p className="text-muted">Insights and analytics for your payroll</p>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="page-body">
        {/* Charts Row */}
        <div className="row g-4 mb-4">
          {/* Bar Chart Card */}
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm h-100">
              <h2 className="section-title h6 mb-4">Payroll Expenses</h2>
              <div className="payroll-expenses-chart" role="img" aria-label="Payroll expenses by month">
                <div className="payroll-expenses-chart__y-axis">
                  <span className="payroll-expenses-chart__y-title">Number of issues identified</span>
                  <div className="payroll-expenses-chart__ticks">
                    {yAxisTicks.map((tick) => (
                      <span key={tick}>{tick}</span>
                    ))}
                  </div>
                </div>

                <div className="payroll-expenses-chart__plot-area">
                  <div className="bar-chart" style={{ height: '220px' }}>
                    {barData.map((d, i) => (
                      <div className="bar-chart__column" key={i}>
                        <div
                          className="bar-chart__bar"
                          style={{
                            height: `${(Number(d.value || 0) / maxBar) * 100}%`,
                            '--bar-delay': `${i * 80}ms`,
                          }}
                          title={`${d.label}: ₱${Number(d.value || 0).toLocaleString()}`}
                        />
                        <span className="bar-chart__month">{d.label}</span>
                      </div>
                    ))}
                    {loading && <div className="small text-muted">Loading chart...</div>}
                    {!loading && barData.length === 0 && <div className="small text-muted">No chart data available.</div>}
                  </div>
                  <div className="payroll-expenses-chart__x-title">Months of the year</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm h-100">
              <h2 className="section-title h6 mb-4">Department Cost</h2>
              <div
                className="pie-chart pie-chart--animate mx-auto"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: pieBackground,
                }}
                title={pieHoverTitle}
              />
              <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                {departmentCost.map((item, i) => (
                  <div
                    key={i}
                    className="d-flex align-items-center gap-2 small"
                    style={{ cursor: 'default' }}
                    title={`${item.label}: ${currency(item.value)}`}
                    onMouseEnter={() => setHoveredDepartmentIndex(i)}
                    onMouseLeave={() => setHoveredDepartmentIndex(null)}
                  >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pieColors[i % pieColors.length] }} />
                    <span className="text-secondary">{item.label}</span>
                  </div>
                ))}
                {!loading && departmentCost.length === 0 && <span className="text-muted small">No department cost data.</span>}
              </div>
              {!loading && departmentCost.length > 0 && (
                <div className="text-center small text-muted mt-2">
                  {hoveredDepartment
                    ? `${hoveredDepartment.label}: ${currency(hoveredDepartment.value)}`
                    : 'Hover a legend item to see total cost.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Payroll Report Table */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <h2 className="section-title h6 mb-4">Monthly Payroll Report</h2>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3">Month</th>
                      <th className="border-0 py-3">Total Payroll</th>
                      <th className="border-0 py-3 text-center">
                        Status
                        <i className="bi bi-chevron-down ms-1 small opacity-50"></i>
                      </th>
                      <th className="border-0 py-3 text-end">Taxes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">Loading report...</td>
                      </tr>
                    )}
                    {!loading && monthlyReport.map((row, i) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{row.month}</td>
                        <td className="text-secondary">{currency(row.total_payroll)}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${statusClass[row.status] || 'bg-light text-dark'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="text-end fw-bold">{currency(row.taxes)}</td>
                      </tr>
                    ))}
                    {!loading && monthlyReport.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">No monthly payroll report available.</td>
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
