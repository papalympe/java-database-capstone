package com.project.back_end.services;

import com.project.back_end.entities.Admin;
import com.project.back_end.entities.Doctor;
import com.project.back_end.entities.Patient;
import com.project.back_end.repositories.AdminRepository;
import com.project.back_end.repositories.DoctorRepository;
import com.project.back_end.repositories.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Service {

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Autowired
    public Service(TokenService tokenService,
                   AdminRepository adminRepository,
                   DoctorRepository doctorRepository,
                   PatientRepository patientRepository) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    // Validate token for a given role and return boolean
    public boolean validateToken(String token, String role) {
        return tokenService.validateToken(token, role);
    }

    // Validate admin login and generate JWT token if successful
    public ResponseEntity<String> validateAdmin(String username, String password) {
        try {
            Optional<Admin> adminOpt = adminRepository.findByUsername(username);
            if (adminOpt.isPresent()) {
                Admin admin = adminOpt.get();
                if (admin.getPassword().equals(password)) {
                    String token = tokenService.generateToken(admin.getEmail());
                    return ResponseEntity.ok(token);
                } else {
                    return ResponseEntity.status(401).body("Incorrect password");
                }
            } else {
                return ResponseEntity.status(401).body("Admin not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal Server Error");
        }
    }

    // Validate patient login
    public ResponseEntity<String> validatePatientLogin(String email, String password) {
        try {
            Optional<Patient> patientOpt = patientRepository.findByEmail(email);
            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                if (patient.getPassword().equals(password)) {
                    String token = tokenService.generateToken(patient.getEmail());
                    return ResponseEntity.ok(token);
                } else {
                    return ResponseEntity.status(401).body("Incorrect password");
                }
            } else {
                return ResponseEntity.status(401).body("Patient not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal Server Error");
        }
    }

    // Check if a patient can register (email/phone uniqueness)
    public boolean validatePatient(Patient patient) {
        boolean emailExists = patientRepository.findByEmail(patient.getEmail()).isPresent();
        boolean phoneExists = patientRepository.findByPhone(patient.getPhone()).isPresent();
        return !emailExists && !phoneExists;
    }

    // Filter doctors by name, specialty (example logic)
    public List<Doctor> filterDoctor(String name, String specialty) {
        if (name != null && specialty != null) {
            return doctorRepository.findByNameContainingAndSpecialtyContaining(name, specialty);
        } else if (name != null) {
            return doctorRepository.findByNameContaining(name);
        } else if (specialty != null) {
            return doctorRepository.findBySpecialtyContaining(specialty);
        } else {
            return doctorRepository.findAll();
        }
    }

    // Filter patient's appointments by doctor name or condition (simplified)
    public List<?> filterPatientAppointments(String token, String doctorName, String condition) {
        String email = tokenService.extractEmail(token);
        if (email == null) return List.of();

        Optional<Patient> patientOpt = patientRepository.findByEmail(email);
        if (patientOpt.isEmpty()) return List.of();

        Patient patient = patientOpt.get();
        // Here you would delegate to a patient service or repository to filter appointments
        // Simplified: return all appointments (replace with real filtering logic)
        return patient.getAppointments();
    }

}
