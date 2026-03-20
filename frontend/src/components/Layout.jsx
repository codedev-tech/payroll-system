import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/components/layout.css';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className={`layout ${isDarkMode ? 'theme-dark' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header d-md-none d-flex align-items-center justify-content-between position-fixed top-0 start-0 w-100 z-3">
        <div className="d-flex align-items-center gap-2">
          <div className="mobile-brand-badge d-flex align-items-center justify-content-center">
            <i className="bi bi-layers-fill"></i>
          </div>
          <span className="mobile-brand-title fw-bold">Payroll</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="theme-icon-btn"
            onClick={() => setIsDarkMode(prev => !prev)}
            type="button"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
          </button>
          <button
            className="mobile-menu-btn d-flex align-items-center justify-content-center"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            type="button"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <i className={`bi bi-${isSidebarOpen ? 'x-lg' : 'list'} h5 mb-0`}></i>
          </button>
        </div>
      </header>

      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-2"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={`main-content flex-grow-1 ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="topbar-actions d-none d-md-flex">
          <button
            className="theme-icon-btn"
            onClick={() => setIsDarkMode(prev => !prev)}
            type="button"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
          </button>
        </div>
        <div className="p-3 p-md-4 mt-5 mt-md-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
