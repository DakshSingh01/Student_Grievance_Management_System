import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
  });

  const navigate = useNavigate();
  const API = "https://student-grievance-management-system-e60s.onrender.com";

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/register`, form);
      navigate("/login");
    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <form className="auth-card" onSubmit={handleRegister}>
          <h2>Create Account</h2>

          <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input placeholder="Course" onChange={(e) => setForm({ ...form, course: e.target.value })} />

          <button>Register</button>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>

      <div className="auth-right"></div>
    </div>
  );
}