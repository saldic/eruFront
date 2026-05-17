import { Link, Navigate, useNavigate, useOutletContext, useParams } from "react-router";
import AuthPanel from "../components/auth/AuthPanel.jsx";
import StatusMessage from "../components/feedback/StatusMessage.jsx";
import eruLogo from "../assets/eru-logo.png";
import eruSymbol from "../assets/eru-symbol.png";

function getMode(routeMode) {
  return routeMode === "login" || routeMode === "register" ? routeMode : null;
}

function AuthPage() {
  const {
    currentUser,
    error,
    handleLogin,
    handleRegister,
    message,
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
        <img src={eruSymbol} alt="eru" className="nav-symbol" />
        <div className="nav-actions">
          <Link to="/auth/login">Login</Link>
          <Link to="/auth/register">Sign up</Link>
        </div>
      </nav>

      <section className="auth-hero">
        <img src={eruLogo} alt="eru" className="hero-logo" />

        <div className="auth-card">
          <div className="auth-copy">
            <h1>Learn something in every scroll.</h1>
          </div>
          <div className="hero-actions">
            <Link to="/auth/login">Login</Link>
            <span>or</span>
            <Link to="/auth/register">Sign up</Link>
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
          <StatusMessage message={message} error={error} />
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
