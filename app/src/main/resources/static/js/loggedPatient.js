import { getDoctors, filterDoctors } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';
import { bookAppointment } from './services/appointmentRecordService.js';
import { getPatientData } from './services/patientServices.js'; // <<-- νέο import

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

/**
 * Show booking overlay.
 * Now: if 'patient' not provided, fetch patient info from backend using token.
 * Ensure appointmentTime format includes seconds.
 */
export async function showBookingOverlay(e, doctor, patient) {
  // if patient not passed in, try to fetch using token
  let resolvedPatient = patient;
  if (!resolvedPatient) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login as patient to book an appointment.");
      return;
    }
    try {
      const pd = await getPatientData(token);
      if (!pd || !pd.id) {
        alert("Unable to read patient data. Please login again.");
        return;
      }
      // patient service returns top-level fields (id,name,...)
      resolvedPatient = {
        id: pd.id,
        name: pd.name,
        email: pd.email,
        phone: pd.phone
      };
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
      alert("Unable to get patient details. Please try again.");
      return;
    }
  }

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
      <input class="input-field" type="text" value="${resolvedPatient?.name || ''}" disabled />
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
    if (!token) return alert("Please login to book an appointment");

    // take start part if range like "09:00-10:00"
    let startTime = time.split('-')[0].trim();

    // ensure seconds: "HH:MM" -> "HH:MM:00"
    if (/^\d{2}:\d{2}$/.test(startTime)) startTime = `${startTime}:00`;

    const appointment = {
      doctor: { id: doctor.id },
      patient: { id: resolvedPatient.id },
      appointmentTime: `${date}T${startTime}`, // e.g. 2025-12-23T09:00:00
      status: 0
    };

    console.log("Attempt booking appointment:", appointment);

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
