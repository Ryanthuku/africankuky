let patientChartInstance = null;
let labChartInstance = null;
let pharmacyChartInstance = null;
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('doctor-login-form')?.addEventListener('submit', loginUser);
  document.getElementById('admin-login-form')?.addEventListener('submit', loginUser);
  document.getElementById('register-form')?.addEventListener('submit', registerPatient);
  document.getElementById('profile-form')?.addEventListener('submit', updateProfile);
  document.getElementById('add-medication-form')?.addEventListener('submit', addMedication);
  document.getElementById('add-lab-form')?.addEventListener('submit', addLabRecord);
  document.getElementById('register-doctor-form')?.addEventListener('submit', registerDoctor);
  document.getElementById('register-admin-form')?.addEventListener('submit', registerAdmin);
  document.getElementById('book-appointment-form')?.addEventListener('submit', bookAppointment);

  // Populate dropdowns initially
  populateAllDoctorDropdowns();
  populatePatientDropdown();

  // Re-populate doctor dropdowns on focus
  document.getElementById('assigned_doctor_patients')?.addEventListener('focus', populateAllDoctorDropdowns);
  document.getElementById('assigned_doctor_lab')?.addEventListener('focus', populateAllDoctorDropdowns);
  // Re-populate patient dropdown on focus
  document.getElementById('lab-patient-id')?.addEventListener('focus', populatePatientDropdown);

  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    showLoginForm('doctor');
    if (document.querySelector('.tabs button')) setActiveTab(document.querySelector('.tabs button'));
    return;
  }

  if (user.role === 'doctor') {
    loadDoctorPatients(user.id);
    loadLabResults(user.id);
    loadPharmacyView();
    loadProfile();
    loadDoctorAppointments(user.name);
  } else if (user.role === 'admin') {
    loadAllPatients();
    loadPharmacyInventory();
    loadLabPanel();
    loadAnalytics();
    loadProfile();
  }
});

// Dummy updateProfile function to prevent JS errors
function updateProfile(event) {
  event.preventDefault();
  showAlert('Profile update not implemented yet.', 'info');
}

// Register Doctor (saves to 'users' table)
async function registerDoctor(event) {
  event.preventDefault();
  const form = event.target;
  const username = form.querySelector('input[name="username"]').value.trim();
  const name = form.querySelector('input[name="name"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/register_doctor.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, name, email, password, role: 'doctor' })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.success) {
      showAlert('Doctor registered successfully.', 'success');
      form.reset();
      populateAllDoctorDropdowns();
    } else {
      showAlert(data.error || 'Failed to register doctor.', 'error');
    }
  } catch (err) {
    showAlert('Failed to register doctor. Please try again later.', 'error');
  }
}

// Register Admin (saves to 'users' table)
async function registerAdmin(event) {
  event.preventDefault();
  const form = event.target;
  const username = form.querySelector('input[name="username"]').value.trim();
  const name = form.querySelector('input[name="name"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value;

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/register_admin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, name, email, password, role: 'admin' })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.success) {
      showAlert('Admin registered successfully.', 'success');
      form.reset();
    } else {
      showAlert(data.error || 'Failed to register admin.', 'error');
    }
  } catch (err) {
    showAlert('Failed to register admin. Please try again later.', 'error');
  }
}

// Register Patient (saves to 'patients' table)
async function registerPatient(event) {
  event.preventDefault();
  const first_name = document.getElementById('register-name')?.value.trim();
  const dob = document.getElementById('register-dob')?.value;
  const address = document.getElementById('register-address')?.value.trim();
  const mobile = document.getElementById('register-mobile')?.value.trim();
  const ailment = document.getElementById('register-ailment')?.value.trim();
  const assigned_doctor_id = document.getElementById('assigned_doctor_patients')?.value || '';
  const appointment_date = document.getElementById('register-appointment-date')?.value || '';

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/register_patients.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ first_name, dob, address, mobile, ailment, assigned_doctor_id, appointment_date })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.success || data.message) {
      showAlert('Patient registered successfully.', 'success');
      loadAllPatients();
      document.getElementById('register-form').reset();
    } else {
      showAlert(data.error || 'Registration failed.', 'error');
    }
  } catch (err) {
    showAlert('Failed to register patient. Please try again later.', 'error');
  }
}

