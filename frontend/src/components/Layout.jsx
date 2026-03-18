import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleTheme = () => {
    // Reverted: Theme switching logic removed as requested
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header d-md-none d-flex align-items-center justify-content-between p-3 position-fixed top-0 start-0 w-100 z-3">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary-subtle text-primary rounded p-1 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-layers-fill"></i>
          </div>
          <span className="fw-bold">Payroll System</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-sm btn-outline-secondary border d-flex align-items-center justify-content-center"
            onClick={toggleTheme}
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
          >
            <i className="bi bi-moon-stars h6 mb-0"></i>
          </button>
          <button 
            className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
          >
            <i className={`bi bi-${isSidebarOpen ? 'x-lg' : 'list'} h5 mb-0`}></i>
          </button>
        </div>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onToggleTheme={toggleTheme}
      />
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-2"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="main-content flex-grow-1">
        <div className="p-3 p-md-4 mt-5 mt-md-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
