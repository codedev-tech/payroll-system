import { Navigate } from 'react-router-dom';
import { getActorRole } from '../utils/auth';

export default function RoleHomeRedirect() {
  const role = getActorRole();

  if (role === 'hr' || role === 'admin') {
    return <Navigate to="/employees" replace />;
  }

  return <Navigate to="/login" replace />;
}
