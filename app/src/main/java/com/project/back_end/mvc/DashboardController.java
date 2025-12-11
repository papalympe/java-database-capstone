package com.project.back_end.mvc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import com.project.back_end.services.ServiceManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Controller
public class DashboardController {

    // Autowire the shared service for token validation
    @Autowired
    private ServiceManager serviceManager; 

    /**
     * Admin Dashboard
     * Handles GET requests to /adminDashboard/{token}
     */
    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable("token") String token) {
        // Validate token for admin role
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "admin");
        
        // If the map is empty, the token is valid
        if (tokenValidation.getStatusCode().is2xxSuccessful()) {
            return "admin/adminDashboard";
        } else {
            return "redirect:/";
        }
    }

    /**
     * Doctor Dashboard
     * Handles GET requests to /doctorDashboard/{token}
     */
    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable("token") String token) {
        // Validate token for doctor role
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "doctor");

        // If the map is empty, the token is valid
        if (tokenValidation.getStatusCode().is2xxSuccessful()) {
            return "doctor/doctorDashboard";
        } else {
            return "redirect:/";
        }
    }
}
