package com.project.back_end.services;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Appointment;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public DoctorService(DoctorRepository doctorRepository,
                         AppointmentRepository appointmentRepository,
                         TokenService tokenService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    // -----------------------
    // Get Doctor Availability
    // -----------------------
    @Transactional(readOnly = true)
    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        // Normalize day window
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        // fetch appointments for doctor for the date
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentTimeBetween(doctorId, start, end);

        // booked times normalized to "HH:mm"
        Set<String> booked = appointments.stream()
                .map(a -> formatLocalTime(a.getAppointmentTime().toLocalTime()))
                .collect(Collectors.toSet());

        // fetch doctor and availableTimes
        Optional<Doctor> optDoc = doctorRepository.findById(doctorId);
        if (optDoc.isEmpty()) return Collections.emptyList();

        List<String> availableTimes = optDoc.get().getAvailableTimes();
        if (availableTimes == null) return Collections.emptyList();

        // normalize availableTimes and filter out booked ones; preserve original format where possible
        List<String> result = new ArrayList<>();
        for (String timeStr : availableTimes) {
            Optional<LocalTime> parsed = extractStartLocalTime(timeStr);
            if (parsed.isEmpty()) continue;
            String norm = formatLocalTime(parsed.get());
            if (!booked.contains(norm)) {
                result.add(timeStr);
            }
        }

        return result;
    }

    // -----------------------
    // Save Doctor
    // -----------------------
    @Transactional
    public int saveDoctor(Doctor doctor) {
        try {
            Doctor existing = doctorRepository.findByEmail(doctor.getEmail());
            if (existing != null) {
                return -1; // conflict: email exists
            }
            doctorRepository.save(doctor);
            return 1; // success
        } catch (Exception e) {
            return 0; // internal error
        }
    }

    // -----------------------
    // Update Doctor
    // -----------------------
    @Transactional
    public int updateDoctor(Doctor doctor) {
        try {
            if (doctor.getId() == null || doctorRepository.findById(doctor.getId()).isEmpty()) {
                return -1; // not found
            }
            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    // -----------------------
    // Get All Doctors
    // -----------------------
    @Transactional(readOnly = true)
    public List<Doctor> getDoctors() {
        return doctorRepository.findAll();
    }

    // -----------------------
    // Delete Doctor
    // -----------------------
    @Transactional
    public int deleteDoctor(long id) {
        try {
            if (doctorRepository.findById(id).isEmpty()) {
                return -1; // not found
            }

            // delete appointments for doctor first
            appointmentRepository.deleteAllByDoctorId(id);

            // then delete doctor
            doctorRepository.deleteById(id);
            return 1;
        } catch (Exception e) {
            return 0;
        }
    }

    // -----------------------
    // Validate Doctor (login)
    // -----------------------
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {
        Map<String, String> resp = new HashMap<>();

        // here login.identifier expected to be email
        String identifier = login.getIdentifier();
        String password = login.getPassword();
        Doctor doctor = doctorRepository.findByEmail(identifier);

        if (doctor == null) {
            resp.put("message", "Doctor not found");
            return new ResponseEntity<>(resp, HttpStatus.NOT_FOUND);
        }

        // NOTE: in production compare hashed password
        if (doctor.getPassword() == null || !doctor.getPassword().equals(password)) {
            resp.put("message", "Invalid credentials");
            return new ResponseEntity<>(resp, HttpStatus.UNAUTHORIZED);
        }

        // Generate token (assumes tokenService has this method)
        String token = tokenService.generateToken(doctor.getEmail());
        resp.put("token", token);
        resp.put("message", "Login successful");
        return new ResponseEntity<>(resp, HttpStatus.OK);
    }

    // -----------------------
    // Find doctor(s) by name
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> findDoctorByName(String name) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findByNameLike(name == null ? "" : name);
        result.put("doctors", doctors);
        return result;
    }

    // -----------------------
    // Filter by name + specialty + AM/PM
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByNameSpecilityandTime(String name, String specialty, String amOrPm) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> matches = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
                name == null ? "" : name, specialty == null ? "" : specialty
        );

        List<Doctor> filtered = filterDoctorByTime(matches, amOrPm);
        result.put("doctors", filtered);
        return result;
    }

    // -----------------------
    // Filter by name + time
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndTime(String name, String amOrPm) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> matches = doctorRepository.findByNameLike(name == null ? "" : name);
        List<Doctor> filtered = filterDoctorByTime(matches, amOrPm);
        result.put("doctors", filtered);
        return result;
    }

    // -----------------------
    // Filter by name + specialty
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByNameAndSpecility(String name, String specilty) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> matches = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(
                name == null ? "" : name, specilty == null ? "" : specilty
        );
        result.put("doctors", matches);
        return result;
    }

    // -----------------------
    // Filter by time + specialty
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorByTimeAndSpecility(String specilty, String amOrPm) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> matches = doctorRepository.findBySpecialtyIgnoreCase(specilty == null ? "" : specilty);
        List<Doctor> filtered = filterDoctorByTime(matches, amOrPm);
        result.put("doctors", filtered);
        return result;
    }

    // -----------------------
    // Filter by specialty only
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorBySpecility(String specilty) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> matches = doctorRepository.findBySpecialtyIgnoreCase(specilty == null ? "" : specilty);
        result.put("doctors", matches);
        return result;
    }

    // -----------------------
    // Filter all doctors by time (AM/PM)
    // -----------------------
    @Transactional(readOnly = true)
    public Map<String, Object> filterDoctorsByTime(String amOrPm) {
        Map<String, Object> result = new HashMap<>();
        List<Doctor> all = doctorRepository.findAll();
        List<Doctor> filtered = filterDoctorByTime(all, amOrPm);
        result.put("doctors", filtered);
        return result;
    }

    // -----------------------
    // Private helper: filter a list of doctors by AM/PM availability
    // -----------------------
    private List<Doctor> filterDoctorByTime(List<Doctor> doctors, String amOrPm) {
        if (doctors == null) return Collections.emptyList();
        if (amOrPm == null) return doctors;

        String mode = amOrPm.trim().toUpperCase();
        boolean wantAM = mode.equals("AM");
        boolean wantPM = mode.equals("PM");

        if (!wantAM && !wantPM) {
            // unknown mode -> return original
            return doctors;
        }

        LocalTime noon = LocalTime.NOON;
        List<Doctor> result = new ArrayList<>();

        for (Doctor d : doctors) {
            List<String> times = d.getAvailableTimes();
            if (times == null || times.isEmpty()) continue;

            boolean ok = false;
            for (String tstr : times) {
                Optional<LocalTime> parsed = extractStartLocalTime(tstr);
                if (parsed.isEmpty()) continue;
                LocalTime t = parsed.get();
                // debug (remove in production)
                // System.out.println("Doctor " + d.getId() + " start time parsed: " + t + " (checking " + (wantAM ? "AM" : "PM") + ")");
                if (wantAM && t.isBefore(noon)) {
                    ok = true;
                    break;
                } else if (wantPM && (t.equals(noon) || t.isAfter(noon))) {
                    ok = true;
                    break;
                }
            }
            if (ok) result.add(d);
        }

        return result;
    }

    // -----------------------
    // Utilities: parse and format times
    // -----------------------
    /**
     * Extracts the "start" time from a slot string. Examples:
     *  - "09:00-10:00"  -> parse "09:00"
     *  - "9:00 AM - 10:00 AM" -> parse "9:00 AM"
     *  - "09:00" -> parse "09:00"
     */
    private Optional<LocalTime> extractStartLocalTime(String timeStr) {
        if (timeStr == null) return Optional.empty();
        String trimmed = timeStr.trim();

        // Accept unicode en-dash or hyphen
        if (trimmed.contains("-") || trimmed.contains("–")) {
            String[] parts = trimmed.split("[-–]", 2);
            trimmed = parts[0].trim();
        }

        // support "to" forms: "9:00 to 10:00" (case-insensitive)
        if (trimmed.toLowerCase().contains(" to ")) {
            trimmed = trimmed.split("(?i) to ")[0].trim();
        }

        // strip any trailing text beyond the time token (e.g. "09:00 (confirmed)")
        if (trimmed.contains(" ")) {
            // keep tokens that might include AM/PM (like "9:00 AM"), otherwise keep first token
            String[] tokens = trimmed.split("\\s+");
            if (tokens.length >= 2 && (tokens[1].equalsIgnoreCase("AM") || tokens[1].equalsIgnoreCase("PM"))) {
                trimmed = tokens[0] + " " + tokens[1];
            } else {
                trimmed = tokens[0];
            }
        }

        // handle "HH:mm:ss" -> "HH:mm"
        if (trimmed.matches("^\\d{2}:\\d{2}:\\d{2}.*$")) {
            trimmed = trimmed.substring(0, 5);
        }

        return parseToLocalTime(trimmed);
    }

    private Optional<LocalTime> parseToLocalTime(String timeStr) {
        if (timeStr == null) return Optional.empty();
        String trimmed = timeStr.trim();

        // try multiple patterns: e.g. "HH:mm", "H:mm", "hh:mm a", "h:mm a"
        DateTimeFormatter[] fmts = new DateTimeFormatter[] {
                DateTimeFormatter.ofPattern("HH:mm"),
                DateTimeFormatter.ofPattern("H:mm"),
                DateTimeFormatter.ofPattern("hh:mm a"),
                DateTimeFormatter.ofPattern("h:mm a")
        };

        for (DateTimeFormatter fmt : fmts) {
            try {
                LocalTime t = LocalTime.parse(trimmed, fmt);
                return Optional.of(t);
            } catch (DateTimeParseException ignored) {
            }
        }

        // try to parse with ISO_LOCAL_TIME fallback
        try {
            LocalTime t = LocalTime.parse(trimmed);
            return Optional.of(t);
        } catch (DateTimeParseException ignored) {
        }

        return Optional.empty();
    }

    private String formatLocalTime(LocalTime t) {
        return t.format(DateTimeFormatter.ofPattern("HH:mm"));
    }
}
