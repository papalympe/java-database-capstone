// /js/patientDashboard.js
import { createDoctorCard } from "./components/doctorCard.js";
import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { patientLogin, patientSignup } from "./services/patientServices.js";

document.addEventListener("DOMContentLoaded", () => {
    loadDoctorCards();

    const signupBtn = document.getElementById("patientSignup");
    if (signupBtn) signupBtn.addEventListener("click", () => openModal("patientSignup"));

    const loginBtn = document.getElementById("patientLogin");
    if (loginBtn) loginBtn.addEventListener("click", () => openModal("patientLogin"));
});

async function loadDoctorCards() {
    try {
        const raw = await getDoctors();

        // Normalize response: accept array OR { doctors: [...] } OR nested shapes
        const doctors = normalizeDoctorsResponse(raw);

        const contentDiv = document.getElementById("content");
        if (!contentDiv) return;
        contentDiv.innerHTML = "";

        if (!Array.isArray(doctors) || doctors.length === 0) {
            contentDiv.innerHTML = `<p style="text-align:center; color:#666">No doctors found.</p>`;
            return;
        }

        doctors.forEach((doc) => {
            const docCard = createDoctorCard(doc, "patient");
            contentDiv.appendChild(docCard);
        });
    } catch (error) {
        console.error("Error loading doctors:", error);
        const content = document.getElementById("content");
        if (content) content.innerHTML = `<p style="text-align:center; color:red;">Failed to load doctors. Please try again later.</p>`;
    }
}

// Attach listeners defensively (elements exist in your HTML)
document.getElementById("searchBar")?.addEventListener("input", filterDoctorsOnChange);
document.getElementById("filterTime")?.addEventListener("change", filterDoctorsOnChange);
document.getElementById("filterSpecialty")?.addEventListener("change", filterDoctorsOnChange);

async function filterDoctorsOnChange() {
    const name = document.getElementById("searchBar")?.value.trim() || null;
    const time = document.getElementById("filterTime")?.value || null;
    const specialty = document.getElementById("filterSpecialty")?.value || null;

    try {
        const raw = await filterDoctors(name, time, specialty);

        const doctors = normalizeDoctorsResponse(raw);

        const contentDiv = document.getElementById("content");
        if (!contentDiv) return;
        contentDiv.innerHTML = "";

        if (!Array.isArray(doctors) || doctors.length === 0) {
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
        // helpful debug output for you while developing
        alert("Error filtering doctors. See console for details.");
    }
}

// Helper: normalize different response shapes to an array of doctors
function normalizeDoctorsResponse(raw) {
    if (!raw) return [];
    // if it's already an array
    if (Array.isArray(raw)) return raw;

    // common shape: { doctors: [...] }
    if (Array.isArray(raw.doctors)) return raw.doctors;

    // nested: { data: { doctors: [...] } }
    if (raw.data && Array.isArray(raw.data.doctors)) return raw.data.doctors;

    // sometimes server returns { doctors: { doctors: [...] } } — try deeper
    if (raw.doctors && typeof raw.doctors === 'object') {
        for (const k of Object.keys(raw.doctors)) {
            if (Array.isArray(raw.doctors[k])) return raw.doctors[k];
        }
    }

    // if one of the top-level properties is an array, return first array found
    for (const k of Object.keys(raw)) {
        if (Array.isArray(raw[k])) return raw[k];
    }

    // fallback: if raw looks like a single doctor object, wrap it
    if (raw.name || raw.email) return [raw];

    return [];
}

// --------------------
// modal handlers kept as globals (if you also use them here)
window.signupPatient = window.signupPatient || async function () {
    const name = document.getElementById("signupName")?.value?.trim() || '';
    const email = document.getElementById("signupEmail")?.value?.trim() || '';
    const password = document.getElementById("signupPassword")?.value?.trim() || '';
    const phone = document.getElementById("signupPhone")?.value?.trim() || '';
    const address = document.getElementById("signupAddress")?.value?.trim() || '';

    try {
        const result = await patientSignup({ name, email, password, phone, address });
        if (result.success) {
            alert(result.message);
            const modal = document.getElementById('modal'); if (modal) modal.style.display = 'none';
            window.location.reload();
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Signup error:", err);
        alert("Signup failed. Please try again.");
    }
};

window.loginPatient = window.loginPatient || async function () {
    const email = (document.getElementById("loginEmail")?.value || document.getElementById("email")?.value || '').trim();
    const password = (document.getElementById("loginPassword")?.value || document.getElementById("password")?.value || '').trim();

    try {
        const response = await patientLogin({ identifier: email, password });
        if (response && response.status === 200) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", "patient");
            alert("Login successful!");
            window.location.href = "/pages/loggedPatientDashboard.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Login failed. Please try again.");
    }
};
