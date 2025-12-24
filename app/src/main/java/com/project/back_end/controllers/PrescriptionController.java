package com.project.back_end.controllers;

import com.project.back_end.models.Prescription;
import com.project.back_end.models.AppointmentStatus;
import com.project.back_end.services.AppointmentService;
import com.project.back_end.services.PrescriptionService;
import com.project.back_end.services.ServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("${api.path}prescription")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final ServiceManager serviceManager;
    private final AppointmentService appointmentService;

    public PrescriptionController(PrescriptionService prescriptionService,
                                  ServiceManager serviceManager,
                                  AppointmentService appointmentService) {
        this.prescriptionService = prescriptionService;
        this.serviceManager = serviceManager;
        this.appointmentService = appointmentService;
    }

    /* =======================
       SAVE PRESCRIPTION
       ======================= */
    @PostMapping("/{token:.+}")
    public ResponseEntity<Map<String, String>> savePrescription(
            @RequestBody Prescription prescription,
            @PathVariable("token") String token) {

        ResponseEntity<Map<String, String>> tokenValidation =
                serviceManager.validateToken(token, "doctor");

        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        appointmentService.updateAppointmentStatus(
                prescription.getAppointmentId(),
                AppointmentStatus.PRESCRIPTION_ADDED
        );

        return prescriptionService.savePrescription(prescription);
    }

    /* =======================
       GET PRESCRIPTION
       ======================= */
    @GetMapping("/{appointmentId}/{token:.+}")
    public ResponseEntity<Map<String, Object>> getPrescription(
            @PathVariable Long appointmentId,
            @PathVariable("token") String token) {

        ResponseEntity<Map<String, String>> tokenValidation =
                serviceManager.validateToken(token, "doctor");

        if (tokenValidation.getStatusCode().is4xxClientError()) {
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        return prescriptionService.getPrescription(appointmentId);
    }
}
