import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        const serverError = err.response.data.message || err.response.data.error || err.response.data;
        setError(typeof serverError === 'string' ? serverError : 'Invalid login credentials.');
      } else {
        setError('Network unavailable. Ensure your Spring Boot backend is actively running!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="auth-shell">
        <div className="login-card">
          <Link to="/" className="login-back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Home
          </Link>


          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">
            Sign in to continue to your dashboard.
          </p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label className="login-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@smartcampus.edu"
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label" htmlFor="password">Password</label>
              </div>
              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                      <path d="M5 19l14-14" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="login-helper-text">Use the same credentials you registered with.</p>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span className="button-spinner-wrap">
                  <span className="button-spinner"></span> Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-login-button"
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            disabled={loading}
          >
            <svg className="google-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-switch-text">
            Don&apos;t have an account? <Link to="/register" className="auth-switch-link">Create Account</Link>
          </p>
          <p className="auth-footer-note">
            Protected access for students, staff, and administrators.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
