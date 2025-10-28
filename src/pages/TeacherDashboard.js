import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects, createProject, addTask, gradeSubmission } from "../features/teacher/teacherSlice";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projects, isLoading, error } = useSelector((state) => state.teacher);
  const { user } = useSelector((state) => state.auth);

  const [newProject, setNewProject] = useState({ title: "", description: "", students: "" });
  const [newTask, setNewTask] = useState({ project_id: "", title: "", description: "" });
  const [gradeData, setGradeData] = useState({ task_id: "", student_id: "", grade: "" });

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

  const handleCreateProject = (e) => {
    e.preventDefault();
    const studentsArray = newProject.students
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);

    dispatch(createProject({ ...newProject, students: studentsArray }));
    setNewProject({ title: "", description: "", students: "" });
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🎓 Teacher Dashboard</h3>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {isLoading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Create Project */}
      <div className="card mb-4 p-3 shadow-sm">
        <h5>Create New Project</h5>
        <form onSubmit={handleCreateProject}>
          <div className="row g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Student IDs (comma separated)"
                value={newProject.students}
                onChange={(e) => setNewProject({ ...newProject, students: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

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
                onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Task Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
                onChange={(e) => setGradeData({ ...gradeData, task_id: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Student ID"
                value={gradeData.student_id}
                onChange={(e) => setGradeData({ ...gradeData, student_id: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Grade (A/B/C...)"
                value={gradeData.grade}
                onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
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
