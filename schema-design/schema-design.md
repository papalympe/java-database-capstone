# 📘 Schema Design for Smart Clinic Management System

This document is prepared for inclusion in the **java-database-capstone** GitHub repository. It defines both the **MySQL relational schema** and the **MongoDB document schema** used in the Smart Clinic Management System.

---

# 🗄️ MySQL Database Schema
The MySQL database stores structured and relational data such as patients, doctors, appointments, and administrative users.

Below are four core tables with their columns, data types, constraints, and relationships.

---

## **1. patients Table**
```sql
CREATE TABLE patients (
    patient_id     INT AUTO_INCREMENT PRIMARY KEY,
    first_name     VARCHAR(50) NOT NULL,
    last_name      VARCHAR(50) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    phone          VARCHAR(20) NOT NULL,
    date_of_birth  DATE NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **2. doctors Table**
```sql
CREATE TABLE doctors (
    doctor_id       INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    specialization  VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20) NOT NULL,
    available       BOOLEAN DEFAULT TRUE
);
```

---

## **3. appointments Table**
```sql
CREATE TABLE appointments (
    appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
    patient_id       INT NOT NULL,
    doctor_id        INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    notes            VARCHAR(255),
    status           ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',

    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);
```

> **Justification:** This structure enforces relationships between patients, doctors, and their scheduled visits.

---

## **4. admin Table**
```sql
CREATE TABLE admin (
    admin_id      INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50) NOT NULL
);
```

> **Justification:** Admin accounts require strong constraints and unique usernames.

---

# 🍃 MongoDB Collection Schema
MongoDB stores flexible, document-based data. Items like prescriptions may contain nested arrays and optional attributes that do not fit well into relational tables.

---

## **prescriptions Collection**
### Example Document
```json
{
  "prescriptionId": "PR-2025-001",
  "patientId": 12,
  "doctorId": 4,
  "createdAt": "2025-01-18T10:45:00Z",

  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times a day",
      "duration_days": 7
    },
    {
      "name": "Ibuprofen",
      "dosage": "200mg",
      "frequency": "as needed",
      "notes": "Take with food"
    }
  ],

  "doctorNotes": {
    "symptoms": ["Fever", "Sore throat", "Headache"],
    "diagnosis": "Bacterial infection",
    "followUpDate": "2025-01-25"
  }
}
```

> **Justification:** MongoDB allows flexible documents with nested arrays (medications) and objects (doctorNotes), which supports future schema changes without database restructuring.

---

# ✅ Summary
- **MySQL** is used for normalized, structured, and relational data.
- **MongoDB** is used for flexible, evolving documents.
- This hybrid approach supports scalability, performance, and maintainability.



