// /js/components/doctorCard.js
import { showBookingOverlay } from "../loggedPatient.js";
import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";

/**
 * Creates a DOM element representing a single doctor card
 */
export function createDoctorCard(doctor) {
  const card = document.createElement("div");
  card.classList.add("doctor-card");

  const role = localStorage.getItem("userRole") || "";

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  const name = document.createElement("h3");
  name.textContent = doctor.name || "Unnamed Doctor";

  const specialization = document.createElement("p");
  specialization.textContent = `Specialty: ${doctor.specialty || "Not specified"}`;

  const email = document.createElement("p");
  email.textContent = `Email: ${doctor.email || "Not specified"}`;

  // robust availability handling
  const availabilityArr = Array.isArray(doctor.availability) ? doctor.availability
    : Array.isArray(doctor.availableTimes) ? doctor.availableTimes
    : Array.isArray(doctor.available_time) ? doctor.available_time
    : [];

  const availabilityText = availabilityArr.length ? availabilityArr.join(", ") : "Not specified";
  const availability = document.createElement("p");
  availability.textContent = `Availability: ${availabilityText}`;

  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");

  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";
    removeBtn.addEventListener("click", async () => {
      if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) return;
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
    });
    actionsDiv.appendChild(removeBtn);
  } else if (role === "patient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";
    bookNow.addEventListener("click", () => alert("Patient needs to login first."));
    actionsDiv.appendChild(bookNow);
  } else if (role === "loggedPatient") {
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

  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}
