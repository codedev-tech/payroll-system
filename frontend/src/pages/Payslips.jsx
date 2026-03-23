import { useEffect, useMemo, useState } from 'react';
import { extractData, payslipsApi } from '../api';
import { getActorRole } from '../utils/auth';
import '../styles/pages/payslips.css';

export default function Payslips() {
  const actorRole = getActorRole();
  const canToggleHistorical = actorRole === 'hr' || actorRole === 'admin';
  const [payslips, setPayslips] = useState([]);
  const [openPayslipId, setOpenPayslipId] = useState('');
  const [showHistorical, setShowHistorical] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPayslips = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await payslipsApi.list({ limit: 100 });
        const data = extractData(response);
        const list = Array.isArray(data) ? data : [];

        if (isMounted) {
          setPayslips(list);
          setOpenPayslipId(list[0]?.id ? String(list[0].id) : '');
        }
      } catch {
        if (isMounted) {
          setError('Unable to load payslips.');
          setPayslips([]);
          setOpenPayslipId('');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPayslips();

    return () => {
      isMounted = false;
    };
  }, []);

  const currency = (value) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  const formatPeriod = (value) => {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }

    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };

  const payslipItems = useMemo(() => payslips.map((payslip) => {
    const employee = {
      name: payslip?.employee?.full_name || payslip?.employee?.employee_no || 'N/A',
      position: payslip?.employee?.position || 'N/A',
      id: payslip?.employee?.employee_no || 'N/A',
      payPeriod: `${formatPeriod(payslip?.period_start)} - ${formatPeriod(payslip?.period_end)}`,
    };

    const status = payslip?.employee?.employment_status;
    const isHistorical = status !== 'active';

    const earnings = Array.isArray(payslip?.earnings) ? payslip.earnings : [];
    const deductions = Array.isArray(payslip?.deductions) ? payslip.deductions : [];

    return {
      payslip,
      employee,
      isHistorical,
      earnings,
      deductions,
    };
  }), [payslips]);

  const visiblePayslipItems = useMemo(() => {
    if (!canToggleHistorical || showHistorical) {
      return payslipItems;
    }

    return payslipItems.filter(({ isHistorical }) => {
      return !isHistorical;
    });
  }, [canToggleHistorical, showHistorical, payslipItems]);

  const historicalPayslipCount = useMemo(() => {
    return payslipItems.filter(({ isHistorical }) => isHistorical).length;
  }, [payslipItems]);

  useEffect(() => {
    if (visiblePayslipItems.length === 0) {
      setOpenPayslipId('');
      return;
    }

    if (openPayslipId === '') {
      return;
    }

    const hasOpen = visiblePayslipItems.some(({ payslip }) => String(payslip.id) === openPayslipId);
    if (!hasOpen) {
      setOpenPayslipId(String(visiblePayslipItems[0].payslip.id));
    }
  }, [visiblePayslipItems, openPayslipId]);

  return (
    <div className="fade-in payslip-page">
      <div className="page-header mb-4">
        <h1 className="h3">Payslip</h1>
        <p className="text-muted">Read-only view of your payslip details</p>
      </div>
      <div className="page-body">
        {error && <div className="alert alert-warning">{error}</div>}

        {canToggleHistorical && (
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="showHistoricalPayslips"
              checked={showHistorical}
              onChange={(event) => setShowHistorical(event.target.checked)}
            />
            <label className="form-check-label" htmlFor="showHistoricalPayslips">
              Show historical (resigned/inactive) ({historicalPayslipCount})
            </label>
          </div>
        )}

        {!loading && canToggleHistorical && showHistorical && historicalPayslipCount === 0 && (
          <div className="alert alert-info">No historical payslips found.</div>
        )}

        {loading && <div className="alert alert-info">Loading payslips...</div>}

        {!loading && visiblePayslipItems.length === 0 && (
          <div className="alert alert-secondary">No payslips available.</div>
        )}

        <div className="payslip-accordion-list">
          {visiblePayslipItems.map(({ payslip, employee, isHistorical, earnings, deductions }) => {
            const isOpen = String(payslip.id) === openPayslipId;

            return (
              <div className="card border-0 shadow-sm overflow-hidden p-0 w-100 mb-3" key={payslip.id}>
                <button
                  type="button"
                  className="payslip-accordion-trigger"
                  onClick={() => setOpenPayslipId((prev) => (prev === String(payslip.id) ? '' : String(payslip.id)))}
                >
                  <div className="payslip-header__info d-flex align-items-center gap-3">
                    <div className="payslip-header__avatar rounded-circle bg-secondary d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="text-start">
                      <div className="payslip-header__name fw-bold d-flex align-items-center gap-2">
                        <span>{employee.name}</span>
                        {showHistorical && isHistorical && (
                          <span className="badge rounded-pill text-bg-warning">Historical</span>
                        )}
                      </div>
                      <div className="small text-white-50">{employee.payPeriod}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span className="small text-white-50">{currency(payslip.net_pay)}</span>
                    <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="payslip-info-card border rounded p-3">
                          <h6 className="text-uppercase small fw-bold text-muted mb-2">Employee Information</h6>
                          <div className="row mb-1">
                            <div className="col-4 text-muted small">Position</div>
                            <div className="col-8 fw-medium">{employee.position}</div>
                          </div>
                          <div className="row mb-1">
                            <div className="col-4 text-muted small">Employee ID</div>
                            <div className="col-8 fw-medium">{employee.id}</div>
                          </div>
                          <div className="row">
                            <div className="col-4 text-muted small">Pay Period</div>
                            <div className="col-8 fw-medium">{employee.payPeriod}</div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3 h-100">
                          <h6 className="text-uppercase small fw-bold text-muted mb-2 text-success">Earnings</h6>
                          {earnings.map((item, i) => (
                            <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-light" key={i}>
                              <span className="text-secondary small">{item.label}</span>
                              <span className="fw-bold">{currency(item.amount)}</span>
                            </div>
                          ))}
                          {earnings.length === 0 && <div className="small text-muted">No earnings breakdown available.</div>}
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="border rounded p-3 h-100">
                          <h6 className="text-uppercase small fw-bold text-muted mb-2 text-danger">Deductions</h6>
                          {deductions.map((item, i) => (
                            <div className="d-flex justify-content-between mb-1 pb-1 border-bottom border-light" key={i}>
                              <span className="text-secondary small">{item.label}</span>
                              <span className="fw-bold">{currency(item.amount)}</span>
                            </div>
                          ))}
                          {deductions.length === 0 && <div className="small text-muted">No deduction breakdown available.</div>}
                        </div>
                      </div>
                    </div>

                    <div className="row mt-4 pt-3 border-top">
                      <div className="col-12 d-flex flex-wrap justify-content-end gap-4">
                        <div className="text-end">
                          <div className="text-uppercase small text-muted mb-1">Total Earnings</div>
                          <div className="h5 fw-bold text-success">{currency(payslip.gross_pay)}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-uppercase small text-muted mb-1">Total Deductions</div>
                          <div className="h5 fw-bold text-danger">{currency(payslip.total_deductions)}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-uppercase small text-muted mb-1">Net Pay</div>
                          <div className="h5 fw-bold text-primary">{currency(payslip.net_pay)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
