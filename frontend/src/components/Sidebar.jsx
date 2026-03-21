import { NavLink } from 'react-router-dom';
import '../styles/components/sidebar.css';
import { getActorRole } from '../utils/auth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <i className="bi bi-grid-fill"></i> },
  { path: '/employees', label: 'Employees', icon: <i className="bi bi-people-fill"></i> },
  { path: '/payroll', label: 'Payroll', icon: <i className="bi bi-wallet2"></i> },
  { path: '/payslips', label: 'Payslips', icon: <i className="bi bi-file-earmark-text-fill"></i> },
  { path: '/attendance', label: 'Attendance', icon: <i className="bi bi-clock-history"></i> },
  { path: '/leave-requests', label: 'Leaves', icon: <i className="bi bi-calendar-check"></i> },
  { path: '/reports', label: 'Report', icon: <i className="bi bi-bar-chart-fill"></i> },
];

const employeeNavItems = [
  { path: '/payslips', label: 'Payslips', icon: <i className="bi bi-file-earmark-text-fill"></i> },
  { path: '/attendance', label: 'Attendance', icon: <i className="bi bi-clock-history"></i> },
  { path: '/leave-requests', label: 'Leaves', icon: <i className="bi bi-calendar-check"></i> },
];

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const role = getActorRole();
  const visibleNavItems = role === 'employee' ? employeeNavItems : navItems;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''} h-100`}>
      <div className="sidebar__brand d-flex align-items-center justify-content-between">
        <div className="sidebar__brand-main d-flex align-items-center gap-2">
          <div className="sidebar__logo rounded-pill d-flex align-items-center justify-content-center bg-primary-subtle text-primary" style={{ width: '36px', height: '36px' }}>
            <i className="bi bi-layers-fill"></i>
          </div>
          <h1 className="sidebar__brand-text h6 mb-0 text-white fw-bold"> <span className='pay'>PayFlow</span>HRMS</h1>
        </div>
        <button 
          className="btn btn-dark d-md-none p-1 border-0"
          onClick={onClose}
        >
          <i className="bi bi-x-lg text-white"></i>
        </button>
      </div>
      <nav className="sidebar__nav mt-3 flex-grow-1">
        {visibleNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onClose}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `sidebar__link text-decoration-none ${isActive ? 'active' : ''}`
            }
          >
            <span className="icon d-flex align-items-center justify-content-center" style={{ width: '24px' }}>
              {item.icon}
            </span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer d-none d-md-block">
        <button
          type="button"
          className="sidebar__collapse-btn"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className="bi bi-layout-sidebar-inset"></i>
          <span className="sidebar__collapse-text">{isCollapsed ? '>' : '<'}</span>
        </button>
      </div>
    </aside>
  );
}
