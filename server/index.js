import "dotenv/config";
import express from "express";
import quotationRoutes from "./routes/quotationRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/quotations", quotationRoutes);

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
