-- Run once on production database before deploying slug support
ALTER TABLE accommodations
    ADD COLUMN slug VARCHAR(255) NULL AFTER name;

CREATE UNIQUE INDEX idx_accommodations_slug ON accommodations (slug);
