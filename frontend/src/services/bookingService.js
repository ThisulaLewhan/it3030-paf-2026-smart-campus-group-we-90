import api from './api';

export const getBookings = () => api.get('/bookings');
