// /js/components/modals.js
function ensureModalExists() {
  if (document.getElementById("modal")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div id="modal" class="modal" style="display:none;" aria-hidden="true">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button id="closeModal" class="close" aria-label="Close modal">&times;</button>
        <div id="modal-body"></div>
      </div>
    </div>
  `);
  console.log("modals.js -> modal element injected");
}

export function openModal(type) {
  ensureModalExists();

  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = document.getElementById("closeModal");

  if (!modal || !modalBody || !closeBtn) {
    console.error("modals.js -> modal elements not present");
    return;
  }

  console.log("openModal CALLED with:", type);

  // Reset body
  modalBody.innerHTML = "";

  // Build content
  let modalContent = "";
  switch (type) {
    case "addDoctor":
      modalContent = `
        <h2 id="modal-title">Add Doctor</h2>
        <input id="doctorName" placeholder="Doctor Name" class="input-field">
        <select id="specialization" class="input-field select-dropdown">
          <option value="">Specialization</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dentist">Dentist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Neurologist">Neurologist</option>
          <option value="Pediatrician">Pediatrician</option>
        </select>
        <input id="doctorEmail" placeholder="Email" class="input-field">
        <input id="doctorPassword" type="password" placeholder="Password" class="input-field">
        <button id="saveDoctorBtn" class="dashboard-btn">Save</button>
      `;
      break;

    case "adminLogin":
      modalContent = `
        <h2 id="modal-title">Admin Login</h2>
        <input id="username" placeholder="Username" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="adminLoginBtn" class="dashboard-btn">Login</button>
      `;
      break;

    case "doctorLogin":
      modalContent = `
        <h2 id="modal-title">Doctor Login</h2>
        <input id="email" placeholder="Email" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="doctorLoginBtn" class="dashboard-btn">Login</button>
      `;
      break;

    case "patientLogin":
      modalContent = `
        <h2 id="modal-title">Patient Login</h2>
        <input id="email" placeholder="Email" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="loginBtn" class="dashboard-btn">Login</button>
      `;
      break;

    case "patientSignup":
      modalContent = `
        <h2 id="modal-title">Patient Signup</h2>
        <input id="name" placeholder="Name" class="input-field">
        <input id="email" placeholder="Email" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="signupBtn" class="dashboard-btn">Signup</button>
      `;
      break;

    default:
      modalContent = `<p>Unknown modal type: ${type}</p>`;
  }

  // Insert content and show
  modalBody.innerHTML = modalContent;
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // prevent background scroll

  // ---- Close helpers ----
  const closeModal = () => {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.removeEventListener("keydown", escHandler);
    modal.removeEventListener("click", outsideClickHandler);
  };

  const escHandler = (e) => {
    if (e.key === "Escape") closeModal();
  };

  // click outside to close
  const outsideClickHandler = (e) => {
    if (e.target === modal) closeModal();
  };

  closeBtn.onclick = closeModal;
  modal.addEventListener("click", outsideClickHandler);
  window.addEventListener("keydown", escHandler);

  // ---- Wire action buttons to globals safely ----
  const safeBind = (selector, handlerName) => {
    const btn = modalBody.querySelector(selector);
    if (!btn) return;
    btn.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (typeof window[handlerName] === "function") {
        try {
          window[handlerName]();
        } catch (err) {
          console.error(`${handlerName} threw:`, err);
        }
      } else {
        console.warn(`${handlerName} not defined on window`);
      }
    });
  };

  safeBind("#adminLoginBtn", "adminLoginHandler");
  safeBind("#doctorLoginBtn", "doctorLoginHandler");
  safeBind("#loginBtn", "loginPatient");
  safeBind("#signupBtn", "signupPatient");
  safeBind("#saveDoctorBtn", "adminAddDoctor");

  // focus first input for accessibility
  const firstInput = modalBody.querySelector("input, select, button");
  if (firstInput) firstInput.focus();

  console.log("modal opened:", type);
}

// Make openModal available to legacy / non-module code (inline onclicks etc.)
if (typeof window !== "undefined") window.openModal = openModal;

// default export
export default openModal;
