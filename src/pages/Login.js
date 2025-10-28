import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  // ✅ Redirect after login based on role
  useEffect(() => {
    if (user) {
      if (user.role_name === "admin") navigate("/admin");
      else if (user.role_name === "teacher") navigate("/teacher");
      else if (user.role_name === "student") navigate("/student");
    }
  }, [user, navigate]);

  return (
    <div className="container mt-5">
      <div className="col-md-5 mx-auto">
        <div className="card p-4 shadow-sm">
          <h3 className="text-center mb-4">Login</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
