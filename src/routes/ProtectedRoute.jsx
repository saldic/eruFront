import { Navigate, Outlet, useOutletContext } from "react-router";

function ProtectedRoute({ requiredRole }) {
  const outletContext = useOutletContext();
  const { currentUser } = outletContext;

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && !currentUser.roles?.includes(requiredRole)) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet context={outletContext} />;
}

export default ProtectedRoute;
