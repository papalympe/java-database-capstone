package com.project.back_end.controllers;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Patient;
import com.project.back_end.services.PatientService;
import com.project.back_end.services.ServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/patient")
public class PatientController {

    private final PatientService patientService;
    private final ServiceManager serviceManager;

    public PatientController(PatientService patientService, ServiceManager serviceManager) {
        this.patientService = patientService;
        this.serviceManager = serviceManager;
    }

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getPatient(@PathVariable String token) {
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }
        return patientService.getPatientDetails(token);
    }

    @PostMapping()
    public ResponseEntity<Map<String, String>> createPatient(@RequestBody Patient patient) {
        boolean isValid = serviceManager.validatePatient(patient);
        if (!isValid) {
            return ResponseEntity.status(409).body(Map.of("error", "Patient with email id or phone no already exist"));
        }

        int result = patientService.createPatient(patient);
        if (result == 1) {
            return ResponseEntity.status(201).body(Map.of("message", "Signup successful"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Internal server error"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Login login) {
        return serviceManager.validatePatientLogin(login);
    }

    @GetMapping("/{id}/{token}")
    public ResponseEntity<Map<String, Object>> getPatientAppointment(
            @PathVariable Long id,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        return patientService.getPatientAppointment(id, token);
    }

    @GetMapping("/filter/{condition}/{name}/{token}")
    public ResponseEntity<Map<String, Object>> filterPatientAppointment(
            @PathVariable String condition,
            @PathVariable String name,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        return serviceManager.filterPatient(condition, name, token);
    }
}
