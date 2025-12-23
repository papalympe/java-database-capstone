import { API_BASE_URL } from "../config/config.js";
const APPOINTMENT_API = `${API_BASE_URL}/appointments`;

// Get all appointments (unchanged)
export async function getAllAppointments(date, patientName, token) {
    try {
        const params = new URLSearchParams();
        if (date) params.set('date', date);
        if (patientName) params.set('patientName', patientName);
        if (token) params.set('token', token);

        const url = `${APPOINTMENT_API}?${params.toString()}`;

        console.log("GET appointments:", url);

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
    if (!token) {
      return { success: false, message: "Missing token" };
    }

    // encode token for safe URL (JWT has dots and other chars)
    const safeToken = encodeURIComponent(token);
    const url = `${APPOINTMENT_API}/${safeToken}`;

    console.log("POST booking ->", url, appointment);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    // Try to parse JSON body safely
    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      console.warn("bookAppointment: response body not JSON", err);
    }

    if (!response.ok) {
      const msg = (data && (data.error || data.message)) || `${response.status} ${response.statusText}`;
      console.error("bookAppointment failed:", response.status, msg, data);
      return { success: false, message: msg };
    }

    return {
      success: true,
      message: (data && (data.message || "Appointment booked")) || "Appointment booked"
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
    if (!token) return { success: false, message: "Missing token" };
    const safeToken = encodeURIComponent(token);
    const response = await fetch(`${APPOINTMENT_API}/${safeToken}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointment)
    });

    let data = null;
    try { data = await response.json(); } catch(_) {}

    if (!response.ok) {
      const msg = (data && (data.error || data.message)) || `${response.status} ${response.statusText}`;
      return { success: false, message: msg };
    }

    return {
      success: true,
      message: data?.message || "Appointment updated"
    };
  } catch (error) {
    console.error("Error while updating appointment:", error);
    return {
      success: false,
      message: "Network error. Please try again later."
    };
  }
}
