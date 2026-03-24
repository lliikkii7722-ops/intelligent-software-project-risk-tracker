package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.model.AuditLog;
import com.riskanalysis.risk_system.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(String action, String user, String details) {
        repository.save(new AuditLog(action, user, details));
    }

    public List<AuditLog> getAllLogs() {
        return repository.findAllByOrderByIdDesc();
    }
}