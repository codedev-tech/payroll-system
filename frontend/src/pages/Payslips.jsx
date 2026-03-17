export default function Payslips() {
  const employee = {
    name: 'Juan Dela Cruz',
    position: 'Software Engineer',
    id: '23-103',
    payPeriod: 'June 1 - June 30, 2026',
  };

  const earnings = [
    { label: 'Basic Salary', amount: '₱ 32,250' },
    { label: 'Bonus', amount: '₱ 1,500' },
  ];

  const deductions = [
    { label: 'Tax', amount: '₱ 1,230' },
    { label: 'Health Insurance', amount: '₱ 1,500' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Reports</h1>
        <p>View payslip details</p>
      </div>
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div className="payslip-header">
            <div className="payslip-header__info">
              <div className="payslip-header__avatar">👤</div>
              <span className="payslip-header__name">{employee.name}</span>
            </div>
            <button className="btn btn--primary btn--sm">
              📥 Download PDF
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            {/* Employee Information */}
            <fieldset className="fieldset">
              <legend className="fieldset__legend">Employee Information</legend>
              <div className="fieldset__row">
                <span className="fieldset__label">Position</span>
                <span className="fieldset__value">{employee.position}</span>
              </div>
              <div className="fieldset__row">
                <span className="fieldset__label">Employee ID</span>
                <span className="fieldset__value">{employee.id}</span>
              </div>
              <div className="fieldset__row">
                <span className="fieldset__label">Pay Period</span>
                <span className="fieldset__value">{employee.payPeriod}</span>
              </div>
            </fieldset>

            {/* Earnings */}
            <fieldset className="fieldset">
              <legend className="fieldset__legend">Earnings</legend>
              {earnings.map((item, i) => (
                <div className="fieldset__row" key={i}>
                  <span className="fieldset__label">{item.label}</span>
                  <span className="fieldset__value" style={{ fontWeight: 600 }}>{item.amount}</span>
                </div>
              ))}
            </fieldset>

            {/* Deductions */}
            <fieldset className="fieldset">
              <legend className="fieldset__legend">Deduction</legend>
              {deductions.map((item, i) => (
                <div className="fieldset__row" key={i}>
                  <span className="fieldset__label">{item.label}</span>
                  <span className="fieldset__value" style={{ fontWeight: 600 }}>{item.amount}</span>
                </div>
              ))}
            </fieldset>

            {/* Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '32px',
              paddingTop: '12px',
              borderTop: '2px solid var(--border-color)',
              marginTop: '8px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL EARNINGS</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>₱ 33,750</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL DEDUCTIONS</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>₱ 2,730</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>NET PAY</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>₱ 31,020</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
