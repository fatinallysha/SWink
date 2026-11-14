CREATE TABLE IF NOT EXISTS quotations (
  quotation_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NULL,
  address TEXT NOT NULL,
  contact_number VARCHAR(50) NOT NULL,
  items TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Quotation Requested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (quotation_id)
);

CREATE TABLE IF NOT EXISTS artwork (
  artwork_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quotation_id INT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (artwork_id),
  KEY idx_artwork_quotation_id (quotation_id),
  CONSTRAINT fk_artwork_quotation
    FOREIGN KEY (quotation_id) REFERENCES quotations (quotation_id)
    ON DELETE CASCADE
);
