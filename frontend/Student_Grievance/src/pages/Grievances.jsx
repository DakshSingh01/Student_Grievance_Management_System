import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Grievances() {
  const [data, setData] = useState([]);

  const API = "https://student-grievance-management-system-e60s.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`${API}/api/grievances`, {
        headers: { Authorization: token },
      })
      .then((res) => setData(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div className="split-page">
        {/* LEFT */}
        <div className="split-left">
          <div className="card">
            <h2>Your Grievances</h2>

            {data.map((g) => (
              <div key={g._id}>
                <p><b>{g.title}</b></p>
                <Link to={`/edit/${g._id}`}>Edit</Link>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="split-right"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1551836022-d5d88e9218df)",
          }}
        >
          <div className="split-overlay">
            <h1>Your Records</h1>
            <p>View and manage your complaints</p>
          </div>
        </div>
      </div>
    </>
  );
}