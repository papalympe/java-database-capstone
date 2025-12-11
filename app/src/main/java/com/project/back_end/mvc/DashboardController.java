package com.project.back_end.mvc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@Controller
public class DashboardController {

    // Autowire the shared service for token validation
    @Autowired
    private Service service; // Αντικατάστησε με το πραγματικό όνομα της service class σου

    /**
     * Admin Dashboard
     * Handles GET requests to /adminDashboard/{token}
     */
    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable("token") String token) {
        // Validate token for admin role
        Map<String, Object> validationResult = service.validateToken(token, "admin");

        // If the map is empty, the token is valid
        if (validationResult.isEmpty()) {
            return "admin/adminDashboard"; // Thymeleaf template
        } else {
            return "redirect:/"; // Redirect to login or home page
        }
    }

    /**
     * Doctor Dashboard
     * Handles GET requests to /doctorDashboard/{token}
     */
    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable("token") String token) {
        // Validate token for doctor role
        Map<String, Object> validationResult = service.validateToken(token, "doctor");

        // If the map is empty, the token is valid
        if (validationResult.isEmpty()) {
            return "doctor/doctorDashboard"; // Thymeleaf template
        } else {
            return "redirect:/"; // Redirect to login or home page
        }
    }
}
