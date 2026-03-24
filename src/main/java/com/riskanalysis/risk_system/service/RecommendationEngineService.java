package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.model.Project;
import org.springframework.stereotype.Service;

@Service
public class RecommendationEngineService {

    // ================= BUDGET =================
    public String getBudgetRecommendation(Project project, double budgetUsed) {
        if (budgetUsed > 100) {
            return "Reduce scope or control spending immediately.";
        } else if (budgetUsed >= 80) {
            return "Monitor budget closely and optimize costs.";
        }
        return "";
    }

    // ================= TIMELINE =================
    public String getTimelineRecommendation(String timelineStatus) {
        if ("Delayed".equalsIgnoreCase(timelineStatus)) {
            return "Replan timeline and increase execution speed.";
        } else if ("Warning".equalsIgnoreCase(timelineStatus)) {
            return "Track progress closely and avoid delays.";
        }
        return "";
    }

    // ================= RESOURCE =================
    public String getResourceRecommendation(String resourceStatus) {
        if ("Overloaded".equalsIgnoreCase(resourceStatus)) {
            return "Redistribute workload or add team members.";
        } else if ("Underutilized".equalsIgnoreCase(resourceStatus)) {
            return "Optimize resource allocation.";
        }
        return "";
    }

    // ================= SCOPE =================
    public String getScopeRecommendation(String scopeStatus) {
        if ("High Scope Risk".equalsIgnoreCase(scopeStatus)) {
            return "Freeze requirements and enforce strict change control.";
        } else if ("Moderate Scope Risk".equalsIgnoreCase(scopeStatus)) {
            return "Monitor requirement changes carefully.";
        }
        return "";
    }

    // ================= QUALITY =================
    public String getQualityRecommendation(int defects, double coverage, String qualityLevel) {
        if (defects > 10 && coverage < 50) {
            return "Increase testing cycle and reduce defect leakage immediately.";
        }

        if ("HIGH".equalsIgnoreCase(qualityLevel)) {
            return "Improve test coverage and reduce rework effort.";
        }

        if ("MEDIUM".equalsIgnoreCase(qualityLevel)) {
            return "Monitor quality and strengthen testing practices.";
        }

        return "";
    }

    // ================= FINAL PROJECT ENGINE =================
    public String generateProjectRecommendation(
            Project project,
            double budgetUsed,
            String timelineStatus,
            String resourceStatus,
            String scopeStatus,
            double qualityScore
    ) {
        StringBuilder recommendation = new StringBuilder();

        append(recommendation, getBudgetRecommendation(project, budgetUsed));
        append(recommendation, getTimelineRecommendation(timelineStatus));
        append(recommendation, getResourceRecommendation(resourceStatus));
        append(recommendation, getScopeRecommendation(scopeStatus));
        append(recommendation, getQualityRecommendationFromScore(qualityScore));

        if (recommendation.length() == 0) {
            return "Project is stable. Continue monitoring.";
        }

        return recommendation.toString().trim();
    }

    // ================= QUALITY SCORE FOR PROJECT HEALTH =================
    public String getQualityRecommendationFromScore(double qualityScore) {
        if (qualityScore < 50) {
            return "Improve testing quality and reduce delivery defects.";
        } else if (qualityScore < 75) {
            return "Strengthen review and validation practices.";
        }
        return "";
    }

    // ================= COMMON APPEND HELPER =================
    private void append(StringBuilder builder, String text) {
        if (text != null && !text.isBlank()) {
            builder.append(text).append(" ");
        }
    }
}