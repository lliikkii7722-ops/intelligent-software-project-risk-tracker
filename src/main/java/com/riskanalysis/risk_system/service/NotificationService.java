package com.riskanalysis.risk_system.service;

import com.riskanalysis.risk_system.model.Notification;
import com.riskanalysis.risk_system.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // SAVE NOTIFICATION
    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    // GET ALL NOTIFICATIONS
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // GET ONLY UNREAD NOTIFICATIONS
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByStatus("UNREAD");
    }

    // MARK NOTIFICATION AS READ
    public Notification markAsRead(Long id) {
        Optional<Notification> optional = notificationRepository.findById(id);
        if (optional.isPresent()) {
            Notification notification = optional.get();
            notification.setStatus("READ");
            return notificationRepository.save(notification);
        }
        return null;
    }

    // DELETE NOTIFICATION
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}