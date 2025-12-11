package com.project.back_end.services;

import com.project.back_end.models.Prescription;
import com.project.back_end.repo.PrescriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

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

        try {
           // Βρίσκουμε όλες τις συνταγές για την ίδια appointment
            List<Prescription> existingList = prescriptionRepository.findByAppointmentId(prescription.getAppointmentId());

            Prescription existing = existingList.isEmpty() ? null : existingList.get(0);

            if (existing != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Prescription already exists for this appointment"));
            }

            prescriptionRepository.save(prescription);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Prescription saved"));

        } catch (Exception e) {
            System.out.println("Error saving prescription: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while saving the prescription"));
        }
    }

    // -----------------------------------------------------
    // GET PRESCRIPTION BY APPOINTMENT ID
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> getPrescription(Long appointmentId) {

        try {
            List<Prescription> list = prescriptionRepository.findByAppointmentId(appointmentId);
            Prescription prescription = list.isEmpty() ? null : list.get(0);;

            if (prescription == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "No prescription found for this appointment"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("prescription", prescription);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("Error retrieving prescription: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while retrieving the prescription"));
        }
    }
}
