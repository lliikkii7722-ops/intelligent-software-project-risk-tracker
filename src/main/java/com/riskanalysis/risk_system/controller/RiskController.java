package com.riskanalysis.risk_system.controller;

import com.riskanalysis.risk_system.model.Risk;
import com.riskanalysis.risk_system.repository.ProjectRepository;
import com.riskanalysis.risk_system.repository.UserRepository;
import com.riskanalysis.risk_system.service.RiskService;
import com.riskanalysis.risk_system.service.AuditLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/risks")
@CrossOrigin(origins = "http://localhost:3000")
public class RiskController {

    private final RiskService riskService;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public RiskController(RiskService riskService,
                          ProjectRepository projectRepository,
                          UserRepository userRepository,
                          AuditLogService auditLogService) {
        this.riskService = riskService;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public Risk createRisk(@RequestBody Risk risk) {

        if (risk.getProject() != null && risk.getProject().getId() != null) {
            risk.setProject(projectRepository.findById(risk.getProject().getId()).orElse(null));
        }

        if (risk.getUser() != null && risk.getUser().getId() != null) {
            risk.setUser(userRepository.findById(risk.getUser().getId()).orElse(null));
        }

        Risk saved = riskService.saveRisk(risk);

        auditLogService.log(
                "CREATE_RISK",
                "MANAGER",
                "Created risk: " + saved.getTitle()
        );

        return saved;
    }

    @GetMapping
    public List<Risk> getAllRisks() {
        return riskService.getAllRisks();
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<Map<String, Object>> getRiskAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(riskService.getRiskAnalytics(id));
    }

    @PutMapping("/{id}")
    public Risk updateRisk(@PathVariable Long id, @RequestBody Risk riskDetails) {

        if (riskDetails.getProject() != null && riskDetails.getProject().getId() != null) {
            riskDetails.setProject(projectRepository.findById(riskDetails.getProject().getId()).orElse(null));
        }

        if (riskDetails.getUser() != null && riskDetails.getUser().getId() != null) {
            riskDetails.setUser(userRepository.findById(riskDetails.getUser().getId()).orElse(null));
        }

        Risk updated = riskService.updateRisk(id, riskDetails);

        auditLogService.log(
                "UPDATE_RISK",
                "MANAGER",
                "Updated risk: " + updated.getTitle()
        );

        return updated;
    }

    @DeleteMapping("/{id}")
    public String deleteRisk(@PathVariable Long id) {

        riskService.deleteRisk(id);

        auditLogService.log(
                "DELETE_RISK",
                "ADMIN",
                "Deleted risk ID: " + id
        );

        return "Risk deleted successfully";
    }

    @GetMapping("/level/{riskLevel}")
    public List<Risk> getRisksByLevel(@PathVariable String riskLevel) {
        return riskService.getRisksByLevel(riskLevel);
    }

    @GetMapping("/counts")
    public Map<String, Long> getRiskCounts() {
        return riskService.getRiskCounts();
    }
}