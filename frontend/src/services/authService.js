import api from './api';

const authService = {
  /**
   * Hits the Spring Boot AuthController login endpoint.
   * If successful, natively caches the JWT and safe DTO inside LocalStorage.
   */
  login: async (email, password) => {
    // Passes the cleanly formatted LoginRequestDto payload
    const response = await api.post('/auth/login', { email, password });
    
    // AuthResponseDto cleanly packs the 'token' and 'user' fields mapping identically to Spring Boot
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Eradicates cached keys triggering instant frontend logout
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Pings the heavily restricted /api/auth/me backend endpoint.
   * No token passing is needed explicitly here because our 'api.js' interceptor injects it natively!
   */
  getCurrentUserAsync: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Flawless synchronous helper to immediately rip the User payload from cache without awaiting network
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;
