// /js/services/patientServices.js

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

// Patient Login
export async function patientLogin(data) {
    try {
        // Normalize payload: backend expects { identifier, password }
        const payload = {
            identifier: data.email ?? data.identifier ?? "",
            password: data.password
        };

        const response = await fetch(`${PATIENT_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        return response; // frontend handles token & status
    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
}


// Fetch logged-in patient details (backend: GET /patient/{token})
export async function getPatientData(token) {
    try {
        const response = await fetch(`${PATIENT_API}/${encodeURIComponent(token)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) return null;
        const data = await response.json();
        // backend returns the patient info in the top-level map (id,name,email,phone,address)
        // so return that object
        return data;
    } catch (error) {
        console.error("Error fetching patient data:", error);
        return null;
    }
}

/**
 * Fetch appointments for patient (backend: GET /patient/{id}/{token})
 * If user === "doctor" you can still call the same endpoint if backend expects it; here use mapping to controller.
 */
export async function getPatientAppointments(id, token, user) {
    try {
        const response = await fetch(`${PATIENT_API}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            console.error("Failed to fetch appointments.", response.status);
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
 * Filter Appointments (now using query params)
 * GET /patient/filter?condition=...&name=...&token=...
 */
export async function filterAppointments(condition, name, token) {
    try {
        const params = new URLSearchParams();
        if (condition) params.append("condition", condition);
        if (name) params.append("name", name);
        // token is required by backend in current design
        if (token) params.append("token", token);

        const url = `${PATIENT_API}/filter?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            console.error("Failed to filter appointments", response.status);
            return [];
        }

        const data = await response.json();
        // serviceManager.filterPatient returns a ResponseEntity with a map that has appointments under "appointments"
        // But our backend patientService returns the map from patientService that already contains "appointments".
        // To be robust handle both array or object shape:
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.appointments)) return data.appointments;
        return [];
    } catch (error) {
        console.error("Error filtering appointments:", error);
        return [];
    }
}



