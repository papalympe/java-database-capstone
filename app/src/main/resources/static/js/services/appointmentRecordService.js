// src/main/resources/static/js/services/appointmentRecordService.js
import { API_BASE_URL } from "../config/config.js";
const APPOINTMENT_API = `${API_BASE_URL}/appointments`;


//This is for the doctor to get all the patient Appointments
/**
 * Get all appointments for a doctor for a date, optional patientName filter
 * @param {string} date - yyyy-MM-dd
 * @param {string|null} patientName
 * @param {string} token
 * @returns {Array} - appointments array (objects)
 */
export async function getAllAppointments(date, patientName, token) {
    try {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (patientName) params.set('patientName', patientName);
        if (token) params.set('token', token);

        // ✅ FIX: σωστό constant
        const url = `${APPOINTMENT_API}?${params.toString()}`;

        console.log("GET appointments:", url); // 👈 debug

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error('getAllAppointments failed', res.status, res.statusText);
            return [];
        }

        const data = await res.json();
        return data.appointments || [];
    } catch (err) {
        console.error('getAllAppointments error', err);
        return [];
    }
}


export async function bookAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Something went wrong"
    };
  } catch (error) {
    console.error("Error while booking appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}

export async function updateAppointment(appointment, token) {
  try {
    const response = await fetch(`${APPOINTMENT_API}/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Something went wrong"
    };
  } catch (error) {
    console.error("Error while booking appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}
