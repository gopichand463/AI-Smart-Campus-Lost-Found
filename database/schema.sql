-- =======================================================
-- Smart Campus Lost & Found System - Database Schema (v1.0)
-- Based on SRS Section 8.1 Entities
-- =======================================================

CREATE DATABASE IF NOT EXISTS smart_campus_lost_found;
USE smart_campus_lost_found;

-- 1. User Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Campus User', 'Project Operator') NOT NULL DEFAULT 'Campus User',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lost & Found Items Record Table
CREATE TABLE IF NOT EXISTS lost_found_records (
    record_id VARCHAR(64) PRIMARY KEY,
    item_type ENUM('Lost', 'Found') NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    color VARCHAR(100) DEFAULT 'Unknown',
    brand VARCHAR(100) DEFAULT 'Unknown',
    description TEXT,
    location VARCHAR(255) NOT NULL,
    item_date DATE NOT NULL,
    recovery_status ENUM('Pending', 'Recovered', 'Closed') NOT NULL DEFAULT 'Pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Model Versions Metadata Table (NFR-4)
CREATE TABLE IF NOT EXISTS model_versions (
    model_version VARCHAR(64) PRIMARY KEY,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataset_version VARCHAR(64) NOT NULL,
    random_seed INT NOT NULL,
    preprocessing_config TEXT NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    macro_f1_score FLOAT NOT NULL
);

-- 4. Prediction Audit Logs Table (NFR-3)
CREATE TABLE IF NOT EXISTS prediction_logs (
    prediction_id VARCHAR(64) PRIMARY KEY,
    record_id VARCHAR(64) NOT NULL,
    model_version VARCHAR(64) NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    predicted_class ENUM('Pending', 'Recovered', 'Closed') NOT NULL,
    confidence FLOAT NOT NULL,
    corrected_status ENUM('Pending', 'Recovered', 'Closed') NULL,
    FOREIGN KEY (record_id) REFERENCES lost_found_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (model_version) REFERENCES model_versions(model_version)
);
