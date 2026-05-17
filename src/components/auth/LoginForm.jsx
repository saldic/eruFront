import { useState } from "react";

const emptyLoginForm = {
  username: "",
  password: "",
};

function LoginForm({ onLogin, setError, setMessage }) {
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [submitting, setSubmitting] = useState(false);

  function updateLoginField(event) {
    const { name, value } = event.target;
    setLoginForm((form) => ({ ...form, [name]: value }));
  }

  async function submitLogin(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onLogin(loginForm);
      setLoginForm(emptyLoginForm);
    } catch (apiError) {
      setError(apiError.message);
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitLogin}>
      <input
        name="username"
        value={loginForm.username}
        onChange={updateLoginField}
        placeholder="Username"
        required
      />
      <input
        name="password"
        type="password"
        value={loginForm.password}
        onChange={updateLoginField}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={submitting}>
        Login
      </button>
    </form>
  );
}

export default LoginForm;
