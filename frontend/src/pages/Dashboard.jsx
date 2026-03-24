import React, { useEffect, useMemo, useState } from "react";
import {
  getProjects,
  getRisks,
  getNotifications,
  getProjectAnalytics,
  getRiskAnalytics
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Bell,
  FolderKanban,
  ShieldAlert,
  TriangleAlert,
  Activity,
  BarChart3
} from "lucide-react";
import { motion, animate } from "framer-motion";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [risks, setRisks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      navigate("/");
      return;
    }

    getProjects()
      .then((res) => setProjects(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProjects([]));

    getRisks()
      .then((res) => setRisks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRisks([]));

    getNotifications()
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNotifications([]));
  }, [navigate]);

  useEffect(() => {
    const controls = animate(0, risks.length, {
      duration: 0.8,
      onUpdate(value) {
        setAnimatedTotal(Math.round(value));
      }
    });

    return () => controls.stop();
  }, [risks.length]);

  const severityData = useMemo(() => {
    return [
      {
        name: "Low",
        value: risks.filter((r) => String(r.severity).toUpperCase() === "LOW").length,
        color: "#22c55e",
        softBg: "rgba(34, 197, 94, 0.12)",
        softText: "#86efac"
      },
      {
        name: "Medium",
        value: risks.filter((r) => String(r.severity).toUpperCase() === "MEDIUM").length,
        color: "#f59e0b",
        softBg: "rgba(245, 158, 11, 0.12)",
        softText: "#fcd34d"
      },
      {
        name: "High",
        value: risks.filter((r) => String(r.severity).toUpperCase() === "HIGH").length,
        color: "#ef4444",
        softBg: "rgba(239, 68, 68, 0.12)",
        softText: "#fca5a5"
      }
    ].filter((item) => item.value > 0);
  }, [risks]);

  const highRisksCount = risks.filter(
    (r) =>
      String(r.severity).toUpperCase() === "HIGH" ||
      String(r.riskLevel || "").toUpperCase() === "HIGH"
  ).length;

  const avgRiskScore =
    risks.length > 0
      ? (
          risks.reduce((sum, risk) => sum + Number(risk.score || 0), 0) / risks.length
        ).toFixed(1)
      : 0;

  const projectHealth = useMemo(() => {
    if (projects.length === 0) return "No Data";
    if (highRisksCount === 0) return "Healthy";
    if (highRisksCount < 3) return "Moderate Risk";
    return "Critical";
  }, [projects.length, highRisksCount]);

  const systemStatus = useMemo(() => {
    if (highRisksCount === 0) return "Stable";
    if (highRisksCount < 5) return "Warning";
    return "Critical";
  }, [highRisksCount]);

  const riskDensity =
    projects.length > 0 ? (risks.length / projects.length).toFixed(1) : 0;

  const getHealthTone = (value) => {
    if (value === "Healthy" || value === "Stable") {
      return {
        bg: "rgba(34, 197, 94, 0.12)",
        color: "#86efac",
        border: "1px solid rgba(34, 197, 94, 0.24)"
      };
    }

    if (value === "Moderate Risk" || value === "Warning") {
      return {
        bg: "rgba(245, 158, 11, 0.12)",
        color: "#fcd34d",
        border: "1px solid rgba(245, 158, 11, 0.24)"
      };
    }

    return {
      bg: "rgba(239, 68, 68, 0.12)",
      color: "#fca5a5",
      border: "1px solid rgba(239, 68, 68, 0.24)"
    };
  };

  const getHeatMapCount = (probability, impact) => {
    return risks.filter(
      (risk) =>
        Number(risk.probability) === probability &&
        Number(risk.impact) === impact
    ).length;
  };

  const getHeatMapColor = (probability, impact) => {
    const score = probability * impact;
    if (score <= 3) return "#052e1a";
    if (score <= 6) return "#3b2304";
    return "#450a0a";
  };

  const getHeatMapTextColor = (probability, impact) => {
    const score = probability * impact;
    if (score <= 3) return "#86efac";
    if (score <= 6) return "#fcd34d";
    return "#fca5a5";
  };

  const impactLevels = [3, 2, 1];
  const probabilityLevels = [1, 2, 3];
  const recentNotifications = notifications.slice(0, 5);

  const buildProjectAnalyticsRows = async () => {
    const responses = await Promise.allSettled(
      projects.map((project) => getProjectAnalytics(project.id))
    );

    return responses.map((result, index) => {
      const project = projects[index];

      if (result.status === "fulfilled") {
        const data = result.value.data || {};
        return [
          data.projectName || project.name || "N/A",
          `${data.budgetUsedPercent ?? 0}%`,
          data.budgetStatus || "N/A",
          data.timelineStatus || "N/A",
          data.resourceStatus || "N/A",
          data.scopeStatus || "N/A",
          data.projectHealthStatus || "N/A",
          data.projectHealthScore ?? "N/A",
          data.recommendation || "N/A"
        ];
      }

      return [
        project?.name || "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "N/A",
        "Analytics unavailable"
      ];
    });
  };

  const buildRiskAnalyticsRows = async () => {
    const responses = await Promise.allSettled(
      risks.map((risk) => getRiskAnalytics(risk.id))
    );

    return responses.map((result, index) => {
      const risk = risks[index];

      if (result.status === "fulfilled") {
        const data = result.value.data || {};
        return [
          data.title || risk.title || "N/A",
          data.score ?? risk.score ?? "N/A",
          data.riskLevel || risk.riskLevel || "N/A",
          data.qualityScore ?? "N/A",
          data.qualityRiskLevel || "N/A",
          data.recommendation || "N/A"
        ];
      }

      return [
        risk?.title || "N/A",
        risk?.score ?? "N/A",
        risk?.riskLevel || "N/A",
        "N/A",
        "N/A",
        "Analytics unavailable"
      ];
    });
  };

  const downloadPDF = async () => {
    try {
      toast.info("Preparing intelligent PDF report...");

      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const role = user?.role || "USER";

      const doc = new jsPDF();

      const projectAnalyticsRows = await buildProjectAnalyticsRows();
      const riskAnalyticsRows = await buildRiskAnalyticsRows();

      const visibleProjectRows =
        role === "USER" || role === "MEMBER"
          ? projectAnalyticsRows.slice(0, 2)
          : projectAnalyticsRows;

      const visibleRiskRows =
        role === "USER" || role === "MEMBER"
          ? riskAnalyticsRows.slice(0, 3)
          : riskAnalyticsRows;

      doc.setFontSize(18);
      doc.text("Intelligent Risk Management Report", 14, 16);

      doc.setFontSize(11);
      doc.text(`Role: ${role}`, 14, 24);
      doc.text(`Total Projects: ${projects.length}`, 14, 32);
      doc.text(`Total Risks: ${risks.length}`, 14, 39);
      doc.text(`High Risks: ${highRisksCount}`, 14, 46);
      doc.text(`Average Risk Score: ${avgRiskScore}`, 14, 53);
      doc.text(`Project Health: ${projectHealth}`, 14, 60);
      doc.text(`System Status: ${systemStatus}`, 14, 67);
      doc.text(`Risk Density: ${riskDensity}`, 14, 74);

      autoTable(doc, {
        startY: 84,
        head: [["Dashboard Summary", "Value"]],
        body: [
          ["Role", role],
          ["Total Projects", String(projects.length)],
          ["Total Risks", String(risks.length)],
          ["High Risks", String(highRisksCount)],
          ["Average Risk Score", String(avgRiskScore)],
          ["Project Health", projectHealth],
          ["System Status", systemStatus],
          ["Risk Density", String(riskDensity)],
          ...(role === "ADMIN" || role === "MANAGER"
            ? [["Notifications", String(notifications.length)]]
            : [])
        ],
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235] }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [[
          "Project",
          "Budget %",
          "Budget Status",
          "Timeline",
          "Resource",
          "Scope",
          "Health",
          "Score",
          "Recommendation"
        ]],
        body: visibleProjectRows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [16, 185, 129] },
        columnStyles: {
          8: { cellWidth: 45 }
        }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 12,
        head: [[
          "Risk",
          "Score",
          "Risk Level",
          "Quality Score",
          "Quality Level",
          "Recommendation"
        ]],
        body: visibleRiskRows,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [245, 158, 11] },
        columnStyles: {
          5: { cellWidth: 65 }
        }
      });

      if (role === "ADMIN" || role === "MANAGER") {
        const recommendationSummary = [];

        if (highRisksCount > 0) {
          recommendationSummary.push([
            "High Risk Alert",
            `${highRisksCount} high-risk items need closer monitoring.`
          ]);
        }

        if (Number(avgRiskScore) >= 8) {
          recommendationSummary.push([
            "Average Risk Score",
            "Overall risk score is elevated. Review mitigation plans."
          ]);
        }

        if (systemStatus === "Critical") {
          recommendationSummary.push([
            "System Status",
            "Critical condition detected. Prioritize immediate intervention."
          ]);
        }

        if (projectHealth === "Moderate Risk" || projectHealth === "Critical") {
          recommendationSummary.push([
            "Project Portfolio",
            "Project health requires management attention and corrective planning."
          ]);
        }

        if (recommendationSummary.length === 0) {
          recommendationSummary.push([
            "Overall Summary",
            "System is stable. Continue regular monitoring and review cycles."
          ]);
        }

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 12,
          head: [["AI Recommendation Summary", "Details"]],
          body: recommendationSummary,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [239, 68, 68] }
        });
      }

      const fileName =
        role === "ADMIN"
          ? "Admin_Intelligent_Risk_Report.pdf"
          : role === "MANAGER"
          ? "Manager_Intelligent_Risk_Report.pdf"
          : "User_Intelligent_Risk_Report.pdf";

      doc.save(fileName);
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div
          style={{
            background: "#0f172a",
            border: "1px solid #22314a",
            borderRadius: "16px",
            padding: "12px 14px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.35)"
          }}
        >
          <p style={{ margin: 0, color: "#f8fafc", fontWeight: 800 }}>
            {item.name}
          </p>
          <p style={{ margin: "6px 0 0", color: "#cbd5e1", fontSize: "14px" }}>
            Risks: {item.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const fadeUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 }
  };

  const summaryCards = [
    { label: "Total Projects", value: projects.length },
    { label: "Total Risks", value: risks.length },
    { label: "High Risks", value: highRisksCount, highlight: true },
    { label: "Average Risk Score", value: avgRiskScore }
  ];

  const intelligenceCards = [
    {
      label: "Project Health",
      value: projectHealth,
      icon: <Activity size={18} />,
      tone: getHealthTone(projectHealth)
    },
    {
      label: "System Risk Status",
      value: systemStatus,
      icon: <ShieldAlert size={18} />,
      tone: getHealthTone(systemStatus)
    },
    {
      label: "Active Notifications",
      value: notifications.length,
      icon: <Bell size={18} />,
      tone: {
        bg: "rgba(59, 130, 246, 0.12)",
        color: "#93c5fd",
        border: "1px solid rgba(59, 130, 246, 0.24)"
      }
    },
    {
      label: "Risk Density",
      value: riskDensity,
      icon: <BarChart3 size={18} />,
      tone: {
        bg: "rgba(168, 85, 247, 0.12)",
        color: "#d8b4fe",
        border: "1px solid rgba(168, 85, 247, 0.24)"
      }
    }
  ];

  return (
    <motion.div
      className="app-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="page-container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Monitor projects, risks, notifications, and reporting from one place.
            </p>
          </div>

          <button onClick={downloadPDF} className="secondary-btn">
            Export PDF Report
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          style={{
            marginBottom: "22px",
            padding: "18px 20px",
            borderRadius: "22px",
            background: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(15,23,42,0.9))",
            border: "1px solid rgba(59,130,246,0.24)",
            boxShadow: "0 14px 30px rgba(0,0,0,0.18)"
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#93c5fd",
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: "8px"
            }}
          >
            INTELLIGENCE SUMMARY
          </div>
          <div
            style={{
              color: "#f8fafc",
              fontSize: "18px",
              fontWeight: 700,
              lineHeight: 1.5
            }}
          >
            Current system status is{" "}
            <span style={{ color: getHealthTone(systemStatus).color }}>
              {systemStatus}
            </span>
            . Project portfolio health is{" "}
            <span style={{ color: getHealthTone(projectHealth).color }}>
              {projectHealth}
            </span>
            , with {highRisksCount} high-risk item{highRisksCount === 1 ? "" : "s"}{" "}
            across {projects.length} project{projects.length === 1 ? "" : "s"}.
          </div>
        </motion.div>

        <div className="card-grid">
          {summaryCards.map((item, index) => (
            <motion.div
              key={item.label}
              className={`stat-card ${item.highlight ? "high-risk-card" : ""}`}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.35, delay: 0.08 * index }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className="stat-label">{item.label}</div>
              <div className="stat-value">{item.value}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          {intelligenceCards.map((item, index) => (
            <motion.div
              key={item.label}
              className="stat-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.14 + index * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              style={{
                background: item.tone.bg,
                border: item.tone.border
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  color: item.tone.color,
                  background: "rgba(15,23,42,0.45)"
                }}
              >
                {item.icon}
              </div>

              <div className="stat-label">{item.label}</div>
              <div className="stat-value" style={{ color: item.tone.color }}>
                {item.value}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "20px",
            marginTop: "24px"
          }}
        >
          <motion.div
            className="section-card"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px"
              }}
            >
              <div>
                <h3 className="section-title" style={{ marginBottom: "6px" }}>
                  Risk Severity Overview
                </h3>
                <p className="item-text" style={{ margin: 0 }}>
                  Distribution of risks by severity level
                </p>
              </div>

              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "rgba(59,130,246,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#93c5fd"
                }}
              >
                <ShieldAlert size={20} />
              </div>
            </div>

            {severityData.length === 0 ? (
              <div className="empty-state">No risk data available.</div>
            ) : (
              <>
                <div style={{ width: "100%", height: "330px", position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={severityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={74}
                        outerRadius={108}
                        paddingAngle={5}
                        activeOuterRadius={120}
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth={2}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {severityData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            style={{
                              filter:
                                activeIndex === index
                                  ? `drop-shadow(0 0 12px ${entry.color})`
                                  : "none",
                              transition: "all 0.2s ease"
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={renderCustomTooltip} />
                    </PieChart>
                  </ResponsiveContainer>

                  <motion.div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -54%)",
                      textAlign: "center",
                      pointerEvents: "none"
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        fontWeight: 700,
                        letterSpacing: "0.02em"
                      }}
                    >
                      Total Risks
                    </div>
                    <div
                      style={{
                        fontSize: "32px",
                        color: "#f8fafc",
                        fontWeight: 800,
                        lineHeight: 1.1
                      }}
                    >
                      {animatedTotal}
                    </div>
                  </motion.div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "12px",
                    marginTop: "6px"
                  }}
                >
                  {severityData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.32 + index * 0.08 }}
                      whileHover={{ y: -3, scale: 1.02 }}
                      style={{
                        padding: "14px",
                        borderRadius: "18px",
                        background: item.softBg,
                        border:
                          activeIndex === index
                            ? `1px solid ${item.color}`
                            : "1px solid rgba(255,255,255,0.06)",
                        boxShadow:
                          activeIndex === index
                            ? `0 12px 22px rgba(0,0,0,0.20)`
                            : "none"
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "999px",
                          background: item.color,
                          marginBottom: "10px"
                        }}
                      />
                      <div
                        style={{
                          color: "#f8fafc",
                          fontWeight: 700,
                          fontSize: "14px"
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          color: item.softText,
                          fontWeight: 800,
                          fontSize: "22px",
                          marginTop: "4px"
                        }}
                      >
                        {item.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          <motion.div
            className="section-card"
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px"
              }}
            >
              <div>
                <h3 className="section-title" style={{ marginBottom: "6px" }}>
                  Recent Notifications
                </h3>
                <p className="item-text" style={{ margin: 0 }}>
                  Latest alerts and updates from the system
                </p>
              </div>

              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: "rgba(245,158,11,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fcd34d"
                }}
              >
                <Bell size={20} />
              </div>
            </div>

            {recentNotifications.length === 0 ? (
              <div className="empty-state">No notifications available.</div>
            ) : (
              recentNotifications.map((n, index) => (
                <motion.div
                  key={n.id || index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: 0.34 + index * 0.08 }}
                  whileHover={{ y: -2 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px",
                    marginBottom: "12px",
                    borderRadius: "18px",
                    background: "linear-gradient(180deg, #0b1425, #111c31)",
                    border: "1px solid #1f2c44",
                    boxShadow: "0 10px 22px rgba(0,0,0,0.18)"
                  }}
                >
                  <div
                    style={{
                      minWidth: "42px",
                      height: "42px",
                      borderRadius: "14px",
                      background: "rgba(59,130,246,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#93c5fd"
                    }}
                  >
                    <TriangleAlert size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#f8fafc",
                        fontWeight: 700,
                        fontSize: "14px",
                        marginBottom: "4px"
                      }}
                    >
                      System Alert
                    </div>
                    <div
                      style={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                        lineHeight: "1.55"
                      }}
                    >
                      {n.message}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        <motion.div
          className="section-card"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.42, delay: 0.38 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            <div>
              <h3 className="section-title" style={{ marginBottom: "6px" }}>
                Risk Heat Map
              </h3>
              <p className="item-text" style={{ margin: 0 }}>
                Probability and impact mapping of identified risks
              </p>
            </div>

            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: "rgba(34,197,94,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#86efac"
              }}
            >
              <FolderKanban size={20} />
            </div>
          </div>

          {risks.length === 0 ? (
            <div className="empty-state">No risk data available.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "inline-block", minWidth: "470px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px repeat(3, 110px)",
                    gap: "10px",
                    alignItems: "center"
                  }}
                >
                  <div></div>
                  <div style={{ textAlign: "center", fontWeight: "700", color: "#94a3b8" }}>
                    P1
                  </div>
                  <div style={{ textAlign: "center", fontWeight: "700", color: "#94a3b8" }}>
                    P2
                  </div>
                  <div style={{ textAlign: "center", fontWeight: "700", color: "#94a3b8" }}>
                    P3
                  </div>

                  {impactLevels.map((impact, rowIndex) => (
                    <React.Fragment key={impact}>
                      <div style={{ fontWeight: "700", color: "#cbd5e1" }}>I{impact}</div>

                      {probabilityLevels.map((probability, colIndex) => (
                        <motion.div
                          key={`${impact}-${probability}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.22,
                            delay: 0.46 + (rowIndex * 3 + colIndex) * 0.04
                          }}
                          whileHover={{ y: -2, scale: 1.03 }}
                          style={{
                            height: "98px",
                            borderRadius: "20px",
                            background: getHeatMapColor(probability, impact),
                            color: getHeatMapTextColor(probability, impact),
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "800",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow: "0 10px 20px rgba(0,0,0,0.18)"
                          }}
                        >
                          <div style={{ fontSize: "22px", lineHeight: 1 }}>
                            {getHeatMapCount(probability, impact)}
                          </div>
                          <div style={{ fontSize: "12px", marginTop: "6px" }}>
                            Risks
                          </div>
                        </motion.div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap"
                  }}
                >
                  <span className="badge badge-low">Low</span>
                  <span className="badge badge-medium">Medium</span>
                  <span className="badge badge-high">High</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Dashboard;