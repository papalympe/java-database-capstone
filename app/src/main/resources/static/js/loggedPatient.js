// /js/loggedPatient.js
import { getDoctors, filterDoctors } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { bookAppointment } from './services/appointmentRecordService.js';

document.addEventListener("DOMContentLoaded", () => {
  initPage();
});

async function initPage() {
  await loadDoctorCards();

  // attach filter listeners safely
  const searchEl = document.getElementById("searchBar");
  const timeEl = document.getElementById("filterTime");
  const specEl = document.getElementById("filterSpecialty");

  if (searchEl) searchEl.addEventListener("input", debounce(filterDoctorsOnChange, 250));
  if (timeEl) timeEl.addEventListener("change", filterDoctorsOnChange);
  if (specEl) specEl.addEventListener("change", filterDoctorsOnChange);
}

async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    const contentDiv = document.getElementById("content");
    if (!contentDiv) {
      console.warn("No #content element on page");
      return;
    }
    contentDiv.innerHTML = "";

    if (!Array.isArray(doctors) || doctors.length === 0) {
      contentDiv.innerHTML = `<p>No doctors found.</p>`;
      return;
    }

    doctors.forEach(doctor => {
      const card = createDoctorCard(doctor);
      contentDiv.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load doctors:", error);
  }
}

export function showBookingOverlay(e, doctor, patient) {
  const ripple = document.createElement("div");
  ripple.classList.add("ripple-overlay");
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
  document.body.appendChild(ripple);

  setTimeout(() => ripple.classList.add("active"), 50);

  const modalApp = document.createElement("div");
  modalApp.classList.add("modalApp");

  // safe availability
  const times = Array.isArray(doctor.availableTimes) ? doctor.availableTimes
              : Array.isArray(doctor.availability) ? doctor.availability
              : [];

  const optionsHtml = times.length ? times.map(t => `<option value="${t}">${t}</option>`).join('') : '';

  modalApp.innerHTML = `
    <div class="modalApp-inner">
      <h2>Book Appointment</h2>
      <input class="input-field" type="text" value="${patient?.name || ''}" disabled />
      <input class="input-field" type="text" value="${doctor?.name || ''}" disabled />
      <input class="input-field" type="text" value="${doctor?.specialty || ''}" disabled/>
      <input class="input-field" type="email" value="${doctor?.email || ''}" disabled/>
      <input class="input-field" type="date" id="appointment-date" />
      <select class="input-field" id="appointment-time">
        <option value="">Select time</option>
        ${optionsHtml}
      </select>
      <button class="confirm-booking">Confirm Booking</button>
      <button class="cancel-booking">Cancel</button>
    </div>
  `;

  document.body.appendChild(modalApp);
  setTimeout(() => modalApp.classList.add("active"), 60);

  modalApp.querySelector(".cancel-booking").addEventListener("click", () => {
    ripple.remove();
    modalApp.remove();
  });

  modalApp.querySelector(".confirm-booking").addEventListener("click", async () => {
    const date = modalApp.querySelector("#appointment-date").value;
    const time = modalApp.querySelector("#appointment-time").value;
    if (!date || !time) return alert("Please pick date and time");

    const token = localStorage.getItem("token");
    const startTime = time.split('-')[0];
    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: patient.id },
      appointmentTime: `${date}T${startTime}:00`,
      status: 0
    };

    const { success, message } = await bookAppointment(appointment, token);
    if (success) {
      alert("Appointment Booked successfully");
      ripple.remove();
      modalApp.remove();
    } else {
      alert("❌ Failed to book an appointment :: " + message);
    }
  });
}

function filterDoctorsOnChange() {
  const searchBarEl = document.getElementById("searchBar");
  const timeEl = document.getElementById("filterTime");
  const specialtyEl = document.getElementById("filterSpecialty");

  const name = searchBarEl ? (searchBarEl.value.trim() || null) : null;
  const time = timeEl ? (timeEl.value || null) : null;
  const specialty = specialtyEl ? (specialtyEl.value || null) : null;

  filterDoctors(name, time, specialty)
    .then(response => {
      const doctors = response?.doctors || response || [];
      const contentDiv = document.getElementById("content");
      if (!contentDiv) return;
      contentDiv.innerHTML = "";

      if (doctors.length > 0) {
        doctors.forEach(doctor => {
          const card = createDoctorCard(doctor);
          contentDiv.appendChild(card);
        });
      } else {
        contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
      }
    })
    .catch(error => {
      console.error("Failed to filter doctors:", error);
      alert("❌ An error occurred while filtering doctors.");
    });
}

function debounce(fn, ms = 250){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), ms);
  };
}
