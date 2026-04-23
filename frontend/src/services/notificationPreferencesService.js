const STORAGE_KEY = "notification_preferences";

const defaultPreferences = {
  bookings: true,
  tickets: true,
  comments: true,
};

const notificationPreferencesService = {
  async getPreferences() {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return { ...defaultPreferences };
    }

    try {
      return {
        ...defaultPreferences,
        ...JSON.parse(storedValue),
      };
    } catch (error) {
      return { ...defaultPreferences };
    }
  },

  async savePreferences(preferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return { ...preferences };
  },
};

export default notificationPreferencesService;