// Load all patients and render in table
async function loadAllPatients() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/patients.php', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patients');
    const patients = await res.json();
    const tbody = document.getElementById('patients-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    patients.forEach(p => {
      tbody.innerHTML += `<tr>
      <td>${p.id || p.patient_id}</td>
      <td>${p.first_name || p.name}</td>
      <td>${p.dob || ''}</td>
      <td>${p.address || ''}</td>
      <td>${p.mobile || ''}</td>
      <td>${p.ailment || ''}</td>
      <td>${p.assigned_doctor_id || ''}</td>
      <td>${p.status || ''}</td>
      <td>
        <button onclick="editPatient(${p.id || p.patient_id})">Edit</button>
        <button onclick="deletePatient(${p.id || p.patient_id})">Delete</button>
      </td>
    </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load patients.', 'error');
  }
}

// Add Medication (saves to 'medications' table)
async function addMedication(event) {
  event.preventDefault();
  const form = event.target;
  const drug_name = form.querySelector('input[name="drug_name"]').value.trim();
  const stock = form.querySelector('input[name="stock"]').value.trim();
  const expiry = form.querySelector('input[name="expiry"]').value;
  const manufacturer = form.querySelector('input[name="manufacturer"]').value.trim();

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/medications.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ drug_name, stock, expiry, manufacturer })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.message) {
      showAlert('Medication added successfully.', 'success');
      loadPharmacyInventory();
      form.reset();
    } else {
      showAlert(data.error || 'Failed to add medication.', 'error');
    }
  } catch (err) {
    showAlert('Failed to add medication. Please try again later.', 'error');
  }
}

// Load all medications and render in table
async function loadPharmacyInventory() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/medications.php', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch medications');
    const meds = await res.json();
    const tbody = document.getElementById('pharmacy-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    meds.forEach(med => {
      tbody.innerHTML += `<tr>
        <td>${med.drug_name}</td>
        <td>${med.stock}</td>
        <td>${med.expiry}</td>
        <td>${med.manufacturer}</td>
        <td>
          <button onclick="editMedication('${med.id}')">Edit</button>
          <button onclick="deleteMedication('${med.id}')">Delete</button>
        </td>
      </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load medications.', 'error');
  }
}

