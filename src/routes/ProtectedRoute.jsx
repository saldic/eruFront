import { Navigate, Outlet, useOutletContext } from "react-router";

function ProtectedRoute() {
  const outletContext = useOutletContext();
  const { currentUser } = outletContext;

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet context={outletContext} />;
}

export default ProtectedRoute;
