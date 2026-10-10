import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    else if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!email.trim()) errors.email = "Email is required";
    else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
          />
          {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
        </div>

        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
          />
          {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn primary big" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}