import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchLogs } from "../features/admin/adminSlice";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function AdminDashboard() {

  const { theme, toggleTheme } = useContext(ThemeContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, logs, isLoading, error } = useSelector((state) => state.admin);
  const { user, token } = useSelector((state) => state.auth);
  const [showLogs, setShowLogs] = useState(false);

  // 🆕 Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role_name: "student",
  });

  useEffect(() => {
    if (!user || user.role_name !== "admin") {
      navigate("/login");
      return;
    }
    dispatch(fetchUsers());
  }, [dispatch, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleViewLogs = () => {
    if (!showLogs) {
      dispatch(fetchLogs());
    }
    setShowLogs(!showLogs);
  };

  // ✅ Utility: Get user info
  const getUserInfo = (userId) => {
    const found = users?.find((u) => u.id === userId);
    if (!found) return { name: `User ID: ${userId}`, role: "Unknown" };
    return { name: found.name, role: found.role_name };
  };

  // 🆕 Handle Add User
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}admin/users`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ User created successfully!");
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role_name: "student" });
      dispatch(fetchUsers());
    } catch (err) {
      console.error("Error creating user:", err);
      alert("❌ Failed to create user. Please check inputs.");
    }
  };

  // 🆕 Handle Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ User deleted successfully!");
      dispatch(fetchUsers());
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("❌ Failed to delete user.");
    }
  };

  return (
    <div className="container mt-5">
      {/* ===== Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👑 Admin Dashboard</h3>
        <button
          className="btn btn-outline-secondary me-2"
          onClick={toggleTheme}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ===== Users Table Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>All Users</h5>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add User
        </button>
      </div>

      {/* ===== Users Table ===== */}
      <table className="table table-striped mt-2">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role_name}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ===== Activity Logs Button ===== */}
      <div className="mt-4">
        <button className="btn btn-secondary" onClick={handleViewLogs}>
          {showLogs ? "Hide Activity Logs" : "View Activity Logs"}
        </button>
      </div>

      {/* ===== Activity Logs ===== */}
      {showLogs && (
        <div className="mt-4">
          <h5>System Activity Logs</h5>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs?.length > 0 ? (
                  logs.map((log, index) => {
                    const { name, role } = getUserInfo(log.user_id);
                    const displayRole =
                      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
                    const badgeClass =
                      displayRole === "Admin"
                        ? "bg-danger"
                        : displayRole === "Teacher"
                          ? "bg-primary"
                          : displayRole === "Student"
                            ? "bg-success"
                            : "bg-secondary";
                    return (
                      <tr key={index}>
                        <td>
                          {name}{" "}
                          <span className={`badge ${badgeClass}`}>
                            {displayRole}
                          </span>
                        </td>
                        <td>{log.action}</td>
                        <td>
                          {new Date(log.timestamp).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No activity logs
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Add User Modal ===== */}
      {showAddModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={newUser.role_name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role_name: e.target.value })
                      }
                      required
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
