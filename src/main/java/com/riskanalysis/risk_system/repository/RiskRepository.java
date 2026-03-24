package com.riskanalysis.risk_system.repository;

import com.riskanalysis.risk_system.model.Project;
import com.riskanalysis.risk_system.model.Risk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskRepository extends JpaRepository<Risk, Long> {
    void deleteByProject(Project project);
    List<Risk> findByRiskLevelIgnoreCase(String riskLevel);
}