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
      <div className="page-header">
        <h1>Employee</h1>
        <p>Manage your workforce</p>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="search-bar">
            <div className="search-bar__wrapper">
              <span className="search-bar__icon">🔍</span>
              <input
                className="search-bar__input"
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn--primary btn--sm">+ Add Employee</button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>ID</th>
                <th>Department</th>
                <th>Status ▼</th>
                <th>Salary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 500 }}>{emp.name}</td>
                  <td>{emp.id}</td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`badge ${statusClass[emp.status]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{emp.salary}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
