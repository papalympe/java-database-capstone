// /js/doctor/doctorDashboard.js
import { getAllAppointments } from "/js/services/appointmentRecordService.js";
import { createPatientRow } from "/js/components/patientRows.js";

/*
  This file expects:
   - token stored in localStorage.token
   - user role to be "doctor" in localStorage.userRole
*/

let tableBody;
let selectedDate = new Date().toISOString().split("T")[0];
let patientName = null;
const token = localStorage.getItem("token");
const role = localStorage.getItem("userRole");

document.addEventListener("DOMContentLoaded", () => {
  tableBody = document.getElementById("patientTableBody");

  // quick auth/role guard: if not doctor or no token redirect to root
  if (role !== "doctor" || !token) {
    console.warn("doctorDashboard: missing token or role, redirecting to /");
    window.location.href = "/";
    return;
  }

  const searchBar = document.getElementById("searchBar");
  const todayButton = document.getElementById("todayButton");
  const datePicker = document.getElementById("datePicker");

  if (!tableBody) {
    console.error("patientTableBody not found in DOM");
    return;
  }

  // Init date picker
  if (datePicker) {
    datePicker.value = selectedDate;
    datePicker.addEventListener("change", (e) => {
      selectedDate = e.target.value;
      loadAppointments();
    });
  }

  // Search with debounce
  if (searchBar) {
    let debounceTimer = null;
    searchBar.addEventListener("input", (e) => {
      const value = e.target.value.trim();
      patientName = value !== "" ? value : null;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => loadAppointments(), 300);
    });
  }

  // Today button
  if (todayButton) {
    todayButton.addEventListener("click", () => {
      selectedDate = new Date().toISOString().split("T")[0];
      if (datePicker) datePicker.value = selectedDate;
      loadAppointments();
    });
  }

  // Initial load
  loadAppointments();
});

async function loadAppointments() {
  try {
    const appointments = await getAllAppointments(selectedDate, patientName, token);

    tableBody.innerHTML = "";

    if (!appointments || appointments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:15px;">
            No appointments found.
          </td>
        </tr>
      `;
      return;
    }

    appointments.forEach((appt) => {
      const patient = {
        id: appt.patientId,
        name: appt.patientName,
        phone: appt.patientPhone,
        email: appt.patientEmail,
      };

      // pass appointment id and doctor id correctly
      const row = createPatientRow(patient, appt.id, appt.doctorId);
      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading appointments:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:15px; color:red;">
          Error loading appointments.
        </td>
      </tr>
    `;
  }
}

export { loadAppointments };
