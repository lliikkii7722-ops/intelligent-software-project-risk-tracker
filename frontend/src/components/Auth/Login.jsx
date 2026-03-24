import React, { useState } from "react";
import { loginUser } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await loginUser({ email, password });

      if (res.data?.message === "Login Successful" || res.data?.email) {
        localStorage.setItem("user", JSON.stringify(res.data));
        alert("Login Successful");
        navigate("/dashboard");
      } else {
        alert(res.data?.message || "Login Failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Login Failed"
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
            <span>Enterprise Risk Platform</span>
          </div>

          <h1 className="auth-hero-title">
            Manage risks with clarity, control, and confidence.
          </h1>

          <p className="auth-hero-text">
            Track projects, assess risks, manage mitigations, monitor audits,
            and generate reports from one secure dashboard.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-card">
              <h4>Role-Based Access</h4>
              <p>Secure access for Admin, Manager, User, and Member roles.</p>
            </div>

            <div className="auth-feature-card">
              <h4>Risk Analytics</h4>
              <p>Monitor severity, score, predictions, and heatmap insights.</p>
            </div>

            <div className="auth-feature-card">
              <h4>Audit Tracking</h4>
              <p>Maintain accountability through detailed activity logs.</p>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-top">
            <div className="auth-brand">
              <div className="auth-logo">R</div>
              <div>
                <h2>Welcome Back</h2>
                <p>Sign in to continue to your dashboard</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
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

            <button type="submit" className="auth-primary-btn">
              <span>Login</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-footer-text">
            Don&apos;t have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;