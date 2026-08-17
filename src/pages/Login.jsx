import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!email.toLowerCase().endsWith("@gla.ac.in")) {
      alert("Please use your GLA University email address.");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("user"));

if (!savedUser) {
  alert("No account found. Please register first.");
  return;
}

if (savedUser.email !== email.toLowerCase()) {
  alert("Email is not registered.");
  return;
}

if (savedUser.password !== password) {
  alert("Incorrect password.");
  return;
}

alert("Login successful!");
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <label>GLA Email</label>
        <input
          type="email"
          placeholder="example@gla.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </form>
    </div>
  );
}

export default Login;