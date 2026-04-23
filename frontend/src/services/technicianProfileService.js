const STORAGE_PREFIX = "smart-campus-technician-profile";

const buildStorageKey = (userId) => `${STORAGE_PREFIX}:${userId || "current"}`;

const getDefaultProfile = (user = {}) => ({
  phoneNumber: user.phoneNumber || "",
  department: "",
  specialization: "",
  availabilityStatus: "Available",
  avatarUrl: "",
});

const technicianProfileService = {
  getProfile(user) {
    const storageKey = buildStorageKey(user?.id);
    const fallbackProfile = getDefaultProfile(user);

    try {
      const rawProfile = localStorage.getItem(storageKey);
      if (!rawProfile) {
        return fallbackProfile;
      }

      const parsedProfile = JSON.parse(rawProfile);
      return {
        ...fallbackProfile,
        ...parsedProfile,
      };
    } catch (error) {
      return fallbackProfile;
    }
  },

  saveProfile(user, payload) {
    const storageKey = buildStorageKey(user?.id);
    const mergedProfile = {
      ...this.getProfile(user),
      ...payload,
    };

    localStorage.setItem(storageKey, JSON.stringify(mergedProfile));
    return mergedProfile;
  },
};

export default technicianProfileService;
