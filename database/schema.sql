CREATE DATABASE IF NOT EXISTS ayres_ssb_dashboard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ayres_ssb_dashboard;

CREATE TABLE ssb (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  logo VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  partnership_notes TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_ssb_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ssb_id BIGINT UNSIGNED DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('AYRES_ADMIN', 'SSB_ADMIN') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_ssb_id (ssb_id),
  CONSTRAINT fk_users_ssb
    FOREIGN KEY (ssb_id) REFERENCES ssb (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partnerships (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ssb_id BIGINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partnerships_ssb_id (ssb_id),
  KEY idx_partnerships_status (status),
  KEY idx_partnerships_period (start_date, end_date),
  CONSTRAINT fk_partnerships_ssb
    FOREIGN KEY (ssb_id) REFERENCES ssb (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT chk_partnerships_dates
    CHECK (end_date >= start_date)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE participants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ssb_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  nickname VARCHAR(100) DEFAULT NULL,
  birth_date DATE DEFAULT NULL,
  position VARCHAR(50) DEFAULT NULL,
  jersey_size VARCHAR(10) DEFAULT NULL,
  parent_name VARCHAR(150) DEFAULT NULL,
  parent_phone VARCHAR(30) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  join_date DATE DEFAULT NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_participants_ssb_id (ssb_id),
  KEY idx_participants_name (name),
  KEY idx_participants_status (status),
  KEY idx_participants_position (position),
  KEY idx_participants_join_date (join_date),
  CONSTRAINT fk_participants_ssb
    FOREIGN KEY (ssb_id) REFERENCES ssb (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ssb_billing_config (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ssb_id BIGINT UNSIGNED NOT NULL,
  billing_type ENUM('MONTHLY', 'DEPOSIT_SESSION', 'MONTHLY_SESSION') NOT NULL,
  monthly_fee DECIMAL(12, 0) UNSIGNED DEFAULT NULL,
  deposit_fee DECIMAL(12, 0) UNSIGNED DEFAULT NULL,
  session_fee DECIMAL(12, 0) UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_billing_config_ssb_id (ssb_id),
  CONSTRAINT fk_billing_config_ssb
    FOREIGN KEY (ssb_id) REFERENCES ssb (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ssb_id BIGINT UNSIGNED NOT NULL,
  participant_id BIGINT UNSIGNED NOT NULL,
  payment_type ENUM('MONTHLY', 'DEPOSIT', 'SESSION') NOT NULL,
  amount DECIMAL(12, 0) UNSIGNED NOT NULL,
  period_month CHAR(7) DEFAULT NULL,
  status ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
  paid_at TIMESTAMP NULL DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_ssb_id (ssb_id),
  KEY idx_payments_participant_id (participant_id),
  KEY idx_payments_status (status),
  KEY idx_payments_period (ssb_id, period_month),
  KEY idx_payments_type (payment_type),
  CONSTRAINT fk_payments_ssb
    FOREIGN KEY (ssb_id) REFERENCES ssb (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_payments_participant
    FOREIGN KEY (participant_id) REFERENCES participants (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
