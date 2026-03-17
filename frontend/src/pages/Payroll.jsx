export default function Payroll() {
  const stats = [
    { label: 'Total Salary', value: '₱123,456', color: '', icon: '📊' },
    { label: 'Deduction', value: '₱56,000', color: 'danger', icon: '📉' },
    { label: 'Net Pay', value: '₱72,009', color: 'success', icon: '📈' },
  ];

  const recentPayroll = [
    { employee: 'Juan Dela Cruz',     grossPay: '₱ 6,200', deduction: '₱ 5,000', netPay: '₱ 32,500' },
    { employee: 'Ethel Perez Gannad', grossPay: '₱ 3,000', deduction: '₱ 5,000', netPay: '₱ 62,500' },
    { employee: 'Ferdinand Monde',    grossPay: '₱ 4,500', deduction: '₱ 2,800', netPay: '₱ 35,200' },
    { employee: 'Jerizz Dolosa',      grossPay: '₱ 5,100', deduction: '₱ 3,200', netPay: '₱ 28,400' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Run Payroll</h1>
        <p>Process and manage employee payroll</p>
      </div>
      <div className="page-body">
        <div className="stat-cards">
          {stats.map((stat, i) => (
            <div className="stat-card card--clickable" key={i}>
              <div className="stat-card__info">
                <span className="stat-card__label">{stat.label}</span>
                <span className={`stat-card__value ${stat.color ? `stat-card__value--${stat.color}` : ''}`}>
                  {stat.value}
                </span>
              </div>
              <div className={`stat-card__icon stat-card__icon--${stat.color === 'danger' ? 'red' : stat.color === 'success' ? 'green' : 'blue'}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="section-title">Recent Payroll Activity</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Gross Pay</th>
                <th>Deduction</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {recentPayroll.map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{item.employee}</td>
                  <td>{item.grossPay}</td>
                  <td>{item.deduction}</td>
                  <td style={{ fontWeight: 600 }}>{item.netPay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
