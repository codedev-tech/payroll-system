import { Navigate, useLocation } from 'react-router-dom';
import { getActorRole } from '../utils/auth';

export default function RequireRole({ allowedRoles, children }) {
  const location = useLocation();
  const role = getActorRole();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/employees" replace state={{ from: location }} />;
  }

  return children;
}
