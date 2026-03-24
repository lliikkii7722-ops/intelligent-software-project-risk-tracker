package com.riskanalysis.risk_system.controller;

import com.riskanalysis.risk_system.model.AuditLog;
import com.riskanalysis.risk_system.service.AuditLogService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:3000")
public class AuditLogController {

    private final AuditLogService service;
    private final JdbcTemplate jdbcTemplate;

    public AuditLogController(AuditLogService service, JdbcTemplate jdbcTemplate) {
        this.service = service;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<AuditLog> getLogs() {
        List<AuditLog> logs = service.getAllLogs();
        System.out.println("AUDIT LOG COUNT = " + logs.size());
        return logs;
    }

    @GetMapping("/test")
    public String createTestLog() {
        service.log("TEST_AUDIT", "ADMIN", "Manual test from API");
        return "Test log inserted";
    }

    @GetMapping("/debug")
    public Map<String, Object> debugAudit() {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM audit_log",
                Integer.class
        );

        return Map.of(
                "jdbcCount", count == null ? 0 : count,
                "jpaCount", service.getAllLogs().size()
        );
    }
}