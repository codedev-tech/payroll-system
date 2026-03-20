import '../styles/pages/payroll.css';

export default function Payroll() {
  const stats = [
    { label: 'Total Salary', value: '₱123,456', color: '', icon: <i className="bi bi-graph-up-arrow"></i> },
    { label: 'Deduction', value: '₱56,000', color: 'danger', icon: <i className="bi bi-graph-down-arrow"></i> },
    { label: 'Net Pay', value: '₱72,009', color: 'success', icon: <i className="bi bi-wallet2"></i> },
  ];

  const recentPayroll = [
    { employee: 'Juan Dela Cruz',     grossPay: '₱ 6,200', deduction: '₱ 5,000', netPay: '₱ 32,500' },
    { employee: 'Ethel Perez Gannad', grossPay: '₱ 3,000', deduction: '₱ 5,000', netPay: '₱ 62,500' },
    { employee: 'Ferdinand Monde',    grossPay: '₱ 4,500', deduction: '₱ 2,800', netPay: '₱ 35,200' },
    { employee: 'Jerizz Dolosa',      grossPay: '₱ 5,100', deduction: '₱ 3,200', netPay: '₱ 28,400' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Run Payroll</h1>
        <p className="text-muted">Process and manage employee payroll</p>
      </div>
      
      <div className="page-body">
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
                    {recentPayroll.map((item, i) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{item.employee}</td>
                        <td className="text-secondary">{item.grossPay}</td>
                        <td className="text-secondary">{item.deduction}</td>
                        <td className="fw-bold text-end text-primary">{item.netPay}</td>
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
