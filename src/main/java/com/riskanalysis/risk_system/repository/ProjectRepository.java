package com.riskanalysis.risk_system.repository;

import com.riskanalysis.risk_system.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}