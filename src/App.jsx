import { useEffect, useState } from "react";
import ArtworkUploadPage from "./ArtworkUploadPage.jsx";
import {
  Card,
  ErrorBanner,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectDropdown,
  TextInput,
} from "./components.jsx";

const initialValues = {
  product: "",
  quantity: "",
  name: "",
  company: "",
  address: "",
  contactNumber: "",
  items: "",
};

const productOptions = [
  { value: "", label: "Select a product", disabled: true },
  { value: "printed-shirts", label: "Printed shirts" },
  { value: "sublimation-shirts", label: "Sublimation shirts" },
  { value: "banners", label: "Banners" },
  { value: "business-cards", label: "Business cards" },
  { value: "corporate-gifts", label: "Corporate gifts" },
];

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [artworkFiles, setArtworkFiles] = useState([]);

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

  if (pathname === "/artwork-upload") {
    return (
      <ArtworkUploadPage
        files={artworkFiles}
        onFilesChange={setArtworkFiles}
        onContinue={() => navigate("/")}
        onBack={() => navigate("/")}
      />
    );
  }

  if (pathname === "/quotation-success") {
    return <SuccessPage onNavigate={navigate} />;
  }

  return (
    <QuotationRequestPage
      artworkFiles={artworkFiles}
      onArtworkNavigate={() => navigate("/artwork-upload")}
      onSubmitSuccess={() => navigate("/quotation-success")}
    />
  );
}

function QuotationRequestPage({
  artworkFiles,
  onArtworkNavigate,
  onSubmitSuccess,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showFormError, setShowFormError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    const nextValue =
      name === "quantity" ? value.replace(/\D/g, "") : value;
    setValues((current) => ({ ...current, [name]: nextValue }));

    if (name === "contactNumber") {
      const error = nextValue.trim()
        ? /^\d{7,15}$/.test(nextValue.trim())
          ? undefined
          : "Enter a valid contact number"
        : showFormError
          ? "This field is required"
          : undefined;
      setErrors((current) => ({ ...current, [name]: error }));
    } else if (errors[name]) {
      const error =
        showFormError && !nextValue.trim()
          ? "This field is required"
          : undefined;
      setErrors((current) => ({ ...current, [name]: error }));
    }
  }

  function validate() {
    const nextErrors = {};
    for (const field of [
      "product",
      "quantity",
      "name",
      "address",
      "contactNumber",
      "items",
    ]) {
      if (!values[field].trim()) nextErrors[field] = "This field is required";
    }
    if (
      values.contactNumber.trim() &&
      !/^\d{7,15}$/.test(values.contactNumber.trim())
    ) {
      nextErrors.contactNumber = "Enter a valid contact number";
    }
    if (values.quantity && Number(values.quantity) < 1) {
      nextErrors.quantity = "This field is required";
    }
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShowFormError(true);
      return;
    }
    setShowFormError(false);
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    onSubmitSuccess();
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-28 pt-3 text-text-primary sm:px-6 sm:pt-6 md:pb-10">
      <div className="mx-auto w-full max-w-[640px]">
        <PageHeader onBack={() => window.history.back()} />

        <div className="pb-6 pt-7 sm:pt-9">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Request a Quotation
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Fill in the details below and we'll send you a price.
          </p>
        </div>

        <Card className="p-4 sm:p-7">
          <form id="quotation-form" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {showFormError && (
                <ErrorBanner
                  message="Please fill in all required fields."
                  onDismiss={() => setShowFormError(false)}
                />
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectDropdown
                  label="Product"
                  name="product"
                  required
                  value={values.product}
                  onChange={updateField}
                  error={errors.product}
                  options={productOptions}
                />
                <TextInput
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  required
                  placeholder="Enter quantity"
                  value={values.quantity}
                  onChange={updateField}
                  error={errors.quantity}
                />
              </div>

              <SectionDivider>Your Details</SectionDivider>

              <div className="grid gap-5 md:grid-cols-2">
                <TextInput
                  label="Name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Your name"
                  value={values.name}
                  onChange={updateField}
                  error={errors.name}
                />
                <TextInput
                  label="Company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Company name (optional)"
                  value={values.company}
                  onChange={updateField}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <TextInput
                  label="Address"
                  name="address"
                  as="textarea"
                  autoComplete="street-address"
                  required
                  placeholder="Enter your address"
                  value={values.address}
                  onChange={updateField}
                  error={errors.address}
                />
                <TextInput
                  label="Contact Number"
                  name="contactNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  placeholder="e.g., 0123456789"
                  value={values.contactNumber}
                  onChange={updateField}
                  error={errors.contactNumber}
                />
              </div>

              <TextInput
                label="Items"
                name="items"
                type="text"
                required
                placeholder="Describe the items you need"
                helperText="e.g., 20 white t-shirts with logo"
                value={values.items}
                onChange={updateField}
                error={errors.items}
              />

              <SectionDivider>Artwork (optional)</SectionDivider>

              <p className="text-sm text-text-secondary">
                Attach your design file to this quotation request.
              </p>
              <SecondaryButton
                type="button"
                onClick={onArtworkNavigate}
                className="w-full"
              >
                {artworkFiles.some((file) => !file.error)
                  ? "Manage uploaded artwork"
                  : "Upload artwork"}
              </SecondaryButton>
              {artworkFiles.filter((file) => !file.error).length > 0 && (
                <ul className="space-y-2 text-sm text-text-secondary">
                  {artworkFiles
                    .filter((file) => !file.error)
                    .map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-lg border border-border px-3 py-2"
                      >
                        {entry.file.name}
                      </li>
                    ))}
                </ul>
              )}

              <div className="hidden pt-1 md:block">
                <PrimaryButton
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Submit Quotation Request"}
                </PrimaryButton>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto max-w-[640px]">
          <PrimaryButton
            type="submit"
            form="quotation-form"
            loading={submitting}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? "Submitting..." : "Submit Quotation Request"}
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}

function SectionDivider({ children }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <h2 className="shrink-0 text-sm font-semibold text-text-primary">
        {children}
      </h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function SuccessPage({ onNavigate }) {
  return (
    <main className="min-h-screen bg-background px-4 py-3 text-text-primary sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-[640px]">
        <PageHeader onBack={() => onNavigate("/")} />
        <Card className="mt-8 px-5 py-10 text-center sm:px-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">
            Quotation request submitted
          </h1>
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
