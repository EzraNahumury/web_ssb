USE ayres_ssb_dashboard;

-- Rename deposit_fee to registration_fee
ALTER TABLE ssb_billing_config
  CHANGE COLUMN deposit_fee registration_fee DECIMAL(12, 0) UNSIGNED DEFAULT NULL;

-- Update billing_type enum: DEPOSIT_SESSION -> REGISTRATION_SESSION
ALTER TABLE ssb_billing_config
  MODIFY COLUMN billing_type ENUM('MONTHLY', 'REGISTRATION_SESSION', 'MONTHLY_SESSION') NOT NULL;

-- Update payment_type enum: DEPOSIT -> REGISTRATION
ALTER TABLE payments
  MODIFY COLUMN payment_type ENUM('MONTHLY', 'REGISTRATION', 'SESSION') NOT NULL;

-- Migrate existing data
UPDATE ssb_billing_config SET billing_type = 'REGISTRATION_SESSION' WHERE billing_type = 'DEPOSIT_SESSION';
UPDATE payments SET payment_type = 'REGISTRATION' WHERE payment_type = 'DEPOSIT';
