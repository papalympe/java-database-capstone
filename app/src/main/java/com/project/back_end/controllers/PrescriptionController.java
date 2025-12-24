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
       SAVE PRESCRIPTION (improved logging + safer flow)
       ======================= */
    @PostMapping("/{token:.+}")
    public ResponseEntity<Map<String, String>> savePrescription(
            @RequestBody Prescription prescription,
            @PathVariable("token") String token) {

        System.out.println("SAVE PRESCRIPTION called. token=" + token + " payload=" + prescription);

        ResponseEntity<Map<String, String>> tokenValidation =
                serviceManager.validateToken(token, "doctor");

        if (tokenValidation.getStatusCode().is4xxClientError()) {
            System.out.println("Token validation failed when saving prescription: " + tokenValidation.getBody());
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        // First attempt to save the prescription
        ResponseEntity<Map<String, String>> saveResp = prescriptionService.savePrescription(prescription);

        if (!saveResp.getStatusCode().is2xxSuccessful()) {
            // return underlying message so frontend sees concrete reason
            System.err.println("Failed to save prescription: " + saveResp.getBody());
            return ResponseEntity.status(saveResp.getStatusCode()).body(saveResp.getBody());
        }

        // After saving, try to update appointment status. If update fails, log and return a 500 with message.
        try {
            appointmentService.updateAppointmentStatus(
                    prescription.getAppointmentId(),
                    AppointmentStatus.PRESCRIPTION_ADDED
            );
        } catch (Exception e) {
            // Log full error but return informative message
            System.err.println("Failed to update appointment status for appointmentId=" + prescription.getAppointmentId());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Prescription saved but failed to update appointment status: " + e.getMessage()));
        }

        // All good
        return ResponseEntity.status(201).body(Map.of("message", "Prescription saved and appointment updated"));
    }

    /* =======================
       GET PRESCRIPTION
       ======================= */
    @GetMapping("/{appointmentId}/{token:.+}")
    public ResponseEntity<Map<String, Object>> getPrescription(
            @PathVariable Long appointmentId,
            @PathVariable("token") String token) {

        System.out.println("GET PRESCRIPTION called. appointmentId=" + appointmentId + " token=" + token);

        ResponseEntity<Map<String, String>> tokenValidation =
                serviceManager.validateToken(token, "doctor");

        if (tokenValidation.getStatusCode().is4xxClientError()) {
            System.out.println("Token validation failed when getting prescription: " + tokenValidation.getBody());
            return ResponseEntity.status(tokenValidation.getStatusCode())
                    .body(Map.of("error", "Unauthorized or invalid token"));
        }

        return prescriptionService.getPrescription(appointmentId);
    }
}
