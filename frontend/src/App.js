import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import NewLoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuth2RedirectHandler from "./pages/Auth/OAuth2RedirectHandler";
import BookingsPage from "./pages/Bookings/BookingsPage";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import NotificationPreferencesPage from "./pages/Notifications/NotificationPreferencesPage";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import ResourcesPage from "./pages/Resources/ResourcesPage";
import TicketsPage from "./pages/Tickets/TicketsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountSecurityPage from "./pages/Security/AccountSecurityPage";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import Unauthorized from "./pages/Unauthorized";
import ProfilePage from "./pages/Profile/ProfilePage";
import PublicLayout from "./layouts/PublicLayout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public layout for all unauthenticated pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<NewLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* Invisible component strictly used as the OAuth Callback catch-basin */}
          <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />

          {/* Main layout with sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route path="dashboard" element={<Home />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="security" element={<AccountSecurityPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="notifications/preferences" element={<NotificationPreferencesPage />} />
              <Route path="unauthorized" element={<Unauthorized />} />
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
