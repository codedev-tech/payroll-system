export default function Dashboard() {
  const stats = [
    { label: 'Total Employees', value: '156', icon: '👥', color: 'blue' },
    { label: 'Total Payroll', value: '₱2,450,000', icon: '💰', color: 'green' },
    { label: 'Pending Payroll', value: '₱380,000', icon: '⏳', color: 'orange' },
    { label: 'Active Employees', value: '142', icon: '✓', color: 'green' },
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
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your payroll overview.</p>
      </div>
      <div className="page-body">
        <div className="stat-cards">
          {stats.map((stat, i) => (
            <div className="stat-card card--clickable" key={i}>
              <div className="stat-card__info">
                <span className="stat-card__label">{stat.label}</span>
                <span className="stat-card__value">{stat.value}</span>
              </div>
              <div className={`stat-card__icon stat-card__icon--${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Recent Activity</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Action</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{item.employee}</td>
                  <td>{item.action}</td>
                  <td>{item.date}</td>
                  <td style={{ fontWeight: 600 }}>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
