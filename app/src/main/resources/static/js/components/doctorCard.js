// ================================
// /js/components/doctorCard.js
// Creates a dynamic doctor card component with role-based actions
// ================================

// Import helper functions
import { showBookingOverlay } from "../loggedPatient.js";
import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";;

/**
 * Creates a DOM element representing a single doctor card
 * @param {Object} doctor - The doctor object containing info like name, specialty, email, availability
 * @returns {HTMLElement} - The complete doctor card element
 */
export function createDoctorCard(doctor) {
  // Create main card container
  const card = document.createElement("div");
  card.classList.add("doctor-card");

  // Fetch the current user's role
  const role = localStorage.getItem("userRole");

  // Create doctor info section
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  const name = document.createElement("h3");
  name.textContent = doctor.name;

  const specialization = document.createElement("p");
  specialization.textContent = `Specialty: ${doctor.specialty}`;

  const email = document.createElement("p");
  email.textContent = `Email: ${doctor.email}`;

  const availability = document.createElement("p");
  availability.textContent = `Availability: ${doctor.availability.join(", ")}`;

  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  // Create action buttons container
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");

  // === Admin Actions ===
  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";
    removeBtn.addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) {
        try {
          const token = localStorage.getItem("token");
          const result = await deleteDoctor(doctor.id, token);
          if (result.success) {
            alert("Doctor deleted successfully.");
            card.remove();
          } else {
            alert("Failed to delete doctor. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting doctor:", error);
          alert("An error occurred while deleting the doctor.");
        }
      }
    });
    actionsDiv.appendChild(removeBtn);
  }
  // === Patient (not logged-in) Actions ===
  else if (role === "patient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";
    bookNow.addEventListener("click", () => {
      alert("Patient needs to login first.");
    });
    actionsDiv.appendChild(bookNow);
  }
  // === Logged-in Patient Actions ===
  else if (role === "loggedPatient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";
    bookNow.addEventListener("click", async (e) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Session expired. Please log in again.");
          window.location.href = "/pages/patientDashboard.html";
          return;
        }
        const patientData = await getPatientData(token);
        showBookingOverlay(e, doctor, patientData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        alert("Could not fetch patient data. Please try again.");
      }
    });
    actionsDiv.appendChild(bookNow);
  }

  // Append info and actions to the card
  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}
