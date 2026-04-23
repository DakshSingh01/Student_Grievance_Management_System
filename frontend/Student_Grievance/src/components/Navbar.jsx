import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <h2>🎓 Student Portal</h2>

      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/add">Add</Link>
        <Link to="/grievances">Grievances</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}