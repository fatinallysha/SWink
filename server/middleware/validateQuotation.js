import { body, validationResult } from "express-validator";
import { unlink } from "node:fs/promises";

export const validateQuotation = [
  body("product")
    .exists({ values: "undefined" })
    .withMessage("This field is required")
    .bail()
    .isString()
    .withMessage("Must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Must not be empty"),
  body("quantity")
    .exists({ values: "undefined" })
    .withMessage("This field is required")
    .bail()
    .isInt()
    .withMessage("Must be an integer")
    .toInt(),
  body("name")
    .exists({ values: "undefined" })
    .withMessage("This field is required")
    .bail()
    .isString()
    .withMessage("Must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Must not be empty"),
  body("company")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Must be a string")
    .bail()
    .trim()
    .customSanitizer((value) => (value === "" ? null : value)),
  body("address")
    .exists({ values: "undefined" })
    .withMessage("This field is required")
    .bail()
    .isString()
    .withMessage("Must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Must not be empty"),
  body("contactNumber")
    .exists({ values: "undefined" })
    .withMessage("This field is required")
    .bail()
    .isString()
    .withMessage("Must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Must not be empty"),
  body("items")
    .exists({ values: "undefined" })
    .withMessage("This field is required")
    .bail()
    .isString()
    .withMessage("Must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Must not be empty"),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        try {
          await unlink(req.file.path);
        } catch (error) {
          if (error.code !== "ENOENT") {
            return next(error);
          }
        }
      }

      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(({ path, msg }) => ({
          field: path,
          message: msg,
        })),
      });
    }

    return next();
  },
];
