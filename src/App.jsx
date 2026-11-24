import { useEffect, useRef, useState } from "react";
import {
  Card,
  DestructiveButton,
  ErrorBanner,
  FileUploadZone,
  FormFieldWrapper,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectDropdown,
  TextInput,
} from "./components.jsx";

const serviceOptions = [
  "Clothing",
  "Banner",
  "Sticker",
  "Booklet",
  "Name Card",
  "Flyers / Brochures",
  "Gifts & Corporate Items",
];

const serviceFields = {
  Clothing: [
    { name: "clothingType", label: "Clothing Type", type: "radio", options: ["T-Shirt", "Polo Shirt", "Hoodie", "Sweatshirt", "Jacket", "Jersey", "Apron", "Non-Woven Bag"] },
    { name: "printingMethod", label: "Printing Method", type: "select", options: ["Silkscreen", "Heat Press", "DTF", "Embroidery", "Sublimation"] },
    { name: "material", label: "Material", type: "select", options: ["Eyelet", "Interlock", "Lycra", "RJ", "Diamond", "MF Ultra", "Cotton", "Polo Honeycomb", "Microfiber"] },
    { name: "gsm", label: "GSM", type: "text", placeholder: "Material thickness" },
    { name: "quantity", label: "Quantity", type: "number" },
  ],
  Banner: [
    { name: "product", label: "Product", type: "select", options: ["Banner", "Bunting", "Backdrop", "Roll-Up Banner"] },
    { name: "bannerSize", label: "Banner Size", type: "text", placeholder: "e.g., Width X Height (Inch)" },
    { name: "finishing", label: "Finishing", type: "select", options: ["Eyelets / Hole", "Rope", "Pipe"] },
    { name: "quantity", label: "Quantity", type: "number" },
  ],
  Sticker: [
    { name: "stickerType", label: "Sticker Type", type: "select", options: ["Transparent", "Waterproof", "Label Sticker", "PVC Outdoor"] },
    { name: "quantity", label: "Sticker Quantity", type: "number" },
  ],
  Booklet: [
    { name: "sizing", label: "Sizing", type: "text", placeholder: "e.g., Width X Length (cm)" },
    { name: "numberOfPages", label: "Number of Pages", type: "number", helperText: "including front and back cover" },
    { name: "coverMaterial", label: "Cover Material", type: "select", options: ["Hard Cover", "Soft Cover"] },
    { name: "contentMaterial", label: "Content Material", type: "select", options: ["Simili", "Art Paper"] },
    { name: "bindingOption", label: "Binding Option", type: "select", options: ["Wire-O-Ring", "Perfect Binding", "Saddle Stitch"] },
    { name: "quantity", label: "Quantity", type: "number" },
  ],
  "Flyers / Brochures": [
    { name: "size", label: "Size", type: "select", options: ["A4", "A5", "DL"] },
    { name: "foldType", label: "Fold Type", type: "select", options: ["None", "Bi-Fold", "Tri-Fold", "Z-Fold"] },
    { name: "paper", label: "Paper", type: "select", options: ["128 gsm", "157 gsm", "210 gsm"] },
    { name: "quantity", label: "Quantity", type: "number" },
  ],
  "Gifts & Corporate Items": [
    { name: "product", label: "Product", type: "select", options: ["Mug", "Keychain", "Lanyard", "Notebook", "Pen", "Tumbler", "USB Drive", "Calendar"] },
    { name: "printingMethod", label: "Printing Method", type: "select", options: ["UV Print", "Laser Engraving", "Sublimation", "Silkscreen"] },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "packaging", label: "Packaging", type: "select", options: ["Yes", "No"] },
  ],
  "Name Card": [
    { name: "size", label: "Size", type: "select", options: ["Standard", "Custom"] },
    { name: "paper", label: "Paper", type: "select", options: ["260 gsm", "310 gsm", "Art Card", "Linen", "Kraft"] },
    { name: "printing", label: "Printing", type: "select", options: ["Single Sided", "Double Sided"] },
    { name: "corners", label: "Corners", type: "select", options: ["Square", "Rounded"] },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "lamination", label: "Lamination", type: "select", options: ["Matte", "Gloss", "None"] },
  ],
};

const customerFieldNames = ["name", "company", "phoneNumber", "address", "remark"];

