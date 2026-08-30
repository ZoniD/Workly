package dk.ek.workly.controller;
import dk.ek.workly.dto.adminDTO.AdminDashboardResponse;
import dk.ek.workly.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    private final AdminDashboardService adminDashboardService;
    public AdminDashboardController(AdminDashboardService adminDashboardService){this.adminDashboardService=adminDashboardService;}
    @GetMapping public ResponseEntity<AdminDashboardResponse> getDashboard(){return ResponseEntity.ok(adminDashboardService.getDashboard());}
}
