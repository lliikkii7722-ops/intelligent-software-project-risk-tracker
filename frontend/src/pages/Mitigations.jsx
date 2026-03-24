import React, { useEffect, useState } from "react";
import {
  getMitigations,
  createMitigation,
  deleteMitigation,
  getRisks,
  getUsers,
  updateMitigation,
  updateMitigationStatus
} from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Mitigations() {
  const [mitigations, setMitigations] = useState([]);
  const [risks, setRisks] = useState([]);
  const [users, setUsers] = useState([]);

  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [riskId, setRiskId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const canCreateMitigation =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const canDeleteMitigation =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const canEditMitigation =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const canUpdateStatus =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "USER" ||
    user?.role === "MEMBER";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      toast.error("Please login first");
      navigate("/");
      return;
    }

    loadMitigations();
    loadRisks();
    loadUsers();
  }, [navigate]);

  const loadMitigations = async () => {
    try {
      const res = await getMitigations();
      setMitigations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Mitigations error:", err.response?.data || err.message);
      toast.error("Failed to load mitigations");
    }
  };

  const loadRisks = async () => {
    try {
      const res = await getRisks();
      setRisks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Risks error:", err.response?.data || err.message);
      toast.error("Failed to load risks");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Users error:", err.response?.data || err.message);
      toast.error("Failed to load users");
    }
  };

  const resetForm = () => {
    setDescription("");
    setAssignedToId("");
    setStatus("Pending");
    setDueDate("");
    setRiskId("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateMitigation) {
      toast.error("You are not allowed to create or edit mitigations");
      return;
    }

    if (!description.trim() || !assignedToId || !dueDate || !riskId) {
      toast.error("Please fill all mitigation fields");
      return;
    }

    const payload = {
      description: description.trim(),
      status,
      dueDate,
      risk: {
        id: Number(riskId)
      },
      assignedTo: {
        id: Number(assignedToId)
      }
    };

    try {
      if (editingId) {
        await updateMitigation(editingId, payload);
        toast.success("Mitigation updated successfully");
      } else {
        await createMitigation(payload);
        toast.success("Mitigation added successfully");
      }

      resetForm();
      loadMitigations();
    } catch (err) {
      console.error(
        editingId ? "Update mitigation error:" : "Create mitigation error:",
        err.response?.data || err.message
      );

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save mitigation";

      toast.error(errorMessage);
    }
  };

  const handleEdit = (mitigation) => {
    if (!canEditMitigation) {
      toast.error("You are not allowed to edit mitigations");
      return;
    }

    setEditingId(mitigation.id);
    setDescription(mitigation.description || "");
    setStatus(mitigation.status || "Pending");
    setDueDate(mitigation.dueDate || "");
    setRiskId(mitigation.risk?.id ? String(mitigation.risk.id) : "");
    setAssignedToId(
      mitigation.assignedTo?.id ? String(mitigation.assignedTo.id) : ""
    );
  };

  const handleDelete = async (id) => {
    if (!canDeleteMitigation) {
      toast.error("You are not allowed to delete mitigations");
      return;
    }

    try {
      await deleteMitigation(id);
      loadMitigations();
      toast.success("Mitigation deleted successfully");

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Delete mitigation error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to delete mitigation");
    }
  };

  const handleStatusChange = async (mitigationId, newStatus) => {
    if (!canUpdateStatus) {
      toast.error("You are not allowed to update mitigation status");
      return;
    }

    try {
      await updateMitigationStatus(mitigationId, newStatus);
      loadMitigations();
      toast.success("Mitigation status updated successfully");
    } catch (err) {
      console.error(
        "Update mitigation status error:",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.error || "Failed to update mitigation status");
    }
  };

  return (
    <div className="app-bg">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mitigations</h1>
            <p className="page-subtitle">
              Manage mitigation plans for project risks
            </p>
          </div>
        </div>

        {canCreateMitigation ? (
          <div className="section-card">
            <h3 className="section-title">
              {editingId ? "Edit Mitigation" : "Add Mitigation"}
            </h3>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="full-width">
                <textarea
                  placeholder="Mitigation Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
              >
                <option value="">Select Assigned User</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>

              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <select value={riskId} onChange={(e) => setRiskId(e.target.value)}>
                <option value="">Select Risk</option>
                {risks.map((risk) => (
                  <option key={risk.id} value={risk.id}>
                    {risk.title}
                  </option>
                ))}
              </select>

              <div className="full-width" style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="secondary-btn">
                  {editingId ? "Update Mitigation" : "Add Mitigation"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetForm}
                    style={{ background: "#6b7280" }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="section-card">
            <p className="item-text">
              You have limited access. You can view mitigations and update status only.
            </p>
          </div>
        )}

        <div className="section-card">
          <h3 className="section-title">All Mitigations</h3>

          {mitigations.length === 0 ? (
            <p className="item-text">No mitigations available.</p>
          ) : (
            mitigations.map((mitigation) => (
              <div key={mitigation.id} className="list-item">
                <h4 className="item-title">
                  {mitigation.description || "No description"}
                </h4>

                <p className="item-text">
                  Assigned To: {mitigation.assignedTo?.name || "Not assigned"}
                </p>

                <p className="item-text">
                  Due Date: {mitigation.dueDate || "Not set"}
                </p>

                <p className="item-text">
                  Risk: {mitigation.risk?.title || "Not linked"}
                </p>

                {canUpdateStatus ? (
                  <div style={{ marginTop: "10px" }}>
                    <label className="item-text" style={{ marginRight: "10px" }}>
                      Status:
                    </label>
                    <select
                      value={mitigation.status || "Pending"}
                      onChange={(e) =>
                        handleStatusChange(mitigation.id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                ) : (
                  <p className="item-text">
                    Status: {mitigation.status || "Not available"}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  {canEditMitigation && (
                    <button
                      className="secondary-btn"
                      onClick={() => handleEdit(mitigation)}
                    >
                      Edit
                    </button>
                  )}

                  {canDeleteMitigation && (
                    <button
                      className="secondary-btn"
                      onClick={() => handleDelete(mitigation.id)}
                      style={{ background: "#dc2626" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Mitigations;