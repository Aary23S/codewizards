import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center text-gray-500 py-32">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // If roles array passed, check if user's role is allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="py-32 text-center text-gray-500">Loading...</div>;

  if (user) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
