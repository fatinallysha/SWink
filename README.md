# SWink

## Quotation API

The Express API is separate from the Vite frontend. Configure MySQL and copy
`.env.example` to `.env`, then apply `server/database/schema.sql` to the
configured database.

Start the API with `npm run dev:api` (watch mode) or `npm run start:api`.
It listens on port `3000` by default. `POST /api/quotations` accepts
`multipart/form-data` with a `cart` field containing a JSON array. Each entry
has `service_type`, `item_details`, and an optional `quantity` (items whose
service does not ask for quantity store `NULL`). Attach one `artwork` file for
each cart item; files are associated with items in array order. JPEG, PNG, PDF,
and PostScript files are accepted up to 300 MB each. Include `name`,
`phoneNumber`, and `address`; `company` and `remark` are optional. The
quotation and all its items are saved in one database transaction. Successful
requests return the new `quotation_id`. Legacy quotation columns are retained
as nullable for existing database compatibility.