/*  
    Doctor Dashboard Logic
*/

// -----------------------------------------
// 🔹 IMPORT REQUIRED MODULES
// -----------------------------------------
import { getAllAppointments } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

// -----------------------------------------
// 🔹 STATE
// -----------------------------------------
let tableBody;
let selectedDate = new Date().toISOString().split("T")[0];
let patientName = null;
const token = localStorage.getItem("token");

// -----------------------------------------
// 🔹 DOM READY
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    tableBody = document.getElementById("patientTableBody");

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

    // Search
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const value = e.target.value.trim();
            patientName = value !== "" ? value : null;
            loadAppointments();
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

// -----------------------------------------
// 🔹 FUNCTION: loadAppointments()
// -----------------------------------------
async function loadAppointments() {
    try {
        const appointments = await getAllAppointments(
            selectedDate,
            patientName,
            token
        );

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

            const row = createPatientRow(patient, appt);
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
