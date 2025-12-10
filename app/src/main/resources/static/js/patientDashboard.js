/*  
    Patient Dashboard Logic

    - Loads all doctors on page load
    - Provides search + filter by time + specialty
    - Handles patient signup & login using modals
    - Renders doctor cards dynamically
*/

// -----------------------------------------
// 🔹 IMPORT REQUIRED MODULES
// -----------------------------------------
import { createDoctorCard } from "./components/doctorCard.js";
import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { patientLogin, patientSignup } from "./services/patientServices.js";

// -----------------------------------------
// 🔹 LOAD DOCTOR CARDS ON PAGE LOAD
// -----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadDoctorCards();

    // Signup modal trigger
    const signupBtn = document.getElementById("patientSignup");
    if (signupBtn) {
        signupBtn.addEventListener("click", () => openModal("patientSignup"));
    }

    // Login modal trigger
    const loginBtn = document.getElementById("patientLogin");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => openModal("patientLogin"));
    }
});

// -----------------------------------------
// 🔹 FUNCTION: loadDoctorCards()
// -----------------------------------------
async function loadDoctorCards() {
    try {
        const doctors = await getDoctors();

        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = "";

        doctors.forEach((doc) => {
            const docCard = createDoctorCard(doc, "patient");
            contentDiv.appendChild(docCard);
        });
    } catch (error) {
        console.error("Error loading doctors:", error);

        document.getElementById("content").innerHTML = `
            <p style="text-align:center; color:red;">
                Failed to load doctors. Please try again later.
            </p>`;
    }
}

// -----------------------------------------
// 🔹 SEARCH & FILTER EVENT LISTENERS
// -----------------------------------------
document.getElementById("searchBar").addEventListener("input", filterDoctorsOnChange);
document.getElementById("filterTime").addEventListener("change", filterDoctorsOnChange);
document.getElementById("filterSpecialty").addEventListener("change", filterDoctorsOnChange);

// -----------------------------------------
// 🔹 FUNCTION: filterDoctorsOnChange()
// -----------------------------------------
async function filterDoctorsOnChange() {
    const name = document.getElementById("searchBar").value.trim() || null;
    const time = document.getElementById("filterTime").value || null;
    const specialty = document.getElementById("filterSpecialty").value || null;

    try {
        const doctors = await filterDoctors(name, time, specialty);

        const contentDiv = document.getElementById("content");
        contentDiv.innerHTML = "";

        if (!doctors || doctors.length === 0) {
            contentDiv.innerHTML = `
                <p style="text-align:center; padding: 10px;">
                    No doctors found with the given filters.
                </p>`;
            return;
        }

        doctors.forEach((doc) => {
            const docCard = createDoctorCard(doc, "patient");
            contentDiv.appendChild(docCard);
        });
    } catch (error) {
        console.error("Filter error:", error);
        alert("Error filtering doctors. Please try again.");
    }
}

// -------------------------------------------------------
// 🔹 PATIENT SIGNUP HANDLER
// -------------------------------------------------------
window.signupPatient = async function () {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const address = document.getElementById("signupAddress").value.trim();

    const data = { name, email, password, phone, address };

    try {
        const result = await patientSignup(data);

        if (result.success) {
            alert(result.message);

            // Close signup modal
            document.getElementById("modal-overlay").style.display = "none";

            // Reload page
            window.location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed. Please try again.");
    }
};

// -------------------------------------------------------
// 🔹 PATIENT LOGIN HANDLER
// -------------------------------------------------------
window.loginPatient = async function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
        const response = await patientLogin({ email, password });

        if (response.status === 200) {
            const data = await response.json();

            localStorage.setItem("patientToken", data.token);

            alert("Login successful!");

            window.location.href = "loggedPatientDashboard.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
};

