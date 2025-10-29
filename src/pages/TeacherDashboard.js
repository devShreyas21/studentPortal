import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  createProject,
  addTask,
  gradeSubmission,
} from "../features/teacher/teacherSlice";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error } = useSelector((state) => state.teacher);
  const { user, token } = useSelector((state) => state.auth);

  // ===== State variables =====
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [newProject, setNewProject] = useState({ title: "", description: "" });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [gradeMap, setGradeMap] = useState({}); // store grades per student

  // ===== Edit States =====
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editProject, setEditProject] = useState({ _id: "", title: "", description: "" });

  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTask, setEditTask] = useState({ _id: "", title: "", description: "" });

  const [toastMessage, setToastMessage] = useState("");


  const getStudentName = (id) => {
    const student = students.find((s) => Number(s.id) === Number(id));
    return student ? student.name : "";
  };

  // ===== Lifecycle =====
  useEffect(() => {
    if (!user || user.role_name !== "teacher") {
      navigate("/login");
      return;
    }
    dispatch(fetchProjects());
    fetchStudents();
  }, [dispatch, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // ===== Fetch all students (for assigning project) =====
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allUsers = res.data;
      const studentUsers = allUsers.filter(
        (u) => u.role_name.toLowerCase() === "student"
      );
      setStudents(studentUsers);
      setShowStudentModal(true);
    } catch (err) {
      console.error("Error fetching students:", err);
      alert("Failed to load students");
    }
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    await dispatch(createProject({ ...newProject, students: selectedStudents }));
    dispatch(fetchProjects()); // refresh immediately
    setNewProject({ title: "", description: "" });
    setSelectedStudents([]);
  };

  // ===== Handle Add Task =====
  const openTaskModal = (projectId) => {
    setTaskProjectId(projectId);
    setShowTaskModal(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskProjectId) {
      alert("Project not found!");
      return;
    }
    await dispatch(addTask({ project_id: taskProjectId, ...newTask }));
    dispatch(fetchProjects());
    setNewTask({ title: "", description: "" });
    setShowTaskModal(false);
  };

  // // ===== Handle Edit Project =====
  // const handleEditProject = async (project) => {
  //   const title = prompt("Edit Project Title:", project.title);
  //   const description = prompt("Edit Project Description:", project.description);
  //   if (!title || !description) return;

  //   try {
  //     await axios.put(
  //       `${process.env.REACT_APP_API_BASE_URL}teacher/project/${project._id}`,
  //       { title, description },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert("Project updated successfully");
  //     dispatch(fetchProjects());
  //   } catch (err) {
  //     console.error("Error editing project:", err);
  //     alert("Failed to update project");
  //   }
  // };

  // ===== Handle Delete Project =====
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}teacher/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Project deleted successfully");
      dispatch(fetchProjects());
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  // // ===== Handle Edit Task =====
  // const handleEditTask = async (task) => {
  //   const title = prompt("Edit Task Title:", task.title);
  //   const description = prompt("Edit Task Description:", task.description);
  //   if (!title || !description) return;

  //   try {
  //     await axios.put(
  //       `${process.env.REACT_APP_API_BASE_URL}teacher/task/${task._id}`,
  //       { title, description },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert("Task updated successfully");
  //     dispatch(fetchProjects());
  //   } catch (err) {
  //     console.error("Error editing task:", err);
  //     alert("Failed to update task");
  //   }
  // };

  // ===== Handle Delete Task =====
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}teacher/task/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Task deleted successfully");
      dispatch(fetchProjects());
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task");
    }
  };

  // ===== Handle Edit Project =====
  const handleEditProject = (project) => {
    setEditProject(project);
    setShowEditProjectModal(true);
  };

  // ===== Submit Edit Project =====
  const submitEditProject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}teacher/project/${editProject._id}`,
        { title: editProject.title, description: editProject.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMessage("✅ Project updated successfully!");
      setShowEditProjectModal(false);
      dispatch(fetchProjects());
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Error editing project:", err);
      setToastMessage("❌ Failed to update project.");
    }
  };

  // ===== Handle Edit Task =====
  const handleEditTask = (task) => {
    setEditTask(task);
    setShowEditTaskModal(true);
  };

  // ===== Submit Edit Task =====
  const submitEditTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}teacher/task/${editTask._id}`,
        { title: editTask.title, description: editTask.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMessage("✅ Task updated successfully!");
      setShowEditTaskModal(false);
      dispatch(fetchProjects());
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.error("Error editing task:", err);
      setToastMessage("❌ Failed to update task.");
    }
  };



  // ===== Open Grade Modal =====
  const openGradeModal = (task) => {
    setSelectedTask(task);
    const map = {};
    task.submissions?.forEach((s) => {
      map[s.student_id] = s.grade || "";
    });
    setGradeMap(map);
    setShowGradeModal(true);
  };

  // ===== Handle Grade Submission =====
  const handleGradeSubmit = async (student_id) => {
    const grade = gradeMap[student_id];
    if (!grade) {
      alert("Please enter a grade.");
      return;
    }

    await dispatch(
      gradeSubmission({
        task_id: selectedTask._id,
        student_id,
        grade,
      })
    );

    // Refresh immediately
    dispatch(fetchProjects());
  };

  {
    toastMessage && (
      <div
        className="alert alert-success text-center position-fixed top-0 start-50 translate-middle-x mt-3 shadow"
        style={{ zIndex: 1050, width: "300px" }}
      >
        {toastMessage}
      </div>
    )
  }

  return (
    <div className="container mt-5">
      {/* ===== Header ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👨‍🏫 Teacher Dashboard</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ===== Create Project ===== */}
      <div className="card mb-4 p-3 shadow-sm">
        <h5>Create New Project</h5>
        <form onSubmit={handleCreateProject}>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-outline-primary w-100"
                onClick={fetchStudents}
              >
                Add Students
              </button>
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="mt-3">
              <strong>Selected Students:</strong> {selectedStudents.join(", ")}
            </div>
          )}

          <div className="mt-3">
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>

      {/* ===== Student Selection Modal ===== */}
      {showStudentModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Students</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowStudentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  {students.map((s) => (
                    <label
                      key={s.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        <b>{s.name}</b> — {s.email}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => toggleStudentSelection(s.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStudentModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => setShowStudentModal(false)}
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Projects & Tasks List ===== */}
      <h5>Your Projects</h5>
      {projects?.length > 0 ? (
        projects.map((p) => (
          <div key={p._id} className="card mb-4 p-3 shadow-sm">
            {/* <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">{p.title}</h6>
                <p className="mb-2 text-muted">{p.description}</p>
                <small>
                  <b>Students:</b>{" "}
                  {p.students?.length
                    ? p.students.map((id) => getStudentName(id)).join(", ")
                    : "No students"}
                </small>

              </div>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => openTaskModal(p._id)}
              >
                + Add Task
              </button>
            </div> */}

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">
                  {p.title}{" "}
                  {p.isEdited && (
                    <span className="badge bg-warning text-dark ms-2">Edited</span>
                  )}
                  {p.isDeleted && (
                    <span className="badge bg-danger text-light ms-2">Deleted</span>
                  )}
                </h6>
                <p className="mb-2 text-muted">{p.description}</p>
                <small>
                  <b>Students:</b>{" "}
                  {p.students?.length
                    ? p.students.map((id) => getStudentName(id)).join(", ")
                    : "No students"}
                </small>
              </div>

              <div className="d-flex gap-2">
                {!p.isDeleted && (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => openTaskModal(p._id)}
                  >
                    + Add Task
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleEditProject(p)}
                  disabled={p.isDeleted}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDeleteProject(p._id)}
                  disabled={p.isDeleted}
                >
                  🗑 Delete
                </button>
              </div>
            </div>


            <hr />
            <ul className="list-group">
              {p.tasks?.length ? (
                p.tasks.map((t) => {
                  const gradedCount = t.submissions?.filter(
                    (s) => s.grade
                  ).length;
                  const total = t.submissions?.length || 0;

                  return (
                    <li
                      key={t._id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {/* <b>{t.title}</b> — {t.description} */}
                        <b>
                          {t.title}{" "}
                          {t.isEdited && (
                            <span className="badge bg-warning text-dark ms-2">Edited</span>
                          )}
                          {t.isDeleted && (
                            <span className="badge bg-danger text-light ms-2">Deleted</span>
                          )}
                        </b>{" "}
                        — {t.description}
                        <div className="small text-muted mt-1">
                          {total > 0 ? (
                            <>
                              <span className="badge bg-secondary me-2">
                                {gradedCount}/{total} graded
                              </span>
                            </>
                          ) : (
                            <span className="text-muted">
                              No submissions yet
                            </span>
                          )}
                        </div>
                      </div>
                      {total > 0 && (

                        <div className="d-flex gap-2">
                          {total > 0 && !t.isDeleted && (
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openGradeModal(t)}
                            >
                              Grade Submissions
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditTask(t)}
                            disabled={t.isDeleted}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteTask(t._id)}
                            disabled={t.isDeleted}
                          >
                            🗑 Delete
                          </button>
                        </div>

                      )}
                    </li>
                  );
                })
              ) : (
                <li className="list-group-item text-muted">
                  No tasks yet for this project.
                </li>
              )}
            </ul>
          </div>
        ))
      ) : (
        <div className="alert alert-secondary">No projects found</div>
      )}

      {/* ===== Add Task Modal ===== */}
      {showTaskModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Task</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowTaskModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Task Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Task Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTaskModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== Grade Modal ===== */}
      {showGradeModal && selectedTask && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Grade Submissions for: {selectedTask.title}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowGradeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {selectedTask.submissions?.length > 0 ? (
                  selectedTask.submissions.map((s) => (
                    <div
                      key={s._id}
                      className="border rounded p-3 mb-3 bg-light"
                    >
                      <p>
                        <b>Student:</b> {getStudentName(s.student_id)}
                      </p>
                      <p>
                        <b>Submission:</b> {s.content}
                      </p>

                      {/* 🆕 File download section */}
                      {s.fileId && (
                        <p>
                          <b>Attached File:</b>{" "}
                          <a
                            href={`${process.env.REACT_APP_API_BASE_URL}upload/${s.fileId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            📎 View File
                          </a>
                        </p>
                      )}

                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control me-2"
                          placeholder="Enter grade"
                          value={gradeMap[s.student_id] || ""}
                          onChange={(e) =>
                            setGradeMap({
                              ...gradeMap,
                              [s.student_id]: e.target.value,
                            })
                          }
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => handleGradeSubmit(s.student_id)}
                        >
                          Submit Grade
                        </button>
                      </div>

                    </div>
                  ))
                ) : (
                  <p>No submissions yet.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowGradeModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Project Modal ===== */}
      {showEditProjectModal && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Project</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditProjectModal(false)}
                ></button>
              </div>
              <form onSubmit={submitEditProject}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editProject.title}
                      onChange={(e) =>
                        setEditProject({ ...editProject, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Project Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editProject.description}
                      onChange={(e) =>
                        setEditProject({ ...editProject, description: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditProjectModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Task Modal ===== */}
      {showEditTaskModal && (
        <div
          className="modal show fade d-block"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditTaskModal(false)}
                ></button>
              </div>
              <form onSubmit={submitEditTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Task Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editTask.title}
                      onChange={(e) =>
                        setEditTask({ ...editTask, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Task Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editTask.description}
                      onChange={(e) =>
                        setEditTask({ ...editTask, description: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditTaskModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save Changes
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
