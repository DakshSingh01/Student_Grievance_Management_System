import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const API = "https://student-grievance-management-system-e60s.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API}/api/dashboard`, {
        headers: { Authorization: token },
      })
      .then((res) => setUser(res.data))
      .catch(() => alert("Unauthorized"));
  }, []);

  return (
    <>
      <Navbar />

      <div className="split-page">
        {/* LEFT */}
        <div className="split-left">
          {user && (
            <div className="card">
              <h2>Dashboard</h2>
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Course:</b> {user.course || "Not set"}</p>
            </div>
          )}
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="split-right"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f)",
          }}
        >
          <div className="split-overlay">
            <h1>Welcome Dashboard</h1>
            <p>Track and manage your grievances</p>
          </div>
        </div>
      </div>
    </>
  );
}