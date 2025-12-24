// js/addPrescription.js
import { savePrescription, getPrescription } from "./services/prescriptionServices.js";

document.addEventListener('DOMContentLoaded', async () => {
  const savePrescriptionBtn = document.getElementById("savePrescription");
  const patientNameInput = document.getElementById("patientName");
  const medicinesInput = document.getElementById("medicines");
  const dosageInput = document.getElementById("dosage");
  const notesInput = document.getElementById("notes");
  const heading = document.getElementById("heading");

  const urlParams = new URLSearchParams(window.location.search);
  let appointmentId = urlParams.get("appointmentId");
  const mode = urlParams.get("mode");
  const token = localStorage.getItem("token");
  const patientName = urlParams.get("patientName");

  // Ensure appointmentId is a number (frontend fix)
  if (appointmentId !== null) {
    const n = Number(appointmentId);
    appointmentId = Number.isFinite(n) ? n : appointmentId; // keep original if not numeric
  }

  if (heading) {
    heading.innerHTML = mode === "view" ? `View <span>Prescription</span>` : `Add <span>Prescription</span>`;
  }

  if (patientNameInput && patientName) {
    patientNameInput.value = patientName;
  }

  // Try to load existing prescription
  if (appointmentId && token) {
    try {
      const response = await getPrescription(appointmentId, token);
      console.log("getPrescription :: ", response);

      if (response && Array.isArray(response.prescription) && response.prescription.length > 0) {
        const existingPrescription = response.prescription[0];
        patientNameInput.value = existingPrescription.patientName || '';
        medicinesInput.value = existingPrescription.medication || "";
        dosageInput.value = existingPrescription.dosage || "";
        notesInput.value = existingPrescription.doctorNotes || "";
      } else {
        console.log("No prescription found for appointmentId:", appointmentId);
      }
    } catch (error) {
      console.warn("No existing prescription found or failed to load:", error);
    }
  }

  if (mode === 'view') {
    patientNameInput.disabled = true;
    medicinesInput.disabled = true;
    dosageInput.disabled = true;
    notesInput.disabled = true;
    if (savePrescriptionBtn) savePrescriptionBtn.style.display = "none";
  }

  savePrescriptionBtn?.addEventListener('click', async (e) => {
    e.preventDefault();

    const prescription = {
      patientName: patientNameInput.value,
      medication: medicinesInput.value,
      dosage: dosageInput.value,
      doctorNotes: notesInput.value,
      appointmentId // now a number (if parse succeeded)
    };

    console.log("Attempting to save prescription (frontend):", prescription);

    try {
      const { success, message } = await savePrescription(prescription, token);
      console.log("savePrescription result:", { success, message });
      if (success) {
        alert("✅ Prescription saved successfully.");
        selectRole('doctor');
      } else {
        alert("❌ Failed to save prescription. " + message);
      }
    } catch (err) {
      console.error("Unexpected error while saving prescription:", err);
      alert("❌ Unexpected error while saving prescription. See console.");
    }
  });
});
