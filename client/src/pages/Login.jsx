import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const errors = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn primary big" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </div>
  );
}