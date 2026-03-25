import React, { useEffect, useState } from "react";
import {
  getRisks,
  createRisk,
  deleteRisk,
  updateRisk,
  getProjects,
  getUsers
} from "../services/api";
import { toast } from "react-toastify";

function Risks() {
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [probability, setProbability] = useState(1);
  const [impact, setImpact] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadRisks = () => {
    getRisks()
      .then((res) => {
        setRisks(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Risks error:", err.response?.data || err.message);
        toast.error("Failed to load risks");
      });
  };

  const loadProjects = () => {
    getProjects()
      .then((res) => {
        setProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Projects error:", err.response?.data || err.message);
      });
  };

  const loadUsers = () => {
    getUsers()
      .then((res) => {
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Users error:", err.response?.data || err.message);
      });
  };

  useEffect(() => {
    loadRisks();
    loadProjects();
    loadUsers();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSeverity("");
    setProbability(1);
    setImpact(1);
    setProjectId("");
    setUserId("");
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const riskData = {
      title,
      description,
      severity,
      probability: Number(probability),
      impact: Number(impact),
      project: projectId ? { id: Number(projectId) } : null,
      user: userId ? { id: Number(userId) } : null
    };

    if (editingId) {
      updateRisk(editingId, riskData)
        .then(() => {
          toast.success("Risk updated successfully");
          loadRisks();
          resetForm();
        })
        .catch((err) => {
          console.error("Update risk error:", err.response?.data || err.message);
          toast.error("Failed to update risk");
        });
    } else {
      createRisk(riskData)
        .then(() => {
          toast.success("Risk created successfully");
          loadRisks();
          resetForm();
        })
        .catch((err) => {
          console.error("Create risk error:", err.response?.data || err.message);
          toast.error("Failed to create risk");
        });
    }
  };

  const handleEdit = (risk) => {
    setTitle(risk.title || "");
    setDescription(risk.description || "");
    setSeverity(risk.severity || "");
    setProbability(risk.probability || 1);
    setImpact(risk.impact || 1);
    setProjectId(risk.project?.id ? String(risk.project.id) : "");
    setUserId(risk.user?.id ? String(risk.user.id) : "");
    setEditingId(risk.id);
  };

  const handleDelete = (id) => {
    deleteRisk(id)
      .then(() => {
        toast.success("Risk deleted successfully");
        loadRisks();
      })
      .catch((err) => {
        console.error("Delete risk error:", err.response?.data || err.message);
        toast.error("Failed to delete risk");
      });
  };

  return (
    <div className="page-container">
      <h2>Risk Management</h2>

      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          placeholder="Risk Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Risk Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          required
        />

        <select
          value={probability}
          onChange={(e) => setProbability(e.target.value)}
          required
        >
          <option value={1}>Probability 1</option>
          <option value={2}>Probability 2</option>
          <option value={3}>Probability 3</option>
        </select>

        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          required
        >
          <option value={1}>Impact 1</option>
          <option value={2}>Impact 2</option>
          <option value={3}>Impact 3</option>
        </select>

        <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Assign User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>

        <button type="submit">
          {editingId ? "Update Risk" : "Add Risk"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <div className="table-card">
        <h3>Risk List</h3>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Probability</th>
              <th>Impact</th>
              <th>Score</th>
              <th>Risk Level</th>
              <th>Project</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {risks.length > 0 ? (
              risks.map((risk) => (
                <tr key={risk.id}>
                  <td>{risk.title}</td>
                  <td>{risk.description}</td>
                  <td>{risk.severity}</td>
                  <td>{risk.probability}</td>
                  <td>{risk.impact}</td>
                  <td>{risk.score ?? risk.probability * risk.impact}</td>
                  <td>{risk.riskLevel || "N/A"}</td>
                  <td>{risk.project?.name || "N/A"}</td>
                  <td>{risk.user?.name || "N/A"}</td>
                  <td>
                    <button onClick={() => handleEdit(risk)}>Edit</button>
                    <button onClick={() => handleDelete(risk.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">No risks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Risks;