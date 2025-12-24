package com.project.back_end.services;

import com.project.back_end.models.Prescription;
import com.project.back_end.repo.PrescriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    // -----------------------------------------------------
    // SAVE PRESCRIPTION
    // -----------------------------------------------------
    public ResponseEntity<Map<String, String>> savePrescription(Prescription prescription) {
        // Basic payload validation (protects from Jackson/validation surprises)
        if (prescription == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Empty payload"));
        }
        if (prescription.getAppointmentId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "appointmentId is required"));
        }
        if (prescription.getPatientName() == null || prescription.getPatientName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "patientName is required"));
        }
        if (prescription.getMedication() == null || prescription.getMedication().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "medication is required"));
        }
        if (prescription.getDosage() == null || prescription.getDosage().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "dosage is required"));
        }

        System.out.println("PrescriptionService.savePrescription called. appointmentId="
                + prescription.getAppointmentId() + " patient=" + prescription.getPatientName());

        try {
            List<Prescription> existingList = safeFindByAppointmentId(prescription.getAppointmentId());
            Prescription existing = existingList.isEmpty() ? null : existingList.get(0);

            if (existing != null) {
                System.out.println("Prescription already exists for appointmentId=" + prescription.getAppointmentId());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Prescription already exists for this appointment"));
            }

            // Save (may throw)
            Prescription saved = prescriptionRepository.save(prescription);
            System.out.println("Prescription saved with id=" + (saved != null ? saved.getId() : "null"));

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Prescription saved"));

        } catch (Exception e) {
            // full stacktrace to server logs for debugging
            System.err.println("Error saving prescription (exception): " + e.getClass().getName() + " : " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error while saving prescription: " + e.getMessage()));
        }
    }

    // -----------------------------------------------------
    // GET PRESCRIPTION BY APPOINTMENT ID (robust)
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> getPrescription(Long appointmentId) {
        try {
            List<Prescription> list = safeFindByAppointmentId(appointmentId);
            if (list == null) list = Collections.emptyList();

            Map<String, Object> response = new HashMap<>();
            response.put("prescription", list);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error retrieving prescription: " + e.getClass().getName() + " : " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while retrieving the prescription"));
        }
    }

    // -----------------------------------------------------
    // Helper: call repository safely, fallback to in-memory filter if something goes wrong
    // -----------------------------------------------------
    private List<Prescription> safeFindByAppointmentId(Long appointmentId) {
        try {
            List<Prescription> found = prescriptionRepository.findByAppointmentId(appointmentId);
            if (found == null) return Collections.emptyList();
            return found;
        } catch (Exception primaryEx) {
            System.err.println("PrescriptionRepository.findByAppointmentId failed: " + primaryEx.getClass().getName() + " : " + primaryEx.getMessage());
            primaryEx.printStackTrace();

            try {
                // Fallback: load all prescriptions and filter in Java (slower but robust)
                List<Prescription> all = prescriptionRepository.findAll();
                if (all == null) return Collections.emptyList();

                return all.stream()
                        .filter(p -> {
                            try {
                                return appointmentId != null && appointmentId.equals(p.getAppointmentId());
                            } catch (Exception e) {
                                return false;
                            }
                        })
                        .collect(Collectors.toList());
            } catch (Exception fallbackEx) {
                System.err.println("Fallback scanning also failed: " + fallbackEx.getClass().getName() + " : " + fallbackEx.getMessage());
                fallbackEx.printStackTrace();
                throw fallbackEx;
            }
        }
    }
}
