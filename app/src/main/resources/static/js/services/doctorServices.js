// src/main/resources/static/js/services/doctorServices.js

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

export async function deleteDoctor(id, token) {
    try {
        // backend expects DELETE /doctor/{id}/{token}
        const url = `${DOCTOR_API}/${encodeURIComponent(id)}/${encodeURIComponent(token)}`;
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

export async function saveDoctor(doctor, token) {
    try {
        // backend expects POST /doctor/{token}
        const url = `${DOCTOR_API}/${encodeURIComponent(token)}`;
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

export async function updateDoctor(doctor, token) {
    try {
        const url = `${DOCTOR_API}/${encodeURIComponent(token)}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctor)
        });

        const data = await response.json().catch(()=>({}));
        return {
            success: response.ok,
            message: data.message || (response.ok ? 'Doctor updated' : 'Failed to update doctor')
        };
    } catch (error) {
        console.error('Error updating doctor:', error);
        return { success: false, message: 'An error occurred while updating the doctor.' };
    }
}


/**
 * Filter doctors based on criteria
 * Always returns an object: { doctors: Array }
 *
 * Accepts either query params (preferred) or legacy path style.
 */
export async function filterDoctors(name = '', time = '', specialty = '') {
    try {
        // build query params only for provided values
        const params = new URLSearchParams();
        if (name && name.trim() !== '') params.set('name', name.trim());
        if (time && time.trim() !== '') params.set('time', time.trim());
        
        if (specialty && specialty.trim() !== '') params.set('specialty', specialty.trim());

        const url = `${DOCTOR_API}/filter${params.toString() ? `?${params.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            console.error('Failed to filter doctors:', response.status, response.statusText);
            return { doctors: [] };
        }

        const data = await response.json();

        // NORMALIZE: extract the doctors array from several possible shapes
        let doctors = [];

        // Case 1: data is an array already
        if (Array.isArray(data)) {
            doctors = data;
        }
        // Case 2: data.doctors is array (common)
        else if (data && Array.isArray(data.doctors)) {
            doctors = data.doctors;
        }
        // Case 3: nested: data.doctors.doctors
        else if (data && data.doctors && Array.isArray(data.doctors.doctors)) {
            doctors = data.doctors.doctors;
        }
        // Case 4: some endpoint returns object with unknown prop containing array -> find first array
        else if (data && typeof data === 'object') {
            for (const k of Object.keys(data)) {
                if (Array.isArray(data[k])) {
                    doctors = data[k];
                    break;
                }
            }
        }

        // Final fallback: if still empty but data itself looks like a single doctor object, wrap it
        if (doctors.length === 0 && data && typeof data === 'object' && (data.name || data.email)) {
            doctors = [data];
        }

        return { doctors };
    } catch (error) {
        console.error('Error filtering doctors:', error);
        return { doctors: [] };
    }
}
