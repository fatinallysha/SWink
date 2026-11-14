import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const maxFileSize = 300_000_000;
const extensionsByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
  "application/postscript": ".ai",
};
const uploadDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../uploads",
);

mkdirSync(uploadDirectory, { recursive: true });

export const uploadArtwork = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${extensionsByMimeType[file.mimetype]}`);
    },
  }),
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!Object.hasOwn(extensionsByMimeType, file.mimetype)) {
      const error = new Error(
        "Unsupported artwork format. Upload a JPEG, PNG, PDF, or PostScript (AI) file.",
      );
      error.code = "UNSUPPORTED_ARTWORK_TYPE";
      return callback(error);
    }

    return callback(null, true);
  },
});

export function handleArtworkUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "Artwork file must not exceed 300 MB.",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Upload one artwork file using the 'artwork' field.",
      });
    }

    return res.status(400).json({ message: error.message });
  }

  if (error.code === "UNSUPPORTED_ARTWORK_TYPE") {
    return res.status(400).json({ message: error.message });
  }

  return next(error);
}
