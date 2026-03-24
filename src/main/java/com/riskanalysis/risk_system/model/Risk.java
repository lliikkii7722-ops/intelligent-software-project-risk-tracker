package com.riskanalysis.risk_system.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Entity
public class Risk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String severity;

    private int probability;
    private int impact;
    private int score;
    private String riskLevel;

    // ===== Quality Risk Tracker =====
    private Integer defectCount;
    private Double testingCoverage;
    private Double reworkEffort;
    private Double qualityScore;
    private String qualityRiskLevel;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Risk() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public int getProbability() {
        return probability;
    }

    public void setProbability(int probability) {
        if (probability < 1 || probability > 3) {
            throw new IllegalArgumentException("Probability must be between 1 and 3");
        }
        this.probability = probability;
        calculateScoreAndLevel();
    }

    public int getImpact() {
        return impact;
    }

    public void setImpact(int impact) {
        if (impact < 1 || impact > 3) {
            throw new IllegalArgumentException("Impact must be between 1 and 3");
        }
        this.impact = impact;
        calculateScoreAndLevel();
    }

    public int getScore() {
        return score;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public Integer getDefectCount() {
        return defectCount;
    }

    public void setDefectCount(Integer defectCount) {
        this.defectCount = defectCount;
        calculateQualityMetrics();
    }

    public Double getTestingCoverage() {
        return testingCoverage;
    }

    public void setTestingCoverage(Double testingCoverage) {
        this.testingCoverage = testingCoverage;
        calculateQualityMetrics();
    }

    public Double getReworkEffort() {
        return reworkEffort;
    }

    public void setReworkEffort(Double reworkEffort) {
        this.reworkEffort = reworkEffort;
        calculateQualityMetrics();
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public String getQualityRiskLevel() {
        return qualityRiskLevel;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    private void calculateScoreAndLevel() {
        this.score = this.probability * this.impact;

        if (this.score <= 3) {
            this.riskLevel = "Low";
        } else if (this.score <= 6) {
            this.riskLevel = "Medium";
        } else {
            this.riskLevel = "High";
        }
    }

    private void calculateQualityMetrics() {
        int defects = defectCount == null ? 0 : defectCount;
        double coverage = testingCoverage == null ? 0.0 : testingCoverage;
        double rework = reworkEffort == null ? 0.0 : reworkEffort;

        double defectPenalty = defects * 5.0;
        double coverageBonus = coverage;
        double reworkPenalty = rework * 2.0;

        double calculatedScore = coverageBonus - defectPenalty - reworkPenalty;

        if (calculatedScore < 0) {
            calculatedScore = 0;
        }
        if (calculatedScore > 100) {
            calculatedScore = 100;
        }

        this.qualityScore = Math.round(calculatedScore * 100.0) / 100.0;

        if (defects > 10 && coverage < 50) {
            this.qualityRiskLevel = "High";
        } else if (qualityScore >= 75) {
            this.qualityRiskLevel = "Low";
        } else if (qualityScore >= 45) {
            this.qualityRiskLevel = "Medium";
        } else {
            this.qualityRiskLevel = "High";
        }
    }
}