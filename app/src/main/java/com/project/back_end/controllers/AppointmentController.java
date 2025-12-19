// src/main/java/com/project/back_end/controllers/AppointmentController.java
package com.project.back_end.controllers;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.ServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final ServiceManager serviceManager;

    public AppointmentController(AppointmentService appointmentService, ServiceManager serviceManager) {
        this.appointmentService = appointmentService;
        this.serviceManager = serviceManager;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAppointments(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String patientName,
            @RequestParam String token) {

        // validate token for doctor
        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "doctor");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        // default date => today when missing
        if (date == null || date.trim().isEmpty()) {
            date = java.time.LocalDate.now().toString();
        }

        LocalDate appointmentDate;
        try {
            appointmentDate = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Expected yyyy-MM-dd"));
        }

        Map<String, Object> appointments = appointmentService.getAppointment(
                patientName == null ? "" : patientName,
                appointmentDate,
                token
        );

        if (appointments == null) {
            // defensive: ensure we return an empty structure rather than null
            return ResponseEntity.ok(Map.of("appointments", List.of()));
        }
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @RequestBody Appointment appointment,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        int validation = serviceManager.validateAppointment(appointment);
        if (validation == -1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Doctor does not exist"));
        } else if (validation == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Appointment slot is unavailable"));
        }

        int result = appointmentService.bookAppointment(appointment);
        if (result == 1) {
            return ResponseEntity.status(201).body(Map.of("message", "Appointment booked successfully"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to book appointment"));
        }
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @RequestBody Appointment appointment,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        return appointmentService.updateAppointment(appointment);
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long id,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        return appointmentService.cancelAppointment(id, token);
    }
}
