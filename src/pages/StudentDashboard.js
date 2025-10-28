import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentProjects, submitTask, clearMessage } from "../features/student/studentSlice";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error, message } = useSelector((state) => state.student);
  const { user } = useSelector((state) => state.auth);
  const [submission, setSubmission] = useState({ task_id: "", content: "" });

  // Load student projects
  useEffect(() => {
    if (!user || user.role_name !== "student") {
      navigate("/login");
      return;
    }
    dispatch(fetchStudentProjects());
  }, [dispatch, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitTask(submission));
    setSubmission({ task_id: "", content: "" });
    setTimeout(() => dispatch(clearMessage()), 2500);
  };

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🎓 Student Dashboard</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <h5>Your Assigned Projects</h5>
      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>Project Title</th>
            <th>Description</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {projects?.length > 0 ? (
            projects.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.description}</td>
                <td>
                  {p.tasks?.length ? (
                    <ul className="list-unstyled mb-0">
                      {p.tasks.map((t) => (
                        <li key={t._id}>
                          <b>{t.title}</b> — {t.description}{" "}
                          {t.submissions?.find((s) => s.student_id === user.id) ? (
                            <span className="badge bg-success ms-2">Submitted</span>
                          ) : (
                            <span className="badge bg-secondary ms-2">Pending</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No tasks"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No assigned projects
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Submit Task */}
      <div className="card mt-4 p-3 shadow-sm mb-5">
        <h5>Submit a Task</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Task ID"
                value={submission.task_id}
                onChange={(e) => setSubmission({ ...submission, task_id: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Your submission content"
                value={submission.content}
                onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
