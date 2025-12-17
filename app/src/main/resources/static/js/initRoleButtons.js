// initRoleButtons.js
// purpose: φορτώνει το services module και συνδέει τα role buttons με το openRoleModal
(async function initRoleButtons() {
  try {
    // δυναμικό import του module που υλοποιεί openRoleModal
    const svc = await import('/js/services/index.js');

    // αν το module εξάγει openRoleModal ως window.openRoleModal ή ως export, βεβαιωνόμαστε
    const opener = window.openRoleModal || svc.openRoleModal || svc.openRoleModal?.default;
    if (!opener && !window.openRoleModal) {
      console.warn('openRoleModal not found after importing services module. svc keys:', Object.keys(svc));
    }

    const adminBtn = document.getElementById('adminBtn');
    const doctorBtn = document.getElementById('doctorBtn');
    const patientBtn = document.getElementById('patientBtn');

    if (adminBtn) adminBtn.addEventListener('click', () => {
      // προτίμησε το window.openRoleModal (το module συνήθως το βάζει εκεί)
      if (typeof window.openRoleModal === 'function') window.openRoleModal('admin');
      else if (typeof opener === 'function') opener('admin');
      else console.error('openRoleModal not available');
    });

    if (doctorBtn) doctorBtn.addEventListener('click', () => {
      if (typeof window.openRoleModal === 'function') window.openRoleModal('doctor');
      else if (typeof opener === 'function') opener('doctor');
      else console.error('openRoleModal not available');
    });

    if (patientBtn) patientBtn.addEventListener('click', () => {
      if (typeof window.openRoleModal === 'function') window.openRoleModal('patient');
      else if (typeof opener === 'function') opener('patient');
      else console.error('openRoleModal not available');
    });

    console.log('initRoleButtons: handlers attached');

  } catch (err) {
    console.error('initRoleButtons: failed to import services module or attach handlers', err);
  }
})();
