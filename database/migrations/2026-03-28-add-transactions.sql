USE ayres_ssb_dashboard;

CREATE TABLE transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ssb_id BIGINT UNSIGNED NOT NULL,
  type ENUM('INCOME', 'EXPENSE') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 0) UNSIGNED NOT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_transactions_ssb_id (ssb_id),
  KEY idx_transactions_type (type),
  KEY idx_transactions_date (ssb_id, transaction_date),
  CONSTRAINT fk_transactions_ssb
    FOREIGN KEY (ssb_id) REFERENCES ssb (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
