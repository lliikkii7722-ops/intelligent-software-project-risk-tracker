import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  Wrench,
  Users,
  ScrollText,
  LogOut,
  Activity
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const hideSidebar =
    location.pathname === "/" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const itemStyle = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "14px",
    color: active ? "#ffffff" : "#cbd5e1",
    background: active
      ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
      : "transparent",
    boxShadow: active ? "0 10px 20px rgba(37,99,235,0.25)" : "none",
    fontWeight: active ? 700 : 600,
    textDecoration: "none",
    marginBottom: "8px"
  });

  if (hideSidebar) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-logo">R</div>
          <div>
            <h2>Risk System</h2>
            <p>{user ? `${user.name} • ${user.role}` : "Dashboard"}</p>
          </div>
        </div>
      </div>

      <div className="sidebar-menu">
        <Link to="/dashboard" style={itemStyle(location.pathname === "/dashboard")}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        {user &&
          ["ADMIN", "MANAGER", "USER", "MEMBER"].includes(user.role) && (
            <Link to="/projects" style={itemStyle(location.pathname === "/projects")}>
              <FolderKanban size={18} />
              <span>Projects</span>
            </Link>
          )}

        {user &&
          ["ADMIN", "MANAGER"].includes(user.role) && (
            <>
              <Link to="/risks" style={itemStyle(location.pathname === "/risks")}>
                <ShieldAlert size={18} />
                <span>Risks</span>
              </Link>

              <Link
                to="/risk-analytics"
                style={itemStyle(location.pathname === "/risk-analytics")}
              >
                <Activity size={18} />
                <span>Risk Analytics</span>
              </Link>
            </>
          )}

        {user &&
          ["ADMIN", "MANAGER", "MEMBER", "USER"].includes(user.role) && (
            <Link
              to="/mitigations"
              style={itemStyle(location.pathname === "/mitigations")}
            >
              <Wrench size={18} />
              <span>Mitigations</span>
            </Link>
          )}

        {user?.role === "ADMIN" && (
          <Link to="/users" style={itemStyle(location.pathname === "/users")}>
            <Users size={18} />
            <span>Users</span>
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <Link to="/audit" style={itemStyle(location.pathname === "/audit")}>
            <ScrollText size={18} />
            <span>Audit Logs</span>
          </Link>
        )}
      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;