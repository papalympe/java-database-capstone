// doctorServices.js

// Import the API base URL
import { API_BASE_URL } from "../config/config.js";

// Define the doctor-related API endpoint
const DOCTOR_API = API_BASE_URL + '/doctor';

/**
 * Fetch all doctors
 * @returns {Array} - List of doctor objects
 */
export async function getDoctors() {
    try {
        const response = await fetch(DOCTOR_API, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            console.error('Failed to fetch doctors:', response.statusText);
            return [];
        }

        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
}

/**
 * Delete a doctor by ID
 * @param {string} id - Doctor ID
 * @param {string} token - Admin authentication token
 * @returns {Object} - { success: boolean, message: string }
 */
export async function deleteDoctor(id, token) {
    try {
        const url = `${DOCTOR_API}/${id}?token=${token}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        return {
            success: response.ok,
            message: data.message || (response.ok ? 'Doctor deleted successfully' : 'Failed to delete doctor')
        };
    } catch (error) {
        console.error('Error deleting doctor:', error);
        return { success: false, message: 'An error occurred while deleting the doctor.' };
    }
}

/**
 * Save (add) a new doctor
 * @param {Object} doctor - Doctor object containing details
 * @param {string} token - Admin authentication token
 * @returns {Object} - { success: boolean, message: string }
 */
export async function saveDoctor(doctor, token) {
    try {
        const url = `${DOCTOR_API}?token=${token}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });

        const data = await response.json();
        return {
            success: response.ok,
            message: data.message || (response.ok ? 'Doctor saved successfully' : 'Failed to save doctor')
        };
    } catch (error) {
        console.error('Error saving doctor:', error);
        return { success: false, message: 'An error occurred while saving the doctor.' };
    }
}

/**
 * Filter doctors based on criteria
 * @param {string} name - Doctor name (optional)
 * @param {string} time - Availability time (optional)
 * @param {string} specialty - Doctor specialty (optional)
 * @returns {Array} - Filtered list of doctors
 */
export async function filterDoctors(name = '', time = '', specialty = '') {
    try {
        const url = `${DOCTOR_API}/filter/${encodeURIComponent(name)}/${encodeURIComponent(time)}/${encodeURIComponent(specialty)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            console.error('Failed to filter doctors:', response.statusText);
            return { doctors: [] };
        }

        const data = await response.json();
        return data.doctors || [];
    } catch (error) {
        console.error('Error filtering doctors:', error);
        alert('Failed to fetch filtered doctors. Please try again.');
        return { doctors: [] };
    }
}
