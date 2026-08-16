function Register() {
  return (
    <div className="auth-page">
      <h1>Create Account</h1>

      <form>
        <label>Name</label>
        <input
          type="text"
          placeholder="Enter your name"
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Create a password"
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your password"
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;