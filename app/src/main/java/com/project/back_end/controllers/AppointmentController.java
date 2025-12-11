package com.project.back_end.controllers;

import com.project.back_end.models.Appointment;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final Service service;

    // Constructor Injection
    public AppointmentController(AppointmentService appointmentService, Service service) {
        this.appointmentService = appointmentService;
        this.service = service;
    }

    /**
     * Get Appointments for a doctor on a specific date, optionally filtered by patient name
     */
    @GetMapping("/{date}/{patientName}/{token}")
    public ResponseEntity<Map<String, Object>> getAppointments(
            @PathVariable String patientName,
            @PathVariable String date,
            @PathVariable String token) {

        // Validate token for doctor role
        ResponseEntity<Map<String, String>> tokenValidation = service.validateToken(token, "doctor");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        LocalDate appointmentDate = LocalDate.parse(date);
        Map<String, Object> appointments = appointmentService.getAppointment(patientName, appointmentDate, token);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Book a new appointment
     */
    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> bookAppointment(
            @RequestBody Appointment appointment,
            @PathVariable String token) {

        // Validate token for patient role
        ResponseEntity<Map<String, String>> tokenValidation = service.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        int validation = service.validateAppointment(appointment);
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

    /**
     * Update an existing appointment
     */
    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateAppointment(
            @RequestBody Appointment appointment,
            @PathVariable String token) {

        // Validate token for patient role
        ResponseEntity<Map<String, String>> tokenValidation = service.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        return appointmentService.updateAppointment(appointment);
    }

    /**
     * Cancel an appointment
     */
    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long id,
            @PathVariable String token) {

        // Validate token for patient role
        ResponseEntity<Map<String, String>> tokenValidation = service.validateToken(token, "patient");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode()).body(Map.of("error", "Unauthorized or invalid token"));
        }

        return appointmentService.cancelAppointment(id, token);
    }
}

