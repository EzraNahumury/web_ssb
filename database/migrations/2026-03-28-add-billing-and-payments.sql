USE ayres_ssb_dashboard;

-- Billing configuration per SSB (one row per SSB)
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

-- Payment / invoice records
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
