import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import quotationRoutes from "./routes/quotationRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/api/quotations", quotationRoutes);

// Hidangkan website yang sudah di-build (folder dist)
app.use(express.static(path.join(__dirname, "../dist")));

app.use((error, req, res, next) => {
  console.error("API request failed:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`SWink API listening on port ${port}`);
});