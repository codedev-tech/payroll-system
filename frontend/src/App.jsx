import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import RoleHomeRedirect from './components/RoleHomeRedirect'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Payroll from './pages/Payroll'
import Payslips from './pages/Payslips'
import Reports from './pages/Reports'
import LeaveRequests from './pages/LeaveRequests'
import Attendance from './pages/Attendance'
import AttendanceKiosk from './pages/AttendanceKiosk'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/attendance-kiosk" element={<AttendanceKiosk />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route path="/employees" element={<RequireRole allowedRoles={['hr', 'admin']}><Employees /></RequireRole>} />
        <Route path="/payroll" element={<RequireRole allowedRoles={['hr', 'admin']}><Payroll /></RequireRole>} />
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave-requests" element={<LeaveRequests />} />
        <Route path="/reports" element={<RequireRole allowedRoles={['hr', 'admin']}><Reports /></RequireRole>} />
        <Route path="/dashboard" element={<RequireRole allowedRoles={['hr', 'admin']}><Dashboard /></RequireRole>} />
      </Route>
    </Routes>
  )
}

export default App
