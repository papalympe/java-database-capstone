package com.project.back_end.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import java.time.LocalDateTime;

/*
 Marker interfaces για validation groups.
 - OnCreate: χρησιμοποιείται όταν θέλουμε να εφαρμόσουμε κανόνες που αφορούν μόνο τη δημιουργία (π.χ. @Future).
 - OnUpdate: χρησιμοποιείται όταν κάνουμε validation σε ενημερώσεις (αν χρειαστεί).
 Στην πράξη: κατά τη δημιουργία endpoint/controller κάνεις @Validated(OnCreate.class)
*/
interface OnCreate {}
interface OnUpdate {}

@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @NotNull
    private Doctor doctor;

    @ManyToOne
    @NotNull
    private Patient patient;

    // Το @Future εφαρμόζεται ΜΟΝΟ όταν επικαλούμαστε validation με το group OnCreate.
    // Αυτό αποφεύγει validation failures όταν κάνουμε update σε ραντεβού που έχουν ήδη περάσει.
    @NotNull
    @Future(groups = OnCreate.class)
    private LocalDateTime appointmentTime;

    @NotNull
    private int status; // 0 = Scheduled, 1 = Completed

    /**
     * Βοηθητική μέθοδος που υπολογίζει το τέλος του ραντεβού (1 ώρα μετά την έναρξη).
     * @return end time ή null αν appointmentTime == null
     */
    @Transient
    public LocalDateTime getEndTime() {
        if (this.appointmentTime == null) return null;
        return appointmentTime.plusHours(1);
    }

    /**
     * Επιστρέφει την ημερομηνία (LocalDate) του ραντεβού.
     * Χρήσιμο για grouping/φιλτράρισμα στο UI.
     */
    @Transient
    public java.time.LocalDate getAppointmentDate() {
        return appointmentTime == null ? null : appointmentTime.toLocalDate();
    }

    /**
     * Επιστρέφει μόνο την ώρα (LocalTime) του ραντεβού.
     * Χρήσιμο για εμφανίσεις/φόρμες όπου χρειάζεται μόνο η ώρα.
     */
    @Transient
    public java.time.LocalTime getAppointmentTimeOnly() {
        return appointmentTime == null ? null : appointmentTime.toLocalTime();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public LocalDateTime getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(LocalDateTime appointmentTime) { this.appointmentTime = appointmentTime; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    // Βοηθητικά getters και setters για enum
    public AppointmentStatus getAppointmentStatus() {
        return AppointmentStatus.fromCode(this.status);
    }

    public void setAppointmentStatus(AppointmentStatus status) {
        this.status = status.getCode();
    }
}
