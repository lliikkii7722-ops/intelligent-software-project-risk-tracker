import React, { useEffect, useState, useCallback, useRef } from "react";
import { getRisks, getRiskAnalytics } from "../services/api";
import { toast } from "react-toastify";
import "./RiskAnalytics.css";

function RiskAnalytics() {
  const [risks, setRisks] = useState([]);
  const [selectedRiskId, setSelectedRiskId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Prevent stale/older API responses from overwriting latest data
  const latestRequestId = useRef(0);

  const normalizeAnalytics = useCallback((data) => {
    if (!data) return null;

    return {
      qualityScore:
        data.qualityScore ??
        data.score ??
        data.quality_score ??
        0,

      qualityRiskLevel:
        data.qualityRiskLevel ??
        data.qualityLevel ??
        data.riskLevel ??
        data.level ??
        "N/A",

      defectCount:
        data.defectCount ??
        data.defects ??
        data.defect_count ??
        0,

      testingCoverage:
        data.testingCoverage ??
        data.coverage ??
        data.testing_coverage ??
        0,

      reworkEffort:
        data.reworkEffort ??
        data.reworkHours ??
        data.rework ??
        data.rework_effort ??
        0,

      recommendation:
        data.recommendation ??
        data.qualityRecommendation ??
        "No recommendation available."
    };
  }, []);

  const loadAnalytics = useCallback(
    async (id) => {
      if (!id) return;

      const requestId = ++latestRequestId.current;
      setLoading(true);

      try {
        const res = await getRiskAnalytics(id);
        console.log("Risk Analytics Response:", res.data);

        // Only update if this is the latest request
        if (requestId === latestRequestId.current) {
          setAnalytics(normalizeAnalytics(res.data));
        }
      } catch (err) {
        console.error("Load analytics error:", err.response?.data || err.message);

        if (requestId === latestRequestId.current) {
          setAnalytics(null);
          toast.error("Failed to load analytics");
        }
      } finally {
        if (requestId === latestRequestId.current) {
          setLoading(false);
        }
      }
    },
    [normalizeAnalytics]
  );

  const loadRisks = useCallback(async () => {
    try {
      const res = await getRisks();
      const data = Array.isArray(res.data) ? res.data : [];
      setRisks(data);

      if (data.length > 0) {
        setSelectedRiskId(String(data[0].id));
      } else {
        setSelectedRiskId("");
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Load risks error:", err.response?.data || err.message);
      toast.error("Failed to load risks");
    }
  }, []);

  useEffect(() => {
    loadRisks();
  }, [loadRisks]);

  // Load analytics only when selectedRiskId changes
  useEffect(() => {
    if (selectedRiskId) {
      loadAnalytics(selectedRiskId);
    }
  }, [selectedRiskId, loadAnalytics]);

  const handleChange = (e) => {
    const id = e.target.value;
    setSelectedRiskId(id);
  };

  return (
    <div className="analytics-page">
      <h1 className="analytics-title">Risk Analytics</h1>

      <div className="analytics-card">
        <label>Select Risk</label>
        <select value={selectedRiskId} onChange={handleChange}>
          {risks.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="analytics-card">
          <p>Loading analytics...</p>
        </div>
      )}

      {!loading && analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Quality Score</h3>
            <h2>{analytics.qualityScore}%</h2>
          </div>

          <div className="analytics-card">
            <h3>Risk Level</h3>
            <h2>{analytics.qualityRiskLevel}</h2>
          </div>

          <div className="analytics-card">
            <h3>Defects</h3>
            <h2>{analytics.defectCount}</h2>
          </div>

          <div className="analytics-card">
            <h3>Testing Coverage</h3>
            <h2>{analytics.testingCoverage}%</h2>
          </div>

          <div className="analytics-card">
            <h3>Rework Effort</h3>
            <h2>{analytics.reworkEffort}</h2>
          </div>

          <div className="analytics-card full">
            <h3>Recommendation</h3>
            <p>{analytics.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskAnalytics;