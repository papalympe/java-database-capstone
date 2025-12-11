package com.project.back_end.services;

import com.project.back_end.model.Appointment;
import com.project.back_end.model.Doctor;
import com.project.back_end.model.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;
import com.project.back_end.security.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TokenService tokenService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              TokenService tokenService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.tokenService = tokenService;
    }

    // -----------------------------------------------------
    // BOOK APPOINTMENT
    // -----------------------------------------------------
    @Transactional
    public int bookAppointment(Appointment appointment) {
        try {
            appointmentRepository.save(appointment);
            return 1; // success
        } catch (Exception e) {
            return 0; // failure
        }
    }

    // -----------------------------------------------------
    // UPDATE APPOINTMENT
    // -----------------------------------------------------
    @Transactional
    public ResponseEntity<Map<String, String>> updateAppointment(Appointment appointment) {
        Map<String, String> response = new HashMap<>();

        Optional<Appointment> existingOpt = appointmentRepository.findById(appointment.getId());

        if (existingOpt.isEmpty()) {
            response.put("message", "Appointment not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        Appointment existing = existingOpt.get();

        // Validate patient match
        if (!existing.getPatient().getId().equals(appointment.getPatient().getId())) {
            response.put("message", "Patient ID mismatch");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        // Validate doctor availability
        Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId()).orElse(null);
        if (doctor == null) {
            response.put("message", "Doctor not found");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // Validate appointment time not already booked
        LocalDateTime start = appointment.getAppointmentTime();
        LocalDateTime end = start.plusHours(1);

        List<Appointment> overlapping = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetween(doctor.getId(), start, end);

        for (Appointment a : overlapping) {
            if (!a.getId().equals(existing.getId())) {
                response.put("message", "Time slot already booked");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }
        }

        // Save update
        appointmentRepository.save(appointment);

        response.put("message", "Appointment updated successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // -----------------------------------------------------
    // CANCEL APPOINTMENT
    // -----------------------------------------------------
    @Transactional
    public ResponseEntity<Map<String, String>> cancelAppointment(long id, String token) {
        Map<String, String> response = new HashMap<>();

        Optional<Appointment> opt = appointmentRepository.findById(id);

        if (opt.isEmpty()) {
            response.put("message", "Appointment not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }

        Appointment appointment = opt.get();

        // Extract patient ID from token
        Long tokenUserId = tokenService.extractUserIdFromToken(token);

        if (!appointment.getPatient().getId().equals(tokenUserId)) {
            response.put("message", "Unauthorized to cancel this appointment");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        appointmentRepository.delete(appointment);

        response.put("message", "Appointment canceled successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // -----------------------------------------------------
    // GET APPOINTMENTS (doctor/date/patient filter)
    // -----------------------------------------------------
    @Transactional(readOnly = true)
    public Map<String, Object> getAppointment(String pname, LocalDate date, String token) {
        Map<String, Object> result = new HashMap<>();

        Long doctorId = tokenService.extractUserIdFromToken(token);

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Appointment> appointments =
                appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
                        doctorId, startOfDay, endOfDay
                );

        // Filter by patient name
        if (pname != null && !pname.trim().isEmpty()) {
            appointments.removeIf(a ->
                    !a.getPatient().getName().toLowerCase().contains(pname.toLowerCase())
            );
        }

        result.put("appointments", appointments);
        return result;
    }

    // -----------------------------------------------------
    // CHANGE APPOINTMENT STATUS
    // -----------------------------------------------------
    @Transactional
    public void changeStatus(long id, int status) {
        appointmentRepository.updateStatus(status, id);
    }

}
