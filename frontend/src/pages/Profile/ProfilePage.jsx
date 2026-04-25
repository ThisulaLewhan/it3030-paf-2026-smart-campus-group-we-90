import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileSettingsForm from '../../components/ProfileSettingsForm';
import TechnicianProfilePage from '../Technician/TechnicianProfilePage';
import securityService from '../../services/securityService';
import './ProfilePage.css';

const StandardProfilePage = () => {
  const { user, loadCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  // Security Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        setError('');
        await loadCurrentUser();
      } catch (fetchError) {
        if (isMounted) {
          setError('Unable to load your profile details right now.');
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const formattedRole = useMemo(() => {
    if (!user?.role) {
      return 'Unknown';
    }

    return user.role
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [user?.role]);

  const formattedAuthProvider = useMemo(() => {
    if (!user?.authProvider) {
      return 'Email & Password';
    }

    if (user.authProvider.toLowerCase() === 'local') {
      return 'Email & Password';
    }

    return user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1);
  }, [user?.authProvider]);

  const formattedCreatedAt = useMemo(() => {
    if (!user?.createdAt) {
      return 'Not available';
    }

    const parsedDate = new Date(user.createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available';
    }

    return parsedDate.toLocaleString();
  }, [user?.createdAt]);

  const profileFields = [
    { label: 'Name', value: user?.name || 'Not available' },
    { label: 'Email', value: user?.email || 'Not available' },
    { label: 'Role', value: formattedRole },
    { label: 'Auth Provider', value: formattedAuthProvider },
    { label: 'Created Date', value: formattedCreatedAt },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSaved = async (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    await loadCurrentUser();
  };

  const passwordSupported = !user?.authProvider || user.authProvider.toLowerCase() === 'local';

  const validateSecurity = () => {
    const nextErrors = {};

    if (!formValues.currentPassword) {
      nextErrors.currentPassword = 'Current password is required.';
    }

    if (!formValues.newPassword) {
      nextErrors.newPassword = 'New password is required.';
    } else if (formValues.newPassword.length < 6) {
      nextErrors.newPassword = 'New password must be at least 6 characters.';
    }

    if (!formValues.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (formValues.newPassword !== formValues.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (
      formValues.currentPassword &&
      formValues.newPassword &&
      formValues.currentPassword === formValues.newPassword
    ) {
      nextErrors.newPassword = 'New password must be different from your current password.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSecurityChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setStatus({ type: '', message: '' });
  };

  const handleSecuritySubmit = async (event) => {
    event.preventDefault();

    if (!passwordSupported || !validateSecurity()) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await securityService.changePassword({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      });

      setFormValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus({ type: 'success', message: 'Password updated successfully.' });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to update your password right now.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-shell">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="profile-title">
            <p className="profile-eyebrow">My Profile</p>
            <h1>{user?.name || 'Loading profile'}</h1>
            <p className="profile-subtitle">
              View the details from your current authenticated session.
            </p>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Info
          </button>
          <button 
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Account Security
          </button>
        </div>

        {activeTab === 'general' && (
          <>
            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h2 className="section-title">Account Details</h2>
                  <p className="section-copy">
                    Data is refreshed from the current user API when this page opens.
                  </p>
                </div>
                <button className="profile-logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              {isRefreshing && (
                <div className="profile-status">Loading your profile details...</div>
              )}

              {!isRefreshing && error && (
                <div className="profile-status profile-status-error">{error}</div>
              )}

              {!isRefreshing && !error && (
                <div className="info-grid">
                  {profileFields.map((field) => (
                    <div className="info-group" key={field.label}>
                      <label>{field.label}</label>
                      <div className="info-value">{field.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isRefreshing && !error && (
              <ProfileSettingsForm user={user} onProfileSaved={handleProfileSaved} />
            )}
          </>
        )}

        {activeTab === 'security' && (
          <div className="profile-card">
            <div className="profile-card-header">
              <div>
                <h2 className="section-title">Change Password</h2>
                <p className="section-copy">
                  {passwordSupported
                    ? "Update your password to keep your account secure."
                    : `Password changes are managed by your ${formattedAuthProvider} provider.`}
                </p>
              </div>
            </div>

            {!passwordSupported ? (
              <div className="profile-status">
                This account signs in through an external provider. Password changes are not available here.
              </div>
            ) : (
              <form className="profile-settings-form" onSubmit={handleSecuritySubmit} noValidate>
                {status.message && (
                  <div
                    className={`profile-status ${
                      status.type === 'error' ? 'profile-status-error' : 'profile-status-success'
                    }`}
                  >
                    {status.message}
                  </div>
                )}

                <div className="security-form-grid" style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr' }}>
                  <div className="info-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formValues.currentPassword}
                      onChange={handleSecurityChange}
                      className={`profile-input ${errors.currentPassword ? "profile-input-error" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.currentPassword && <p className="profile-field-error">{errors.currentPassword}</p>}
                  </div>

                  <div className="info-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formValues.newPassword}
                      onChange={handleSecurityChange}
                      className={`profile-input ${errors.newPassword ? "profile-input-error" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.newPassword && <p className="profile-field-error">{errors.newPassword}</p>}
                  </div>

                  <div className="info-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formValues.confirmPassword}
                      onChange={handleSecurityChange}
                      className={`profile-input ${errors.confirmPassword ? "profile-input-error" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.confirmPassword && <p className="profile-field-error">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="profile-form-actions" style={{ marginTop: '1rem' }}>
                  <button type="submit" className="profile-primary-button" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();

  if (user?.role === 'TECHNICIAN') {
    return <TechnicianProfilePage />;
  }

  return <StandardProfilePage />;
};

export default ProfilePage;
