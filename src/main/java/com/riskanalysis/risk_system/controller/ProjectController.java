package com.riskanalysis.risk_system.controller;

import com.riskanalysis.risk_system.model.Project;
import com.riskanalysis.risk_system.service.ProjectService;
import com.riskanalysis.risk_system.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    private final ProjectService projectService;
    private final AuditLogService auditLogService;

    public ProjectController(ProjectService projectService,
                             AuditLogService auditLogService){
        this.projectService = projectService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public Project createProject(@RequestBody Project project){
        Project saved = projectService.saveProject(project);

        auditLogService.log(
                "CREATE_PROJECT",
                "ADMIN",
                "Created project: " + saved.getName()
        );

        return saved;
    }

    @GetMapping
    public List<Project> getProjects(){
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<Map<String, Object>> getProjectAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectAnalytics(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project){
        Project updated = projectService.updateProject(id, project);

        auditLogService.log(
                "UPDATE_PROJECT",
                "ADMIN",
                "Updated project: " + updated.getName()
        );

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Project> updateProjectProgress(@PathVariable Long id, @RequestBody Project project){
        Project updated = projectService.updateProjectProgress(id, project);

        auditLogService.log(
                "UPDATE_PROGRESS",
                "USER",
                "Updated progress for project: " + updated.getName()
        );

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable Long id){
        projectService.deleteProject(id);

        auditLogService.log(
                "DELETE_PROJECT",
                "ADMIN",
                "Deleted project ID: " + id
        );
    }
}