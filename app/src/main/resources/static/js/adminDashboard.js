// adminDashboard.js  (αντικατέστησε το υπάρχον)
import { openModal } from "../components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { createDoctorCard } from "../components/doctorCard.js";

document.addEventListener("DOMContentLoaded", () => {
  // safe element refs
  const searchEl = document.getElementById("searchBar");
  const timeEl = document.getElementById("timeFilter");
  const specEl = document.getElementById("specialtyFilter");
  const addDocBtn = document.getElementById("addDocBtn");

  if (addDocBtn) addDocBtn.addEventListener("click", () => openModal("addDoctor"));

  // Load initial doctors
  loadDoctorCards();

  // Attach listeners if elements exist (guarded)
  if (searchEl) searchEl.addEventListener("input", debounce(filterDoctorsOnChange, 300));
  if (timeEl) timeEl.addEventListener("change", filterDoctorsOnChange);
  if (specEl) specEl.addEventListener("change", filterDoctorsOnChange);
});

async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    renderDoctorCards(Array.isArray(doctors) ? doctors : (doctors?.doctors || []));
  } catch (err) {
    console.error("loadDoctorCards error:", err);
    document.getElementById("content").innerHTML = `<p style="text-align:center;color:red">Failed to load doctors.</p>`;
  }
}

async function filterDoctorsOnChange() {
  try {
    const name = document.getElementById("searchBar")?.value.trim() || '';
    const time = document.getElementById("timeFilter")?.value || '';
    const specialty = document.getElementById("specialtyFilter")?.value || '';

    // Call service
    const result = await filterDoctors(name, time, specialty);

    // Support both shapes: array OR { doctors: [...] }
    let doctors = [];
    if (!result) {
      doctors = [];
    } else if (Array.isArray(result)) {
      doctors = result;
    } else if (Array.isArray(result.doctors)) {
      doctors = result.doctors;
    } else if (Array.isArray(result?.data?.doctors)) {
      doctors = result.data.doctors;
    } else {
      // worst case: try to introspect
      for (const k in result) {
        if (Array.isArray(result[k])) { doctors = result[k]; break; }
      }
    }

    const content = document.getElementById("content");
    content.innerHTML = "";

    if (!doctors || doctors.length === 0) {
      content.innerHTML = `<p class="text-center" style="padding:20px;color:#666">No doctors found with the given filters.</p>`;
      return;
    }

    renderDoctorCards(doctors);
  } catch (err) {
    console.error("filterDoctorsOnChange error:", err);
    document.getElementById("content").innerHTML = `<p style="text-align:center;color:red">Error applying filters.</p>`;
  }
}

function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;
  contentDiv.innerHTML = "";
  for (const doc of doctors) {
    const card = createDoctorCard(doc);
    contentDiv.appendChild(card);
  }
}

/* small debounce helper to avoid too many network calls while typing */
function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