// Add Lab Record (saves to 'labrecord' table)
async function addLabRecord(event) {
  event.preventDefault();
  const patient_id = document.getElementById('lab-patient-id').value.trim();
  const test_type = document.getElementById('lab-test').value.trim();
  const test_date = document.getElementById('lab-date').value;
  const result = document.getElementById('lab-result').value.trim();
  const doctor_id = document.getElementById('assigned_doctor_lab')?.value || null;

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/lab_records.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ patient_id, test_type, test_date, result, doctor_id })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.message) {
      showAlert('Lab record added successfully.', 'success');
      loadLabPanel();
      event.target.reset();
    } else {
      showAlert(data.error || 'Failed to add lab record.', 'error');
    }
  } catch (err) {
    showAlert('Failed to add lab record. Please try again later.', 'error');
  }
}
// Load all lab records and render in table
async function loadLabPanel() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/lab_records.php', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch lab records');
    const labs = await res.json();
    const tbody = document.getElementById('lab-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    labs.forEach(lab => {
      tbody.innerHTML += `<tr>
        <td>${lab.patient_id}</td>
        <td>${lab.test_type}</td>
        <td>${lab.test_date}</td>
        <td>${lab.result}</td>
        <td>${lab.doctor_id || ''}</td>
        <td>
          <button onclick="editLabRecord('${lab.id || lab.lab_id}')">Edit</button>
          <button onclick="deleteLabRecord('${lab.id || lab.lab_id}')">Delete</button>
        </td>
      </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load lab records.', 'error');
  }
}

// Unified doctor dropdowns
async function populateAllDoctorDropdowns() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/users.php?role=doctor', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch doctors');
    const doctors = await res.json();
    const dropdownIds = ['assigned_doctor_patients', 'assigned_doctor_lab', 'appt-doctor'];
    dropdownIds.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Assign to Doctor</option>';
        doctors.forEach(doc => {
          select.innerHTML += `<option value="${doc.id}">${doc.name}</option>`;
        });
        if (currentValue) select.value = currentValue;
      }
    });
  } catch (e) {
    console.error('Failed to load doctors:', e);
  }
}

// Populate patient dropdown for lab record form
async function populatePatientDropdown() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/patients.php', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patients');
    const patients = await res.json();
    const select = document.getElementById('lab-patient-id');
    if (select) {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Select Patient</option>';
      patients.forEach(p => {
        const pid = p.id || p.patient_id;
        select.innerHTML += `<option value="${pid}">${p.first_name || p.name} (ID: ${pid})</option>`;
      });
      if (currentValue) select.value = currentValue;
    }
  } catch (e) {
    console.error('Failed to load patients:', e);
  }
}

// Filtering and utility functions
function filterPatients(query) {
  const rows = document.querySelectorAll('#patients-list tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}

function filterMedications(query) {
  const rows = document.querySelectorAll('#pharmacy-list tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}

// Filter lab records
function filterLabRecords(query) {
  const rows = document.querySelectorAll('#lab-list tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
  });
}
function showPage(pageId) {
  document.querySelectorAll('.page-content').forEach(sec => {
    sec.style.display = (sec.id === pageId) ? 'block' : 'none';
  });
  // Repopulate dropdowns when relevant panels are shown
  if (['patients-panel', 'lab-panel'].includes(pageId)) {
    populateAllDoctorDropdowns();
  }
  if (pageId === 'lab-panel') {
    populatePatientDropdown();
    loadLabPanel();
  }
  // Move this AFTER setting display, so canvas is visible
  if (pageId === 'analytics-panel') {
    setTimeout(loadAnalytics, 100); // Give DOM time to render
  }
}

function logout() {
  sessionStorage.removeItem('user');
  window.location.href = 'HMS_2.html';
}

// Alert function for notifications
function showAlert(message, type = 'info') {
  // type can be 'success', 'error', 'info', etc.
  let color = '#007bff';
  if (type === 'success') color = '#28a745';
  if (type === 'error') color = '#dc3545';

  // Remove any existing alert
  document.getElementById('hms-alert')?.remove();

  // Create alert div
  const alertDiv = document.createElement('div');
  alertDiv.id = 'hms-alert';
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = 9999;
  alertDiv.style.background = color;
  alertDiv.style.color = '#fff';
  alertDiv.style.padding = '12px 24px';
  alertDiv.style.borderRadius = '4px';
  alertDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
  alertDiv.innerText = message;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3500);
}
async function updateNotes(event) {
  event.preventDefault();
  const form = event.target;
  const patient_id = form.patient_id.value.trim();
  const notes = form.notes.value.trim();

  // Get doctor_id from logged-in user
  const user = JSON.parse(sessionStorage.getItem('user'));
  const doctor_id = user?.id;

  if (!patient_id || !notes || !doctor_id) {
    showAlert('Patient ID, doctor ID, and notes are required.', 'error');
    return;
  }

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/doctor_notes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ patient_id, doctor_id, notes })
    });
    const data = await res.json();
    if (res.ok && data.message) {
      showAlert('Notes updated successfully.', 'success');
      form.reset();
      loadDoctorPatients(); // Refresh patient list if needed
    } else {
      showAlert(data.error || 'Failed to update notes.', 'error');
    }
  } catch (e) {
    showAlert('Failed to update notes.', 'error');
  }
}
function prescribeMedication(event) {
  event.preventDefault();
  const form = event.target;
  const patient_id = form.patient_id.value.trim();
  const medication = form.medication.value.trim();

  // Get doctor_id from logged-in user
  const user = JSON.parse(sessionStorage.getItem('user'));
  const doctor_id = user?.id;

  if (!patient_id || !medication || !doctor_id) {
    showAlert('Patient ID, medication, and doctor ID are required.', 'error');
    return;
  }

  fetch('http://127.0.0.1/jubilee%20hms/backend/prescriptions.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ patient_id, medication, doctor_id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success || data.message) {
      showAlert('Prescription added successfully.', 'success');
      form.reset();
    } else {
      showAlert(data.error || 'Failed to add prescription.', 'error');
    }
  })
  .catch(() => showAlert('Failed to add prescription.', 'error'));
}
function requestLabTest(event) {
  event.preventDefault();
  const form = event.target;
  const patient_id = form.patient_id.value.trim();
  const test_type = form.test_type.value.trim();

  // Get doctor_id from logged-in user
  const user = JSON.parse(sessionStorage.getItem('user'));
  const doctor_id = user?.id;

  if (!patient_id || !test_type || !doctor_id) {
    showAlert('Patient ID, test type, and doctor ID are required.', 'error');
    return;
  }

  fetch('http://127.0.0.1/jubilee%20hms/backend/lab_records.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      patient_id,
      test_type,
      doctor_id,
      test_date: new Date().toISOString().slice(0, 10),
      result: ''
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success || data.message) {
      showAlert('Lab test requested successfully.', 'success');
      form.reset();
    } else {
      showAlert(data.error || 'Failed to request lab test.', 'error');
    }
  })
  .catch(() => showAlert('Failed to request lab test.', 'error'));
}

// Load patients assigned to the logged-in doctor and render in table
async function loadDoctorPatients(doctorId) {
  try {
    const res = await fetch(`http://127.0.0.1/jubilee%20hms/backend/patients.php?assigned_doctor_id=${doctorId}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patients');
    const patients = await res.json();
    const tbody = document.getElementById('doctor-patient-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    patients.forEach(p => {
      tbody.innerHTML += `<tr>
        <td>${p.id || p.patient_id}</td>
        <td>${p.first_name || p.name}</td>
        <td>${p.mobile || ''}</td>
        <td>${p.ailment || ''}</td>
        <td>${p.status || ''}</td>
        <td>${p.notes || ''}</td>
        <td>
          <button onclick="editPatient('${p.id || p.patient_id}')">Edit</button>
          <button onclick="deletePatient('${p.id || p.patient_id}')">Delete</button>
        </td>
      </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load patients.', 'error');
  }
}

// Load lab results for the logged-in doctor and render in table
async function loadLabResults(doctorId) {
  try {
    const res = await fetch(`http://127.0.0.1/jubilee%20hms/backend/lab_records.php?doctor_id=${doctorId}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch lab results');
    const labs = await res.json();
    const tbody = document.getElementById('doctor-lab-results');
    if (!tbody) return;
    tbody.innerHTML = '';
    labs.forEach(lab => {
      tbody.innerHTML += `<tr>
        <td>${lab.patient_id}</td>
        <td>${lab.test_type}</td>
        <td>${lab.test_date}</td>
        <td>${lab.result}</td>
      </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load lab results.', 'error');
  }
}

// Load all medications and render in doctor's pharmacy table
async function loadPharmacyView() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/medications.php', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch medications');
    const meds = await res.json();
    const tbody = document.getElementById('doctor-pharmacy-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    meds.forEach(med => {
      tbody.innerHTML += `<tr>
        <td>${med.drug_name}</td>
        <td>${med.stock}</td>
        <td>${med.expiry}</td>
      </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load medications.', 'error');
  }
}

// Optionally, implement doctor appointments loader if needed:
async function loadDoctorAppointments(doctorName) {
  try {
    const res = await fetch(`http://127.0.0.1/jubilee%20hms/backend/appointments.php?doctor_name=${encodeURIComponent(doctorName)}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    const appts = await res.json();
    const tbody = document.getElementById('doctor-appointments-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    appts.forEach(a => {
      tbody.innerHTML += `<tr>
        <td>${a.id || a.appointment_id}</td>
        <td>${a.patient_name || ''}</td>
        <td>${a.date || a.appointment_date || ''}</td>
        <td>${a.time || ''}</td>
        <td>${a.status || ''}</td>
      </tr>`;
    });
  } catch (e) {
    showAlert('Failed to load appointments.', 'error');
  }
}

async function loadAnalytics() {
  // Destroy previous charts if they exist
  if (patientChartInstance) {
    patientChartInstance.destroy();
    patientChartInstance = null;
  }
  if (labChartInstance) {
    labChartInstance.destroy();
    labChartInstance = null;
  }
  if (pharmacyChartInstance) {
    pharmacyChartInstance.destroy();
    pharmacyChartInstance = null;
  }

  // --- Patients per Month ---
  const patientsRes = await fetch('http://127.0.0.1/jubilee%20hms/backend/patients.php', { credentials: 'include' });
  const patients = await patientsRes.json();
  const patientMonths = {};
  patients.forEach(p => {
    // Use created_at, and ensure it's parsed correctly
    let dateStr = p.created_at ? p.created_at.replace(' ', 'T') : '';
    const date = new Date(dateStr || p.dob || p.registration_date);
    if (!isNaN(date)) {
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      patientMonths[key] = (patientMonths[key] || 0) + 1;
    }
  });
  const patientLabels = Object.keys(patientMonths).sort();
  const patientData = patientLabels.map(l => patientMonths[l]);
  console.log('Patients:', patients);
  console.log('patientMonths:', patientMonths);
  console.log('patientLabels:', patientLabels);
  console.log('patientData:', patientData);
  patientChartInstance = new Chart(document.getElementById('patientChart'), {
    type: 'bar',
    data: {
      labels: patientLabels,
      datasets: [{ label: 'Patients', data: patientData, backgroundColor: '#007bff' }]
    }
  });

  // --- Lab Tests per Type ---
  const labsRes = await fetch('http://127.0.0.1/jubilee%20hms/backend/lab_records.php', { credentials: 'include' });
  const labs = await labsRes.json();
  const testTypes = {};
  labs.forEach(lab => {
    const type = lab.test_type || 'Unknown';
    testTypes[type] = (testTypes[type] || 0) + 1;
  });
  const labLabels = Object.keys(testTypes);
  const labData = labLabels.map(l => testTypes[l]);
  labChartInstance = new Chart(document.getElementById('labChart'), {
    type: 'pie',
    data: {
      labels: labLabels,
      datasets: [{ label: 'Lab Tests', data: labData, backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'] }]
    }
  });

  // --- Medications Stock Levels ---
  const medsRes = await fetch('http://127.0.0.1/jubilee%20hms/backend/medications.php', { credentials: 'include' });
  const meds = await medsRes.json();
  const medLabels = meds.map(m => m.drug_name);
  const medData = meds.map(m => Number(m.stock) || 0);
  pharmacyChartInstance = new Chart(document.getElementById('pharmacyChart'), {
    type: 'bar',
    data: {
      labels: medLabels,
      datasets: [{ label: 'Stock', data: medData, backgroundColor: '#28a745' }]
    }
  });
}
// Utility alert function
function showAlert(message, type = 'info') {
  // type: info, success, error
  alert(message); // You can replace this with custom modal alert if you want
}

// ----------- PATIENTS -------------

// Load and display patients (ensure your existing loadAllPatients calls this fetch)
async function loadAllPatients() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/patients.php', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patients');
    const patients = await res.json();
    const table = document.getElementById('patients-list');
    table.innerHTML = '';
    patients.forEach(patient => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${patient.id || patient.patient_id}</td>
        <td>${patient.first_name || patient.name}</td>
        <td>${patient.dob || ''}</td>
        <td>${patient.address || ''}</td>
        <td>${patient.mobile || ''}</td>
        <td>${patient.ailment || ''}</td>
        <td>${patient.assigned_doctor_name || patient.assigned_doctor_id || ''}</td>
        <td>${patient.status || ''}</td>
        <td>
          <button onclick="editPatient(${patient.id || patient.patient_id})">Edit</button>
          <button onclick="deletePatient(${patient.id || patient.patient_id})">Delete</button>
        </td>
      `;
      table.appendChild(tr);
    });
  } catch (e) {
    showAlert('Failed to load patients.', 'error');
  }
}

async function editPatient(id) {
  try {
    const res = await fetch(`http://127.0.0.1/jubilee%20hms/backend/patient_details.php?id=${id}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to fetch patient details');
    const data = await res.json();
    if (!data.success || !data.patient) {
      showAlert(data.error || 'Patient not found.', 'error');
      return;
    }
    const patient = data.patient;
    // Fill the edit form inputs with patient data:
    document.getElementById('edit-patient-id').value = patient.id || patient.patient_id;
    document.getElementById('edit-patient-name').value = patient.first_name || patient.name || '';
    document.getElementById('edit-patient-dob').value = patient.dob || '';
    document.getElementById('edit-patient-address').value = patient.address || '';
    document.getElementById('edit-patient-mobile').value = patient.mobile || '';
    document.getElementById('edit-patient-ailment').value = patient.ailment || '';
    document.getElementById('edit-patient-assigned-doctor').value = patient.assigned_doctor_id || '';

    // Show the edit modal or form
    document.getElementById('edit-patient-modal').style.display = 'block';
  } catch (e) {
    showAlert('Failed to load patient for edit.', 'error');
  }
}

async function submitEditPatient(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.querySelector('#edit-patient-id').value;
  const first_name = form.querySelector('#edit-patient-name').value.trim();
  const dob = form.querySelector('#edit-patient-dob').value;
  const address = form.querySelector('#edit-patient-address').value.trim();
  const mobile = form.querySelector('#edit-patient-mobile').value.trim();
  const ailment = form.querySelector('#edit-patient-ailment').value.trim();
  const assigned_doctor_id = form.querySelector('#edit-patient-assigned-doctor').value;

  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/update_patient.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, first_name, dob, address, mobile, ailment, assigned_doctor_id })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.success) {
      showAlert('Patient updated successfully.', 'success');
      form.reset();
      document.getElementById('edit-patient-modal').style.display = 'none';
      loadAllPatients();
    } else {
      showAlert(data.error || 'Failed to update patient.', 'error');
    }
  } catch (e) {
    showAlert('Failed to update patient. Please try again later.', 'error');
  }
}

async function deletePatient(id) {
  if (!confirm('Are you sure you want to delete this patient?')) return;
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/delete_patient.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      showAlert('Patient deleted successfully.', 'success');
      loadAllPatients();
    } else {
      showAlert(data.error || 'Failed to delete patient.', 'error');
    }
  } catch (e) {
    showAlert('Failed to delete patient. Please try again later.', 'error');
  }
}

// ----------- MEDICATIONS -------------

async function loadAllMedications() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/medications.php', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch medications');
    const medications = await res.json();
    const table = document.getElementById('medications-list');
    table.innerHTML = '';
    medications.forEach(medication => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${medication.id || medication.medication_id}</td>
        <td>${medication.patient_id || ''}</td>
        <td>${medication.medication_name || ''}</td>
        <td>${medication.dosage || ''}</td>
        <td>${medication.frequency || ''}</td>
        <td>${medication.duration || ''}</td>
        <td>
          <button onclick="editMedication(${medication.id || medication.medication_id})">Edit</button>
          <button onclick="deleteMedication(${medication.id || medication.medication_id})">Delete</button>
        </td>
      `;
      table.appendChild(tr);
    });
  } catch (e) {
    showAlert('Failed to load medications.', 'error');
  }
}

