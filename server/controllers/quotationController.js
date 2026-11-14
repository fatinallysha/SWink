import { unlink } from "node:fs/promises";
import pool from "../config/database.js";

export async function createQuotation(req, res, next) {
  const {
    product,
    quantity,
    name,
    company,
    address,
    contactNumber,
    items,
  } = req.body;

  let connection;
  let transactionStarted = false;
  let quotationId;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [quotation] = await connection.execute(
      `
        INSERT INTO quotations
          (product, quantity, name, company, address, contact_number, items, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product,
        quantity,
        name,
        company ?? null,
        address,
        contactNumber,
        items,
        "Quotation Requested",
      ],
    );
    quotationId = quotation.insertId;

    if (req.file) {
      await connection.execute(
        `
          INSERT INTO artwork (quotation_id, file_name, file_path, file_size)
          VALUES (?, ?, ?, ?)
        `,
        [
          quotationId,
          req.file.originalname,
          `uploads/${req.file.filename}`,
          req.file.size,
        ],
      );
    }

    await connection.commit();
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Failed to roll back quotation transaction:", rollbackError);
      }
    }

    if (req.file) {
      try {
        await unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") {
          console.error("Failed to remove uploaded artwork after database error:", cleanupError);
        }
      }
    }

    return next(error);
  } finally {
    connection?.release();
  }

  return res.status(201).json({
    message: "Quotation request created successfully",
    quotation_id: quotationId,
  });
}
