import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentProjects,
  submitTask,
  clearMessage,
} from "../features/student/studentSlice";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error, message } = useSelector(
    (state) => state.student
  );
  const { user } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [content, setContent] = useState("");

  // ✅ Load student projects on mount
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

  const openModal = (task) => {
    setCurrentTask(task);
    setContent("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentTask(null);
    setContent("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentTask) return;
    dispatch(submitTask({ task_id: currentTask._id, content }));
    closeModal();
    setTimeout(() => dispatch(clearMessage()), 2500);
    dispatch(fetchStudentProjects()); // refresh list
  };

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🎓 Student Dashboard</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Alerts */}
      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Projects */}
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
                      {p.tasks.map((t) => {
                        const submission = t.submissions?.find(
                          (s) => s.student_id === user.id
                        );
                        return (
                          <li key={t._id} className="mb-2">
                            <b>{t.title}</b> — {t.description}{" "}
                            {submission ? (
                              <>
                                <span className="badge bg-success ms-2">
                                  Submitted
                                </span>
                                {submission.grade && (
                                  <span className="badge bg-info ms-2">
                                    Grade: {submission.grade}
                                  </span>
                                )}
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary ms-2"
                                onClick={() => openModal(t)}
                              >
                                Submit Task
                              </button>
                            )}
                          </li>
                        );
                      })}
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

      {/* ✅ Submit Task Modal */}
      {showModal && currentTask && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Submit Task: {currentTask.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Your Submission</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your task content here..."
                      required
                    ></textarea>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
