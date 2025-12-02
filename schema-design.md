# Schema Design — Smart Clinic Management System

This file describes the data design for the Smart Clinic Management System using **MySQL** for structured data and **MongoDB** for flexible/semi-structured documents. 

---

## MySQL Database Design

### Table: patients
```sql
CREATE TABLE patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique identifier for each patient
  first_name VARCHAR(100) NOT NULL,           -- Patient's first name
  last_name VARCHAR(100) NOT NULL,            -- Patient's last name
  email VARCHAR(255) NOT NULL UNIQUE,         -- Unique email for login and contact
  phone VARCHAR(30) NOT NULL,                 -- Contact phone number
  gender ENUM('MALE','FEMALE','OTHER') DEFAULT 'OTHER', -- Gender info
  date_of_birth DATE NOT NULL,                -- Date of birth
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Last update timestamp
  is_active BOOLEAN DEFAULT TRUE              -- Soft delete flag
);
```

### Table: doctors
```sql
CREATE TABLE doctors (
  doctor_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique identifier for each doctor
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,         -- Unique contact and login email
  phone VARCHAR(30) NOT NULL,
  specialization VARCHAR(150) NOT NULL,      -- Medical specialty
  bio TEXT,                                  -- Optional biography or profile info
  is_active BOOLEAN DEFAULT TRUE,            -- Soft delete flag
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: appointments
```sql
CREATE TABLE appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique appointment ID
  patient_id INT NOT NULL,                          -- Reference to patient
  doctor_id INT NOT NULL,                           -- Reference to doctor
  location_id INT,                                  -- Optional location reference
  appointment_start DATETIME NOT NULL,             -- Start time of appointment
  appointment_end DATETIME NOT NULL,               -- End time of appointment
  status ENUM('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED', -- Appointment status
  reason VARCHAR(255),                               -- Reason for visit
  created_by VARCHAR(100),                           -- Who created the appointment (patient/admin/staff)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT, -- Prevent deletion if appointments exist
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE RESTRICT
);
```

### Table: admin
```sql
CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique identifier for admin
  username VARCHAR(100) NOT NULL UNIQUE,    -- Login username
  password_hash VARCHAR(255) NOT NULL,     -- Hashed password
  full_name VARCHAR(200),                   -- Full name of admin
  email VARCHAR(255) NOT NULL UNIQUE,       -- Contact email
  role VARCHAR(50) NOT NULL,                -- Admin role (e.g., SUPERADMIN, STAFFADMIN)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Creation timestamp
);
```

### Table: prescriptions (link to MongoDB)
```sql
CREATE TABLE prescriptions (
  prescription_id INT AUTO_INCREMENT PRIMARY KEY,  -- Unique prescription ID
  patient_id INT NOT NULL,                          -- Reference to patient
  doctor_id INT NOT NULL,                           -- Reference to doctor
  appointment_id INT,                               -- Optional appointment link
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Creation timestamp
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);
```

---

## MongoDB Collection Design

### Collection: prescriptions
**Design choices:** Store prescriptions as documents because medication lists, dosing instructions, and doctor notes vary per patient. Store references to MySQL IDs (patientId, doctorId) rather than embedding full objects.

```json
{
  "_id": { "$oid": "64abc1234567890abcdef123" },
  "prescriptionId": "PR-2025-001",
  "patientId": 12,                  -- Reference to MySQL patients.patient_id
  "doctorId": 4,                    -- Reference to MySQL doctors.doctor_id
  "appointmentId": 101,             -- Optional appointment reference
  "createdAt": "2025-01-18T10:45:00Z",
  "createdBy": {
    "userId": 2001,
    "role": "DOCTOR",
    "name": "Dr. Alice Smith"
  },
  "medications": [
    {
      "medId": "RX-001",
      "name": "Amoxicillin",
      "form": "capsule",
      "dosage": "500mg",
      "route": "oral",
      "frequency": "TID",
      "duration_days": 7,
      "instructions": "Take after meals",
      "quantity": 21
    },
    {
      "medId": "RX-002",
      "name": "Ibuprofen",
      "dosage": "200mg",
      "frequency": "PRN",
      "duration_days": 5,
      "instructions": "If pain persists take twice daily"
    }
  ],
  "notes": {
    "symptoms": ["Fever", "Sore throat"],
    "diagnosis": "Acute bacterial pharyngitis",
    "followUpDays": 7
  },
  "status": "ACTIVE",               -- ACTIVE, CANCELLED, EXPIRED
  "refills": 1,
  "pharmacy": {
    "id": "PH-900",
    "name": "Central Pharmacy",
    "address": "123 Main St"
  },
  "audit": [
    {
      "version": 1,
      "modifiedAt": "2025-01-18T10:45:00Z",
      "modifiedBy": "doctor:4",
      "changeNotes": "Initial create"
    }
  ],
  "tags": ["urgent", "antibiotic"]
}
```

**Notes:** MongoDB is used for flexible, nested, or optional data such as medication arrays, doctor notes, and audit history.

---



