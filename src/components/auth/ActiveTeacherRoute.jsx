import { Navigate } from "react-router-dom";

import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import FullPageLoader from "../common/FullPageLoader.jsx";

function ActiveTeacherRoute({ children }) {
  const { loading, userProfile } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (userProfile?.status === ACCOUNT_STATUSES.PENDING_APPROVAL) {
    return <Navigate replace to="/teacher" />;
  }

  if (userProfile?.status !== ACCOUNT_STATUSES.ACTIVE) {
    return <Navigate replace to="/unauthorized" />;
  }

  return children;
}

export default ActiveTeacherRoute;
