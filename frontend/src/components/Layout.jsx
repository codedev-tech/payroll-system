import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header d-md-none d-flex align-items-center justify-content-between p-3 bg-white shadow-sm border-bottom position-fixed top-0 start-0 w-100 z-3">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary-subtle text-primary rounded p-1 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
            <i className="bi bi-layers-fill"></i>
          </div>
          <span className="fw-bold text-dark">Payroll</span>
        </div>
        <button 
          className="btn btn-light border p-2 d-flex align-items-center justify-content-center"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <i className={`bi bi-${isSidebarOpen ? 'x-lg' : 'list'} h5 mb-0`}></i>
        </button>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
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
