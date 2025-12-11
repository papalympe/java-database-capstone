package com.project.back_end.services;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Admin;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ServiceManager {

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public ServiceManager(TokenService tokenService,
                          AdminRepository adminRepository,
                          DoctorRepository doctorRepository,
                          PatientRepository patientRepository,
                          DoctorService doctorService,
                          PatientService patientService) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    // -----------------------------------------------------
    // VALIDATE TOKEN
    // -----------------------------------------------------
    public ResponseEntity<Map<String, String>> validateToken(String token, String user) {
        if (!tokenService.validateToken(token, user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token is invalid or expired"));
        }
        return ResponseEntity.ok(Map.of("message", "Token is valid"));
    }

    // -----------------------------------------------------
    // VALIDATE ADMIN LOGIN
    // -----------------------------------------------------
    public ResponseEntity<Map<String, String>> validateAdmin(Admin receivedAdmin) {
        Admin admin = adminRepository.findByUsername(receivedAdmin.getUsername());
        if (admin == null || !admin.getPassword().equals(receivedAdmin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
        String token = tokenService.generateToken(admin.getUsername());
        return ResponseEntity.ok(Map.of("token", token));
    }

    // -----------------------------------------------------
    // FILTER DOCTORS
    // -----------------------------------------------------
    public Map<String, Object> filterDoctor(String name, String specialty, String time) {
        Map<String, Object> result = new HashMap<>();
        if ((name == null || name.isEmpty()) &&
            (specialty == null || specialty.isEmpty()) &&
            (time == null || time.isEmpty())) {
            result.put("doctors", doctorService.getDoctors());
            return result;
        }
        result.put("doctors", doctorService.filterDoctorsByNameSpecialtyAndTime(name, specialty, time));
        return result;
    }

    // -----------------------------------------------------
    // VALIDATE APPOINTMENT
    // -----------------------------------------------------
    public int validateAppointment(Appointment appointment) {
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId()).orElse(null);
        if (doctor == null) return -1;

        List<String> available = doctorService.getDoctorAvailability(doctor.getId(), appointment.getAppointmentTime().toLocalDate());
        return available.contains(appointment.getAppointmentTime().toLocalTime().toString()) ? 1 : 0;
    }

    // -----------------------------------------------------
    // VALIDATE PATIENT (CHECK EXISTENCE)
    // -----------------------------------------------------
    public boolean validatePatient(Patient patient) {
        Patient existing = patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone());
        return existing == null;
    }

    // -----------------------------------------------------
    // VALIDATE PATIENT LOGIN
    // -----------------------------------------------------
    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Patient patient = patientRepository.findByEmail(login.getIdentifier());
        if (patient == null || !patient.getPassword().equals(login.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
        String token = tokenService.generateToken(patient.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }

    // -----------------------------------------------------
    // FILTER PATIENT APPOINTMENTS
    // -----------------------------------------------------
    public ResponseEntity<Map<String, Object>> filterPatient(String condition, String name, String token) {
        String email = tokenService.extractEmail(token);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }

        Patient patient = patientRepository.findByEmail(email);
        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Patient not found"));
        }

        if ((condition == null || condition.isEmpty()) && (name == null || name.isEmpty())) {
            return patientService.getPatientAppointment(patient.getId(), token);
        } else if (condition != null && !condition.isEmpty() && (name == null || name.isEmpty())) {
            return patientService.filterByCondition(condition, patient.getId());
        } else if ((condition == null || condition.isEmpty()) && name != null && !name.isEmpty()) {
            return patientService.filterByDoctor(name, patient.getId());
        } else {
            return patientService.filterByDoctorAndCondition(condition, name, patient.getId());
        }
    }
}
