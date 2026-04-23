import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import authService from '../services/authService';

// Safely isolates the context instance
const AuthContext = createContext();

// Custom hook to cleanly consume the context natively in any component like: const { user, login } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used strictly within an AuthProvider higher in the DOM tree');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  // Tracks the initial hydration phase to prevent UI flashes
  const [loading, setLoading] = useState(true);

  // Re-hydrate the memory states the absolute nanosecond the app boots
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = authService.getStoredUser();

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        setUser(storedUser);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Universal Login Wrapper
   */
  const login = useCallback(async (email, password) => {
    // Leverage the raw service layer to handle the hard HTTP requests
    const response = await authService.login(email, password);
    
    // Manually snap the React State into exact sync with the newly cached payload
    setToken(response.token);
    setUser(response.user);
    
    return response;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await authService.register(name, email, password);

    setToken(response.token);
    setUser(response.user);

    return response;
  }, []);

  /**
   * Universal Logout Wrapper
   */
  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Safe refresh tool strictly pulling the exact authoritative user from the backend DB directly
   */
  const loadCurrentUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUserAsync();
      
      // Update both React State and LocalStorage seamlessly in case the DB updated their role 
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      // If the token quietly expired while they were gone, instantly scrub it cleanly!
      if (error.response && error.response.status === 401) {
        logout();
      }
      throw error;
    }
  }, [logout]);

  /**
   * OAuth Login Wrapper
   * Ingests the raw JWT from the URL callback
   */
  const oauthLogin = useCallback(async (newToken) => {
    // Stage 1: Store the raw token precisely so the Axios Interceptor picks it up
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    // Stage 2: Try to pull our full profile immediately, but keep the login alive if it lags.
    try {
      await loadCurrentUser();
    } catch (error) {
      return null;
    }
  }, [loadCurrentUser]);

  // Bundle exposing all assets to descendant nodes
  const value = {
    user,
    token,
    loading,
    login,
    register,
    oauthLogin,
    logout,
    loadCurrentUser,
    isAuthenticated: !!token // Quick helper boolean evaluating the auth presence
  };

  return (
    <AuthContext.Provider value={value}>
      {/* We freeze children rendering until loading resolves so guarded routes don't bounce prematurely */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
