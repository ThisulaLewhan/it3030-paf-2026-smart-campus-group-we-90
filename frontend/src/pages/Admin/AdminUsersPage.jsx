import { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import "./AdminUsersPage.css";

const ROLE_OPTIONS = ["ALL", "ADMIN", "USER"];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busyUserId, setBusyUserId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setStatus({ type: "", message: "" });
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Unable to load users right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleRoleChange = async (userId, nextRole) => {
    try {
      setBusyUserId(userId);
      setStatus({ type: "", message: "" });

      const response = await userService.updateRole(userId, { role: nextRole });
      const updatedUser = response.data;

      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, ...updatedUser } : user))
      );
      setStatus({ type: "success", message: "User role updated successfully." });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update that user role.";

      setStatus({ type: "error", message });
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <section className="admin-users-page">
      <div className="admin-users-hero">
        <div>
          <p className="admin-users-eyebrow">Admin</p>
          <h1>User Management</h1>
          <p className="admin-users-subtitle">
            Manage user access, review roles, and update permissions for your smart campus system.
          </p>
        </div>
      </div>

      <div className="admin-users-card">
        <div className="admin-users-toolbar">
          <input
            type="search"
            className="admin-users-search"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            className="admin-users-filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role === "ALL" ? "All Roles" : role}
              </option>
            ))}
          </select>
        </div>

        {status.message && (
          <div
            className={`admin-users-status ${
              status.type === "error" ? "admin-users-status-error" : "admin-users-status-success"
            }`}
          >
            {status.message}
          </div>
        )}

        {loading ? (
          <div className="admin-users-empty">
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-users-empty">
            <p>No users match your current search and filter.</p>
          </div>
        ) : (
          <div className="admin-users-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Update Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-role-badge role-${user.role?.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-users-role-select"
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        disabled={busyUserId === user.id}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminUsersPage;
