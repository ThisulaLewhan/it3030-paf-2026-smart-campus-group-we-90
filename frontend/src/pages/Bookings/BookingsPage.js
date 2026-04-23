import React, { useState, useEffect } from "react";
import bookingService from "../../services/bookingService";
import authService from "../../services/authService";
import "./BookingsPage.css";

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const user = authService.getStoredUser();
  const isAdmin = user?.role === 'ADMIN';

  // Form state
  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await bookingService.getAdminBookings();
      } else {
        data = await bookingService.getMyBookings();
      }
      // Depending on axios/fetch configuration, the array might be directly returned or inside .data
      setBookings(data.data || data || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await bookingService.create({
        ...formData,
        userId: user.id
      });
      setFormData({ resourceId: '', date: '', startTime: '', endTime: '', purpose: '' });
      fetchBookings();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("Time slot is already booked! Please select another time.");
      } else {
        setError(err.response?.data?.message || "Failed to create booking. Ensure start time is before end time.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await bookingService.approve(id);
      fetchBookings();
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    try {
      await bookingService.reject(id, reason);
      fetchBookings();
    } catch (err) {
      alert("Failed to reject: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancel(id);
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel: " + (err.response?.data?.message || err.message));
    }
  };

  if (!user) return <div style={{padding: '2rem'}}>Please log in to view bookings.</div>;

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>{isAdmin ? "All Bookings (Admin)" : "My Bookings"}</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!isAdmin && (
        <div className="booking-form-card">
          <h2>Create New Booking</h2>
          <form onSubmit={handleCreateBooking} className="form-grid">
            <div className="form-group">
              <label>Resource / Room ID</label>
              <input type="text" name="resourceId" value={formData.resourceId} onChange={handleInputChange} required placeholder="e.g. Auditorium A" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
            </div>
            <div className="form-group full-width">
              <label>Purpose</label>
              <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} required rows="2" placeholder="Briefly describe the event..."></textarea>
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading bookings...</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className={`booking-card status-${booking.status}`}>
              <div className="booking-card-header">
                <h3>{booking.resourceId}</h3>
                <span className="status-badge">{booking.status}</span>
              </div>
              
              <div className="booking-detail">
                <strong>Date:</strong> {booking.date}
              </div>
              <div className="booking-detail">
                <strong>Time:</strong> {booking.startTime} - {booking.endTime}
              </div>
              <div className="booking-detail">
                <strong>Purpose:</strong> {booking.purpose}
              </div>
              {isAdmin && (
                <div className="booking-detail">
                  <strong>User ID:</strong> {booking.userId}
                </div>
              )}
              {booking.rejectionReason && (
                <div className="booking-detail" style={{color: '#dc2626', marginTop: '0.5rem'}}>
                  <strong>Reason:</strong> {booking.rejectionReason}
                </div>
              )}

              <div className="booking-actions">
                {isAdmin && booking.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(booking.id)} className="action-btn approve">Approve</button>
                    <button onClick={() => handleReject(booking.id)} className="action-btn reject">Reject</button>
                  </>
                )}
                {!isAdmin && booking.status === 'APPROVED' && (
                  <button onClick={() => handleCancel(booking.id)} className="action-btn cancel">Cancel</button>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p style={{color: '#64748b'}}>No bookings found.</p>}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
