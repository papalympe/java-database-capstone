// src/main/java/com/project/back_end/controllers/DoctorController.java
package com.project.back_end.controllers;

import com.project.back_end.models.Doctor;
import com.project.back_end.DTO.Login;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.ServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${api.path}doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final ServiceManager serviceManager;

    public DoctorController(DoctorService doctorService, ServiceManager serviceManager) {
        this.doctorService = doctorService;
        this.serviceManager = serviceManager;
    }

    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String, Object>> getDoctorAvailability(
            @PathVariable String user,
            @PathVariable Long doctorId,
            @PathVariable String date,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, user);
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        List<String> availability = doctorService.getDoctorAvailability(doctorId, LocalDate.parse(date));
        return ResponseEntity.ok(Map.of("availability", availability));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDoctor() {
        List<Doctor> doctors = doctorService.getDoctors();
        return ResponseEntity.ok(Map.of("doctors", doctors));
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> saveDoctor(
            @RequestBody Doctor doctor,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "admin");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        int result = doctorService.saveDoctor(doctor);
        if (result == 1) {
            return ResponseEntity.status(201).body(Map.of("message", "Doctor added to db"));
        } else if (result == -1) {
            return ResponseEntity.status(409).body(Map.of("error", "Doctor already exists"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Some internal error occurred"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody Login login) {
        return doctorService.validateDoctor(login);
    }

    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(
            @RequestBody Doctor doctor,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "admin");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        int result = doctorService.updateDoctor(doctor);
        if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor updated"));
        } else if (result == -1) {
            return ResponseEntity.status(404).body(Map.of("error", "Doctor not found"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Some internal error occurred"));
        }
    }

    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> deleteDoctor(
            @PathVariable Long id,
            @PathVariable String token) {

        ResponseEntity<Map<String, String>> tokenValidation = serviceManager.validateToken(token, "admin");
        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        int result = doctorService.deleteDoctor(id);
        if (result == 1) {
            return ResponseEntity.ok(Map.of("message", "Doctor deleted successfully"));
        } else if (result == -1) {
            return ResponseEntity.status(404).body(Map.of("error", "Doctor not found with id"));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Some internal error occurred"));
        }
    }

  @GetMapping("/filter")
    public ResponseEntity<Map<String, Object>> filter(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String time,
            @RequestParam(name = "speciality", required = false) String speciality) {

        // Normalize empty strings to null to let serviceManager do default behavior
        if (name != null && name.trim().isEmpty()) name = null;
        if (time != null && time.trim().isEmpty()) time = null;
        if (speciality != null && speciality.trim().isEmpty()) speciality = null;

        Map<String, Object> filteredDoctors = serviceManager.filterDoctor(name, speciality, time);
        return ResponseEntity.ok(filteredDoctors);
    }  

    
}
