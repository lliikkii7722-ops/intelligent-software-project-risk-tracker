package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.model.Mitigation;
import com.riskanalysis.risk_system.model.Risk;
import com.riskanalysis.risk_system.model.User;
import com.riskanalysis.risk_system.repository.MitigationRepository;
import com.riskanalysis.risk_system.repository.RiskRepository;
import com.riskanalysis.risk_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MitigationService {

    private final MitigationRepository mitigationRepository;
    private final RiskRepository riskRepository;
    private final UserRepository userRepository;

    public MitigationService(MitigationRepository mitigationRepository,
                             RiskRepository riskRepository,
                             UserRepository userRepository) {
        this.mitigationRepository = mitigationRepository;
        this.riskRepository = riskRepository;
        this.userRepository = userRepository;
    }

    public Mitigation saveMitigation(Mitigation mitigation) {
        validateMitigationInput(mitigation);

        Risk risk = riskRepository.findById(mitigation.getRisk().getId())
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + mitigation.getRisk().getId()));

        User user = userRepository.findById(mitigation.getAssignedTo().getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + mitigation.getAssignedTo().getId()));

        mitigation.setRisk(risk);
        mitigation.setAssignedTo(user);

        if (mitigation.getStatus() == null || mitigation.getStatus().trim().isEmpty()) {
            mitigation.setStatus("Pending");
        }

        return mitigationRepository.save(mitigation);
    }

    public List<Mitigation> getAllMitigations() {
        return mitigationRepository.findAll();
    }

    public List<Mitigation> getMitigationsByRiskId(Long riskId) {
        return mitigationRepository.findByRiskId(riskId);
    }

    public Mitigation getMitigationById(Long id) {
        return mitigationRepository.findById(id).orElse(null);
    }

    public Mitigation updateMitigation(Long id, Mitigation mitigationDetails) {
        Mitigation existingMitigation = mitigationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mitigation not found with id: " + id));

        validateMitigationInput(mitigationDetails);

        Risk risk = riskRepository.findById(mitigationDetails.getRisk().getId())
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + mitigationDetails.getRisk().getId()));

        User user = userRepository.findById(mitigationDetails.getAssignedTo().getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + mitigationDetails.getAssignedTo().getId()));

        existingMitigation.setDescription(mitigationDetails.getDescription());
        existingMitigation.setStatus(mitigationDetails.getStatus());
        existingMitigation.setDueDate(mitigationDetails.getDueDate());
        existingMitigation.setRisk(risk);
        existingMitigation.setAssignedTo(user);

        return mitigationRepository.save(existingMitigation);
    }

    public Mitigation updateMitigationStatus(Long id, String status) {
        Mitigation mitigation = mitigationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mitigation not found with id: " + id));

        if (status == null || status.trim().isEmpty()) {
            throw new RuntimeException("Status cannot be empty");
        }

        mitigation.setStatus(status);
        return mitigationRepository.save(mitigation);
    }

    public void deleteMitigation(Long id) {
        Mitigation mitigation = mitigationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mitigation not found with id: " + id));

        mitigationRepository.delete(mitigation);
    }

    private void validateMitigationInput(Mitigation mitigation) {
        if (mitigation == null) {
            throw new RuntimeException("Mitigation data is missing");
        }

        if (mitigation.getDescription() == null || mitigation.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Description is required");
        }

        if (mitigation.getRisk() == null || mitigation.getRisk().getId() == null) {
            throw new RuntimeException("Risk ID is required");
        }

        if (mitigation.getAssignedTo() == null || mitigation.getAssignedTo().getId() == null) {
            throw new RuntimeException("Assigned user ID is required");
        }
    }
}