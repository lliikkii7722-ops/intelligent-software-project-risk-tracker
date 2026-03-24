package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.model.Notification;
import com.riskanalysis.risk_system.model.Project;
import com.riskanalysis.risk_system.model.Risk;
import com.riskanalysis.risk_system.model.User;
import com.riskanalysis.risk_system.repository.ProjectRepository;
import com.riskanalysis.risk_system.repository.RiskRepository;
import com.riskanalysis.risk_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RiskService {

    private final RiskRepository riskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;
    private final RecommendationEngineService recommendationEngineService;

    public RiskService(RiskRepository riskRepository,
                       UserRepository userRepository,
                       ProjectRepository projectRepository,
                       NotificationService notificationService,
                       RecommendationEngineService recommendationEngineService) {
        this.riskRepository = riskRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.notificationService = notificationService;
        this.recommendationEngineService = recommendationEngineService;
    }

    public Risk saveRisk(Risk risk) {
        applyDefaultQualityValues(risk);

        if (risk.getUser() != null && risk.getUser().getId() != null) {
            Long userId = risk.getUser().getId();
            User user = userRepository.findById(userId).orElse(null);
            risk.setUser(user);
        }

        if (risk.getProject() != null && risk.getProject().getId() != null) {
            Long projectId = risk.getProject().getId();
            Project project = projectRepository.findById(projectId).orElse(null);
            risk.setProject(project);
        }

        Risk savedRisk = riskRepository.save(risk);

        // 🔔 Risk Alerts
        if ("High".equalsIgnoreCase(savedRisk.getRiskLevel())) {
            Notification notification = new Notification();
            notification.setMessage("High Risk Detected: " + savedRisk.getTitle());
            notification.setStatus("UNREAD");
            notificationService.saveNotification(notification);
        }

        if ("High".equalsIgnoreCase(savedRisk.getQualityRiskLevel())) {
            Notification notification = new Notification();
            notification.setMessage("Quality Risk High: " + savedRisk.getTitle());
            notification.setStatus("UNREAD");
            notificationService.saveNotification(notification);
        }

        return savedRisk;
    }

    public List<Risk> getAllRisks() {
        return riskRepository.findAll();
    }

    public Risk getRiskById(Long id) {
        Optional<Risk> risk = riskRepository.findById(id);
        return risk.orElse(null);
    }

    public Risk updateRisk(Long id, Risk riskDetails) {
        Optional<Risk> optionalRisk = riskRepository.findById(id);

        if (optionalRisk.isPresent()) {
            Risk risk = optionalRisk.get();

            risk.setTitle(riskDetails.getTitle());
            risk.setDescription(riskDetails.getDescription());
            risk.setSeverity(riskDetails.getSeverity());
            risk.setProbability(riskDetails.getProbability());
            risk.setImpact(riskDetails.getImpact());

            // Quality fields
            risk.setDefectCount(riskDetails.getDefectCount());
            risk.setTestingCoverage(riskDetails.getTestingCoverage());
            risk.setReworkEffort(riskDetails.getReworkEffort());

            if (riskDetails.getUser() != null && riskDetails.getUser().getId() != null) {
                User user = userRepository.findById(riskDetails.getUser().getId()).orElse(null);
                risk.setUser(user);
            }

            if (riskDetails.getProject() != null && riskDetails.getProject().getId() != null) {
                Project project = projectRepository.findById(riskDetails.getProject().getId()).orElse(null);
                risk.setProject(project);
            }

            applyDefaultQualityValues(risk);

            Risk updatedRisk = riskRepository.save(risk);

            if ("High".equalsIgnoreCase(updatedRisk.getRiskLevel())) {
                Notification notification = new Notification();
                notification.setMessage("High Risk Updated: " + updatedRisk.getTitle());
                notification.setStatus("UNREAD");
                notificationService.saveNotification(notification);
            }

            if ("High".equalsIgnoreCase(updatedRisk.getQualityRiskLevel())) {
                Notification notification = new Notification();
                notification.setMessage("Quality Risk High: " + updatedRisk.getTitle());
                notification.setStatus("UNREAD");
                notificationService.saveNotification(notification);
            }

            return updatedRisk;
        }

        return null;
    }

    public void deleteRisk(Long id) {
        riskRepository.deleteById(id);
    }

    public List<Risk> getRisksByLevel(String riskLevel) {
        return riskRepository.findByRiskLevelIgnoreCase(riskLevel);
    }

    public List<Risk> getRisks(String level) {
        if (level != null && !level.isEmpty()) {
            return getRisksByLevel(level);
        }
        return getAllRisks();
    }

    public Map<String, Long> getRiskCounts() {
        List<Risk> allRisks = getAllRisks();
        Map<String, Long> counts = new HashMap<>();

        counts.put("Low", allRisks.stream().filter(r -> "Low".equalsIgnoreCase(r.getRiskLevel())).count());
        counts.put("Medium", allRisks.stream().filter(r -> "Medium".equalsIgnoreCase(r.getRiskLevel())).count());
        counts.put("High", allRisks.stream().filter(r -> "High".equalsIgnoreCase(r.getRiskLevel())).count());

        return counts;
    }

    // ================= ANALYTICS =================

    public Map<String, Object> getRiskAnalytics(Long id) {
        Risk risk = getRiskById(id);
        if (risk == null) {
            throw new RuntimeException("Risk not found");
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("riskId", risk.getId());
        analytics.put("title", risk.getTitle());
        analytics.put("score", risk.getScore());
        analytics.put("riskLevel", risk.getRiskLevel());
        analytics.put("qualityScore", risk.getQualityScore());
        analytics.put("qualityRiskLevel", risk.getQualityRiskLevel());
        analytics.put("recommendation", getQualityRecommendation(risk));

        return analytics;
    }

    // ================= ENGINE INTEGRATION =================

    public String getQualityRecommendation(Risk risk) {

        int defects = risk.getDefectCount() == null ? 0 : risk.getDefectCount();
        double coverage = risk.getTestingCoverage() == null ? 0.0 : risk.getTestingCoverage();
        String level = risk.getQualityRiskLevel();

        String recommendation = recommendationEngineService.getQualityRecommendation(
                defects,
                coverage,
                level
        );

        if (recommendation == null || recommendation.isBlank()) {
            return "Quality is stable. Continue regular quality checks.";
        }

        return recommendation;
    }

    // ================= DEFAULT VALUES =================

    private void applyDefaultQualityValues(Risk risk) {
        if (risk.getDefectCount() == null) {
            risk.setDefectCount(0);
        }
        if (risk.getTestingCoverage() == null) {
            risk.setTestingCoverage(0.0);
        }
        if (risk.getReworkEffort() == null) {
            risk.setReworkEffort(0.0);
        }
    }
}