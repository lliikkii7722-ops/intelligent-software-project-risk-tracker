import React, { useState } from "react";
import { registerUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Briefcase, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !role.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = { name, email, password, role };
      const res = await registerUser(payload);
      console.log("Register success:", res.data);

      alert("Registration Successful");
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      alert(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Registration Failed"
      );
    }
  };

  return (
    <motion.div
      className="auth-shell"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="auth-grid">
        <div className="auth-hero">
          <div className="auth-badge">
            <ShieldCheck size={16} />
            <span>Secure Access Registration</span>
          </div>

          <h1 className="auth-hero-title">
            Join the platform built for modern risk governance.
          </h1>

          <p className="auth-hero-text">
            Create your account to access risk insights, mitigation workflows,
            reporting tools, and audit-ready operational visibility.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-card">
              <h4>Project Oversight</h4>
              <p>Centralize projects and track associated risk exposure.</p>
            </div>
            <div className="auth-feature-card">
              <h4>Mitigation Workflows</h4>
              <p>Assign actions, update statuses, and improve accountability.</p>
            </div>
            <div className="auth-feature-card">
              <h4>Reporting & Audit</h4>
              <p>Generate reports and maintain a complete action trail.</p>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-top">
            <div className="auth-brand">
              <div className="auth-logo">R</div>
              <div>
                <h2>Create Account</h2>
                <p>Register to access the risk management system</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <label className="auth-label">Full Name</label>
            <div className="input-icon-wrap">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <label className="auth-label">Email Address</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label className="auth-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <label className="auth-label">Role</label>
            <div className="input-icon-wrap">
              <Briefcase size={18} className="input-icon" />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="USER">USER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button type="submit" className="auth-primary-btn">
              <span>Register</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/">Login here</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Register;