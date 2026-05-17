import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";

function AuthPanel({
  mode,
  onModeChange,
  onLogin,
  onRegister,
  setError,
  setMessage,
}) {
  return (
    <section className="auth-panel">
      <div className="mode-switch" aria-label="Authentication mode">
        <button
          className={mode === "login" ? "active" : ""}
          type="button"
          onClick={() => onModeChange("login")}
        >
          Login
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          type="button"
          onClick={() => onModeChange("register")}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <LoginForm onLogin={onLogin} setError={setError} setMessage={setMessage} />
      ) : (
        <RegisterForm onRegister={onRegister} setError={setError} setMessage={setMessage} />
      )}
    </section>
  );
}

export default AuthPanel;
