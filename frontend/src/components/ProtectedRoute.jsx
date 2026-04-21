import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // The AuthProvider intrinsically freezes initial renders, but this 
  // secondary check mathematically guarantees we strictly never bounce 
  // users prematurely while their session is hydrating from LocalStorage.
  if (loading) {
    return null; // A sleek <LoadingSpinner /> could be inserted here later
  }

  // Level 1: Authentication Wall
  // If hitting the protected route with absolutely no active session token, bounce instantly to login
  if (!isAuthenticated) {
    // The 'replace' strictly overwrites the browser history so they can't 'back button' into the wall
    return <Navigate to="/login" replace />;
  }

  // Level 2: Authorization (RBAC) Wall
  // If the route explicitly demands specific roles (e.g., ['ADMIN'])
  if (allowedRoles.length > 0) {
    
    // Check their exact role string (USER or ADMIN) against the allowed list passed to the prop
    if (!user || !allowedRoles.includes(user.role)) {
      // If a standard USER tries to access an explicit ADMIN route, gently 
      // deflect them safely back into the dashboard instead of kicking them out entirely.
      return <Navigate to="/dashboard" replace />;
    }
    
  }

  // Check 3: Cleared all obstacles!
  // Smoothly render the nested protected children, supporting both prop or route-nesting patterns
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
