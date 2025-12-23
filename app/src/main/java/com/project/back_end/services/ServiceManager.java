// src/main/java/com/project/back_end/services/ServiceManager.java
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
    // Normalize empty -> null
    if (name != null && name.trim().isEmpty()) name = null;
    if (specialty != null && specialty.trim().isEmpty()) specialty = null;
    if (time != null && time.trim().isEmpty()) time = null;

    Map<String, Object> result = new HashMap<>();

    // No filters -> all doctors
    if (name == null && specialty == null && time == null) {
        result.put("doctors", doctorService.getDoctors());
        return result;
    }

    // name + specialty + time
    if (name != null && specialty != null && time != null) {
        Map<String, Object> inner = doctorService.filterDoctorsByNameSpecilityandTime(name, specialty, time);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

    // name + specialty
    if (name != null && specialty != null && time == null) {
        Map<String, Object> inner = doctorService.filterDoctorByNameAndSpecility(name, specialty);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

    // name + time
    if (name != null && time != null && specialty == null) {
        Map<String, Object> inner = doctorService.filterDoctorByNameAndTime(name, time);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

    // specialty + time
    if (specialty != null && time != null && name == null) {
        Map<String, Object> inner = doctorService.filterDoctorByTimeAndSpecility(specialty, time);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

    // only name
    if (name != null && specialty == null && time == null) {
        Map<String, Object> inner = doctorService.findDoctorByName(name);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

    // only specialty
    if (specialty != null && name == null && time == null) {
        Map<String, Object> inner = doctorService.filterDoctorBySpecility(specialty);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

    // only time
    if (time != null && name == null && specialty == null) {
        Map<String, Object> inner = doctorService.filterDoctorsByTime(time);
        result.put("doctors", inner.get("doctors"));
        return result;
    }

     // Fallback: call the general method and unwrap if possible
    Map<String, Object> fallback = doctorService.filterDoctorsByNameSpecilityandTime(name, specialty, time);
    if (fallback != null && fallback.get("doctors") instanceof List) {
        result.put("doctors", fallback.get("doctors"));
    } else {
        // if fallback unexpectedly returned list directly
        result.put("doctors", fallback);
    }
    return result;
}

    // -----------------------------------------------------
    // VALIDATE APPOINTMENT
    // -----------------------------------------------------
  public int validateAppointment(Appointment appointment) {
    Doctor doctor = doctorRepository
            .findById(appointment.getDoctor().getId())
            .orElse(null);

    if (doctor == null) return -1;

    LocalDate date = appointment.getAppointmentTime().toLocalDate();
    LocalTime requestedTime = appointment.getAppointmentTime().toLocalTime();

    List<String> availableSlots =
            doctorService.getDoctorAvailability(doctor.getId(), date);

    for (String slot : availableSlots) {
        Optional<LocalTime> slotStart =
                doctorService.extractStartLocalTime(slot);

        if (slotStart.isPresent() && slotStart.get().equals(requestedTime)) {
            return 1; // ✅ AVAILABLE
        }
    }

    return 0; // ❌ NOT AVAILABLE
}


    // -----------------------------------------------------
    // VALIDATE PATIENT (CHECK EXISTENCE)
    // -----------------------------------------------------
    public boolean validatePatient(Patient patient) {
        return patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone()).isEmpty();
    }

    // -----------------------------------------------------
    // VALIDATE PATIENT LOGIN
    // -----------------------------------------------------
    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Patient patient = patientRepository.findByEmail(login.getIdentifier()).orElse(null);
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
        String email = tokenService.extractIdentifier(token);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }

        Patient patient = patientRepository.findByEmail(email).orElse(null);
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
