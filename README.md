# SWink

## Quotation API

The Express API is separate from the Vite frontend. Configure MySQL and copy
`.env.example` to `.env`, then apply `server/database/schema.sql` to the
configured database.

Start the API with `npm run dev:api` (watch mode) or `npm run start:api`.
It listens on port `3000` by default. `POST /api/quotations` accepts
`multipart/form-data` with `product`, `quantity`, `name`, `address`,
`contactNumber`, and `items`; `company` is optional. Attach one optional
artwork file using the `artwork` field. JPEG, PNG, PDF, and PostScript files
are accepted up to 300 MB. Successful requests return the new `quotation_id`.