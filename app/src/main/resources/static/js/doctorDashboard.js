/*  
    Doctor Dashboard Logic

    - Fetches and displays appointments
    - Allows filtering by date and patient name
    - Uses getAllAppointments() for backend requests
    - Uses createPatientRow() to build table rows
*/

// -----------------------------------------
// 🔹 IMPORT REQUIRED MODULES
// -----------------------------------------
import { getAllAppointments } from "./services/appointmentRecordService.js";
import { createPatientRow } from "./components/patientRows.js";

// -----------------------------------------
// 🔹 INITIALIZE GLOBAL VARIABLES
// -----------------------------------------

// Table body reference
const tableBody = document.getElementById("patientTableBody");

// Today's date in YYYY-MM-DD format
let selectedDate = new Date().toISOString().split("T")[0];

// Token from localStorage
const token = localStorage.getItem("token");

// Patient name filter (search input)
let patientName = null;

// -----------------------------------------
// 🔹 SEARCH BAR EVENT LISTENER
// -----------------------------------------
document.getElementById("searchBar").addEventListener("input", (e) => {
    const value = e.target.value.trim();

    patientName = value !== "" ? value : "null";

    loadAppointments();
});

// -----------------------------------------
// 🔹 TODAY BUTTON EVENT LISTENER
// -----------------------------------------
document.getElementById("todayButton").addEventListener("click", () => {
    selectedDate = new Date().toISOString().split("T")[0];

    document.getElementById("datePicker").value = selectedDate;

    loadAppointments();
});

// -----------------------------------------
// 🔹 DATE PICKER EVENT LISTENER
// -----------------------------------------
document.getElementById("datePicker").addEventListener("change", (e) => {
    selectedDate = e.target.value;
    loadAppointments();
});

// -----------------------------------------
// 🔹 FUNCTION: loadAppointments()
// -----------------------------------------
async function loadAppointments() {
    try {
        // Fetch appointments
        const appointments = await getAllAppointments(selectedDate, patientName, token);

        // Clear existing rows
        tableBody.innerHTML = "";

        // If no appointments found
        if (!appointments || appointments.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="5" style="text-align:center; padding: 15px;">
                    No Appointments found for today.
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        // Loop through appointments
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

        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="5" style="text-align:center; padding: 15px; color:red;">
                Error loading appointments. Try again later.
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// -----------------------------------------
// 🔹 INITIAL PAGE LOAD
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("datePicker")) {
        document.getElementById("datePicker").value = selectedDate;
    }

    loadAppointments();
});