function editMedication(id) {
  showAlert('Editing medication functionality not implemented yet.', 'info');
}

async function deleteMedication(id) {
  if (!confirm('Are you sure you want to delete this medication?')) return;
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/delete_medication.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.success) {
      showAlert('Medication deleted successfully.', 'success');
      loadAllMedications();
    } else {
      showAlert(data.error || 'Failed to delete medication.', 'error');
    }
  } catch (e) {
    showAlert('Failed to delete medication. Please try again later.', 'error');
  }
}

// ----------- LAB RECORDS -------------

async function loadAllLabRecords() {
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/labrecords.php', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch lab records');
    const labrecords = await res.json();
    const table = document.getElementById('labrecords-list');
    table.innerHTML = '';
    labrecords.forEach(labrecord => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${labrecord.id || labrecord.labrecord_id}</td>
        <td>${labrecord.patient_id || ''}</td>
        <td>${labrecord.lab_test_name || ''}</td>
        <td>${labrecord.lab_result || ''}</td>
        <td>${labrecord.date || ''}</td>
        <td>
          <button onclick="editLabRecord(${labrecord.id || labrecord.labrecord_id})">Edit</button>
          <button onclick="deleteLabRecord(${labrecord.id || labrecord.labrecord_id})">Delete</button>
        </td>
      `;
      table.appendChild(tr);
    });
  } catch (e) {
    showAlert('Failed to load lab records.', 'error');
  }
}

function editLabRecord(id) {
  showAlert('Editing lab record functionality not implemented yet.', 'info');
}

async function deleteLabRecord(id) {
  if (!confirm('Are you sure you want to delete this lab record?')) return;
  try {
    const res = await fetch('http://127.0.0.1/jubilee%20hms/backend/delete_labrecord.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    if (data.success) {
      showAlert('Lab record deleted successfully.', 'success');
      loadAllLabRecords();
    } else {
      showAlert(data.error || 'Failed to delete lab record.', 'error');
    }
  } catch (e) {
    showAlert('Failed to delete lab record. Please try again later.', 'error');
  }
}

// Open Edit Lab modal and populate form with current data
async function editLabRecord(id) {
  try {
    const res = await fetch(`backend/labrecord_details.php?id=${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch lab record');
    const lab = await res.json();
    if (!lab) return showAlert('Lab record not found.', 'error');

    // Fill modal fields; adjust IDs if your modal inputs differ
    document.getElementById('edit-lab-id').value = lab.id || lab.labrecord_id;
    document.getElementById('edit-lab-patient-id').value = lab.patient_id;
    document.getElementById('edit-lab-test-type').value = lab.test_type || lab.lab_test_name;
    document.getElementById('edit-lab-test-date').value = lab.test_date || lab.date;
    document.getElementById('edit-lab-result').value = lab.result || lab.lab_result;

    document.getElementById('edit-lab-modal').style.display = 'block';
  } catch (e) {
    showAlert('Error loading lab record.', 'error');
  }
}

