import React, { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from "../services/api";
import { toast } from "react-toastify";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadProjects = () => {
    getProjects()
      .then((res) => {
        setProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Projects error:", err.response?.data || err.message);
        toast.error("Failed to load projects");
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const projectData = {
      name,
      description,
      startDate,
      endDate
    };

    if (editingId) {
      updateProject(editingId, projectData)
        .then(() => {
          toast.success("Project updated successfully");
          loadProjects();
          resetForm();
        })
        .catch((err) => {
          console.error("Update project error:", err.response?.data || err.message);
          toast.error("Failed to update project");
        });
    } else {
      createProject(projectData)
        .then(() => {
          toast.success("Project created successfully");
          loadProjects();
          resetForm();
        })
        .catch((err) => {
          console.error("Create project error:", err.response?.data || err.message);
          toast.error("Failed to create project");
        });
    }
  };

  const handleEdit = (project) => {
    setName(project.name || "");
    setDescription(project.description || "");
    setStartDate(project.startDate || "");
    setEndDate(project.endDate || "");
    setEditingId(project.id);
  };

  const handleDelete = (id) => {
    deleteProject(id)
      .then(() => {
        toast.success("Project deleted successfully");
        loadProjects();
      })
      .catch((err) => {
        console.error("Delete project error:", err.response?.data || err.message);
        toast.error("Failed to delete project");
      });
  };

  return (
    <div className="page-container">
      <h2>Project Management</h2>

      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <textarea
          placeholder="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        <label>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />

        <button type="submit">
          {editingId ? "Update Project" : "Add Project"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </form>

      <div className="table-card">
        <h3>Project List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>{project.startDate}</td>
                  <td>{project.endDate}</td>
                  <td>
                    <button onClick={() => handleEdit(project)}>Edit</button>
                    <button onClick={() => handleDelete(project.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No projects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Projects;