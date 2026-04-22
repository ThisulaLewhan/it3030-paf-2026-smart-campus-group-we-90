const STORAGE_KEY = "user_activity_feed";

const defaultActivity = [
  {
    id: "activity-1",
    type: "login",
    title: "Signed in to the smart campus portal",
    description: "Your account logged in successfully.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "activity-2",
    type: "profile",
    title: "Profile details reviewed",
    description: "You opened your profile page and account information.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "activity-3",
    type: "notifications",
    title: "Notification center accessed",
    description: "Recent notifications were checked from the notification center.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "activity-4",
    type: "role",
    title: "Role status confirmed",
    description: "Your current access level and role permissions were loaded.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

const userActivityService = {
  async getRecentActivity() {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [...defaultActivity];
    }

    try {
      const parsed = JSON.parse(storedValue);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...defaultActivity];
    } catch (error) {
      return [...defaultActivity];
    }
  },
};

export default userActivityService;