// Submit edited Lab record to backend and refresh UI
async function submitEditLab(event) {
  event.preventDefault();

  const id = document.getElementById('edit-lab-id').value;
  const patient_id = document.getElementById('edit-lab-patient-id').value.trim();
  const test_type = document.getElementById('edit-lab-test-type').value.trim();
  const test_date = document.getElementById('edit-lab-test-date').value;
  const result = document.getElementById('edit-lab-result').value.trim();

  try {
    const res = await fetch('backend/update_lab_record.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, patient_id, test_type, test_date, result }),
    });

    const data = await res.json();
    if (data.success) {
      showAlert('Lab record updated successfully', 'success');
      document.getElementById('edit-lab-modal').style.display = 'none';
      loadLabPanel();
      loadAllLabRecords();
    } else {
      showAlert(data.error || 'Update failed', 'error');
    }
  } catch {
    showAlert('Network error updating lab record', 'error');
  }
}

// Make sure to bind submit handler after DOM load:
document.getElementById('edit-lab-form').addEventListener('submit', submitEditLab);
async function editMedication(id) {
  try {
    const res = await fetch(`backend/medication_details.php?id=${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch medication');
    const med = await res.json();
    if (!med) return showAlert('Medication not found.', 'error');

    document.getElementById('edit-med-id').value = med.id || med.medication_id;
    document.getElementById('edit-med-patient-id').value = med.patient_id;
    document.getElementById('edit-med-name').value = med.medication_name;
    document.getElementById('edit-med-dosage').value = med.dosage;
    document.getElementById('edit-med-frequency').value = med.frequency;
    document.getElementById('edit-med-duration').value = med.duration;

    document.getElementById('edit-med-modal').style.display = 'block';
  } catch {
    showAlert('Error loading medication.', 'error');
  }
}

async function submitEditMedication(event) {
  event.preventDefault();

  const id = document.getElementById('edit-med-id').value;
  const patient_id = document.getElementById('edit-med-patient-id').value.trim();
  const medication_name = document.getElementById('edit-med-name').value.trim();
  const dosage = document.getElementById('edit-med-dosage').value.trim();
  const frequency = document.getElementById('edit-med-frequency').value.trim();
  const duration = document.getElementById('edit-med-duration').value.trim();

  try {
    const res = await fetch('backend/update_medication.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, patient_id, medication_name, dosage, frequency, duration }),
    });
    const data = await res.json();

    if (data.success) {
      showAlert('Medication updated successfully', 'success');
      document.getElementById('edit-med-modal').style.display = 'none';
      loadPharmacyInventory();
      loadAllMedications();
    } else {
      showAlert(data.error || 'Update failed', 'error');
    }
  } catch {
    showAlert('Network error updating medication', 'error');
  }
}

document.getElementById('edit-med-form').addEventListener('submit', submitEditMedication);

// ----------- PRINT AND DOWNLOAD -------------

// Print a section by id
function printSection(sectionId) {
  const content = document.getElementById(sectionId);
  if (!content) {
    showAlert('Content to print not found.', 'error');
    return;
  }
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Print</title>');
  // Add any required stylesheets here
  printWindow.document.write('<style>table {width: 100%; border-collapse: collapse;} td, th {border: 1px solid #ccc; padding: 8px;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

// Download table content as CSV
function downloadTableCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) {
    showAlert('Table not found.', 'error');
    return;
  }
  let csvContent = '';
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const cols = row.querySelectorAll('th, td');
    const rowData = Array.from(cols).map(td => {
      let text = td.textContent.trim();
      // Escape double quotes
      text = text.replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
    csvContent += rowData + '\n';
  });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Example usage:
// downloadTableCSV('patients-table', 'patients.csv');
// downloadTableCSV('medications-table', 'medications.csv');
// downloadTableCSV('labrecords-table', 'labrecords.csv');

// -------------------------------

// Initialize or set up listeners for forms
document.getElementById('edit-patient-form').addEventListener('submit', submitEditPatient);

// Initial load calls
loadAllPatients();
loadAllMedications();
loadAllLabRecords();


async function loadProfile() {}
function showLoginForm() {}
function setActiveTab() {}

// Placeholder functions for edit and delete actions
