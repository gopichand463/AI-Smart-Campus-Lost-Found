import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Biotechnology",
    "Management Studies (BBA/MBA)",
    "Pharmaceutical Sciences",
    "Polytechnic & Diploma"
  ];

  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (!email.toLowerCase().endsWith("@gla.ac.in")) {
      setErrorMsg("Institutional Restriction: Registration requires an official @gla.ac.in university domain address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Security requirement: Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Verification mismatch: Passwords do not match.");
      return;
    }

    // Save user record in local storage
    const userData = {
      name: name.trim(),
      rollNo: rollNo.trim(),
      email: email.toLowerCase().trim(),
      password,
      department,
      registeredAt: new Date().toLocaleDateString(),
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setSuccessMsg("Registration successful! Initializing your student profile...");
    setTimeout(() => {
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }, 700);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card-wide">
        {/* Brand Banner */}
        <div className="auth-brand-head">
          <div className="auth-crest-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="auth-title-block">
            <span className="auth-eyebrow">GLA UNIVERSITY • STUDENT DIRECTORY</span>
            <h1 className="auth-headline">Create Campus Account</h1>
            <p className="auth-sub">Register to receive automated visual and text-based match notifications for lost campus items.</p>
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
        <form onSubmit={handleRegister} className="auth-form-styled">
          <div className="form-two-col">
            <div className="auth-input-group">
              <label className="auth-label">Full Name <span className="req">*</span></label>
              <input
                type="text"
                placeholder="e.g. Vemula Gopi Chand"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">University Roll / Reg. No.</label>
              <input
                type="text"
                placeholder="e.g. 2115000999"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </div>
          </div>

          <div className="form-two-col">
            <div className="auth-input-group">
              <label className="auth-label">
                <span>GLA Email Address</span>
                <span className="req">*</span>
              </label>
              <input
                type="email"
                placeholder="name.roll_cs21@gla.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Academic Department</label>
              <select
                className="auth-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-two-col">
            <div className="auth-input-group">
              <label className="auth-label">Password <span className="req">*</span></label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Confirm Password <span className="req">*</span></label>
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit btn-auth-forest">
            <span>Register &amp; Create Profile</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an active campus account?{" "}
            <Link to="/login" className="auth-link">
              Sign in here
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

export default Register;
