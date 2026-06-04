import { Route, Routes } from "react-router";
import App from "./App.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import InteractionsPage from "./pages/InteractionsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<FeedPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="interactions" element={<InteractionsPage />} />
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
        <Route path="auth" element={<AuthPage />} />
        <Route path="auth/:mode" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
