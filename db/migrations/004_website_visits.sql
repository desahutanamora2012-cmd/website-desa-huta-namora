-- ============================================================
-- website_visits: track unique daily visits (anonymized)
-- ============================================================

CREATE TABLE IF NOT EXISTS website_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visit_date VARCHAR(10) NOT NULL, -- YYYY-MM-DD
  fingerprint VARCHAR(64) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY website_visits_unique_day_fingerprint (visit_date, fingerprint)
);
