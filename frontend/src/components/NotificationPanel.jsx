import React, { useState, useEffect, useRef } from 'react';
import notificationService from '../services/notificationService';
import './NotificationPanel.css';

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Track out-of-bounds clicking naturally
  const panelRef = useRef(null);

  // Directly leverages the explicit Axios binding module we created
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to sync notifications from backend", error);
    } finally {
      setLoading(false);
    }
  };

  // Natively poll the server for fresh array chunks mapping the unread count instantly
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Window event listener binding to instantly shut the floating dropdown 
  // safely if the user clicks anywhere else universally on the DOM layout.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // UI toggle wrapper
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      // Intelligently sync to grab the absolute newest hits when the human opens it
      fetchNotifications();
    }
  };

  // Mapped UI invocation hitting PUT -> translates state seamlessly allowing rapid non-blocking UX
  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      
      // Update cache mechanically preserving array structures
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to update read state", error);
    }
  };

  // Mapped UI invocation hitting DELETE -> violently scrubs it out completely mapping the 204
  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      
      // Hard filter the JSON chunk directly to reflect the permanent DB deletion
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification entity from DB", error);
    }
  };

  // Fast mathematical computation scanning raw memory to calculate the red popup integer
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-wrapper" ref={panelRef}>
      
      {/* Absolute Master Bell Trigger */}
      <button className="notification-bell" onClick={handleToggle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {/* Floating Panel Canvas */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
          </div>
          
          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div className="notification-empty">Loading feeds...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">You're all caught up!</div>
            ) : (
              notifications.map((notif) => (
                
                /* Mount dynamic CSS triggers natively tied to the 'read' payload and explicitly passing 'type' */
                <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} data-type={notif.type}>
                  
                  <div className="notification-content">
                    <div className="notification-type">{notif.type}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    {/* Only render the CHECK button if the db flag natively says it's still unread! */}
                    {!notif.read && (
                      <button onClick={(e) => markAsRead(notif.id, e)} className="btn-read" title="Mark as read">✓</button>
                    )}
                    <button onClick={(e) => deleteNotification(notif.id, e)} className="btn-delete" title="Delete forever">✕</button>
                  </div>
                  
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
    </div>
  );
};

export default NotificationPanel;
