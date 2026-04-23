import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API = "https://student-grievance-management-system-e60s.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/login`, { email, password });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Login Failed ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <form className="auth-card" onSubmit={handleLogin}>
          <h2>Welcome Back</h2>

          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button>Login</button>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>

      <div className="auth-right"></div>
    </div>
  );
}