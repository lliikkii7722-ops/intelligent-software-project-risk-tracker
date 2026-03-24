package com.riskanalysis.risk_system.dto;

public class DashboardDTO {

    private Long totalRisks;
    private Long highRisks;
    private Long mediumRisks;
    private Long lowRisks;
    private Long completedMitigations;
    private Long pendingMitigations;
    private Long inProgressMitigations;

    // Getters and Setters
    public Long getTotalRisks() { return totalRisks; }
    public void setTotalRisks(Long totalRisks) { this.totalRisks = totalRisks; }

    public Long getHighRisks() { return highRisks; }
    public void setHighRisks(Long highRisks) { this.highRisks = highRisks; }

    public Long getMediumRisks() { return mediumRisks; }
    public void setMediumRisks(Long mediumRisks) { this.mediumRisks = mediumRisks; }

    public Long getLowRisks() { return lowRisks; }
    public void setLowRisks(Long lowRisks) { this.lowRisks = lowRisks; }

    public Long getCompletedMitigations() { return completedMitigations; }
    public void setCompletedMitigations(Long completedMitigations) { this.completedMitigations = completedMitigations; }

    public Long getPendingMitigations() { return pendingMitigations; }
    public void setPendingMitigations(Long pendingMitigations) { this.pendingMitigations = pendingMitigations; }

    public Long getInProgressMitigations() { return inProgressMitigations; }
    public void setInProgressMitigations(Long inProgressMitigations) { this.inProgressMitigations = inProgressMitigations; }
}