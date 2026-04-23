import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import bookingService from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";
import "./BookingsPage.css";

// ── SVG Icon Helpers ──
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// ── Static Data for Popular Resources ──
const popularResources = [
  { id: "LH-101", name: "LH-101", type: "Lecture Hall", building: "Main Building", capacity: 150, image: "/images/resources/lecture_hall.png", tag: "lecture", tagLabel: "Lecture Hall" },
  { id: "Lab-2", name: "Lab 2", type: "Computer Lab", building: "Engineering Building", capacity: 40, image: "/images/resources/computer_lab.png", tag: "lab", tagLabel: "Computer Lab" },
  { id: "MR-03", name: "MR-03", type: "Meeting Room", building: "Admin Building", capacity: 12, image: "/images/resources/meeting_room.png", tag: "meeting", tagLabel: "Meeting Room" },
];

// ── Helper: format date ──
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Helper: format time ──
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

// ── Resource icon color map ──
const getResourceColor = (resourceId) => {
  const id = (resourceId || '').toLowerCase();
  if (id.includes('lh') || id.includes('lecture') || id.includes('hall')) return 'blue';
  if (id.includes('lab') || id.includes('computer')) return 'green';
  if (id.includes('mr') || id.includes('meeting') || id.includes('room')) return 'violet';
  return 'amber';
};

function BookingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });

  // ── Calendar state ──
  const [calDate, setCalDate] = useState(new Date());

  // ── Fetch Bookings ──
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = isAdmin
        ? await bookingService.getAdminBookings()
        : await bookingService.getMyBookings();
      setBookings(res.data || res || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = bookings.length;
    const approved = bookings.filter(b => b.status === 'APPROVED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length;
    return { total, approved, pending, cancelled };
  }, [bookings]);

  // ── Upcoming bookings (next 3 approved/pending) ──
  const upcoming = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings
      .filter(b => (b.status === 'APPROVED' || b.status === 'PENDING') && b.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
      .slice(0, 3);
  }, [bookings]);

  // ── Calendar logic ──
  const calendarDays = useMemo(() => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();

    const bookedDates = new Set(bookings.filter(b => b.status === 'APPROVED' || b.status === 'PENDING').map(b => b.date));

    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, otherMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        otherMonth: false,
        today: today.getDate() === d && today.getMonth() === month && today.getFullYear() === year,
        hasBooking: bookedDates.has(dateStr),
      });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, otherMonth: true });
    }
    return days;
  }, [calDate, bookings]);

  const calMonthLabel = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Greeting ──
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // ── Handlers ──
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await bookingService.create({ ...formData, userId: user.id });
      setFormData({ resourceId: '', date: '', startTime: '', endTime: '', purpose: '' });
      fetchBookings();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("This time slot conflicts with an existing booking. Please choose another time.");
      } else if (!err.response) {
        setError("Network error: Could not connect to the backend server.");
      } else {
        setError(err.response?.data?.message || "An unexpected error occurred while creating the booking.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try { await bookingService.approve(id); fetchBookings(); }
    catch (err) { alert("Failed to approve: " + (err.response?.data?.message || err.message)); }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;
    try { await bookingService.reject(id, reason); fetchBookings(); }
    catch (err) { alert("Failed to reject: " + (err.response?.data?.message || err.message)); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try { await bookingService.cancel(id); fetchBookings(); }
    catch (err) { alert("Failed to cancel: " + (err.response?.data?.message || err.message)); }
  };

  const handleResourceSelect = (resourceId) => {
    setFormData(prev => ({ ...prev, resourceId }));
    document.getElementById('bk-create-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) return <div style={{ padding: '2rem' }}>Please log in to view bookings.</div>;

  return (
    <div className="bk-page">
      {/* ── Welcome ── */}
      <div className="bk-welcome">
        <h1>{greeting}, {user?.name || 'User'} 👋</h1>
        <p className="bk-welcome-sub">
          {isAdmin ? "Manage all campus bookings from here." : "Here's what's happening with your bookings."}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="bk-stats">
        <div className="bk-stat-card">
          <div className="bk-stat-icon blue"><CalendarIcon /></div>
          <div className="bk-stat-info">
            <h3>{stats.total}</h3>
            <div className="bk-stat-label">{isAdmin ? 'Total Bookings' : 'My Bookings'}</div>
            <div className="bk-stat-sub">{isAdmin ? 'All users' : 'View your bookings'}</div>
          </div>
        </div>
        <div className="bk-stat-card">
          <div className="bk-stat-icon green"><CheckIcon /></div>
          <div className="bk-stat-info">
            <h3>{stats.approved}</h3>
            <div className="bk-stat-label">Approved</div>
            <div className="bk-stat-sub">Confirmed bookings</div>
          </div>
        </div>
        <div className="bk-stat-card">
          <div className="bk-stat-icon amber"><ClockIcon /></div>
          <div className="bk-stat-info">
            <h3>{stats.pending}</h3>
            <div className="bk-stat-label">Pending</div>
            <div className="bk-stat-sub">Awaiting approval</div>
          </div>
        </div>
        <div className="bk-stat-card">
          <div className="bk-stat-icon rose"><XIcon /></div>
          <div className="bk-stat-info">
            <h3>{stats.cancelled}</h3>
            <div className="bk-stat-label">Cancelled</div>
            <div className="bk-stat-sub">This month</div>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="bk-main-grid">
        <div>
          {/* ── Popular Resources ── */}
          {!isAdmin && (
            <div className="bk-resources-section">
              <div className="bk-section-header">
                <h2>Popular Resources</h2>
                <Link to="/resources" className="bk-view-all">View all resources →</Link>
              </div>
              <div className="bk-resources-grid">
                {popularResources.map(res => (
                  <div key={res.id} className="bk-resource-card" onClick={() => handleResourceSelect(res.id)}>
                    <div className="bk-resource-img">
                      <img src={res.image} alt={res.name} />
                      <span className={`bk-resource-tag ${res.tag}`}>{res.tagLabel}</span>
                    </div>
                    <div className="bk-resource-info">
                      <h4>{res.name}</h4>
                      <div className="bk-resource-meta">
                        <span><LocationIcon /> {res.building}</span>
                        <span><UsersIcon /> {res.capacity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Create Booking Form ── */}
          {!isAdmin && (
            <div className="bk-create-card" id="bk-create-form" style={{ marginTop: '1.5rem' }}>
              <h2>Book a Resource</h2>
              {error && <div className="bk-error-banner">{error}</div>}
              <form onSubmit={handleCreateBooking} className="bk-form-grid" style={error ? { marginTop: '1rem' } : {}}>
                <div className="bk-form-group">
                  <label>Resource / Room ID</label>
                  <input type="text" name="resourceId" value={formData.resourceId} onChange={handleInputChange} required placeholder="e.g. LH-101, Lab-2, MR-03" />
                </div>
                <div className="bk-form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="bk-form-group">
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
                </div>
                <div className="bk-form-group">
                  <label>End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
                </div>
                <div className="bk-form-group full-width">
                  <label>Purpose</label>
                  <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} required rows="2" placeholder="Briefly describe the event or purpose..." />
                </div>
                <button type="submit" className="bk-submit-btn" disabled={isSubmitting}>
                  <CalendarIcon />
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </form>
            </div>
          )}

          {/* ── Bookings Table ── */}
          <div className="bk-table-section" style={{ marginTop: '1.5rem' }}>
            <div className="bk-section-header">
              <h2>{isAdmin ? 'All Bookings' : 'My Bookings'}</h2>
            </div>
            {loading ? (
              <p style={{ color: 'var(--color-slate-400)', padding: '1rem 0' }}>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="bk-empty">
                <CalendarIcon />
                <p>No bookings found. {!isAdmin && 'Create your first booking above!'}</p>
              </div>
            ) : (
              <table className="bk-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Date & Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>
                        <div className="bk-table-resource">
                          <div className={`bk-table-resource-icon ${getResourceColor(booking.resourceId)}`}>
                            <CalendarIcon />
                          </div>
                          <div>
                            <div className="bk-table-resource-name">{booking.resourceId}</div>
                            {isAdmin && <div className="bk-table-resource-type">User: {booking.userId?.substring(0, 8)}...</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{formatDate(booking.date)}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-400)' }}>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </td>
                      <td>{booking.purpose}</td>
                      <td>
                        <span className={`bk-status ${(booking.status || '').toLowerCase()}`}>
                          {booking.status}
                        </span>
                        {booking.rejectionReason && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>
                            {booking.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td>
                        {isAdmin && booking.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(booking.id)} className="bk-action-btn approve">Approve</button>
                            <button onClick={() => handleReject(booking.id)} className="bk-action-btn reject">Reject</button>
                          </>
                        )}
                        {!isAdmin && booking.status === 'APPROVED' && (
                          <button onClick={() => handleCancel(booking.id)} className="bk-action-btn cancel">Cancel</button>
                        )}
                        {(booking.status === 'REJECTED' || booking.status === 'CANCELLED' || (!isAdmin && booking.status === 'PENDING')) && (
                          <span style={{ color: 'var(--color-slate-400)', fontSize: '0.82rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="bk-sidebar">
          {/* Upcoming Bookings */}
          <div className="bk-upcoming-card">
            <div className="bk-section-header">
              <h2>Upcoming Bookings</h2>
            </div>
            {upcoming.length === 0 ? (
              <p style={{ color: 'var(--color-slate-400)', fontSize: '0.88rem' }}>No upcoming bookings.</p>
            ) : (
              <div className="bk-upcoming-list">
                {upcoming.map(b => (
                  <div key={b.id} className="bk-upcoming-item">
                    <div className="bk-upcoming-icon"><CalendarIcon /></div>
                    <div className="bk-upcoming-details">
                      <div className="bk-upcoming-name">{b.resourceId}</div>
                      <div className="bk-upcoming-time">
                        {formatDate(b.date)} | {formatTime(b.startTime)} - {formatTime(b.endTime)}
                      </div>
                    </div>
                    <span className={`bk-status ${(b.status || '').toLowerCase()}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="bk-calendar-card">
            <div className="bk-cal-header">
              <h3>{calMonthLabel}</h3>
              <div className="bk-cal-nav">
                <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1))}>‹</button>
                <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1))}>›</button>
              </div>
            </div>
            <div className="bk-cal-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="bk-cal-day-header">{d}</div>
              ))}
              {calendarDays.map((d, i) => (
                <div
                  key={i}
                  className={`bk-cal-day${d.otherMonth ? ' other-month' : ''}${d.today ? ' today' : ''}${d.hasBooking ? ' has-booking' : ''}`}
                >
                  {d.day}
                </div>
              ))}
            </div>
            <div className="bk-cal-legend">
              <span><div className="bk-cal-legend-dot approved" /> Approved</span>
              <span><div className="bk-cal-legend-dot pending" /> Pending</span>
              <span><div className="bk-cal-legend-dot rejected" /> Rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingsPage;
