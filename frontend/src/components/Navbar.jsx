import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const styles = {
  navWrap: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    padding: "16px 20px 0 20px",
    backdropFilter: "blur(14px)"
  },
  nav: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)"
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  logoBox: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
    color: "#ffffff",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.3)"
  },
  brandWrap: {
    display: "flex",
    flexDirection: "column"
  },
  logo: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: "-0.02em"
  },
  sub: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#cbd5e1"
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "6px"
  },
  link: {
    color: "#dbeafe",
    fontWeight: "600",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
    background: "transparent"
  },
  activeLink: {
    color: "#ffffff",
    fontWeight: "700",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95))",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.28)"
  },
  logout: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 10px 18px rgba(239, 68, 68, 0.22)"
  }
};

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  const hideNavbar =
    location.pathname === "/" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getLinkStyle = (path) =>
    location.pathname === path ? styles.activeLink : styles.link;

  if (hideNavbar) return null;

  return (
    <div style={styles.navWrap}>
      <nav style={styles.nav}>
        <div style={styles.left}>
          <div style={styles.logoBox}>R</div>
          <div style={styles.brandWrap}>
            <h2 style={styles.logo}>Risk Management System</h2>
            <p style={styles.sub}>
              {user ? `${user.name} • ${user.role}` : "Project Risk Dashboard"}
            </p>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.links}>
            {user && (
              <Link to="/dashboard" style={getLinkStyle("/dashboard")}>
                Dashboard
              </Link>
            )}

            {user &&
              ["ADMIN", "MANAGER", "USER", "MEMBER"].includes(user.role) && (
                <Link to="/projects" style={getLinkStyle("/projects")}>
                  Projects
                </Link>
              )}

            {user &&
              ["ADMIN", "MANAGER"].includes(user.role) && (
                <Link to="/risks" style={getLinkStyle("/risks")}>
                  Risks
                </Link>
              )}

            {user && user.role === "ADMIN" && (
              <Link to="/users" style={getLinkStyle("/users")}>
                Users
              </Link>
            )}

            {user &&
              ["ADMIN", "MANAGER", "MEMBER", "USER"].includes(user.role) && (
                <Link to="/mitigations" style={getLinkStyle("/mitigations")}>
                  Mitigations
                </Link>
              )}

            {user?.role === "ADMIN" && (
              <Link to="/audit" style={getLinkStyle("/audit")}>
                Audit Logs
              </Link>
            )}
          </div>

          {user && (
            <button onClick={handleLogout} style={styles.logout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;