USE ayres_ssb_dashboard;

ALTER TABLE ssb
ADD COLUMN partnership_notes TEXT NULL AFTER updated_at;
