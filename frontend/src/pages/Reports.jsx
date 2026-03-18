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
      <div className="page-header mb-4">
        <h1 className="h3">Reports</h1>
        <p className="text-muted">Insights and analytics for your payroll</p>
      </div>

      <div className="page-body">
        {/* Charts Row */}
        <div className="row g-4 mb-4">
          {/* Bar Chart Card */}
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm h-100">
              <h2 className="section-title h6 mb-4">Payroll Expenses</h2>
              <div className="bar-chart d-flex align-items-end gap-2" style={{ height: '220px' }}>
                {barData.map((d, i) => (
                  <div className="flex-grow-1 d-flex flex-column align-items-center" key={i}>
                    <div
                      className="bar-chart__bar w-100 rounded-top"
                      style={{ 
                        height: `${(d.value / maxBar) * 100}%`,
                        background: 'linear-gradient(to top, var(--accent), #6a92e8)'
                      }}
                      title={`${d.label}: ₱${d.value.toLocaleString()}`}
                    />
                    <span className="small text-muted mt-2" style={{ fontSize: '10px' }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie Chart Card */}
          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm h-100">
              <h2 className="section-title h6 mb-4">Department Cost</h2>
              <div
                className="pie-chart mx-auto"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    #4a77d4 0% 35%,
                    #10b981 35% 60%,
                    #f59e0b 60% 80%,
                    #ef4444 80% 100%
                  )`,
                }}
              />
              <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                {[
                  { label: 'Engineering', color: '#4a77d4' },
                  { label: 'Marketing', color: '#10b981' },
                  { label: 'HR', color: '#f59e0b' },
                  { label: 'Finance', color: '#ef4444' },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 small">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                    <span className="text-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
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
                    {monthlyReport.map((row, i) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{row.month}</td>
                        <td className="text-secondary">{row.total}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${statusClass[row.status] || 'bg-light text-dark'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="text-end fw-bold">{row.taxes}</td>
                      </tr>
                    ))}
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
