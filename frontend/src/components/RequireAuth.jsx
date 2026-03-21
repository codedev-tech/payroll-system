import { Navigate, useLocation } from 'react-router-dom';
import { getAuthUser } from '../utils/auth';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const authUser = getAuthUser();

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
