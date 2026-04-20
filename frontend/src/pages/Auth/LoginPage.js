import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const { currentUser, isAuthenticated, login, logout } = useAuth();

  const handleLogin = () => {
    login({
      id: "demo-user",
      name: "Campus Admin",
      role: "ADMIN",
    });
  };

  return (
    <section className="page-card">
      <h1>Authentication</h1>
      <p>
        This lightweight auth context keeps routing ready for future login and
        role-based access work.
      </p>
      <p>
        Status: <strong>{isAuthenticated ? "Signed in" : "Signed out"}</strong>
      </p>
      {currentUser && (
        <p>
          Active user: {currentUser.name} ({currentUser.role})
        </p>
      )}
      <button type="button" onClick={isAuthenticated ? logout : handleLogin}>
        {isAuthenticated ? "Sign out" : "Sign in with demo user"}
      </button>
    </section>
  );
}

export default LoginPage;
