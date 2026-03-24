import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

import AuditLogs from "./pages/AuditLogs";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Risks from "./pages/Risks";
import Mitigations from "./pages/Mitigations";
import Users from "./pages/Users";
import RiskAnalytics from "./pages/RiskAnalytics";

function App() {
  return (
    <>
      <Router>
        <Sidebar />
        <div className="app-layout">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "USER", "MEMBER"]}>
                  <Projects />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                  <AuditLogs />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/risks"
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <Risks />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/risk-analytics"
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
                  <RiskAnalytics />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/mitigations"
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "MEMBER", "USER"]}>
                  <Mitigations />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={["ADMIN"]}>
                  <Users />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>

      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;