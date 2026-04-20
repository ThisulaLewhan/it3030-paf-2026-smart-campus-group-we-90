import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/Auth/LoginPage";
import BookingsPage from "./pages/Bookings/BookingsPage";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import ResourcesPage from "./pages/Resources/ResourcesPage";
import TicketsPage from "./pages/Tickets/TicketsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="auth/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