async function submitQuotationRequest(formData) {
  let response;
  try {
    // Do not set Content-Type: the browser adds the multipart boundary itself.
    response = await fetch("/api/quotations", { method: "POST", body: formData });
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(
      result?.message || "Could not submit your quotation request. Please try again.",
    );
  }
}

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, "", path);
    setPathname(path);
    window.scrollTo(0, 0);
  }

  if (pathname === "/quotation-success") {
    return <SuccessPage onNavigate={navigate} />;
  }

  return <QuotationRequestPage onSubmitSuccess={() => navigate("/quotation-success")} />;
}

function QuotationRequestPage({ onSubmitSuccess }) {
  const [serviceType, setServiceType] = useState("");
  const [details, setDetails] = useState({});
  const [artworkFiles, setArtworkFiles] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    company: "",
    phoneNumber: "",
    address: "",
    remark: "",
  });
  const [customerTouched, setCustomerTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showFormError, setShowFormError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef(null);
  const fields = serviceFields[serviceType] || [];

  function updateField(event) {
    const { name, value } = event.target;
    setDetails((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function adjustQuantity(amount) {
    const quantity = Number(details.quantity);
    const currentQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
    setDetails((current) => ({
      ...current,
      quantity: String(Math.max(1, currentQuantity + amount)),
    }));
    setErrors((current) => ({ ...current, quantity: undefined }));
  }

  function updateService(event) {
    setServiceType(event.target.value);
    setDetails({});
    setArtworkFiles([]);
    setErrors({});
    setShowFormError(false);
  }

  function updateClothingType(option) {
    setDetails((current) => ({ ...current, clothingType: option }));
    setErrors((current) => ({ ...current, clothingType: undefined }));
  }

  function validateCustomerDetails(values) {
    const nextErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (!/^[\p{L} ]+$/u.test(values.name.trim())) {
      nextErrors.name = "Use letters and spaces only";
    }

    if (!/^\d{10,12}$/.test(values.phoneNumber)) {
      nextErrors.phoneNumber = "Enter a phone number with 10 to 12 digits";
    }

    if (values.address.trim().length < 10) {
      nextErrors.address = "Address must be at least 10 characters";
    }
    return nextErrors;
  }

  const customerErrors = validateCustomerDetails(customerDetails);
  const customerDetailsValid = Object.keys(customerErrors).length === 0;

  function updateCustomerField(event) {
    const { name, value } = event.target;
    setCustomerDetails((current) => ({ ...current, [name]: value }));
  }

  function validateItem() {
    const nextErrors = {};
    for (const field of fields) {
      const value = details[field.name];
      if (field.type === "radio") {
        if (!value) {
          nextErrors[field.name] = "Select an option";
        }
      } else if (value === undefined || String(value).trim() === "") {
        nextErrors[field.name] = "This field is required";
      } else if (field.type === "number" && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
        nextErrors[field.name] = "Enter a whole number greater than 0";
      }
    }
    if (!artworkFiles.some((entry) => !entry.error)) {
      nextErrors.artwork = "Upload an artwork file for this item";
    }
    return nextErrors;
  }

  function handleAddItem() {
    const nextErrors = validateItem();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShowFormError(true);
      return;
    }

    setCart((current) => [
      ...current,
      {
        id: window.crypto.randomUUID(),
        serviceType,
        details: { ...details },
        artwork: artworkFiles.find((entry) => !entry.error).file,
      },
    ]);
    setDetails({});
    setArtworkFiles([]);
    setErrors({});
    setShowFormError(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (cart.length === 0 || submitting) return;

    setCustomerTouched(Object.fromEntries(customerFieldNames.map((name) => [name, true])));
    if (!customerDetailsValid) return;

    const formData = new FormData();
    formData.append(
      "cart",
      JSON.stringify(
        cart.map(({ serviceType: type, details: itemDetails }) => ({
          service_type: type,
          item_details: itemDetails,
          quantity: itemDetails.quantity ? Number(itemDetails.quantity) : null,
        })),
      ),
    );
    cart.forEach((item) => formData.append("artwork", item.artwork));
    formData.append("name", customerDetails.name.trim());
    formData.append("company", customerDetails.company.trim());
    formData.append("phoneNumber", customerDetails.phoneNumber);
    formData.append("address", customerDetails.address.trim());
    formData.append("remark", customerDetails.remark.trim());

    setSubmitting(true);
    setSubmitError("");
    try {
      await submitQuotationRequest(formData);
      onSubmitSuccess();
    } catch (error) {
      setSubmitError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-10 pt-3 text-text-primary sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-[720px]">
        <PageHeader />

        <div className="pb-6 pt-7 sm:pt-9">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Request a Quotation
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Add each product and its artwork to your quotation request.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Card className="space-y-5 p-4 sm:p-7">
            {showFormError && Object.keys(errors).length > 0 && (
              <ErrorBanner
                message="Please complete the required item details and upload its artwork."
                onDismiss={() => setShowFormError(false)}
              />
            )}

            <SelectDropdown
              label="Type of Service"
              name="serviceType"
              required
              value={serviceType}
              onChange={updateService}
              options={[
                { value: "", label: "Select a service", disabled: true },
                ...serviceOptions.map((option) => ({ value: option, label: option })),
              ]}
            />

            {fields.length > 0 && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map((field) =>
                    field.type === "radio" ? (
                      <fieldset key={field.name} className="sm:col-span-2">
                        <legend className="mb-2 text-sm font-medium">
                          {field.label}<span className="ml-1 text-primary" aria-hidden="true">*</span>
                        </legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {field.options.map((option) => (
                            <label
                              key={option}
                              className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                            >
                              <input
                                type="radio"
                                name={field.name}
                                value={option}
                                checked={details[field.name] === option}
                                onChange={() => updateClothingType(option)}
                                className="size-4 accent-primary"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                        {errors[field.name] && (
                          <p role="alert" className="mt-1.5 text-sm text-danger">{errors[field.name]}</p>
                        )}
                      </fieldset>
                    ) : field.type === "select" ? (
                      <SelectDropdown
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        required
                        value={details[field.name] || ""}
                        onChange={updateField}
                        error={errors[field.name]}
                        options={[
                          { value: "", label: `Select ${field.label.toLowerCase()}`, disabled: true },
                          ...field.options.map((option) => ({ value: option, label: option })),
                        ]}
                      />
                    ) : field.name === "quantity" ? (
                      <FormFieldWrapper
                        key={field.name}
                        label={field.label}
                        required
                        error={errors[field.name]}
                        helperText={field.helperText}
                        htmlFor="service-quantity"
                      >
                        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] gap-2">
                          <SecondaryButton
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => adjustQuantity(-1)}
                            disabled={!Number.isInteger(Number(details.quantity)) || Number(details.quantity) <= 1}
                            className="px-0"
                          >
                            -
                          </SecondaryButton>
                          <input
                            id="service-quantity"
                            name={field.name}
                            type="number"
                            min="1"
                            inputMode="numeric"
                            required
                            value={details[field.name] || ""}
                            onChange={updateField}
                            aria-invalid={Boolean(errors[field.name])}
                            aria-describedby={errors[field.name] || field.helperText ? "service-quantity-description" : undefined}
                            className={`min-h-11 w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-center text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                              errors[field.name] ? "border-danger" : "border-border"
                            }`}
                          />
                          <SecondaryButton
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => adjustQuantity(1)}
                            className="px-0"
                          >
                            +
                          </SecondaryButton>
                        </div>
                      </FormFieldWrapper>
                    ) : (
                      <TextInput
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        min={field.type === "number" ? "1" : undefined}
                        inputMode={field.type === "number" ? "numeric" : undefined}
                        required
                        placeholder={field.placeholder}
                        helperText={field.helperText}
                        value={details[field.name] || ""}
                        onChange={updateField}
                        error={errors[field.name]}
                      />
                    ),
                  )}
                </div>

                <section aria-labelledby="artwork-heading">
                  <h2 id="artwork-heading" className="mb-2 text-sm font-medium">
                    Artwork<span className="ml-1 text-primary" aria-hidden="true">*</span>
                  </h2>
                  <FileUploadZone
                    inputRef={fileInputRef}
                    multiple={false}
                    onFilesSelected={setArtworkFiles}
                  />
                  {artworkFiles.filter((entry) => !entry.error).map((entry) => (
                    <div key={entry.id} className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="truncate">{entry.file.name}</span>
                      <DestructiveButton
                        type="button"
                        onClick={() => setArtworkFiles([])}
                        className="shrink-0"
                      >
                        Remove
                      </DestructiveButton>
                    </div>
                  ))}
                  {artworkFiles.filter((entry) => entry.error).map((entry) => (
                    <p key={entry.id} role="alert" className="mt-2 text-sm text-danger">
                      {entry.error}
                    </p>
                  ))}
                  {errors.artwork && <p role="alert" className="mt-1.5 text-sm text-danger">{errors.artwork}</p>}
                </section>

                <PrimaryButton type="button" onClick={handleAddItem} className="w-full">
                  + Add Item to Quote Request
                </PrimaryButton>
              </>
            )}
          </Card>

          <section className="mt-7" aria-labelledby="cart-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="cart-heading" className="text-lg font-semibold">Quote Request Items</h2>
              <span className="text-sm text-text-secondary">{cart.length} {cart.length === 1 ? "item" : "items"}</span>
            </div>
            {cart.length === 0 ? (
              <Card className="px-4 py-8 text-center text-sm text-text-muted">
                Your quote request is empty. Add a product above to get started.
              </Card>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <Card key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{index + 1}. {item.serviceType}</h3>
                      <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm text-text-secondary sm:grid-cols-2">
                        {Object.entries(item.details).map(([name, value]) => (
                          <div key={name} className="flex gap-1">
                            <dt className="capitalize">{name.replace(/([A-Z])/g, " $1")}:</dt>
                            <dd>{Array.isArray(value) ? value.join(", ") : value}</dd>
                          </div>
                        ))}
                        <div className="flex gap-1"><dt>Artwork:</dt><dd className="truncate">{item.artwork.name}</dd></div>
                      </dl>
                    </div>
                    <DestructiveButton
                      type="button"
                      onClick={() => setCart((current) => current.filter((entry) => entry.id !== item.id))}
                      className="shrink-0"
                    >
                      Remove
                    </DestructiveButton>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="mt-7" aria-labelledby="customer-details-heading">
            <h2 id="customer-details-heading" className="mb-3 text-lg font-semibold">
              Customer Details
            </h2>
            <Card className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
              <TextInput
                label="Name"
                name="name"
                required
                autoComplete="name"
                placeholder="Your name"
                value={customerDetails.name}
                onChange={updateCustomerField}
                onBlur={() => setCustomerTouched((current) => ({ ...current, name: true }))}
                error={customerTouched.name ? customerErrors.name : undefined}
              />
              <TextInput
                label="Company"
                name="company"
                autoComplete="organization"
                placeholder="Company name (optional)"
                value={customerDetails.company}
                onChange={updateCustomerField}
              />
              <TextInput
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                placeholder="10 to 12 digits"
                value={customerDetails.phoneNumber}
                onChange={updateCustomerField}
                onBlur={() => setCustomerTouched((current) => ({ ...current, phoneNumber: true }))}
                error={customerTouched.phoneNumber ? customerErrors.phoneNumber : undefined}
              />
              <TextInput
                label="Address"
                name="address"
                as="textarea"
                autoComplete="street-address"
                required
                placeholder="Enter your address"
                value={customerDetails.address}
                onChange={updateCustomerField}
                onBlur={() => setCustomerTouched((current) => ({ ...current, address: true }))}
                error={customerTouched.address ? customerErrors.address : undefined}
              />
              <TextInput
                label="Remark"
                name="remark"
                as="textarea"
                placeholder="Optional notes"
                value={customerDetails.remark}
                onChange={updateCustomerField}
                className="sm:col-span-2"
              />
            </Card>
          </section>

          {submitError && (
            <div className="mt-5">
              <ErrorBanner message={submitError} onDismiss={() => setSubmitError("")} />
            </div>
          )}

          <PrimaryButton
            type="submit"
            loading={submitting}
            disabled={cart.length === 0 || !customerDetailsValid || submitting}
            className="mt-5 w-full"
          >
            {submitting ? "Submitting..." : "Submit Quotation Request"}
          </PrimaryButton>
        </form>
      </div>
    </main>
  );
}

function SuccessPage({ onNavigate }) {
  return (
    <main className="min-h-screen bg-background px-4 py-3 text-text-primary sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-[640px]">
        <PageHeader onBack={() => onNavigate("/")} />
        <Card className="mt-8 px-5 py-10 text-center sm:px-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Quotation request submitted</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
            Thank you. We received your request and will send you a price soon.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back to quotation form
          </button>
        </Card>
      </div>
    </main>
  );
}

export default App;
