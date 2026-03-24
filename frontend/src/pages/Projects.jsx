import React, { useEffect, useMemo, useState } from "react";
import {
  getRisks,
  createRisk,
  deleteRisk,
  getProjects,
  updateRisk
} from "../services/api";
import { toast } from "react-toastify";
import { Search, Pencil, Trash2, PlusCircle } from "lucide-react";

function Risks() {
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [probability, setProbability] = useState(1);
  const [impact, setImpact] = useState(1);
  const [projectId, setProjectId] = useState("");

  const [defectCount, setDefectCount] = useState("");
  const [testingCoverage, setTestingCoverage] = useState("");
  const [reworkEffort, setReworkEffort] = useState("");

  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const canManageRisks = user?.role === "ADMIN" || user?.role === "MANAGER";

  const loadRisks = () => {
    setLoading(true);

    getRisks()
      .then((res) => setRisks(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Risks error:", err.response?.data || err.message);
        toast.error("Failed to load risks");
      })
      .finally(() => setLoading(false));
  };

  const loadProjects = () => {
    getProjects()
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Projects error:", err.response?.data || err.message);
        toast.error("Failed to load projects");
      });
  };

  useEffect(() => {
    loadRisks();
    loadProjects();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSeverity("");
    setProbability(1);
    setImpact(1);
    setProjectId("");
    setDefectCount("");
    setTestingCoverage("");
    setReworkEffort("");
    setEditingId(null);
  };

  const getPredictedRiskLevel = (probabilityValue, impactValue, scoreValue) => {
    if (Number(probabilityValue) >= 4 && Number(impactValue) >= 4) {
      return "CRITICAL";
    }
    if (Number(scoreValue) >= 12) {
      return "HIGH";
    }
    if (Number(scoreValue) >= 6) {
      return "MEDIUM";
    }
    return "LOW";
  };

  const getRecommendation = (probabilityValue, impactValue, scoreValue) => {
    if (Number(probabilityValue) >= 4 && Number(impactValue) >= 4) {
      return "Immediate action required";
    }
    if (Number(scoreValue) >= 12) {
      return "High priority mitigation needed";
    }
    if (Number(scoreValue) >= 6) {
      return "Monitor closely";
    }
    return "Low priority, routine monitoring";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canManageRisks) {
      toast.error("You are not allowed to manage risks");
      return;
    }

    if (!title.trim() || !description.trim() || !severity || !projectId) {
      toast.error("Please fill all risk fields");
      return;
    }

    if (Number(probability) < 1 || Number(probability) > 5) {
      toast.error("Probability must be between 1 and 5");
      return;
    }

    if (Number(impact) < 1 || Number(impact) > 5) {
      toast.error("Impact must be between 1 and 5");
      return;
    }

    if (Number(testingCoverage || 0) < 0 || Number(testingCoverage || 0) > 100) {
      toast.error("Testing coverage must be between 0 and 100");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      severity,
      probability: Number(probability),
      impact: Number(impact),
      defectCount: Number(defectCount) || 0,
      testingCoverage: Number(testingCoverage) || 0,
      reworkEffort: Number(reworkEffort) || 0,
      project: {
        id: Number(projectId)
      }
    };

    if (editingId) {
      updateRisk(editingId, payload)
        .then(() => {
          resetForm();
          loadRisks();
          toast.success("Risk updated successfully");
        })
        .catch((err) => {
          console.error("Update risk error:", err.response?.data || err.message);
          toast.error("Failed to update risk");
        });
    } else {
      createRisk(payload)
        .then(() => {
          resetForm();
          loadRisks();
          toast.success("Risk added successfully");
        })
        .catch((err) => {
          console.error("Create risk error:", err.response?.data || err.message);
          toast.error("Failed to add risk");
        });
    }
  };

  const handleDelete = (id) => {
    if (!canManageRisks) {
      toast.error("You are not allowed to delete risks");
      return;
    }

    deleteRisk(id)
      .then(() => {
        loadRisks();
        toast.success("Risk deleted successfully");
      })
      .catch((err) => {
        console.error("Delete risk error:", err.response?.data || err.message);
        toast.error("Failed to delete risk");
      });
  };

  const handleEdit = (risk) => {
    if (!canManageRisks) {
      toast.error("You are not allowed to edit risks");
      return;
    }

    setTitle(risk.title || "");
    setDescription(risk.description || "");
    setSeverity(risk.severity || "");
    setProbability(risk.probability || 1);
    setImpact(risk.impact || 1);
    setProjectId(risk.project?.id ? String(risk.project.id) : "");
    setDefectCount(risk.defectCount ?? "");
    setTestingCoverage(risk.testingCoverage ?? "");
    setReworkEffort(risk.reworkEffort ?? "");
    setEditingId(risk.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPredictionBadgeClass = (predictedLevel) => {
    if (predictedLevel === "CRITICAL" || predictedLevel === "HIGH") {
      return "badge-high";
    }
    if (predictedLevel === "MEDIUM") {
      return "badge-medium";
    }
    return "badge-low";
  };

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const matchesFilter = !filter || risk.riskLevel === filter;

      const text = `${risk.title || ""} ${risk.description || ""} ${risk.project?.name || ""}`
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchTerm.trim() || text.includes(searchTerm.toLowerCase().trim());

      return matchesFilter && matchesSearch;
    });
  }, [risks, filter, searchTerm]);

  return (
    <div className="app-bg">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Risks</h1>
            <p className="page-subtitle">
              Track, evaluate, search, and manage project risks with quality insights
            </p>
          </div>
        </div>

        {canManageRisks ? (
          <div className="section-card">
            <h3 className="section-title">
              {editingId ? "Edit Risk" : "Add Risk"}
            </h3>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="full-width">
                <input
                  type="text"
                  placeholder="Risk Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="full-width">
                <textarea
                  placeholder="Risk Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="">Select Severity</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>

              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                max="5"
                placeholder="Probability (1-5)"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
              />

              <input
                type="number"
                min="1"
                max="5"
                placeholder="Impact (1-5)"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="Defect Count"
                value={defectCount}
                onChange={(e) => setDefectCount(e.target.value)}
              />

              <input
                type="number"
                min="0"
                max="100"
                placeholder="Testing Coverage %"
                value={testingCoverage}
                onChange={(e) => setTestingCoverage(e.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="Rework Effort"
                value={reworkEffort}
                onChange={(e) => setReworkEffort(e.target.value)}
              />

              <div className="full-width" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button type="submit" className="secondary-btn">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <PlusCircle size={16} />
                    {editingId ? "Update Risk" : "Add Risk"}
                  </span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetForm}
                    style={{ background: "#64748b" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="section-card">
            <p className="item-text">
              You have view-only access. Only Admin and Manager can manage risks.
            </p>
          </div>
        )}

        <div className="section-card">
          <h3 className="section-title">All Risks</h3>

          <div
            className="risk-toolbar"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "14px",
              marginBottom: "18px"
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}
              />
              <input
                type="text"
                placeholder="Search by title, description, or project name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "42px" }}
              />
            </div>

            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Risk Levels</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Loading risks...</p>
            </div>
          ) : filteredRisks.length === 0 ? (
            <p className="item-text">No matching risks found.</p>
          ) : (
            filteredRisks.map((risk) => {
              const predictedLevel = getPredictedRiskLevel(
                risk.probability,
                risk.impact,
                risk.score
              );

              const recommendation = getRecommendation(
                risk.probability,
                risk.impact,
                risk.score
              );

              return (
                <div key={risk.id} className="list-item">
                  <h4 className="item-title">{risk.title}</h4>
                  <p className="item-text">{risk.description}</p>
                  <p className="item-text">Severity: {risk.severity}</p>
                  <p className="item-text">Probability: {risk.probability}</p>
                  <p className="item-text">Impact: {risk.impact}</p>
                  <p className="item-text">Score: {risk.score}</p>
                  <p className="item-text">
                    Project: {risk.project ? risk.project.name : "Not assigned"}
                  </p>

                  <p className="item-text">Current Risk Level: {risk.riskLevel}</p>

                  <span
                    className={`badge ${
                      risk.riskLevel === "High"
                        ? "badge-high"
                        : risk.riskLevel === "Medium"
                        ? "badge-medium"
                        : "badge-low"
                    }`}
                  >
                    {risk.riskLevel}
                  </span>

                  <p className="item-text" style={{ marginTop: "12px" }}>
                    <b>Predicted Level:</b>
                  </p>

                  <span className={`badge ${getPredictionBadgeClass(predictedLevel)}`}>
                    {predictedLevel}
                  </span>

                  <p className="item-text" style={{ marginTop: "10px" }}>
                    <b>Recommendation:</b> {recommendation}
                  </p>

                  <p className="item-text" style={{ marginTop: "10px" }}>
                    <b>Quality Score:</b> {risk.qualityScore ?? "N/A"}
                  </p>
                  <p className="item-text">
                    <b>Quality Level:</b> {risk.qualityRiskLevel ?? "N/A"}
                  </p>
                  <p className="item-text">
                    <b>Defects:</b> {risk.defectCount ?? 0}
                  </p>
                  <p className="item-text">
                    <b>Testing Coverage:</b> {risk.testingCoverage ?? 0}%
                  </p>
                  <p className="item-text">
                    <b>Rework Effort:</b> {risk.reworkEffort ?? 0}
                  </p>

                  {canManageRisks && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "14px",
                        flexWrap: "wrap"
                      }}
                    >
                      <button
                        className="secondary-btn"
                        onClick={() => handleEdit(risk)}
                        style={{
                          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() => handleDelete(risk.id)}
                        style={{
                          background: "linear-gradient(135deg, #dc2626, #991b1b)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Risks;