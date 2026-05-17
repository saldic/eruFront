import { useState } from "react";

const emptyRegisterForm = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
};

function RegisterForm({ onRegister, setError, setMessage }) {
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [submitting, setSubmitting] = useState(false);

  function updateRegisterField(event) {
    const { name, value } = event.target;
    setRegisterForm((form) => ({ ...form, [name]: value }));
  }

  async function submitRegister(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onRegister(registerForm);
      setRegisterForm(emptyRegisterForm);
    } catch (apiError) {
      setError(apiError.message);
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitRegister}>
      <input
        name="firstName"
        value={registerForm.firstName}
        onChange={updateRegisterField}
        placeholder="First name"
        required
      />
      <input
        name="lastName"
        value={registerForm.lastName}
        onChange={updateRegisterField}
        placeholder="Last name"
        required
      />
      <input
        name="email"
        type="email"
        value={registerForm.email}
        onChange={updateRegisterField}
        placeholder="Email"
        required
      />
      <input
        name="username"
        value={registerForm.username}
        onChange={updateRegisterField}
        placeholder="Username"
        required
      />
      <input
        name="password"
        type="password"
        value={registerForm.password}
        onChange={updateRegisterField}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={submitting}>
        Create account
      </button>
    </form>
  );
}

export default RegisterForm;
