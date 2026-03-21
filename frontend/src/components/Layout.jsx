import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/components/layout.css';
import { clearAuthUser, getAuthUser } from '../utils/auth';
import { authApi } from '../api';

export default function Layout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordFields, setShowPasswordFields] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const authUser = getAuthUser();

  const initials = (() => {
    const parts = (authUser?.name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'U';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }
    return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
  })();

  const handleLogout = () => {
    clearAuthUser();
    navigate('/login', { replace: true });
  };

  const openProfileModal = () => {
    setPasswordError('');
    setPasswordSuccess('');
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    if (isSavingPassword) {
      return;
    }

    setIsProfileModalOpen(false);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordInput = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordField = (field) => {
    setShowPasswordFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password confirmation does not match.');
      return;
    }

    try {
      setIsSavingPassword(true);
      await authApi.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      });
      setPasswordSuccess('Password updated successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      setPasswordError(apiMessage || 'Unable to update password. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

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
            className="mobile-profile-btn"
            onClick={openProfileModal}
            type="button"
            aria-label="Open profile menu"
          >
            <span className="mobile-profile-btn__avatar">{initials}</span>
            <span className="mobile-profile-btn__name">{authUser?.name ?? 'User'}</span>
          </button>
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
            className="profile-menu-btn me-2"
            type="button"
            onClick={openProfileModal}
            aria-label="Open profile menu"
          >
            <span className="profile-menu-btn__avatar">{initials}</span>
            <span className="profile-menu-btn__name">{authUser?.name ?? 'User'}</span>
            <i className="bi bi-chevron-down"></i>
          </button>
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

      {isProfileModalOpen && (
        <div className="profile-modal-backdrop" onClick={closeProfileModal}>
          <div className="profile-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="profile-modal-card__header">
              <h2 className="h5 mb-1">Profile</h2>
              <p className="text-muted mb-0">{authUser?.name ?? 'User'}</p>
            </div>

            <form className="profile-modal-form" onSubmit={handleChangePassword}>
              <div className="profile-field">
                <label className="form-label">Current Password</label>
                <div className="input-group">
                  <input
                    type={showPasswordFields.current ? 'text' : 'password'}
                    className="form-control"
                    value={passwordForm.currentPassword}
                    onChange={(event) => handlePasswordInput('currentPassword', event.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePasswordField('current')}
                    aria-label={showPasswordFields.current ? 'Hide current password' : 'Show current password'}
                  >
                    <i className={`bi ${showPasswordFields.current ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="profile-field">
                <label className="form-label">New Password</label>
                <div className="input-group">
                  <input
                    type={showPasswordFields.next ? 'text' : 'password'}
                    className="form-control"
                    value={passwordForm.newPassword}
                    onChange={(event) => handlePasswordInput('newPassword', event.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePasswordField('next')}
                    aria-label={showPasswordFields.next ? 'Hide new password' : 'Show new password'}
                  >
                    <i className={`bi ${showPasswordFields.next ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="profile-field">
                <label className="form-label">Confirm New Password</label>
                <div className="input-group">
                  <input
                    type={showPasswordFields.confirm ? 'text' : 'password'}
                    className="form-control"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => handlePasswordInput('confirmPassword', event.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePasswordField('confirm')}
                    aria-label={showPasswordFields.confirm ? 'Hide confirmation password' : 'Show confirmation password'}
                  >
                    <i className={`bi ${showPasswordFields.confirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}
              {passwordSuccess && <div className="alert alert-success py-2">{passwordSuccess}</div>}

              <div className="profile-modal-actions d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm profile-modal-btn"
                  onClick={closeProfileModal}
                  disabled={isSavingPassword}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary btn-sm profile-modal-btn" disabled={isSavingPassword}>
                  {isSavingPassword ? 'Saving...' : 'Change Password'}
                </button>
                <button type="button" className="btn btn-danger btn-sm profile-modal-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
