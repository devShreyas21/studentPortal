import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchLogs } from "../features/admin/adminSlice";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, logs, isLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [showLogs, setShowLogs] = useState(false);

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

  // ✅ Utility to find user name and role from users array
  const getUserInfo = (userId) => {
    const found = users?.find((u) => u.id === userId);
    if (!found) return { name: `User ID: ${userId}`, role: "Unknown" };
    return { name: found.name, role: found.role_name };
  };

  return (
    <div className="container mt-5">
      {/* ===== Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👑 Admin Dashboard</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* ===== Alerts ===== */}
      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ===== Users Table ===== */}
      <h5>All Users</h5>
      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
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

      {/* ===== Activity Logs Table ===== */}
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
                      role.charAt(0).toUpperCase() +
                      role.slice(1).toLowerCase();

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
    </div>
  );
}
