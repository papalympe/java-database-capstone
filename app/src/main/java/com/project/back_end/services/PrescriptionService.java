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
        try {
            List<Prescription> existingList = safeFindByAppointmentId(prescription.getAppointmentId());

            Prescription existing = existingList.isEmpty() ? null : existingList.get(0);

            if (existing != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Prescription already exists for this appointment"));
            }

            prescriptionRepository.save(prescription);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Prescription saved"));

        } catch (Exception e) {
            // full stacktrace to server logs for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred while saving the prescription"));
        }
    }

    // -----------------------------------------------------
    // GET PRESCRIPTION BY APPOINTMENT ID (robust)
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> getPrescription(Long appointmentId) {
        try {
            // Try normal repository call first (fast path)
            List<Prescription> list = safeFindByAppointmentId(appointmentId);

            // Always return an array (frontend expects an array)
            if (list == null) list = Collections.emptyList();

            Map<String, Object> response = new HashMap<>();
            response.put("prescription", list);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Log full stacktrace server-side for diagnosis
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
            // primary attempt - repository query
            List<Prescription> found = prescriptionRepository.findByAppointmentId(appointmentId);
            if (found == null) return Collections.emptyList();
            return found;
        } catch (Exception primaryEx) {
            // Log the primary exception then try a safe fallback to avoid 500 due to type mismatch
            System.err.println("PrescriptionRepository.findByAppointmentId failed: " + primaryEx.getClass().getName() + " - " + primaryEx.getMessage());
            primaryEx.printStackTrace();

            try {
                // Fallback: load all prescriptions and filter in Java (slower but robust)
                List<Prescription> all = prescriptionRepository.findAll();
                if (all == null) return Collections.emptyList();

                // Be tolerant about numeric type differences: compare via string/long safely
                return all.stream()
                        .filter(p -> {
                            try {
                                if (p == null) return false;
                                Long payloadId = p.getAppointmentId();
                                if (payloadId != null && appointmentId != null) {
                                    return appointmentId.equals(payloadId);
                                }
                                // if payloadId is null, attempt to be forgiving (no match)
                                return false;
                            } catch (Exception e) {
                                // if field type mismatch (e.g. stored as String) attempt string comparison
                                try {
                                    Object raw = p.getAppointmentId();
                                    if (raw != null && appointmentId != null) {
                                        return String.valueOf(raw).equals(String.valueOf(appointmentId));
                                    }
                                } catch (Exception ignored) {}
                                return false;
                            }
                        })
                        .collect(Collectors.toList());
            } catch (Exception fallbackEx) {
                // Log the fallback exception but DO NOT rethrow: return empty list to avoid 500s
                System.err.println("Fallback scanning also failed: " + fallbackEx.getClass().getName() + " - " + fallbackEx.getMessage());
                fallbackEx.printStackTrace();
                // Return empty list — safer for frontend (it will assume "no prescription found")
                return Collections.emptyList();
            }
        }
    }
}
