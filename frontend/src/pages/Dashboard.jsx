export default function Dashboard() {
  const stats = [
    { label: 'Total Employees', value: '156', icon: <i className="bi bi-people"></i>, color: 'blue' },
    { label: 'Total Payroll', value: '₱2,450,000', icon: <i className="bi bi-cash-stack"></i>, color: 'green' },
    { label: 'Pending Payroll', value: '₱380,000', icon: <i className="bi bi-clock-history"></i>, color: 'orange' },
    { label: 'Active Employees', value: '142', icon: <i className="bi bi-check-circle"></i>, color: 'green' },
  ];

  const recentActivity = [
    { employee: 'Juan Dela Cruz', action: 'Payroll processed', date: 'Mar 15, 2026', amount: '₱32,500' },
    { employee: 'Ferdinand Monde', action: 'Salary updated', date: 'Mar 14, 2026', amount: '₱35,000' },
    { employee: 'Jerizz Dolosa', action: 'New hire onboarded', date: 'Mar 13, 2026', amount: '₱28,000' },
    { employee: 'Ethel Perez Gannad', action: 'Bonus issued', date: 'Mar 12, 2026', amount: '₱5,000' },
    { employee: 'Fernandiz Ruwel', action: 'Deduction updated', date: 'Mar 11, 2026', amount: '₱1,500' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Dashboard</h1>
        <p className="text-muted">Welcome back! Here's your payroll overview.</p>
      </div>
      
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
                    {recentActivity.map((item, i) => (
                      <tr key={i}>
                        <td className="fw-medium text-dark">{item.employee}</td>
                        <td className="text-secondary">{item.action}</td>
                        <td className="text-secondary">{item.date}</td>
                        <td className="fw-bold text-end">{item.amount}</td>
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
