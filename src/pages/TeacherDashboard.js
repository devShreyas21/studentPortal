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

  const [students, setStudents] = useState([]); // ✅ list of all students
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
  });

  const [newTask, setNewTask] = useState({
    project_id: "",
    title: "",
    description: "",
  });

  const [gradeData, setGradeData] = useState({
    task_id: "",
    student_id: "",
    grade: "",
  });

  useEffect(() => {
    if (!user || user.role_name !== "teacher") {
      navigate("/login");
      return;
    }
    dispatch(fetchProjects());
  }, [dispatch, user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // ✅ Fetch all students from admin API
  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    dispatch(createProject({ ...newProject, students: selectedStudents }));
    setNewProject({ title: "", description: "" });
    setSelectedStudents([]);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    dispatch(addTask(newTask));
    setNewTask({ project_id: "", title: "", description: "" });
  };

  const handleGrade = (e) => {
    e.preventDefault();
    dispatch(gradeSubmission(gradeData));
    setGradeData({ task_id: "", student_id: "", grade: "" });
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>👨‍🏫 Teacher Dashboard</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* ✅ Create Project */}
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
              <strong>Selected Students:</strong>{" "}
              {selectedStudents.join(", ")}
            </div>
          )}

          <div className="mt-3">
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Student Selection Modal */}
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

      {/* Projects Table */}
      <h5>Your Projects</h5>
      <table className="table table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Students</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {projects?.length > 0 ? (
            projects.map((p) => (
              <tr key={p._id}>
                <td>{p.title}</td>
                <td>{p.description}</td>
                <td>{p.students?.join(", ")}</td>
                <td>{p.tasks?.length || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No projects found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Task */}
      <div className="card mt-4 p-3 shadow-sm">
        <h5>Add Task</h5>
        <form onSubmit={handleAddTask}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Project ID"
                value={newTask.project_id}
                onChange={(e) =>
                  setNewTask({ ...newTask, project_id: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">
                Add Task
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Grade Submission */}
      <div className="card mt-4 p-3 shadow-sm mb-5">
        <h5>Grade Student Submission</h5>
        <form onSubmit={handleGrade}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Task ID"
                value={gradeData.task_id}
                onChange={(e) =>
                  setGradeData({ ...gradeData, task_id: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Student ID"
                value={gradeData.student_id}
                onChange={(e) =>
                  setGradeData({ ...gradeData, student_id: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Grade (A/B/C...)"
                value={gradeData.grade}
                onChange={(e) =>
                  setGradeData({ ...gradeData, grade: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-warning w-100">
                Grade
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
