// patientServices.js

// Import API Base URL
import { API_BASE_URL } from "../config/config.js";

// Base Patient API Endpoint
const PATIENT_API = API_BASE_URL + '/patient';

/**
 * Patient Signup
 * @param {Object} data - Patient details (name, email, password, etc.)
 * @returns {Object} - { success: boolean, message: string }
 */
export async function patientSignup(data) {
    try {
        const response = await fetch(`${PATIENT_API}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return {
            success: response.ok,
            message: result.message || (response.ok ? "Signup successful!" : "Signup failed.")
        };

    } catch (error) {
        console.error("Signup error:", error);
        return {
            success: false,
            message: "An error occurred during signup. Please try again."
        };
    }
}

/**
 * Patient Login
 * @param {Object} data - Login credentials (email, password)
 * @returns {Response} - Raw fetch response for token extraction
 */
export async function patientLogin(data) {
    try {
        const response = await fetch(`${PATIENT_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        return response; // frontend will handle token & status
    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
}

/**
 * Fetch logged-in patient details
 * @param {string} token - Auth token
 * @returns {Object|null} - Patient data or null on failure
 */
export async function getPatientData(token) {
    try {
        const response = await fetch(`${PATIENT_API}/me?token=${token}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.patient;

    } catch (error) {
        console.error("Error fetching patient data:", error);
        return null;
    }
}

/**
 * Fetch appointments for patient or doctor
 * @param {string} id - Patient ID
 * @param {string} token - Auth token
 * @param {string} user - "patient" or "doctor"
 * @returns {Array|null} - Appointment list or null
 */
export async function getPatientAppointments(id, token, user) {
    try {
        const response = await fetch(
            `${PATIENT_API}/appointments/${user}/${id}?token=${token}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) {
            console.error("Failed to fetch appointments.");
            return null;
        }

        const data = await response.json();
        return data.appointments || [];

    } catch (error) {
        console.error("Error fetching appointments:", error);
        return null;
    }
}

/**
 * Filter Appointments
 * @param {string} condition - "pending", "consulted", etc.
 * @param {string} name - Doctor or patient name
 * @param {string} token - Auth token
 * @returns {Array} - Filtered appointment list
 */
export async function filterAppointments(condition, name, token) {
    try {
        const response = await fetch(
            `${PATIENT_API}/appointments/filter/${condition}/${encodeURIComponent(name)}?token=${token}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) {
            console.error("Failed to filter appointments");
            return [];
        }

        const data = await response.json();
        return data.appointments || [];

    } catch (error) {
        console.error("Error filtering appointments:", error);
        alert("Unable to filter appointments at this moment.");
        return [];
    }
}
