import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both your university email and password.");
      return;
    }

    if (!email.toLowerCase().endsWith("@gla.ac.in")) {
      setErrorMsg("Institutional Access Restricted: Please provide a valid @gla.ac.in student/faculty ID.");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user") || "null");

    // If user registered locally, check password; or allow demo login
    if (savedUser && savedUser.email === email.toLowerCase()) {
      if (savedUser.password !== password) {
        setErrorMsg("Authentication failed: Incorrect password provided.");
        return;
      }
    } else {
      // Auto-provision student session for ease of demonstration
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: email.split("@")[0].replace(".", " ").toUpperCase(),
          email: email.toLowerCase(),
          password: password,
          role: "GLA Student",
        })
      );
    }

    setSuccessMsg("Verification successful! Authenticating session...");
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }, 600);
  };

  const handleDemoFill = () => {
    setEmail("gopichand.vemula_cs21@gla.ac.in");
    setPassword("SmartCampus@2026");
    setErrorMsg("");
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Banner */}
        <div className="auth-brand-head">
          <div className="auth-crest-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="auth-title-block">
            <span className="auth-eyebrow">GLA UNIVERSITY • CAS SECURE LOGIN</span>
            <h1 className="auth-headline">Student &amp; Faculty Portal</h1>
            <p className="auth-sub">Enter your institutional credentials to access the Smart Campus retrieval system.</p>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="auth-error-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="auth-form-styled">
          <div className="auth-input-group">
            <label className="auth-label">
              <span>GLA Institutional Email</span>
              <span className="auth-hint">Must end with @gla.ac.in</span>
            </label>
            <div className="input-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="field-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                type="email"
                placeholder="firstname.roll_cs21@gla.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">
              <span>Campus Account Password</span>
              <span className="auth-hint">Minimum 6 characters</span>
            </label>
            <div className="input-with-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="field-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your secret password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-extra-row">
            <label className="auth-remember">
              <input type="checkbox" defaultChecked />
              <span>Remember this workstation</span>
            </label>
            <button type="button" onClick={handleDemoFill} className="btn-demo-fill">
              Use Demo Account
            </button>
          </div>

          <button type="submit" className="btn-auth-submit">
            <span>Authenticate &amp; Access Dashboard</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            New student or faculty?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
          <Link to="/" className="auth-link-subtle">
            ← Return to GLA Smart Campus Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
