// prescriptionServices.js
import { API_BASE_URL } from '../config/config.js';

const PRESCRIPTION_API = API_BASE_URL + "/prescription";

export async function savePrescription(prescription, token) {
  try {
    const url = `${PRESCRIPTION_API}/${encodeURIComponent(token)}`;
    console.log("POST prescription ->", url, prescription);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(prescription)
    });

    // try to parse body safely
    const result = await (async () => {
      try { return await response.json(); } catch (_) { return {}; }
    })();

    if (!response.ok) {
      console.error("savePrescription failed", response.status, result);
      return { success: false, message: result.message || `Server error ${response.status}` };
    }

    return { success: true, message: result.message || "Saved" };

  } catch (error) {
    console.error("Error :: savePrescription :: ", error);
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getPrescription(appointmentId, token) {
  try {
    const url = `${PRESCRIPTION_API}/${encodeURIComponent(appointmentId)}/${encodeURIComponent(token)}`;
    console.log("GET prescription ->", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    // if non-OK try parse error body, then throw (and also log raw body if not JSON)
    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
        console.error("Failed to fetch prescription (json):", response.status, errorData);
        throw new Error(errorData.message || `Server responded ${response.status}`);
      } catch (jsonErr) {
        // JSON parse failed — read raw text
        try {
          const raw = await response.text();
          console.error("Failed to fetch prescription (raw body):", response.status, raw);
        } catch (textErr) {
          console.error("Failed to fetch prescription and additionally failed to read raw text body");
        }
        throw new Error(`Server responded with status ${response.status}`);
      }
    }

    const result = await response.json();
    console.log("prescription result:", result);
    return result; // expected shape: { prescription: [...] } or similar
  } catch (error) {
    console.error("Error :: getPrescription ::", error);
    // bubble up to caller so caller can decide what to do
    throw new Error(error.message || "An error occurred while retrieving the prescription");
  }
}
