import { useEffect, useMemo, useState } from 'react';
import { departmentsApi, employeesApi, extractData, hrEmployeeAccountsApi } from '../api';
import { getActorUserId, isHrOrAdmin } from '../utils/auth';
import '../styles/pages/employees.css';

const statusClass = {
  active: 'badge--active',
  on_leave: 'badge--leave',
  inactive: 'badge--inactive',
  pending: 'badge--pending',
};

const statusLabel = {
  active: 'Active',
  on_leave: 'On Leave',
  inactive: 'Inactive',
  pending: 'Pending',
};

const salaryFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

export default function Employees() {
  const canManageEmployees = isHrOrAdmin();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    department_id: '',
    position: '',
    basic_salary: '',
    attendance_pin: '',
    new_department_name: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await employeesApi.list({ limit: 100 });
        const data = extractData(response);

        if (isMounted) {
          setEmployees(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load employees. Please check backend API connection.');
          setEmployees([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDepartments = async () => {
      if (!canManageEmployees) {
        return;
      }

      try {
        const response = await departmentsApi.list();
        const data = extractData(response);
        if (isMounted) {
          setDepartments(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setDepartments([]);
        }
      }
    };

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, [canManageEmployees]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resolveApiErrorMessage = (error, fallbackMessage) => {
    const responseData = error?.response?.data;

    if (responseData?.message) {
      return responseData.message;
    }

    const validationErrors = responseData?.errors;
    if (validationErrors && typeof validationErrors === 'object') {
      const firstFieldErrors = Object.values(validationErrors).find((messages) => Array.isArray(messages) && messages.length > 0);
      if (firstFieldErrors) {
        return firstFieldErrors[0];
      }
    }

    return fallbackMessage;
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      department_id: '',
      position: '',
      basic_salary: '',
      attendance_pin: '',
      new_department_name: '',
    });
  };

  const handleCreateEmployeeAccount = async (event) => {
    event.preventDefault();

    setSubmitError('');
    setSubmitSuccess('');

    const actorUserId = getActorUserId();
    if (!actorUserId) {
      setSubmitError('Missing actor user session. Please login again.');
      return;
    }

    const payload = {
      actor_user_id: actorUserId,
      name: form.name,
      email: form.email,
      password: form.password,
      password_confirmation: form.password_confirmation,
      first_name: form.first_name,
      last_name: form.last_name,
      middle_name: form.middle_name || null,
      phone: form.phone || null,
      department_id: form.department_id && form.department_id !== '__new__' ? Number(form.department_id) : null,
      position: form.position || null,
      basic_salary: form.basic_salary ? Number(form.basic_salary) : 0,
      attendance_pin: form.attendance_pin || null,
    };

    if (form.department_id === '__new__' && form.new_department_name.trim()) {
      try {
        const deptResponse = await departmentsApi.create({
          name: form.new_department_name.trim(),
          code: form.new_department_name.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 20),
          status: 'active',
        });
        const newDepartment = extractData(deptResponse);
        if (newDepartment?.id) {
          payload.department_id = Number(newDepartment.id);
          setDepartments((prev) => [newDepartment, ...prev]);
        }
      } catch (error) {
        setSubmitError(resolveApiErrorMessage(error, 'Unable to create new department. Please try another name.'));
        setSubmitting(false);
        return;
      }
    }

    try {
      setSubmitting(true);
      const response = await hrEmployeeAccountsApi.create(payload);
      const data = extractData(response);
      if (data?.employee) {
        setEmployees((previous) => [data.employee, ...previous]);
      }
      setSubmitSuccess('Employee account created successfully.');
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      setSubmitError(resolveApiErrorMessage(error, 'Unable to create employee account. Please verify inputs and HR privileges.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    const shouldDelete = window.confirm(`Offboard employee ${employee.full_name || employee.employee_no}?`);
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingEmployeeId(employee.id);
      await employeesApi.delete(employee.id);
      setEmployees((previous) => previous.filter((item) => item.id !== employee.id));
    } catch {
      window.alert('Unable to offboard employee. Please try again.');
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return employees.filter((employee) => {
      const name = employee.full_name?.toLowerCase() || '';
      const department = employee.department?.name?.toLowerCase() || '';
      const employeeNo = employee.employee_no?.toLowerCase() || '';

      return name.includes(keyword) || department.includes(keyword) || employeeNo.includes(keyword);
    });
  }, [employees, search]);

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <h1 className="h3">Employee</h1>
        <p className="text-muted">Manage your workforce</p>
      </div>

      <div className="page-body">
        <div className="card border-0 shadow-sm w-100">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div className="search-bar__wrapper flex-grow-1" style={{ maxWidth: '400px' }}>
              <span className="search-bar__icon">
                <i className="bi bi-search"></i>
              </span>
              <input
                className="form-control ps-5"
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {canManageEmployees && (
              <button
                className="btn btn-primary d-flex align-items-center py-2 px-3"
                type="button"
                onClick={() => setShowCreateForm((previous) => !previous)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                {showCreateForm ? 'Hide Employee Form' : 'HR: Add Employee'}
              </button>
            )}
          </div>

          {canManageEmployees && showCreateForm && (
            <form className="border rounded p-3 mb-4" onSubmit={handleCreateEmployeeAccount}>
              <h2 className="h6 mb-3">Create Employee (HR/Admin)</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Login Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleFieldChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleFieldChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" name="password" value={form.password} onChange={handleFieldChange} minLength={8} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" name="password_confirmation" value={form.password_confirmation} onChange={handleFieldChange} minLength={8} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input className="form-control" name="first_name" value={form.first_name} onChange={handleFieldChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input className="form-control" name="middle_name" value={form.middle_name} onChange={handleFieldChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name</label>
                  <input className="form-control" name="last_name" value={form.last_name} onChange={handleFieldChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleFieldChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Department</label>
                  <select className="form-select" name="department_id" value={form.department_id} onChange={handleFieldChange}>
                    <option value="">Select department</option>
                    <option value="__new__">+ Add new department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                  </select>
                </div>
                {form.department_id === '__new__' && (
                  <div className="col-md-4">
                    <label className="form-label">New Department Name</label>
                    <input
                      className="form-control"
                      name="new_department_name"
                      value={form.new_department_name}
                      onChange={handleFieldChange}
                      placeholder="e.g. Accounting"
                      required
                    />
                  </div>
                )}
                <div className="col-md-4">
                  <label className="form-label">Position</label>
                  <input className="form-control" name="position" value={form.position} onChange={handleFieldChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Basic Salary</label>
                  <input type="number" min="0" step="0.01" className="form-control" name="basic_salary" value={form.basic_salary} onChange={handleFieldChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Attendance PIN (optional)</label>
                  <input type="password" minLength={4} maxLength={12} className="form-control" name="attendance_pin" value={form.attendance_pin} onChange={handleFieldChange} placeholder="4-12 digits/chars" />
                </div>
              </div>
              {submitError && <div className="alert alert-danger mt-3 mb-0 py-2">{submitError}</div>}
              {submitSuccess && <div className="alert alert-success mt-3 mb-0 py-2">{submitSuccess}</div>}
              <div className="mt-3 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 py-3">Employee Name</th>
                  <th className="border-0 py-3">Employee No</th>
                  <th className="border-0 py-3">Department</th>
                  <th className="border-0 py-3">
                    Status
                    <i className="bi bi-chevron-down ms-1 small opacity-50"></i>
                  </th>
                  <th className="border-0 py-3 text-end">Salary</th>
                  {canManageEmployees && <th className="border-0 py-3 text-end">Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={canManageEmployees ? 6 : 5} className="text-center py-5 text-muted">
                      Loading employees...
                    </td>
                  </tr>
                )}

                {!loading && filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td className="fw-medium text-dark">{emp.full_name}</td>
                    <td className="text-secondary">{emp.employee_no}</td>
                    <td className="text-secondary">{emp.department?.name ?? 'Unassigned'}</td>
                    <td>
                      <span className={`badge rounded-pill ${statusClass[emp.employment_status] ?? 'badge--inactive'}`}>
                        {statusLabel[emp.employment_status] ?? emp.employment_status}
                      </span>
                    </td>
                    <td className="fw-bold text-end">{salaryFormatter.format(Number(emp.basic_salary || 0))}</td>
                    {canManageEmployees && (
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteEmployee(emp)}
                          disabled={deletingEmployeeId === emp.id}
                        >
                          {deletingEmployeeId === emp.id ? 'Removing...' : 'Remove'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={canManageEmployees ? 6 : 5} className="text-center py-5 text-muted">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
