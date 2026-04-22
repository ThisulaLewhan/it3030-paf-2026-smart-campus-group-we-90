import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../LoginPage.css';

const OAuth2RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthFlow = async () => {
      // Extract the JWT passed by Spring Boot securely through the Query params
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      // Also grab potential spring boot error variables just in case
      const springError = params.get('error');

      if (springError) {
        setError(`Authentication failed: ${springError}`);
        return;
      }

      if (token) {
        try {
          // Immediately engage context synchronization
          await oauthLogin(token);
          
          // Move gracefully to the root secured layout
          navigate('/dashboard', { replace: true });
        } catch (err) {
          setError('Failed to securely fetch user profile after successful OAuth login.');
        }
      } else {
        setError('No secure authentication token returned by server.');
      }
    };

    handleOAuthFlow();
  }, [location, navigate, oauthLogin]);

  // Fallback UI if something explodes mid-flight
  if (error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">OAuth Connection Error</h2>
          <div className="login-error">{error}</div>
          <button className="login-button" onClick={() => navigate('/login')}>
            Return to Standard Login
          </button>
        </div>
      </div>
    );
  }

  // Graceful loading UI while context syncs over the network
  return (
    <div className="login-container">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <h2 className="login-title">Synchronizing Security Profile...</h2>
        <div style={{ marginTop: '2rem' }}>
          <span className="button-spinner-wrap" style={{ color: '#3b82f6' }}>
            <span 
              className="button-spinner" 
              style={{ 
                borderColor: 'rgba(59, 130, 246, 0.2)', 
                borderTopColor: '#3b82f6', 
                width: '35px', 
                height: '35px',
                borderWidth: '3px'
              }}
            ></span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
