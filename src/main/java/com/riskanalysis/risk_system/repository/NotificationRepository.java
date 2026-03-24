package com.riskanalysis.risk_system.repository;

import com.riskanalysis.risk_system.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStatus(String status); // For unread filtering
}