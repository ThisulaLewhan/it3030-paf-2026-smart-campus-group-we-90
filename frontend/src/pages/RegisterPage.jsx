import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  
  // Input tracking
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UX State tracking
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Frontend validation checks
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Hit the backend register endpoint
      const response = await authService.register(name, email, password);
      
      // Sync the AuthContext state with the new token + user
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Redirect to the app after successful registration
      navigate('/');
      // Force a full reload so AuthContext re-hydrates from the new localStorage data
      window.location.reload();
      
    } catch (err) {
      if (err.response && err.response.data) {
        const serverError = err.response.data.message || err.response.data.error || err.response.data;
        setError(typeof serverError === 'string' ? serverError : 'Registration failed. Please try again.');
      } else {
        setError('Network unavailable. Ensure your Spring Boot backend is actively running!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@smartcampus.edu"
              disabled={loading}
              required
            />
          </div>
          
          <div className="login-form-group">
            <label className="login-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className="login-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? (
              <span className="button-spinner-wrap">
                <span className="button-spinner"></span> Creating Account...
              </span>
            ) : 'Sign Up'}
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
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="google-logo" />
          Sign up with Google
        </button>

        <p className="auth-switch-text">
          Already have an account? <Link to="/login" className="auth-switch-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
