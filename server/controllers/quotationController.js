import { unlink } from "node:fs/promises";
import pool from "../config/database.js";

export async function createQuotation(req, res, next) {
  const files = req.files || [];
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
          (name, company, contact_number, address, remark, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        req.body.name,
        req.body.company || null,
        req.body.phoneNumber,
        req.body.address,
        req.body.remark || null,
        "Quotation Requested",
      ],
    );
    quotationId = quotation.insertId;

    for (const [index, item] of req.cart.entries()) {
      const file = files[index];
      await connection.execute(
        `
          INSERT INTO quotation_items
            (quotation_id, service_type, item_details, quantity, artwork_path)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          quotationId,
          item.service_type,
          JSON.stringify(item.item_details),
          item.item_details.quantity ? Number(item.item_details.quantity) : null,
          `uploads/${file.filename}`,
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

    for (const file of files) {
      try {
        await unlink(file.path);
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
