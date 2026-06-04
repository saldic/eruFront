import { Link, Navigate, useNavigate, useOutletContext, useParams } from "react-router";
import AuthPanel from "../components/auth/AuthPanel.jsx";
import BrandMark from "../components/layout/BrandMark.jsx";
import HeroBrandReveal from "../components/layout/HeroBrandReveal.jsx";

function getMode(routeMode) {
  return routeMode === "login" || routeMode === "register" ? routeMode : null;
}

function AuthPage() {
  const {
    currentUser,
    handleLogin,
    handleRegister,
    setError,
    setMessage,
  } = useOutletContext();
  const { mode } = useParams();
  const navigate = useNavigate();
  const authMode = getMode(mode);

  if (currentUser) {
    return <Navigate to="/feed" replace />;
  }

  async function submitLogin(credentials) {
    await handleLogin(credentials);
    navigate("/feed");
  }

  async function submitRegister(account) {
    await handleRegister(account);
    navigate("/feed");
  }

  function changeMode(nextMode) {
    navigate(`/auth/${nextMode}`);
  }

  return (
    <main className="auth-page">
      <nav className="hero-nav" aria-label="eru navigation">
        <BrandMark />
        <div className="nav-actions">
          <Link to="/auth/login">Login</Link>
          <Link to="/auth/register">Sign up</Link>
        </div>
      </nav>

      <section className="auth-hero">
        <HeroBrandReveal />

        <div className="auth-card">
          <div className="auth-copy">
            <h1>Learn something in every scroll.</h1>
          </div>
          {authMode ? (
            <AuthPanel
              mode={authMode}
              onModeChange={changeMode}
              onLogin={submitLogin}
              onRegister={submitRegister}
              setError={setError}
              setMessage={setMessage}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
