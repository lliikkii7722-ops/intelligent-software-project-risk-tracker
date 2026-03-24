import React, { useEffect, useState } from "react";
import { getProjects, getRisks, getNotifications } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [risks, setRisks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const role = user?.role?.toUpperCase();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    getProjects()
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Projects error:", err.response?.data || err.message));

    getRisks()
      .then((res) => setRisks(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Risks error:", err.response?.data || err.message));

    getNotifications()
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        console.error("Notifications error:", err.response?.data || err.message)
      );
  }, [navigate, user]);

  const logout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const highRisks = risks.filter((risk) => risk.riskLevel === "High").length;
  const mediumRisks = risks.filter((risk) => risk.riskLevel === "Medium").length;
  const lowRisks = risks.filter((risk) => risk.riskLevel === "Low").length;

  return (
    <div className="app-bg">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Risk Management Dashboard</h1>
            <p className="page-subtitle">
              Welcome, {user?.name || "User"} ({user?.role || "No Role"})
            </p>
          </div>
          <button onClick={logout} className="secondary-btn" style={{ background: "#dc2626" }}>
            Logout
          </button>
        </div>

        <div className="section-card">
          <h3 className="section-title">User Information</h3>
          <p className="item-text">Name: {user?.name || "Not available"}</p>
          <p className="item-text">Email: {user?.email || "Not available"}</p>
          <p className="item-text">Role: {user?.role || "Not available"}</p>
        </div>

        {(role === "ADMIN" || role === "MANAGER" || role === "USER" || role === "MEMBER") && (
          <div
            className="section-card"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px"
            }}
          >
            <div className="list-item">
              <h4 className="item-title">Total Projects</h4>
              <p className="item-text">{projects.length}</p>
            </div>

            <div className="list-item">
              <h4 className="item-title">Total Risks</h4>
              <p className="item-text">{risks.length}</p>
            </div>

            <div className="list-item">
              <h4 className="item-title">High Risks</h4>
              <p className="item-text">{highRisks}</p>
            </div>

            <div className="list-item">
              <h4 className="item-title">Medium Risks</h4>
              <p className="item-text">{mediumRisks}</p>
            </div>

            <div className="list-item">
              <h4 className="item-title">Low Risks</h4>
              <p className="item-text">{lowRisks}</p>
            </div>

            <div className="list-item">
              <h4 className="item-title">Notifications</h4>
              <p className="item-text">{notifications.length}</p>
            </div>
          </div>
        )}

        {role === "ADMIN" && (
          <div className="section-card">
            <h3 className="section-title">Admin Dashboard</h3>
            <p className="item-text">
              You have full access to manage users, projects, risks, mitigations, and dashboard data.
            </p>
          </div>
        )}

        {role === "MANAGER" && (
          <div className="section-card">
            <h3 className="section-title">Manager Dashboard</h3>
            <p className="item-text">
              You can manage projects, risks, mitigations, and monitor project progress.
            </p>
          </div>
        )}

        {(role === "USER" || role === "MEMBER") && (
          <div className="section-card">
            <h3 className="section-title">Member Dashboard</h3>
            <p className="item-text">
              You can view dashboard information and update mitigation status.
            </p>
          </div>
        )}

        <div className="section-card">
          <h3 className="section-title">Recent Notifications</h3>

          {notifications.length === 0 ? (
            <p className="item-text">No notifications available.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="list-item">
                <p className="item-text">{n.message}</p>
                <p className="item-text">Status: {n.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;