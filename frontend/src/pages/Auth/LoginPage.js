import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Check your credentials.";
      setError(typeof msg === "string" ? msg : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <section className="page-card">
        <h1>Authentication</h1>
        <p>Status: <strong>Signed in</strong></p>
        {user && (
          <p>Active user: {user.name} ({user.role})</p>
        )}
        <button type="button" onClick={logout}>Sign out</button>
      </section>
    );
  }

  return (
    <section className="page-card">
      <h1>Authentication</h1>
      <p>Sign in to access the Smart Campus platform.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ padding: "8px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}

export default LoginPage;
