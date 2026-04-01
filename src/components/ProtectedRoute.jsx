import { Navigate } from 'react-router-dom';
import { getRole, isAuthed } from '../auth';

export default function ProtectedRoute({ roles, children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  if (roles && roles.length) {
    const role = getRole();
    if (!roles.includes(role)) return <Navigate to="/login" replace />;
  }
  return children;
}

