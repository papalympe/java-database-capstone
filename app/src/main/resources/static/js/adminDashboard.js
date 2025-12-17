// /js/adminDashboard.js  
import { openModal } from "./components/modals.js";
import { getDoctors, filterDoctors } from "./services/doctorServices.js";
import { createDoctorCard } from "./components/doctorCard.js";

// expose openModal globally so header inline onclick("openModal('addDoctor')") works
window.openModal = openModal;

console.log("adminDashboard.js LOAD");

document.addEventListener("DOMContentLoaded", () => {
  console.log("adminDashboard.js: DOMContentLoaded fired");
  // initial load
  loadDoctorCards();

  // Attach delegated listeners (fallback) so we catch events even if elements are added later
  document.addEventListener("input", (e) => {
    // search input (any element with id 'searchBar' or class 'search-input')
    const target = e.target;
    if (!target) return;
    if (target.id === "searchBar" || target.classList?.contains?.("search-input")) {
      // debounce via simple timeout attached to element
      if (target._debounce) clearTimeout(target._debounce);
      target._debounce = setTimeout(() => filterDoctorsOnChange(), 250);
    }
  });

  document.addEventListener("change", (e) => {
    const target = e.target;
    if (!target) return;
    // time select - support multiple possible ids
    if (["timeFilter", "filterTime", "time"].includes(target.id) ||
        target.classList?.contains?.("filter-dropdown")) {
      filterDoctorsOnChange();
    }
    // specialty select
    if (["specialtyFilter", "filterSpecialty", "specialty"].includes(target.id) ||
        target.classList?.contains?.("filter-dropdown")) {
      filterDoctorsOnChange();
    }
  });

  // save/add doctor btn might be in header -> delegate click too
  document.addEventListener("click", (e) => {
    const el = e.target;
    if (!el) return;
    if (el.id === "addDocBtn") {
      openModal("addDoctor");
    }
  });
});

async function loadDoctorCards() {
  try {
    const result = await getDoctors();
    // getDoctors() returns array OR { doctors: [] } — normalize
    const doctors = Array.isArray(result) ? result : (result?.doctors || result?.data?.doctors || []);
    renderDoctorCards(doctors);
    console.log("Loaded doctors:", doctors.length);
  } catch (err) {
    console.error("loadDoctorCards error:", err);
    const content = document.getElementById("content");
    if (content) content.innerHTML = `<p style="text-align:center;color:red">Failed to load doctors.</p>`;
  }
}

async function filterDoctorsOnChange() {
  // read values using multiple possible ids (backwards compat)
  const name = (document.getElementById("searchBar")?.value
                || document.querySelector(".search-input")?.value
                || "").trim();
  const time = (document.getElementById("timeFilter")?.value
                || document.getElementById("filterTime")?.value
                || "").trim();
  const specialty = (document.getElementById("specialtyFilter")?.value
                      || document.getElementById("filterSpecialty")?.value
                      || "").trim();

  console.log("filter change:", { name, time, specialty });

  try {
    const result = await filterDoctors(name || "", time || "", specialty || "");
    // normalize response
    let doctors = [];
    if (!result) doctors = [];
    else if (Array.isArray(result)) doctors = result;
    else if (Array.isArray(result.doctors)) doctors = result.doctors;
    else if (Array.isArray(result.data?.doctors)) doctors = result.data.doctors;
    else {
      // try to find first array value
      for (const k in result) if (Array.isArray(result[k])) { doctors = result[k]; break; }
    }

    const content = document.getElementById("content");
    if (!content) {
      console.warn("No #content element found");
      return;
    }
    content.innerHTML = "";

    if (!doctors || doctors.length === 0) {
      content.innerHTML = `<p class="text-center" style="padding:20px;color:#666">No doctors found with the given filters.</p>`;
      return;
    }
    renderDoctorCards(doctors);
  } catch (err) {
    console.error("filterDoctorsOnChange error:", err);
    const content = document.getElementById("content");
    if (content) content.innerHTML = `<p style="text-align:center;color:red">Error applying filters.</p>`;
  }
}

function renderDoctorCards(doctors) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) {
    console.warn("renderDoctorCards: #content not present");
    return;
  }
  contentDiv.innerHTML = "";
  for (const doc of doctors) {
    const card = createDoctorCard(doc);
    contentDiv.appendChild(card);
  }
}
