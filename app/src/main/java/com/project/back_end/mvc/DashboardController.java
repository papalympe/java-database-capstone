package com.project.back_end.mvc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import com.project.back_end.services.ServiceManager;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Controller
public class DashboardController {

    @Autowired
    private ServiceManager serviceManager;

    /**
     * Admin Dashboard
     * Validates token, then redirects to the static admin page under /pages/
     */
    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable("token") String token) {
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "admin");

        if (tokenValidation.getStatusCode().is2xxSuccessful()) {
            // Redirect to the static page served from src/main/resources/static/pages/adminDashboard.html
            return "redirect:/pages/adminDashboard.html";
        } else {
            return "redirect:/";
        }
    }

    /**
     * Doctor Dashboard
     * Validates token, then redirects to the static doctor page under /pages/
     */
    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable("token") String token) {
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "doctor");

        if (tokenValidation.getStatusCode().is2xxSuccessful()) {
            return "redirect:/pages/doctorDashboard.html";
        } else {
            return "redirect:/";
        }
    }
}
