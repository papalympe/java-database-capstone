package com.project.back_end.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestParam;
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

    /**
     * New: filter using query parameters to avoid path-variable issues when values are empty.
     * Example requests:
     *  GET /patient/filter?token=...                          -> all appointments
     *  GET /patient/filter?condition=future&token=...        -> upcoming
     *  GET /patient/filter?name=john&token=...               -> search by doctor name
     *  GET /patient/filter?condition=past&name=john&token=...-> combined
     */
    @GetMapping("/filter")
    public ResponseEntity<Map<String, Object>> filterPatientAppointment(
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String name,
            @RequestParam String token) {

        // Validate token first
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        // Delegate to service manager (it expects the token)
        return serviceManager.filterPatient(condition, name, token);
    }

/**
 * GET appointments for patient (doctor view).
 * URL: /patient/doctor/{id}/{token}
 * Validates the token as doctor; if valid, returns patient's appointments.
 */
@GetMapping("/doctor/{id}/{token}")
public ResponseEntity<Map<String, Object>> getPatientAppointmentForDoctor(
        @PathVariable Long id,
        @PathVariable String token) {

    // validate token as doctor
    ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "doctor");
    if (tokenValidation.getStatusCode().is4xxClientError()) {
        return ResponseEntity.status(tokenValidation.getStatusCode())
                .body(Map.of("error", "Unauthorized or invalid token"));
    }

    // controller validated caller is a doctor; return appointments for patient id
    return patientService.getPatientAppointmentsForDoctor(id);
}
    

    
}
