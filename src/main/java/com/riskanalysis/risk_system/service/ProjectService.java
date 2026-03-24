package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.model.Project;
import com.riskanalysis.risk_system.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final RecommendationEngineService recommendationEngineService;

    public ProjectService(ProjectRepository projectRepository,
                          RecommendationEngineService recommendationEngineService) {
        this.projectRepository = projectRepository;
        this.recommendationEngineService = recommendationEngineService;
    }

    public Project saveProject(Project project) {
        applyDefaultValues(project);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public Project updateProject(Long id, Project updatedProject) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        existingProject.setName(updatedProject.getName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setStartDate(updatedProject.getStartDate());
        existingProject.setEndDate(updatedProject.getEndDate());

        if (updatedProject.getStatus() != null) {
            existingProject.setStatus(updatedProject.getStatus());
        }

        if (updatedProject.getProgress() != null) {
            existingProject.setProgress(updatedProject.getProgress());
        }

        if (updatedProject.getRemarks() != null) {
            existingProject.setRemarks(updatedProject.getRemarks());
        }

        if (updatedProject.getPlannedBudget() != null) {
            existingProject.setPlannedBudget(updatedProject.getPlannedBudget());
        }

        if (updatedProject.getActualCost() != null) {
            existingProject.setActualCost(updatedProject.getActualCost());
        }

        if (updatedProject.getTotalTasks() != null) {
            existingProject.setTotalTasks(updatedProject.getTotalTasks());
        }

        if (updatedProject.getCompletedTasks() != null) {
            existingProject.setCompletedTasks(updatedProject.getCompletedTasks());
        }

        if (updatedProject.getAvailableHours() != null) {
            existingProject.setAvailableHours(updatedProject.getAvailableHours());
        }

        if (updatedProject.getWorkedHours() != null) {
            existingProject.setWorkedHours(updatedProject.getWorkedHours());
        }

        if (updatedProject.getRequirementChanges() != null) {
            existingProject.setRequirementChanges(updatedProject.getRequirementChanges());
        }

        applyDefaultValues(existingProject);
        return projectRepository.save(existingProject);
    }

    public Project updateProjectProgress(Long id, Project updatedProject) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        existingProject.setStatus(updatedProject.getStatus());
        existingProject.setProgress(updatedProject.getProgress());
        existingProject.setRemarks(updatedProject.getRemarks());

        applyDefaultValues(existingProject);
        return projectRepository.save(existingProject);
    }

    private void applyDefaultValues(Project project) {
        if (project.getStatus() == null || project.getStatus().isBlank()) {
            project.setStatus("Not Started");
        }

        if (project.getProgress() == null) {
            project.setProgress(0);
        }

        if (project.getRemarks() == null) {
            project.setRemarks("");
        }

        if (project.getPlannedBudget() == null) {
            project.setPlannedBudget(0.0);
        }

        if (project.getActualCost() == null) {
            project.setActualCost(0.0);
        }

        if (project.getTotalTasks() == null) {
            project.setTotalTasks(0);
        }

        if (project.getCompletedTasks() == null) {
            project.setCompletedTasks(0);
        }

        if (project.getAvailableHours() == null) {
            project.setAvailableHours(0.0);
        }

        if (project.getWorkedHours() == null) {
            project.setWorkedHours(0.0);
        }

        if (project.getRequirementChanges() == null) {
            project.setRequirementChanges(0);
        }
    }

    // ===== Intelligence / Analysis Methods =====

    public Map<String, Object> getProjectAnalytics(Long id) {
        Project project = getProjectById(id);

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("projectId", project.getId());
        analytics.put("projectName", project.getName());

        analytics.put("budgetUsedPercent", calculateBudgetUsedPercent(project));
        analytics.put("costVariance", calculateCostVariance(project));
        analytics.put("budgetStatus", getBudgetStatus(project));

        analytics.put("taskCompletionPercent", calculateTaskCompletionPercent(project));
        analytics.put("timelineStatus", getTimelineStatus(project));

        analytics.put("resourceUtilizationPercent", calculateResourceUtilization(project));
        analytics.put("resourceStatus", getResourceStatus(project));

        analytics.put("requirementChangeCount", project.getRequirementChanges());
        analytics.put("scopeStatus", getScopeStatus(project));

        analytics.put("projectHealthScore", calculateProjectHealthScore(project));
        analytics.put("projectHealthStatus", getProjectHealthStatus(project));

        analytics.put("recommendation", getMitigationRecommendation(project));

        return analytics;
    }

    public double calculateBudgetUsedPercent(Project project) {
        if (project.getPlannedBudget() == null || project.getPlannedBudget() <= 0) {
            return 0.0;
        }
        return round((project.getActualCost() / project.getPlannedBudget()) * 100);
    }

    public double calculateCostVariance(Project project) {
        return round(project.getPlannedBudget() - project.getActualCost());
    }

    public String getBudgetStatus(Project project) {
        double budgetUsed = calculateBudgetUsedPercent(project);

        if (budgetUsed > 100) {
            return "Over Budget";
        } else if (budgetUsed >= 80) {
            return "At Risk";
        } else {
            return "On Budget";
        }
    }

    public double calculateTaskCompletionPercent(Project project) {
        if (project.getTotalTasks() == null || project.getTotalTasks() <= 0) {
            return 0.0;
        }
        return round((project.getCompletedTasks() * 100.0) / project.getTotalTasks());
    }

    public String getTimelineStatus(Project project) {
        double completion = calculateTaskCompletionPercent(project);
        int progress = project.getProgress() == null ? 0 : project.getProgress();

        if (progress >= 100 || completion >= 100) {
            return "On Time";
        } else if (progress < 50 && completion < 50) {
            return "Delayed";
        } else {
            return "Warning";
        }
    }

    public double calculateResourceUtilization(Project project) {
        if (project.getAvailableHours() == null || project.getAvailableHours() <= 0) {
            return 0.0;
        }
        return round((project.getWorkedHours() / project.getAvailableHours()) * 100);
    }

    public String getResourceStatus(Project project) {
        double utilization = calculateResourceUtilization(project);

        if (utilization > 85) {
            return "Overloaded";
        } else if (utilization >= 60) {
            return "Optimal";
        } else {
            return "Underutilized";
        }
    }

    public String getScopeStatus(Project project) {
        int changes = project.getRequirementChanges() == null ? 0 : project.getRequirementChanges();

        if (changes > 10) {
            return "High Scope Risk";
        } else if (changes >= 5) {
            return "Moderate Scope Risk";
        } else {
            return "Stable";
        }
    }

    public double calculateProjectHealthScore(Project project) {
        double timelineScore = getTimelineNumericScore(project);
        double budgetScore = getBudgetNumericScore(project);
        double resourceScore = getResourceNumericScore(project);
        double qualityScore = 70.0;

        double healthScore =
                (0.4 * timelineScore) +
                        (0.3 * budgetScore) +
                        (0.2 * resourceScore) +
                        (0.1 * qualityScore);

        return round(healthScore);
    }

    public String getProjectHealthStatus(Project project) {
        double score = calculateProjectHealthScore(project);

        if (score >= 80) {
            return "Healthy";
        } else if (score >= 50) {
            return "Warning";
        } else {
            return "Critical";
        }
    }

    public String getMitigationRecommendation(Project project) {
        double budgetUsed = calculateBudgetUsedPercent(project);
        String timelineStatus = getTimelineStatus(project);
        String resourceStatus = getResourceStatus(project);
        String scopeStatus = getScopeStatus(project);
        double qualityScore = 70.0;

        return recommendationEngineService.generateProjectRecommendation(
                project,
                budgetUsed,
                timelineStatus,
                resourceStatus,
                scopeStatus,
                qualityScore
        );
    }

    private double getTimelineNumericScore(Project project) {
        String status = getTimelineStatus(project);
        if ("On Time".equals(status)) return 90;
        if ("Warning".equals(status)) return 65;
        return 35;
    }

    private double getBudgetNumericScore(Project project) {
        String status = getBudgetStatus(project);
        if ("On Budget".equals(status)) return 90;
        if ("At Risk".equals(status)) return 65;
        return 35;
    }

    private double getResourceNumericScore(Project project) {
        String status = getResourceStatus(project);
        if ("Optimal".equals(status)) return 90;
        if ("Underutilized".equals(status)) return 60;
        return 40;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}