import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // Input tracking
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UX State tracking
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    // Prevent the standard HTML form submission loop
    e.preventDefault();
    
    // Clean out any lingering errors before the new attempt
    setError('');
    
    // Quick frontend safety check before hitting the network
    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    setLoading(true);

    try {
      // Connect specifically to the custom Axios service we finalized previously
      await authService.login(email, password);
      
      // If Spring Boot returns a 200 OK + JWT, transition seamlessly into the app
      navigate('/dashboard'); 
      
    } catch (err) {
      // Actively intercept failures thrown by our backend's GlobalExceptionHandler
      if (err.response && err.response.data) {
        
        // Dynamically extract the explicit 'message' from our ErrorResponseDto json payload
        const serverError = err.response.data.message || err.response.data.error || err.response.data;
        setError(typeof serverError === 'string' ? serverError : 'Invalid login credentials.');
        
      } else {
        setError('Network unavailable. Ensure your Spring Boot backend is actively running!');
      }
    } finally {
      // Guarantee buttons unlock universally no matter what happened
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Secure Portal</h2>
        
        {/* Mount error conditionally only when something faults */}
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
            />
          </div>
          
          <div className="login-form-group">
            <label className="login-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
