import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import securityService from "../../services/securityService";
import "./AccountSecurityPage.css";

function AccountSecurityPage() {
  const { user, loadCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        setPageError("");
        await loadCurrentUser();
      } catch (error) {
        if (isMounted) {
          setPageError("Unable to load your account security details right now.");
        }
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [loadCurrentUser]);

  const loginMethod = useMemo(() => {
    if (!user?.authProvider || user.authProvider.toLowerCase() === "local") {
      return "Email & Password";
    }

    return user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1);
  }, [user?.authProvider]);

  const formattedRole = useMemo(() => {
    if (!user?.role) {
      return "Unknown";
    }

    return user.role
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [user?.role]);

  const passwordSupported = !user?.authProvider || user.authProvider.toLowerCase() === "local";

  const securityItems = [
    { label: "Login Method", value: loginMethod },
    { label: "User Role", value: formattedRole },
    { label: "Password Change", value: passwordSupported ? "Supported on this account" : "Managed by your sign-in provider" },
    { label: "Session Access", value: "Protected by authenticated access" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const validate = () => {
    const nextErrors = {};

    if (!formValues.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!formValues.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (formValues.newPassword.length < 6) {
      nextErrors.newPassword = "New password must be at least 6 characters.";
    }

    if (!formValues.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (formValues.newPassword !== formValues.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (
      formValues.currentPassword &&
      formValues.newPassword &&
      formValues.currentPassword === formValues.newPassword
    ) {
      nextErrors.newPassword = "New password must be different from your current password.";
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

    if (!passwordSupported || !validate()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await securityService.changePassword({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      });

      setFormValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setStatus({ type: "success", message: "Password updated successfully." });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update your password right now.";

      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="security-page">
      <div className="security-hero">
        <div>
          <p className="security-eyebrow">Account Security</p>
          <h1>Keep your smart campus account secure</h1>
          <p className="security-subtitle">
            Review your login method, security access, and password options in one place.
          </p>
        </div>
        <button className="security-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <div>
            <h2>Security Overview</h2>
            <p>Current security settings for your account.</p>
          </div>
        </div>

        {isRefreshing && <div className="security-status">Loading your security details...</div>}
        {!isRefreshing && pageError && (
          <div className="security-status security-status-error">{pageError}</div>
        )}

        {!isRefreshing && !pageError && (
          <div className="security-grid">
            {securityItems.map((item) => (
              <div className="security-item" key={item.label}>
                <label>{item.label}</label>
                <div className="security-item-value">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <div>
            <h2>Change Password</h2>
            <p>
              {passwordSupported
                ? "Update your password for this account."
                : "This account signs in through an external provider, so password changes are not available here."}
            </p>
          </div>
        </div>

        {!passwordSupported ? (
          <div className="security-status">
            Password changes are managed by your {loginMethod} account.
          </div>
        ) : (
          <form className="security-form" onSubmit={handleSubmit} noValidate>
            {status.message && (
              <div
                className={`security-status ${
                  status.type === "error" ? "security-status-error" : "security-status-success"
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="security-form-grid">
              <div className="security-field">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formValues.currentPassword}
                  onChange={handleChange}
                  className={errors.currentPassword ? "input-error" : ""}
                  disabled={isSubmitting}
                />
                {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
              </div>

              <div className="security-field">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formValues.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? "input-error" : ""}
                  disabled={isSubmitting}
                />
                {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
              </div>

              <div className="security-field security-field-full">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "input-error" : ""}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="security-actions">
              <button type="submit" className="security-primary-button" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AccountSecurityPage;
