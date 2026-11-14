CREATE TABLE IF NOT EXISTS quotations (
  quotation_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product VARCHAR(255) NULL,
  quantity INT NULL,
  name VARCHAR(255) NULL,
  company VARCHAR(255) NULL,
  address TEXT NULL,
  contact_number VARCHAR(50) NULL,
  items TEXT NULL,
  remark TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Quotation Requested',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (quotation_id)
) ENGINE=InnoDB;

ALTER TABLE quotations
  MODIFY product VARCHAR(255) NULL,
  MODIFY quantity INT NULL,
  MODIFY name VARCHAR(255) NULL,
  MODIFY company VARCHAR(255) NULL,
  MODIFY address TEXT NULL,
  MODIFY contact_number VARCHAR(50) NULL,
  MODIFY items TEXT NULL;

SET @remark_column_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'quotations'
    AND column_name = 'remark'
);
SET @add_remark_sql := IF(
  @remark_column_exists = 0,
  'ALTER TABLE quotations ADD COLUMN remark TEXT NULL',
  'SELECT 1'
);
PREPARE add_remark_stmt FROM @add_remark_sql;
EXECUTE add_remark_stmt;
DEALLOCATE PREPARE add_remark_stmt;

CREATE TABLE IF NOT EXISTS quotation_items (
  item_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quotation_id INT UNSIGNED NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  item_details JSON NOT NULL,
  quantity INT UNSIGNED NULL,
  artwork_path VARCHAR(512) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id),
  KEY idx_quotation_items_quotation_id (quotation_id),
  CONSTRAINT fk_quotation_items_quotation
    FOREIGN KEY (quotation_id) REFERENCES quotations (quotation_id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
