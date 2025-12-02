package com.project.back_end.models;

import jakarta.persistence.*;

@Entity
public class DoctorAvailableTime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctor_id;
    private String available_times;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDoctor_id() { return doctor_id; }
    public void setDoctor_id(Long doctor_id) { this.doctor_id = doctor_id; }
    public String getAvailable_times() { return available_times; }
    public void setAvailable_times(String available_times) { this.available_times = available_times; }
}
