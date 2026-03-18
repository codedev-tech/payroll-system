import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: <i className="bi bi-grid-fill"></i> },
  { path: '/employees', label: 'Employees', icon: <i className="bi bi-people-fill"></i> },
  { path: '/payroll', label: 'Payroll', icon: <i className="bi bi-wallet2"></i> },
  { path: '/payslips', label: 'Payslips', icon: <i className="bi bi-file-earmark-text-fill"></i> },
  { path: '/reports', label: 'Report', icon: <i className="bi bi-bar-chart-fill"></i> },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} h-100`}>
      <div className="sidebar__brand d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div className="sidebar__logo rounded-pill d-flex align-items-center justify-content-center bg-primary-subtle text-primary" style={{ width: '36px', height: '36px' }}>
            <i className="bi bi-layers-fill"></i>
          </div>
          <h1 className="h6 mb-0 text-white fw-bold">Payroll</h1>
        </div>
        <button 
          className="btn btn-dark d-md-none p-1 border-0"
          onClick={onClose}
        >
          <i className="bi bi-x-lg text-white"></i>
        </button>
      </div>
      <nav className="sidebar__nav mt-3">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar__link d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none transition-all ${isActive ? 'active' : ''}`
            }
          >
            <span className="icon d-flex align-items-center justify-content-center" style={{ width: '24px' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
