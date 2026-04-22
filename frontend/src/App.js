import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Auth/LoginPage";
import NewLoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuth2RedirectHandler from "./pages/Auth/OAuth2RedirectHandler";
import BookingsPage from "./pages/Bookings/BookingsPage";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import ResourcesPage from "./pages/Resources/ResourcesPage";
import TicketsPage from "./pages/Tickets/TicketsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountSecurityPage from "./pages/Security/AccountSecurityPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import Unauthorized from "./pages/Unauthorized";

import ProfilePage from "./pages/Profile/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login route (standalone page without sidebar) */}
          <Route path="/login" element={<NewLoginPage />} />
          
          {/* Public registration route */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Invisible component strictly used as the OAuth Callback catch-basin */}
          <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />

          {/* Main layout with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Home />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="security" element={<AccountSecurityPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="unauthorized" element={<Unauthorized />} />
              <Route path="auth/login" element={<LoginPage />} />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

