import '../styles/pages/payslips.css';

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
    <div className="fade-in payslip-page">
      <div className="page-header mb-4">
        <h1 className="h3">Payslip</h1>
        <p className="text-muted">View payslip details</p>
      </div>
      <div className="page-body">
        <div className="card border-0 shadow-sm overflow-hidden p-0 w-100">
          {/* Header */}
          <div className="payslip-header d-flex align-items-center justify-content-between px-4 py-3 bg-dark text-white">
            <div className="payslip-header__info d-flex align-items-center gap-3">
              <div className="payslip-header__avatar rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-person-fill"></i>
              </div>
              <span className="payslip-header__name fw-bold">{employee.name}</span>
            </div>
            <button className="btn btn-primary d-flex align-items-center gap-2 px-3">
              <i className="bi bi-download"></i>
              <span>Download PDF</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="row g-4">
              {/* Employee Information */}
              <div className="col-12">
                <div className="payslip-info-card border rounded p-3">
                  <h6 className="text-uppercase small fw-bold text-muted mb-3">Employee Information</h6>
                  <div className="row mb-2">
                    <div className="col-4 text-muted small">Position</div>
                    <div className="col-8 fw-medium">{employee.position}</div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-4 text-muted small">Employee ID</div>
                    <div className="col-8 fw-medium">{employee.id}</div>
                  </div>
                  <div className="row">
                    <div className="col-4 text-muted small">Pay Period</div>
                    <div className="col-8 fw-medium">{employee.payPeriod}</div>
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="col-12 col-md-6">
                <div className="border rounded p-3 h-100">
                  <h6 className="text-uppercase small fw-bold text-muted mb-3 text-success">Earnings</h6>
                  {earnings.map((item, i) => (
                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-light" key={i}>
                      <span className="text-secondary small">{item.label}</span>
                      <span className="fw-bold">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div className="col-12 col-md-6">
                <div className="border rounded p-3 h-100">
                  <h6 className="text-uppercase small fw-bold text-muted mb-3 text-danger">Deductions</h6>
                  {deductions.map((item, i) => (
                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-light" key={i}>
                      <span className="text-secondary small">{item.label}</span>
                      <span className="fw-bold">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="row mt-5 pt-4 border-top">
              <div className="col-12 d-flex flex-wrap justify-content-end gap-5">
                <div className="text-end">
                  <div className="text-uppercase small text-muted mb-1">Total Earnings</div>
                  <div className="h4 fw-bold text-success">₱ 33,750</div>
                </div>
                <div className="text-end">
                  <div className="text-uppercase small text-muted mb-1">Total Deductions</div>
                  <div className="h4 fw-bold text-danger">₱ 2,730</div>
                </div>
                <div className="text-end">
                  <div className="text-uppercase small text-muted mb-1">Net Pay</div>
                  <div className="h4 fw-bold text-primary">₱ 31,020</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
