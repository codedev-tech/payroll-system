import { useEffect, useMemo, useState } from 'react';
import { attendanceApi, employeesApi, extractData } from '../api';
import { getActorEmployeeId, getActorRole, getAuthUser, isHrOrAdmin } from '../utils/auth';

function formatDate(value) {
  if (!value) {
    return '—';
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
}

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

export default function Attendance() {
  const role = getActorRole();
  const canManage = isHrOrAdmin();
  const actorEmployeeId = getActorEmployeeId();
  const authUser = getAuthUser();

  const employeeProfile = authUser?.employee_profile || null;
  const employeeDisplayLabel = employeeProfile?.full_name
    ? `${employeeProfile.full_name}${employeeProfile?.employee_no ? ` (${employeeProfile.employee_no})` : ''}`
    : employeeProfile?.employee_no
      ? employeeProfile.employee_no
      : actorEmployeeId
        ? `Employee #${actorEmployeeId}`
        : 'No employee profile linked';

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAttendance = async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        setError('');

        const requests = [attendanceApi.list()];
        if (canManage) {
          requests.push(employeesApi.list({ limit: 200, employment_status: 'active' }));
        }

        const [attendanceResponse, employeesResponse] = await Promise.all(requests);
        if (!isMounted) {
          return;
        }

        const attendanceData = extractData(attendanceResponse);
        setRecords(Array.isArray(attendanceData) ? attendanceData : []);

        if (canManage && employeesResponse) {
          const employeesData = extractData(employeesResponse);
          const employeeList = Array.isArray(employeesData) ? employeesData : [];
          setEmployees(employeeList);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load attendance records.');
          setRecords([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAttendance();

    const intervalId = window.setInterval(() => {
      loadAttendance(true);
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [canManage]);

  const effectiveEmployeeId = canManage ? selectedEmployeeId : (actorEmployeeId ? String(actorEmployeeId) : '');

  const visibleRecords = useMemo(() => {
    if (!effectiveEmployeeId) {
      return records;
    }

    return records.filter((item) => String(item.employee_id) === String(effectiveEmployeeId));
  }, [records, effectiveEmployeeId]);

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Attendance</h1>
        <p className="text-muted">Track clock-in and clock-out records</p>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="card border-0 shadow-sm mb-4">
        <div className="row g-3 align-items-end">
          {canManage && (
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label">Employee</label>
              <select
                className="form-select"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
              >
                <option value="">All employees</option>
                {employees.length === 0 && <option value="">No active employees</option>}
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name || employee.employee_no}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!canManage && (
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label">Employee</label>
              <input
                className="form-control"
                value={employeeDisplayLabel}
                readOnly
              />
            </div>
          )}

          {!canManage && (
            <div className="col-12">
              <div className="alert alert-info mb-0 py-2">
                Attendance actions are kiosk-only. Use the entrance kiosk screen: /attendance-kiosk.
              </div>
            </div>
          )}
        </div>
        {canManage && (
          <div className="alert alert-info mt-3 mb-0 py-2">
            Attendance actions should be done on the kiosk screen: /attendance-kiosk. This page is for monitoring.
          </div>
        )}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Work Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Overtime (min)</th>
                <th>Undertime (min)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">Loading attendance...</td>
                </tr>
              )}
              {!loading && visibleRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employee?.full_name || record.employee?.employee_no || `#${record.employee_id}`}</td>
                  <td>{formatDate(record.work_date)}</td>
                  <td>{formatDateTime(record.clock_in)}</td>
                  <td>{formatDateTime(record.clock_out)}</td>
                  <td>{record.minutes_overtime ?? 0}</td>
                  <td>{record.minutes_undertime ?? 0}</td>
                  <td className="text-capitalize">{record.status || 'present'}</td>
                </tr>
              ))}
              {!loading && visibleRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {role === 'employee' && !actorEmployeeId && (
        <div className="alert alert-info mt-3 mb-0">
          Your user is not linked to an employee profile yet. Contact HR/Admin to enable attendance tracking.
        </div>
      )}
    </div>
  );
}
