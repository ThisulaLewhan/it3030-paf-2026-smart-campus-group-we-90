import React, { createContext, useState, useEffect, useContext } from 'react';
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

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Universal Login Wrapper
   */
  const login = async (email, password) => {
    // Leverage the raw service layer to handle the hard HTTP requests
    const response = await authService.login(email, password);
    
    // Manually snap the React State into exact sync with the newly cached payload
    setToken(response.token);
    setUser(response.user);
    
    return response;
  };

  /**
   * Universal Logout Wrapper
   */
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  /**
   * Safe refresh tool strictly pulling the exact authoritative user from the backend DB directly
   */
  const loadCurrentUser = async () => {
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
  };

  // Bundle exposing all assets to descendant nodes
  const value = {
    user,
    token,
    loading,
    login,
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
