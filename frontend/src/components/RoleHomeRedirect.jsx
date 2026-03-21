import { Navigate } from 'react-router-dom';
import { getActorRole } from '../utils/auth';

export default function RoleHomeRedirect() {
  const role = getActorRole();

  if (role === 'employee') {
    return <Navigate to="/payslips" replace />;
  }

  return <Navigate to="/employees" replace />;
}
