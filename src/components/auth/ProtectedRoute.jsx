import { Navigate, useLocation } from "react-router-dom";

import FullPageLoader from "../common/FullPageLoader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getAccountAccessRedirect } from "../../utils/getAccountAccessRedirect.js";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading, userProfile } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  const accountRedirect = getAccountAccessRedirect(userProfile);

  if (accountRedirect) {
    return <Navigate replace to={accountRedirect} />;
  }

  return children;
}

export default ProtectedRoute;
