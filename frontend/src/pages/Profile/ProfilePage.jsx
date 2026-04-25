import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileSettingsForm from '../../components/ProfileSettingsForm';
import TechnicianProfilePage from '../Technician/TechnicianProfilePage';
import './ProfilePage.css';

const StandardProfilePage = () => {
  const { user, loadCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState('');

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
