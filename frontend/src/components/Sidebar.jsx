import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/employees', label: 'Employees', icon: '👤' },
  { path: '/payroll', label: 'Payroll', icon: '📊' },
  { path: '/payslips', label: 'Payslips', icon: '📋' },
  { path: '/reports', label: 'Report', icon: '📄' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1>Payroll</h1>
      </div>
      <nav className="sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'active' : ''}`
            }
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
