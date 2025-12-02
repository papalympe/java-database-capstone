package com.project.back_end.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private Long doctor_id;

    @NotNull
    private Long patient_id;

    @NotNull
    private LocalDateTime appointment_time;

    @NotNull
    private String status;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctor_id() { return doctor_id; }
    public void setDoctor_id(Long doctor_id) { this.doctor_id = doctor_id; }
    public Long getPatient_id() { return patient_id; }
    public void setPatient_id(Long patient_id) { this.patient_id = patient_id; }
    public LocalDateTime getAppointment_time() { return appointment_time; }
    public void setAppointment_time(LocalDateTime appointment_time) { this.appointment_time = appointment_time; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
