import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ticketService from "../../services/ticketService";
import technicianProfileService from "../../services/technicianProfileService";
import "./TechnicianPages.css";

const AVAILABILITY_OPTIONS = ["Available", "Busy", "On Leave", "Offline"];

const normalizeText = (value) => (value || "").trim().toLowerCase();

const getInitials = (name) => {
  if (!name) {
    return "T";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

function TechnicianProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => technicianProfileService.getProfile(user));
  const [ticketCounts, setTicketCounts] = useState({ assigned: 0, completed: 0 });
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [formState, setFormState] = useState(() => technicianProfileService.getProfile(user));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedProfile = technicianProfileService.getProfile(user);
    setProfile(storedProfile);
    setFormState(storedProfile);
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const loadTicketCounts = async () => {
      try {
        setLoadingTickets(true);
        const response = await ticketService.getAll();
        const allTickets = Array.isArray(response.data) ? response.data : [];

        const technicianIdentifiers = [
          normalizeText(user?.id),
          normalizeText(user?.email),
          normalizeText(user?.name),
        ].filter(Boolean);

        const assignedTickets = allTickets.filter((ticket) =>
          technicianIdentifiers.includes(normalizeText(ticket.assignedTo))
        );

        const completedTickets = assignedTickets.filter((ticket) =>
          ["resolved", "closed", "completed", "done"].includes(normalizeText(ticket.status))
        );

        if (isMounted) {
          setTicketCounts({
            assigned: assignedTickets.length,
            completed: completedTickets.length,
          });
        }
      } catch (error) {
        if (isMounted) {
          setTicketCounts({ assigned: 0, completed: 0 });
        }
      } finally {
        if (isMounted) {
          setLoadingTickets(false);
        }
      }
    };

    loadTicketCounts();

    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.id, user?.name]);

  const validate = () => {
    const nextErrors = {};

    if (formState.phoneNumber && !/^[0-9+\-\s()]{7,20}$/.test(formState.phoneNumber)) {
      nextErrors.phoneNumber = "Use a valid phone number format.";
    }

    if (formState.avatarUrl) {
      try {
        new URL(formState.avatarUrl);
      } catch (error) {
        nextErrors.avatarUrl = "Enter a valid image URL.";
      }
    }

    if (formState.department && formState.department.length > 60) {
      nextErrors.department = "Department should stay under 60 characters.";
    }

    if (formState.specialization && formState.specialization.length > 80) {
      nextErrors.specialization = "Specialization should stay under 80 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    setFormState((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!validate()) {
      setStatus({ type: "error", message: "Please correct the highlighted technician profile fields." });
      return;
    }

    const savedProfile = technicianProfileService.saveProfile(user, formState);
    setProfile(savedProfile);
    setFormState(savedProfile);
    setStatus({ type: "success", message: "Technician profile updated successfully." });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarSource = profile.avatarUrl || formState.avatarUrl;

  const profileFields = useMemo(
    () => [
      { label: "Full Name", value: user?.name || "Not available" },
      { label: "Email", value: user?.email || "Not available" },
      { label: "Role", value: "Technician" },
      { label: "Phone Number", value: profile.phoneNumber || "Not available" },
      { label: "Department", value: profile.department || "Not available" },
      { label: "Specialization", value: profile.specialization || "Not available" },
      { label: "Availability Status", value: profile.availabilityStatus || "Available" },
      {
        label: "Assigned Ticket Count",
        value: loadingTickets ? "Loading..." : String(ticketCounts.assigned),
      },
      {
        label: "Completed Ticket Count",
        value: loadingTickets ? "Loading..." : String(ticketCounts.completed),
      },
    ],
    [loadingTickets, profile, ticketCounts.assigned, ticketCounts.completed, user?.email, user?.name]
  );

  return (
    <section className="technician-page">
      <div className="technician-profile-hero">
        <div className="technician-profile-avatar-wrap">
          {avatarSource ? (
            <img
              src={avatarSource}
              alt={`${user?.name || "Technician"} avatar`}
              className="technician-profile-avatar technician-profile-image"
            />
          ) : (
            <div className="technician-profile-avatar">{getInitials(user?.name)}</div>
          )}
        </div>

        <div className="technician-profile-copy">
          <p className="technician-eyebrow">Technician Profile</p>
          <h1>{user?.name || "Technician"}</h1>
          <div className="technician-profile-meta-row">
            <span className="technician-role-badge">TECHNICIAN</span>
            <span>{profile.specialization || profile.department || "Campus support technician"}</span>
          </div>
          <p className="technician-subtitle">
            Keep your technician details current so assignments, contact info, and availability stay accurate.
          </p>
        </div>

        <button className="technician-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="technician-content-grid">
        <section className="technician-card technician-span-two">
          <div className="technician-card-header">
            <div>
              <h2>Technician Details</h2>
              <p>Your role-specific profile details and current workload snapshot.</p>
            </div>
          </div>

          <div className="technician-info-grid">
            {profileFields.map((field) => (
              <div key={field.label} className="technician-info-item">
                <span>{field.label}</span>
                <strong>{field.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="technician-card">
          <div className="technician-card-header">
            <div>
              <h2>Edit Technician Info</h2>
              <p>Only technician-owned fields are editable here.</p>
            </div>
          </div>

          {status.message && (
            <div className={`technician-status ${status.type === "error" ? "technician-status-error" : "technician-status-success"}`}>
              {status.message}
            </div>
          )}

          <form className="technician-form" onSubmit={handleSubmit}>
            <label className="technician-form-field">
              <span>Phone Number</span>
              <input
                type="text"
                value={formState.phoneNumber}
                onChange={handleChange("phoneNumber")}
                placeholder="Enter technician contact number"
              />
              {errors.phoneNumber && <small>{errors.phoneNumber}</small>}
            </label>

            <label className="technician-form-field">
              <span>Department</span>
              <input
                type="text"
                value={formState.department}
                onChange={handleChange("department")}
                placeholder="Electrical, Facilities, IT Services..."
              />
              {errors.department && <small>{errors.department}</small>}
            </label>

            <label className="technician-form-field">
              <span>Specialization</span>
              <input
                type="text"
                value={formState.specialization}
                onChange={handleChange("specialization")}
                placeholder="Network support, lab maintenance..."
              />
              {errors.specialization && <small>{errors.specialization}</small>}
            </label>

            <label className="technician-form-field">
              <span>Availability Status</span>
              <select value={formState.availabilityStatus} onChange={handleChange("availabilityStatus")}>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="technician-form-field">
              <span>Profile Photo URL</span>
              <input
                type="url"
                value={formState.avatarUrl}
                onChange={handleChange("avatarUrl")}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatarUrl && <small>{errors.avatarUrl}</small>}
            </label>

            <button type="submit" className="technician-primary-button">
              Save Technician Profile
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

export default TechnicianProfilePage;
