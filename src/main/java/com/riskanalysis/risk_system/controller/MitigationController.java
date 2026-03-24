package com.riskanalysis.risk_system.controller;

import com.riskanalysis.risk_system.model.Mitigation;
import com.riskanalysis.risk_system.service.AuditLogService;
import com.riskanalysis.risk_system.service.MitigationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mitigations")
@CrossOrigin(origins = "http://localhost:3000")
public class MitigationController {

    private final MitigationService mitigationService;
    private final AuditLogService auditLogService;

    public MitigationController(MitigationService mitigationService,
                                AuditLogService auditLogService) {
        this.mitigationService = mitigationService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<?> createMitigation(@RequestBody Mitigation mitigation) {
        try {
            Mitigation saved = mitigationService.saveMitigation(mitigation);

            auditLogService.log(
                    "CREATE_MITIGATION",
                    "SYSTEM",
                    "Created mitigation: " + saved.getDescription()
            );

            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Mitigation>> getAllMitigations() {
        return ResponseEntity.ok(mitigationService.getAllMitigations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMitigationById(@PathVariable Long id) {
        Mitigation mitigation = mitigationService.getMitigationById(id);
        if (mitigation == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Mitigation not found"));
        }
        return ResponseEntity.ok(mitigation);
    }

    @GetMapping("/risk/{riskId}")
    public ResponseEntity<List<Mitigation>> getMitigationsByRiskId(@PathVariable Long riskId) {
        return ResponseEntity.ok(mitigationService.getMitigationsByRiskId(riskId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMitigation(@PathVariable Long id,
                                              @RequestBody Mitigation mitigationDetails) {
        try {
            Mitigation updated = mitigationService.updateMitigation(id, mitigationDetails);

            auditLogService.log(
                    "UPDATE_MITIGATION",
                    "SYSTEM",
                    "Updated mitigation: " + updated.getDescription()
            );

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateMitigationStatus(@PathVariable Long id,
                                                    @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Mitigation updated = mitigationService.updateMitigationStatus(id, status);

            auditLogService.log(
                    "UPDATE_MITIGATION_STATUS",
                    "SYSTEM",
                    "Updated mitigation status to " + updated.getStatus() + " for mitigation ID: " + id
            );

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMitigation(@PathVariable Long id) {
        try {
            mitigationService.deleteMitigation(id);

            auditLogService.log(
                    "DELETE_MITIGATION",
                    "SYSTEM",
                    "Deleted mitigation with ID: " + id
            );

            return ResponseEntity.ok(Map.of("message", "Mitigation deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}