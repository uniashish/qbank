import { Navigate } from "react-router-dom";

import FullPageLoader from "../common/FullPageLoader.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function RoleRoute({ allowedRoles = [], children }) {
  const { loading, role } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate replace to="/unauthorized" />;
  }

  return children;
}

export default RoleRoute;
