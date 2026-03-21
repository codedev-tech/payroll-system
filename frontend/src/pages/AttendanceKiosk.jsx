import { useMemo, useState } from 'react';
import { attendanceApi, extractData } from '../api';

function formatDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function AttendanceKiosk() {
  const [employeeNo, setEmployeeNo] = useState('');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  const [result, setResult] = useState(null);

  const employeeLabel = useMemo(() => {
    if (!result?.employee) {
      return '';
    }

    return result.employee.full_name || result.employee.employee_no || '';
  }, [result]);

  const handleAction = async (action) => {
    if (!employeeNo.trim() || !pin.trim()) {
      setError('Please enter Employee ID and PIN.');
      setErrorDetails(null);
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setErrorDetails(null);

      const payload = {
        employee_no: employeeNo.trim().toUpperCase(),
        pin: pin.trim(),
      };
      const response = action === 'in'
        ? await attendanceApi.kioskClockIn(payload)
        : await attendanceApi.kioskClockOut(payload);

      setResult(extractData(response));
      setEmployeeNo('');
      setPin('');
    } catch (requestError) {
      setResult(null);
      const responseData = requestError?.response?.data || null;
      setError(responseData?.message || 'Unable to process attendance.');
      setErrorDetails({
        detectedIp: responseData?.detected_ip || null,
        allowedIps: Array.isArray(responseData?.allowed_ips) ? responseData.allowed_ips : [],
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm border-0" style={{ width: '100%', maxWidth: '560px' }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="h4 mb-1">Attendance Kiosk</h1>
          <p className="text-muted mb-4">Entrance terminal for employee clock in/out</p>

          {error && (
            <div className="alert alert-danger py-2 mb-3">
              <div>{error}</div>
              {errorDetails?.detectedIp && (
                <div className="small mt-2 mb-0">
                  Detected IP: <strong>{errorDetails.detectedIp}</strong>
                </div>
              )}
              {Array.isArray(errorDetails?.allowedIps) && errorDetails.allowedIps.length > 0 && (
                <div className="small mt-1 mb-0">
                  Allowed IPs: <strong>{errorDetails.allowedIps.join(', ')}</strong>
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Employee ID</label>
            <input
              className="form-control form-control-lg"
              placeholder="e.g. EMP-2026-0003"
              value={employeeNo}
              onChange={(event) => setEmployeeNo(event.target.value)}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Attendance PIN</label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter PIN"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />
          </div>

          <div className="d-grid gap-2 d-md-flex">
            <button
              type="button"
              className="btn btn-success btn-lg flex-fill"
              onClick={() => handleAction('in')}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Clock In'}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-lg flex-fill"
              onClick={() => handleAction('out')}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Clock Out'}
            </button>
          </div>

          {result && (
            <div className="alert alert-success mt-4 mb-0">
              <div className="fw-semibold mb-1">Recorded for: {employeeLabel}</div>
              <div className="small">Clock In: {formatDateTime(result.clock_in)}</div>
              <div className="small">Clock Out: {formatDateTime(result.clock_out)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
