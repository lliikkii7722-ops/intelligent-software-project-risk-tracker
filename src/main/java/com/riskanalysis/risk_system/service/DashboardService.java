package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.dto.DashboardDTO;
import com.riskanalysis.risk_system.model.Mitigation;
import com.riskanalysis.risk_system.model.Risk;
import com.riskanalysis.risk_system.repository.MitigationRepository;
import com.riskanalysis.risk_system.repository.RiskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final RiskRepository riskRepository;
    private final MitigationRepository mitigationRepository;

    public DashboardService(RiskRepository riskRepository, MitigationRepository mitigationRepository) {
        this.riskRepository = riskRepository;
        this.mitigationRepository = mitigationRepository;
    }

    public DashboardDTO getDashboardStats() {
        DashboardDTO dto = new DashboardDTO();

        List<Risk> risks = riskRepository.findAll();
        List<Mitigation> mitigations = mitigationRepository.findAll();

        dto.setTotalRisks((long) risks.size());
        dto.setHighRisks(risks.stream().filter(r -> "High".equalsIgnoreCase(r.getRiskLevel())).count());
        dto.setMediumRisks(risks.stream().filter(r -> "Medium".equalsIgnoreCase(r.getRiskLevel())).count());
        dto.setLowRisks(risks.stream().filter(r -> "Low".equalsIgnoreCase(r.getRiskLevel())).count());

        dto.setCompletedMitigations(mitigations.stream().filter(m -> "Completed".equalsIgnoreCase(m.getStatus())).count());
        dto.setInProgressMitigations(mitigations.stream().filter(m -> "In Progress".equalsIgnoreCase(m.getStatus())).count());
        dto.setPendingMitigations(mitigations.stream().filter(m -> "Pending".equalsIgnoreCase(m.getStatus())).count());

        return dto;
    }
}