// adminDashboard.js

// Import required modules
import { openModal } from "../components/modals.js";
import { getDoctors, filterDoctors, saveDoctor } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";

/* ------------------------------------------------------------------
   Attach event listener to the "Add Doctor" button to open the modal
------------------------------------------------------------------- */

document.getElementById("addDocBtn").addEventListener("click", () => {
    openModal("addDoctor");
});

/* ------------------------------------------------------------------
   Load Doctor Cards when the page is fully loaded
------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
    loadDoctorCards();
});

/* ------------------------------------------------------------------
   Function: loadDoctorCards
   Fetch all doctors and display them as cards
------------------------------------------------------------------- */

async function loadDoctorCards() {
    try {
        const doctors = await getDoctors();
        renderDoctorCards(doctors);
    } catch (error) {
        console.error("Error loading doctors:", error);
    }
}

/* ------------------------------------------------------------------
   Search & Filter Event Listeners
------------------------------------------------------------------- */

document.getElementById("searchBar").addEventListener("input", filterDoctorsOnChange);
document.getElementById("filterTime").addEventListener("change", filterDoctorsOnChange);
document.getElementById("filterSpecialty").addEventListener("change", filterDoctorsOnChange);

/* ------------------------------------------------------------------
   Function: filterDoctorsOnChange
   Apply filters and search to doctor list
------------------------------------------------------------------- */

async function filterDoctorsOnChange() {
    try {
        const name = document.getElementById("searchBar").value.trim() || null;
        const time = document.getElementById("filterTime").value || null;
        const specialty = document.getElementById("filterSpecialty").value || null;

        const doctors = await filterDoctors(name, time, specialty);

        if (doctors.length > 0) {
            renderDoctorCards(doctors);
        } else {
            document.getElementById("content").innerHTML =
                `<p class="text-center text-gray-500 py-5">No doctors found with the given filters.</p>`;
        }
    } catch (error) {
        console.error("Filter error:", error);
        alert("An error occurred while filtering doctors.");
    }
}

/* ------------------------------------------------------------------
   Function: renderDoctorCards
   Render a list of doctor cards into #content
------------------------------------------------------------------- */

function renderDoctorCards(doctors) {
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    doctors.forEach((doctor) => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
    });
}

/* ------------------------------------------------------------------
   Function: adminAddDoctor
   Collect form data and save new doctor
------------------------------------------------------------------- */

export async function adminAddDoctor() {
    try {
        // Get authentication token
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication failed! Please login again.");
            return;
        }

        // Gather form values
        const name = document.getElementById("docName").value.trim();
        const email = document.getElementById("docEmail").value.trim();
        const phone = document.getElementById("docPhone").value.trim();
        const password = document.getElementById("docPassword").value.trim();
        const specialty = document.getElementById("docSpecialty").value.trim();

        // Collect availability times from checkboxes
        const availabilityNodes = document.querySelectorAll(".availability:checked");
        const availability = Array.from(availabilityNodes).map((input) => input.value);

        // Build doctor object
        const doctor = {
            name,
            email,
            phone,
            password,
            specialty,
            availability
        };

        // Save doctor using service layer
        const result = await saveDoctor(doctor, token);

        if (result.success) {
            alert("Doctor added successfully!");
            document.getElementById("addDoctorModal").classList.remove("show");
            loadDoctorCards();
        } else {
            alert(`Failed to add doctor: ${result.message}`);
        }
    } catch (error) {
        console.error("Error adding doctor:", error);
        alert("An unexpected error occurred while adding the doctor.");
    }
}
