// modals.js

function ensureModalExists() {
  if (!document.getElementById("modal")) {
    document.body.insertAdjacentHTML("beforeend", `
      <div id="modal" class="modal" style="display:none;">
        <span id="closeModal" class="close">&times;</span>
        <div id="modal-body"></div>
      </div>
    `);
  }
}

export function openModal(type) {
  ensureModalExists();

  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = document.getElementById("closeModal");

  let modalContent = "";

  switch (type) {
    case "addDoctor":
      modalContent = `
        <h2>Add Doctor</h2>
        <input id="doctorName" placeholder="Doctor Name" class="input-field">
        <select id="specialization" class="input-field">
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
        <h2>Admin Login</h2>
        <input id="username" placeholder="Username" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="adminLoginBtn" class="dashboard-btn">Login</button>
      `;
      break;

    case "doctorLogin":
      modalContent = `
        <h2>Doctor Login</h2>
        <input id="email" placeholder="Email" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="doctorLoginBtn" class="dashboard-btn">Login</button>
      `;
      break;

    case "patientLogin":
      modalContent = `
        <h2>Patient Login</h2>
        <input id="email" placeholder="Email" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="loginBtn" class="dashboard-btn">Login</button>
      `;
      break;

    case "patientSignup":
      modalContent = `
        <h2>Patient Signup</h2>
        <input id="name" placeholder="Name" class="input-field">
        <input id="email" placeholder="Email" class="input-field">
        <input id="password" type="password" placeholder="Password" class="input-field">
        <button id="signupBtn" class="dashboard-btn">Signup</button>
      `;
      break;
  }

  modalBody.innerHTML = modalContent;
  modal.style.display = "block";

  closeBtn.onclick = () => modal.style.display = "none";

  // 🔑 IMPORTANT: call GLOBAL handlers
  if (type === "adminLogin")
    document.getElementById("adminLoginBtn").onclick = () => window.adminLoginHandler();

  if (type === "doctorLogin")
    document.getElementById("doctorLoginBtn").onclick = () => window.doctorLoginHandler();

  if (type === "patientLogin")
    document.getElementById("loginBtn").onclick = () => window.loginPatient();

  if (type === "patientSignup")
    document.getElementById("signupBtn").onclick = () => window.signupPatient();

  if (type === "addDoctor")
    document.getElementById("saveDoctorBtn").onclick = () => window.adminAddDoctor();
}
