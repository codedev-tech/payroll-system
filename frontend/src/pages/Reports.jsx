const barData = [
  { label: 'Jan', value: 600 },
  { label: 'Feb', value: 800 },
  { label: 'Mar', value: 950 },
  { label: 'Apr', value: 1200 },
  { label: 'May', value: 1400 },
  { label: 'Jun', value: 1550 },
  { label: 'Jul', value: 1800 },
  { label: 'Aug', value: 1850 },
];

const maxBar = Math.max(...barData.map(d => d.value));

const monthlyReport = [
  { month: 'January',  total: '₱ 123,456', status: 'Paid',    taxes: '₱ 10,289' },
  { month: 'February', total: '₱ 829,456', status: 'Pending', taxes: '₱ 11,289' },
  { month: 'March',    total: '₱ 141,456', status: 'Paid',    taxes: '₱ 13,289' },
  { month: 'April',    total: '₱ 256,780', status: 'Paid',    taxes: '₱ 15,420' },
  { month: 'May',      total: '₱ 198,340', status: 'Pending', taxes: '₱ 12,100' },
];

const statusClass = {
  Paid: 'badge--paid',
  Pending: 'badge--pending',
};

export default function Reports() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Insights and analytics for your payroll</p>
      </div>
      <div className="page-body">
        {/* Charts Row */}
        <div className="chart-container">
          {/* Bar Chart Card */}
          <div className="card">
            <h2 className="section-title">Payroll Expenses</h2>
            <div className="bar-chart">
              {barData.map((d, i) => (
                <div
                  className="bar-chart__bar"
                  key={i}
                  style={{ height: `${(d.value / maxBar) * 100}%` }}
                  title={`${d.label}: ₱${d.value.toLocaleString()}`}
                />
              ))}
            </div>
            <div className="bar-chart__label">
              {barData.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="card">
            <h2 className="section-title">Department Cost</h2>
            <div
              className="pie-chart"
              style={{
                background: `conic-gradient(
                  #4a77d4 0% 35%,
                  #10b981 35% 60%,
                  #f59e0b 60% 80%,
                  #ef4444 80% 100%
                )`,
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '16px',
              flexWrap: 'wrap'
            }}>
              {[
                { label: 'Engineering', color: '#4a77d4' },
                { label: 'Marketing', color: '#10b981' },
                { label: 'HR', color: '#f59e0b' },
                { label: 'Finance', color: '#ef4444' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: item.color,
                  }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Payroll Report Table */}
        <div className="card">
          <h2 className="section-title">Monthly Payroll Report</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Payroll</th>
                <th>Status ▼</th>
                <th>Taxes</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReport.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{row.month}</td>
                  <td>{row.total}</td>
                  <td>
                    <span className={`badge ${statusClass[row.status]}`}>{row.status}</span>
                  </td>
                  <td>{row.taxes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
