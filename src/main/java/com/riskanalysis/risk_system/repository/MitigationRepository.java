package com.riskanalysis.risk_system.repository;

import com.riskanalysis.risk_system.model.Mitigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MitigationRepository extends JpaRepository<Mitigation, Long> {
    List<Mitigation> findByRiskId(Long riskId);
}