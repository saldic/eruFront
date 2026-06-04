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
        <span className="mode-switch-separator" aria-hidden="true">OR</span>
        <button
          className={mode === "register" ? "active" : ""}
          type="button"
          onClick={() => onModeChange("register")}
        >
          Sign up
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
