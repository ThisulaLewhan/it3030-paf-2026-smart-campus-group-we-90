import React, { useEffect, useState } from "react";
import userService from "../services/userService";

const PHONE_PATTERN = /^[+]?[0-9()\-\s]{7,30}$/;

function ProfileSettingsForm({ user, onProfileSaved }) {
  const [formValues, setFormValues] = useState({
    name: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormValues({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    });
  }, [user?.name, user?.phoneNumber]);

  const validate = () => {
    const nextErrors = {};
    const trimmedName = formValues.name.trim();
    const trimmedPhone = formValues.phoneNumber.trim();

    if (!trimmedName) {
      nextErrors.name = "Display name is required.";
    } else if (trimmedName.length < 2) {
      nextErrors.name = "Display name must be at least 2 characters.";
    }

    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      nextErrors.phoneNumber = "Enter a valid phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = {
        name: formValues.name.trim(),
        phoneNumber: formValues.phoneNumber.trim(),
      };

      const response = await userService.updateProfile(payload);
      const updatedUser = response.data;

      setFormValues({
        name: updatedUser.name || "",
        phoneNumber: updatedUser.phoneNumber || "",
      });
      setStatus({ type: "success", message: "Profile settings updated successfully." });

      if (onProfileSaved) {
        onProfileSaved(updatedUser);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update your profile settings right now.";

      setStatus({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div>
          <h2 className="section-title">Profile Settings</h2>
          <p className="section-copy">
            Update the details that appear on your account.
          </p>
        </div>
      </div>

      <form className="profile-settings-form" onSubmit={handleSubmit} noValidate>
        {status.message && (
          <div
            className={`profile-status ${
              status.type === "error" ? "profile-status-error" : "profile-status-success"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="info-grid">
          <div className="info-group">
            <label htmlFor="settings-name">Display Name</label>
            <input
              id="settings-name"
              name="name"
              className={`profile-input ${errors.name ? "profile-input-error" : ""}`}
              value={formValues.name}
              onChange={handleChange}
              placeholder="Enter your display name"
              disabled={isSaving}
            />
            {errors.name && <p className="profile-field-error">{errors.name}</p>}
          </div>

          <div className="info-group">
            <label htmlFor="settings-phone">Phone Number</label>
            <input
              id="settings-phone"
              name="phoneNumber"
              className={`profile-input ${errors.phoneNumber ? "profile-input-error" : ""}`}
              value={formValues.phoneNumber}
              onChange={handleChange}
              placeholder="+94 77 123 4567"
              disabled={isSaving}
            />
            {errors.phoneNumber && <p className="profile-field-error">{errors.phoneNumber}</p>}
          </div>
        </div>

        <div className="profile-form-actions">
          <button type="submit" className="profile-primary-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettingsForm;
