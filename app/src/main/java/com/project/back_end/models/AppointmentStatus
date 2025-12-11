package com.project.back_end.models;

public enum AppointmentStatus {
    PENDING(0),
    CONFIRMED(1),
    CANCELLED(2),
    PRESCRIPTION_ADDED(3);

    private final int code;

    AppointmentStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static AppointmentStatus fromCode(int code) {
        for (AppointmentStatus status : AppointmentStatus.values()) {
            if (status.getCode() == code) return status;
        }
        throw new IllegalArgumentException("Invalid AppointmentStatus code: " + code);
    }
}
