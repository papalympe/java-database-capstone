package com.project.back_end.services;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;
import com.project.back_end.services.TokenService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          TokenService tokenService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    // -----------------------------------------------------
    // CREATE PATIENT
    // -----------------------------------------------------
    public int createPatient(Patient patient) {
        try {
            patientRepository.save(patient);
            return 1;
        } catch (Exception e) {
            System.out.println("Error while creating patient: " + e.getMessage());
            return 0;
        }
    }

    // -----------------------------------------------------
    // GET PATIENT APPOINTMENTS
    // -----------------------------------------------------
    @Transactional
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {

        String email = tokenService.extractEmail(token);

        if (email == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));

        Optional<Patient> patientOpt = patientRepository.findByEmail(email);

        if (patientOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Patient not found"));

        Patient patient = patientOpt.get();

        // ensure token id matches request id
        if (!Objects.equals(patient.getId(), id)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "You are not allowed to access these appointments"));
        }

        // Retrieve appointments
        List<Appointment> appointments = appointmentRepository.findByPatientId(id);

        List<AppointmentDTO> dtos = appointments.stream()
                .map(a -> new AppointmentDTO(
                a.getId(),
                a.getDoctor().getId(),
                a.getDoctor().getName(),
                a.getPatient().getId(),
                a.getPatient().getName(),
                a.getPatient().getEmail(),
                a.getPatient().getPhone(),
                a.getPatient().getAddress(),
                a.getAppointmentTime(),
                a.getStatus()
        ))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("appointments", dtos);

        return ResponseEntity.ok(response);
    }

    // -----------------------------------------------------
    // FILTER BY CONDITION (PAST / FUTURE)
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {

        int status;

        if (condition.equalsIgnoreCase("past")) status = 1;
        else if (condition.equalsIgnoreCase("future")) status = 0;
        else
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid condition"));

        List<Appointment> appointments =
                appointmentRepository.findByPatientIdAndStatus(id, status);

        List<AppointmentDTO> dtos = appointments.stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("appointments", dtos));
    }

    // -----------------------------------------------------
    // FILTER BY DOCTOR NAME
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {

        List<Appointment> appointments =
                appointmentRepository.findByDoctorNameAndPatientId(name, patientId);

        List<AppointmentDTO> dtos = appointments.stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("appointments", dtos));
    }

    // -----------------------------------------------------
    // FILTER BY DOCTOR + CONDITION
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(
            String condition, String name, long patientId) {

        int status;

        if (condition.equalsIgnoreCase("past")) status = 1;
        else if (condition.equalsIgnoreCase("future")) status = 0;
        else return ResponseEntity.badRequest().body(Map.of("error", "Invalid condition"));

        List<Appointment> appointments =
                appointmentRepository.findByDoctorNameAndPatientIdAndStatus(name, patientId, status);

        List<AppointmentDTO> dtos = appointments.stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("appointments", dtos));
    }

    // -----------------------------------------------------
    // GET PATIENT DETAILS
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> getPatientDetails(String token) {

        String email = tokenService.extractEmail(token);

        if (email == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));

        Optional<Patient> patientOpt = patientRepository.findByEmail(email);

        if (patientOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Patient not found"));

        Patient patient = patientOpt.get();

        Map<String, Object> data = new HashMap<>();
        data.put("id", patient.getId());
        data.put("name", patient.getName());
        data.put("email", patient.getEmail());
        data.put("phone", patient.getPhone());
        data.put("address", patient.getAddress());

        return ResponseEntity.ok(data);
    }
}
