-- Run on production database if needed
ALTER TABLE accommodations
    ADD COLUMN canonical_url VARCHAR(500) NULL AFTER schema_markup,
    ADD COLUMN breadcrumbs TEXT NULL AFTER canonical_url;
