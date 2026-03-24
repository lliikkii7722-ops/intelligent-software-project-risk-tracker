import React, { useEffect, useMemo, useState } from "react";
import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
  updateProjectProgress
} from "../services/api";
import { toast } from "react-toastify";
import { PageMotion, AnimatedSection, AnimatedCard } from "../components/PageMotion";
import { Search, Pencil, Trash2, RefreshCw, PlusCircle } from "lucide-react";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [plannedBudget, setPlannedBudget] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [totalTasks, setTotalTasks] = useState("");
  const [completedTasks, setCompletedTasks] = useState("");
  const [availableHours, setAvailableHours] = useState("");
  const [workedHours, setWorkedHours] = useState("");
  const [requirementChanges, setRequirementChanges] = useState("");

  const [progressEditingId, setProgressEditingId] = useState(null);
  const [progressStatus, setProgressStatus] = useState("Not Started");
  const [progressValue, setProgressValue] = useState(0);
  const [remarks, setRemarks] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const canManageProjects =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const canUpdateProgress =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "USER" ||
    user?.role === "MEMBER";

  const loadProjects = () => {
    setLoading(true);

    getProjects()
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Projects error:", err.response?.data || err.message);
        toast.error("Failed to load projects");
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setPlannedBudget("");
    setActualCost("");
    setTotalTasks("");
    setCompletedTasks("");
    setAvailableHours("");
    setWorkedHours("");
    setRequirementChanges("");
    setEditingId(null);
  };

  const resetProgressForm = () => {
    setProgressEditingId(null);
    setProgressStatus("Not Started");
    setProgressValue(0);
    setRemarks("");
  };

  const handleDelete = (id) => {
    if (!canManageProjects) {
      toast.error("You are not allowed to delete projects");
      return;
    }

    deleteProject(id)
      .then(() => {
        loadProjects();
        toast.success("Project deleted successfully");
      })
      .catch((err) => {
        console.error("Delete project error:", err.response?.data || err.message);
        toast.error("Failed to delete project");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!canManageProjects) {
      toast.error("You are not allowed to manage projects");
      return;
    }

    if (!name.trim() || !description.trim() || !startDate || !endDate) {
      toast.error("Please fill all mandatory project fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    if (
      Number(completedTasks || 0) > Number(totalTasks || 0) &&
      Number(totalTasks || 0) > 0
    ) {
      toast.error("Completed tasks cannot be greater than total tasks");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      plannedBudget: Number(plannedBudget) || 0,
      actualCost: Number(actualCost) || 0,
      totalTasks: Number(totalTasks) || 0,
      completedTasks: Number(completedTasks) || 0,
      availableHours: Number(availableHours) || 0,
      workedHours: Number(workedHours) || 0,
      requirementChanges: Number(requirementChanges) || 0
    };

    if (editingId) {
      updateProject(editingId, payload)
        .then(() => {
          resetForm();
          loadProjects();
          toast.success("Project updated successfully");
        })
        .catch((err) => {
          console.error("Update project error:", err.response?.data || err.message);
          toast.error("Failed to update project");
        });
    } else {
      createProject(payload)
        .then(() => {
          resetForm();
          loadProjects();
          toast.success("Project added successfully");
        })
        .catch((err) => {
          console.error("Create project error:", err.response?.data || err.message);
          toast.error("Failed to add project");
        });
    }
  };

  const handleEdit = (project) => {
    if (!canManageProjects) {
      toast.error("You are not allowed to edit projects");
      return;
    }

    setName(project.name || "");
    setDescription(project.description || "");
    setStartDate(project.startDate || "");
    setEndDate(project.endDate || "");
    setPlannedBudget(project.plannedBudget ?? "");
    setActualCost(project.actualCost ?? "");
    setTotalTasks(project.totalTasks ?? "");
    setCompletedTasks(project.completedTasks ?? "");
    setAvailableHours(project.availableHours ?? "");
    setWorkedHours(project.workedHours ?? "");
    setRequirementChanges(project.requirementChanges ?? "");
    setEditingId(project.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProgressEdit = (project) => {
    if (!canUpdateProgress) {
      toast.error("You are not allowed to update project progress");
      return;
    }

    setProgressEditingId(project.id);
    setProgressStatus(project.status || "Not Started");
    setProgressValue(project.progress ?? 0);
    setRemarks(project.remarks || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProgressSubmit = (e) => {
    e.preventDefault();

    if (!canUpdateProgress) {
      toast.error("You are not allowed to update project progress");
      return;
    }

    if (progressValue < 0 || progressValue > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }

    const payload = {
      status: progressStatus,
      progress: Number(progressValue),
      remarks: remarks.trim()
    };

    updateProjectProgress(progressEditingId, payload)
      .then(() => {
        resetProgressForm();
        loadProjects();
        toast.success("Project progress updated successfully");
      })
      .catch((err) => {
        console.error("Update progress error:", err.response?.data || err.message);
        toast.error("Failed to update project progress");
      });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const text = `${project.name || ""} ${project.description || ""}`.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() || text.includes(searchTerm.toLowerCase().trim());

      const currentStatus = project.status || "Not Started";
      const matchesStatus = !statusFilter || currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <PageMotion>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Create, search, and manage intelligent project records</p>
        </div>
      </div>

      {canManageProjects ? (
        <AnimatedSection delay={0.08}>
          <div className="section-card">
            <h3 className="section-title">
              {editingId ? "Edit Project" : "Add Project"}
            </h3>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="full-width">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="full-width">
                <textarea
                  placeholder="Project Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <input
                type="number"
                placeholder="Planned Budget"
                value={plannedBudget}
                onChange={(e) => setPlannedBudget(e.target.value)}
              />

              <input
                type="number"
                placeholder="Actual Cost"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
              />

              <input
                type="number"
                placeholder="Total Tasks"
                value={totalTasks}
                onChange={(e) => setTotalTasks(e.target.value)}
              />

              <input
                type="number"
                placeholder="Completed Tasks"
                value={completedTasks}
                onChange={(e) => setCompletedTasks(e.target.value)}
              />

              <input
                type="number"
                placeholder="Available Hours"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
              />

              <input
                type="number"
                placeholder="Worked Hours"
                value={workedHours}
                onChange={(e) => setWorkedHours(e.target.value)}
              />

              <input
                type="number"
                placeholder="Requirement Changes"
                value={requirementChanges}
                onChange={(e) => setRequirementChanges(e.target.value)}
              />

              <div className="full-width" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button type="submit" className="secondary-btn">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <PlusCircle size={16} />
                    {editingId ? "Update Project" : "Add Project"}
                  </span>
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetForm}
                    style={{ background: "#475569" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </AnimatedSection>
      ) : (
        <AnimatedSection delay={0.08}>
          <div className="section-card">
            <p className="item-text">
              You cannot create or edit full project details. You can update project
              progress below.
            </p>
          </div>
        </AnimatedSection>
      )}

      {canUpdateProgress && (
        <AnimatedSection delay={0.16}>
          <div className="section-card">
            <h3 className="section-title">Update Project Progress</h3>

            {progressEditingId ? (
              <form className="form-grid" onSubmit={handleProgressSubmit}>
                <select
                  value={progressStatus}
                  onChange={(e) => setProgressStatus(e.target.value)}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Progress %"
                  value={progressValue}
                  onChange={(e) => setProgressValue(e.target.value)}
                />

                <div className="full-width">
                  <textarea
                    placeholder="Remarks / Work Update"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                <div className="full-width" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button type="submit" className="secondary-btn">
                    Save Progress
                  </button>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={resetProgressForm}
                    style={{ background: "#475569" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="item-text">
                Select a project below and click <b>Update Progress</b>.
              </p>
            )}
          </div>
        </AnimatedSection>
      )}

      <AnimatedSection delay={0.24}>
        <div className="section-card">
          <h3 className="section-title">All Projects</h3>

          <div
            className="project-toolbar"
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
                placeholder="Search by project name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "42px" }}
              />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <p className="item-text">No matching projects found.</p>
          ) : (
            filteredProjects.map((project, index) => (
              <AnimatedCard key={project.id} delay={0.04 * index}>
                <div className="list-item">
                  <h4 className="item-title">{project.name}</h4>
                  <p className="item-text">{project.description}</p>
                  <p className="item-text">Start: {project.startDate}</p>
                  <p className="item-text">End: {project.endDate}</p>
                  <p className="item-text">Status: {project.status || "Not Started"}</p>
                  <p className="item-text">Progress: {project.progress ?? 0}%</p>
                  <p className="item-text">Remarks: {project.remarks || "No remarks"}</p>

                  <p className="item-text">Planned Budget: {project.plannedBudget ?? 0}</p>
                  <p className="item-text">Actual Cost: {project.actualCost ?? 0}</p>
                  <p className="item-text">Total Tasks: {project.totalTasks ?? 0}</p>
                  <p className="item-text">Completed Tasks: {project.completedTasks ?? 0}</p>
                  <p className="item-text">Available Hours: {project.availableHours ?? 0}</p>
                  <p className="item-text">Worked Hours: {project.workedHours ?? 0}</p>
                  <p className="item-text">Requirement Changes: {project.requirementChanges ?? 0}</p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "14px",
                      flexWrap: "wrap"
                    }}
                  >
                    {canUpdateProgress && (
                      <button
                        className="secondary-btn"
                        onClick={() => handleProgressEdit(project)}
                        style={{
                          background: "linear-gradient(135deg, #0f766e, #0d9488)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <RefreshCw size={16} />
                        Update Progress
                      </button>
                    )}

                    {canManageProjects && (
                      <>
                        <button
                          className="secondary-btn"
                          onClick={() => handleEdit(project)}
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
                          onClick={() => handleDelete(project.id)}
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
                      </>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            ))
          )}
        </div>
      </AnimatedSection>
    </PageMotion>
  );
}

export default Projects;