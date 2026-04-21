import api from './api';

/**
 * Dedicated service handler mapping purely to our Spring Boot Notification Controller.
 * Because we engineered api.js interceptors previously, JWT headers are dynamically injected natively.
 */
const notificationService = {

  /**
   * Hits the system returning the full array of cleansed NotificationDto feeds.
   * Naturally chronologically sorted by the backend newest-first.
   */
  getMyNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  /**
   * Explicitly hits the read-flag mutation endpoint for a single notification.
   * @param {number|string} notificationId - The unique target database ID
   */
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Fires a heavily protected hard-deletion command. 
   * Handled gracefully returning a 204 No Content upon success.
   * @param {number|string} notificationId - The unique target database ID
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationService;
