import { body, validationResult } from "express-validator";
import { unlink } from "node:fs/promises";

const serviceFields = {
  Clothing: {
    clothingType: ["T-Shirt", "Polo Shirt", "Hoodie", "Sweatshirt", "Jacket", "Jersey", "Apron", "Non-Woven Bag"],
    printingMethod: ["Silkscreen", "Heat Press", "DTF", "Embroidery", "Sublimation"],
    material: ["Eyelet", "Interlock", "Lycra", "RJ", "Diamond", "MF Ultra", "Cotton", "Polo Honeycomb", "Microfiber"],
    gsm: null,
    quantity: "number",
  },
  Banner: {
    product: ["Banner", "Bunting", "Backdrop", "Roll-Up Banner"],
    bannerSize: null,
    finishing: ["Eyelets / Hole", "Rope", "Pipe"],
    quantity: "number",
  },
  Sticker: {
    stickerType: ["Transparent", "Waterproof", "Label Sticker", "PVC Outdoor"],
    quantity: "number",
  },
  Booklet: {
    sizing: null,
    numberOfPages: "number",
    coverMaterial: ["Hard Cover", "Soft Cover"],
    contentMaterial: ["Simili", "Art Paper"],
    bindingOption: ["Wire-O-Ring", "Perfect Binding", "Saddle Stitch"],
    quantity: "number",
  },
  "Flyers / Brochures": {
    size: ["A4", "A5", "DL"],
    foldType: ["None", "Bi-Fold", "Tri-Fold", "Z-Fold"],
    paper: ["128 gsm", "157 gsm", "210 gsm"],
    quantity: "number",
  },
  "Gifts & Corporate Items": {
    product: ["Mug", "Keychain", "Lanyard", "Notebook", "Pen", "Tumbler", "USB Drive", "Calendar"],
    printingMethod: ["UV Print", "Laser Engraving", "Sublimation", "Silkscreen"],
    quantity: "number",
    packaging: ["Yes", "No"],
  },
  "Name Card": {
    size: ["Standard", "Custom"],
    paper: ["260 gsm", "310 gsm", "Art Card", "Linen", "Kraft"],
    printing: ["Single Sided", "Double Sided"],
    corners: ["Square", "Rounded"],
    quantity: "number",
    lamination: ["Matte", "Gloss", "None"],
  },
};

const customerValidators = [
  body("name")
    .exists({ values: "undefined" })
    .withMessage("Name is required")
    .bail()
    .isString()
    .withMessage("Name must be text")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .bail()
    .matches(/^[\p{L} ]+$/u)
    .withMessage("Name may contain letters and spaces only"),
  body("phoneNumber")
    .exists({ values: "undefined" })
    .withMessage("Phone number is required")
    .bail()
    .isString()
    .withMessage("Phone number must be text")
    .bail()
    .matches(/^\d{10,12}$/)
    .withMessage("Phone number must contain 10 to 12 digits"),
  body("address")
    .exists({ values: "undefined" })
    .withMessage("Address is required")
    .bail()
    .isString()
    .withMessage("Address must be text")
    .bail()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Address must be at least 10 characters"),
  body("company")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Company must be text")
    .bail()
    .trim()
    .customSanitizer((value) => value || null),
  body("remark")
    .optional({ values: "undefined" })
    .isString()
    .withMessage("Remark must be text")
    .bail()
    .trim()
    .customSanitizer((value) => value || null),
];

async function removeUploadedFiles(files) {
  for (const file of files) {
    try {
      await unlink(file.path);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

export async function validateQuotation(req, res, next) {
  const files = req.files || [];
  let cart;
  const errors = [];

  await Promise.all(customerValidators.map((validator) => validator.run(req)));
  errors.push(
    ...validationResult(req).array().map(({ path, msg }) => ({
      field: path,
      message: msg,
    })),
  );

  try {
    cart = JSON.parse(req.body.cart);
  } catch {
    errors.push({ field: "cart", message: "Must be a valid JSON array" });
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    errors.push({ field: "cart", message: "Add at least one item" });
  } else {
    cart.forEach((item, index) => {
      const serviceType = item?.service_type;
      if (typeof serviceType !== "string" || !Object.hasOwn(serviceFields, serviceType)) {
        errors.push({ field: `cart[${index}].service_type`, message: "Select a valid service type" });
        return;
      }
      const schema = serviceFields[serviceType];

      const details = item.item_details;
      if (!details || typeof details !== "object" || Array.isArray(details)) {
        errors.push({ field: `cart[${index}].item_details`, message: "Must be an object" });
        return;
      }

      for (const [field, rule] of Object.entries(schema)) {
        const value = details[field];
        const fieldName = `cart[${index}].item_details.${field}`;
        if (rule === "number") {
          if (!Number.isInteger(Number(value)) || Number(value) < 1) {
            errors.push({ field: fieldName, message: "Must be a whole number greater than 0" });
          }
        } else if (Array.isArray(rule)) {
          if (!rule.includes(value)) {
            errors.push({ field: fieldName, message: "Select a valid option" });
          }
        } else if (typeof value !== "string" || value.trim() === "") {
          errors.push({ field: fieldName, message: "This field is required" });
        }
      }
    });

    if (files.length !== cart.length) {
      errors.push({ field: "artwork", message: "Upload one artwork file for each item" });
    }
  }

  if (errors.length > 0) {
    try {
      await removeUploadedFiles(files);
    } catch (error) {
      return next(error);
    }
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.cart = cart;
  return next();
}
