import { useEffect, useMemo, useState } from 'react';
import { extractData, leaveRequestsApi, leaveTypesApi } from '../api';
import { getActorRole, getActorUserId } from '../utils/auth';

const statusLabel = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export default function LeaveRequests() {
  const role = getActorRole();
  const actorUserId = getActorUserId();
  const canReview = role === 'hr' || role === 'admin';

  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const noLeaveTypes = leaveTypes.length === 0;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [leaveRes, leaveTypeRes] = await Promise.all([
          leaveRequestsApi.list(),
          leaveTypesApi.list(),
        ]);

        if (!isMounted) {
          return;
        }

        setRequests(Array.isArray(extractData(leaveRes)) ? extractData(leaveRes) : []);
        setLeaveTypes(Array.isArray(extractData(leaveTypeRes)) ? extractData(leaveTypeRes) : []);
      } catch {
        if (isMounted) {
          setError('Unable to load leave requests.');
          setRequests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitLeaveRequest = async (event) => {
    event.preventDefault();
    setSubmitError('');

    try {
      setSubmitting(true);
      const response = await leaveRequestsApi.create({
        actor_user_id: actorUserId,
        employee_id: canReview && form.employee_id ? Number(form.employee_id) : undefined,
        leave_type_id: Number(form.leave_type_id),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason || null,
      });

      const created = extractData(response);
      setRequests((prev) => [created, ...prev]);
      setForm((prev) => ({
        ...prev,
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
      }));
    } catch {
      setSubmitError('Unable to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const reviewRequest = async (id, action) => {
    const notes = action === 'reject' ? window.prompt('Reason for rejection:') : '';
    if (action === 'reject' && !notes) {
      return;
    }

    try {
      const response = action === 'approve'
        ? await leaveRequestsApi.approve(id, { reviewed_by: actorUserId, review_notes: notes || null })
        : await leaveRequestsApi.reject(id, { reviewed_by: actorUserId, review_notes: notes, status: 'rejected' });

      const updated = extractData(response);
      setRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      window.alert('Unable to update leave request status.');
    }
  };

  const visibleRequests = useMemo(() => requests, [requests]);

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Leave Requests</h1>
        <p className="text-muted">Submit and manage leave requests</p>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {!canReview && (
        <div className="card border-0 shadow-sm mb-4">
          <form className="row g-3" onSubmit={submitLeaveRequest}>
            <div className="col-md-6">
              <label className="form-label">Leave Type</label>
              <select
                className="form-select"
                name="leave_type_id"
                value={form.leave_type_id}
                onChange={handleField}
                required
                disabled={noLeaveTypes}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {noLeaveTypes && (
                <div className="form-text text-warning">No leave types configured yet. Please contact HR/Admin.</div>
              )}
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" name="start_date" value={form.start_date} onChange={handleField} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" name="end_date" value={form.end_date} onChange={handleField} required />
            </div>
            <div className="col-12">
              <label className="form-label">Reason</label>
              <textarea className="form-control" name="reason" value={form.reason} onChange={handleField} rows={2} />
            </div>
            {submitError && <div className="col-12"><div className="alert alert-danger py-2 mb-0">{submitError}</div></div>}
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={submitting || noLeaveTypes}>
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Date Range</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">Loading leave requests...</td>
                </tr>
              )}
              {!loading && visibleRequests.map((item) => (
                <tr key={item.id}>
                  <td>{item.employee?.full_name || item.employee?.employee_no || 'N/A'}</td>
                  <td>{item.leave_type?.name || item.leaveType?.name || 'N/A'}</td>
                  <td>{item.start_date} - {item.end_date}</td>
                  <td>{statusLabel[item.status] || item.status}</td>
                  <td className="text-end">
                    {canReview && item.status === 'pending' && (
                      <div className="d-inline-flex gap-2">
                        <button type="button" className="btn btn-success btn-sm" onClick={() => reviewRequest(item.id, 'approve')}>Approve</button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => reviewRequest(item.id, 'reject')}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && visibleRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
