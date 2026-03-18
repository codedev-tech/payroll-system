import { useState } from 'react';

const employees = [
  { name: 'Juan Dela Cruz',     id: 101, department: 'Engineering',  status: 'Active',   salary: '₱ 32,500' },
  { name: 'Ferdinand Monde',    id: 102, department: 'Marketing',    status: 'On Leave',  salary: '₱ 32,500' },
  { name: 'Jerizz Dolosa',      id: 103, department: 'HR',           status: 'Inactive',  salary: '₱ 32,500' },
  { name: 'Fernandiz Ruwel',    id: 104, department: 'Finance',      status: 'Pending',   salary: '₱ 32,500' },
  { name: 'Ethel Perez Gannad', id: 105, department: 'Engineering',  status: 'Paid',      salary: '₱ 32,500' },
];

const statusClass = {
  'Active':   'badge--active',
  'On Leave': 'badge--leave',
  'Inactive': 'badge--inactive',
  'Pending':  'badge--pending',
  'Paid':     'badge--paid',
};

export default function Employees() {
  const [search, setSearch] = useState('');

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

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
            <button className="btn btn-primary d-flex align-items-center py-2 px-3">
              <i className="bi bi-plus-lg me-2"></i>
              Add Employee
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 py-3">Employee Name</th>
                  <th className="border-0 py-3">ID</th>
                  <th className="border-0 py-3">Department</th>
                  <th className="border-0 py-3">
                    Status
                    <i className="bi bi-chevron-down ms-1 small opacity-50"></i>
                  </th>
                  <th className="border-0 py-3 text-end">Salary</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td className="fw-medium text-dark">{emp.name}</td>
                    <td className="text-secondary">{emp.id}</td>
                    <td className="text-secondary">{emp.department}</td>
                    <td>
                      <span className={`badge rounded-pill ${statusClass[emp.status]}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="fw-bold text-end">{emp.salary}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
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
