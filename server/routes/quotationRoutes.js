import { Router } from "express";
import { createQuotation } from "../controllers/quotationController.js";
import {
  handleArtworkUploadError,
  uploadArtwork,
} from "../middleware/uploadArtwork.js";
import { validateQuotation } from "../middleware/validateQuotation.js";

const router = Router();

router.post(
  "/",
  uploadArtwork.single("artwork"),
  handleArtworkUploadError,
  validateQuotation,
  createQuotation,
);

export default router;
