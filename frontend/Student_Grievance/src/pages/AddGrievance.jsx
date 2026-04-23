import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function AddGrievance() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const API = "https://student-grievance-management-system-e60s.onrender.com";

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/api/grievances`,
        { title, description },
        { headers: { Authorization: token } }
      );
      alert("Added ✅");
    } catch {
      alert("Error ❌");
    }
  };

  return (
    <>
      <Navbar />

      <div className="split-page">
        {/* LEFT */}
        <div className="split-left">
          <div className="card">
            <h2>Add Grievance</h2>

            <input
              className="input"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="input"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
            />

            <button className="btn" onClick={handleSubmit}>
              Add
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="split-right"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1519389950473-47ba0277781c)",
          }}
        >
          <div className="split-overlay">
            <h1>Raise Issues</h1>
            <p>Let us know your problems</p>
          </div>
        </div>
      </div>
    </>
  );
}