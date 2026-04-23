import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";

export default function EditGrievance() {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const API = "https://student-grievance-management-system-e60s.onrender.com";

  const update = async () => {
    const token = localStorage.getItem("token");

    await axios.put(
      `${API}/api/grievances/${id}`,
      { title, description },
      { headers: { Authorization: token } }
    );

    alert("Updated ✅");
  };

  return (
    <>
      <Navbar />

      <div className="split-page">
        {/* LEFT */}
        <div className="split-left">
          <div className="card">
            <h2>Edit Grievance</h2>

            <input className="input" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
            <input className="input" placeholder="Description" onChange={(e) => setDescription(e.target.value)} />

            <button className="btn" onClick={update}>
              Update
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div
          className="split-right"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1531482615713-2afd69097998)",
          }}
        >
          <div className="split-overlay">
            <h1>Edit Details</h1>
            <p>Update your grievance info</p>
          </div>
        </div>
      </div>
    </>
  );
}