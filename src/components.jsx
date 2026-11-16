import { useId, useState } from "react";

const fieldClassName =
  "min-h-11 w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

export function FormFieldWrapper({
  label,
  required = false,
  error,
  helperText,
  htmlFor,
  children,
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-text-primary"
        >
          {label}
          {required && (
            <span className="ml-1 text-primary" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-description` : undefined}
          className="text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={htmlFor ? `${htmlFor}-description` : undefined}
          className="text-xs leading-5 text-text-muted"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  label,
  required,
  error,
  helperText,
  className = "",
  as = "input",
  id: providedId,
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const Element = as;

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      htmlFor={id}
    >
      <Element
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${id}-description` : undefined}
        className={`${fieldClassName} ${
          as === "textarea" ? "min-h-28 resize-y" : ""
        } ${error ? "border-danger" : "border-border"} ${className}`}
      />
    </FormFieldWrapper>
  );
}

export function SelectDropdown({
  label,
  required,
  error,
  helperText,
  options = [],
  id: providedId,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      htmlFor={id}
    >
      <select
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? `${id}-description` : undefined}
        className={`${fieldClassName} ${
          error ? "border-danger" : "border-border"
        } ${className}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormFieldWrapper>
  );
}

const buttonStyles = {
  primary:
    "bg-primary text-neutral-900 hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "border border-border bg-neutral-800 text-text-primary hover:bg-neutral-700 focus-visible:outline-primary",
  destructive:
    "bg-danger text-white hover:bg-red-700 focus-visible:outline-danger",
};

function Button({ variant = "primary", disabled = false, loading, children, ...props }) {
  return (
    <button
      {...props}
      type={props.type || "button"}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${
        props.className || ""
      }`}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}

export function PrimaryButton(props) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props) {
  return <Button {...props} variant="secondary" />;
}

export function DestructiveButton(props) {
  return <Button {...props} variant="destructive" />;
}

export function DisabledButton(props) {
  return <Button {...props} disabled />;
}

export function StatusBadge({ status, children }) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-300",
    "in-progress": "bg-blue-500/15 text-blue-300",
    completed: "bg-green-500/15 text-green-300",
    cancelled: "bg-red-500/15 text-red-300",
    received: "bg-cyan-500/15 text-cyan-300",
    printing: "bg-violet-500/15 text-violet-300",
    finishing: "bg-orange-500/15 text-orange-300",
    delivered: "bg-green-500/15 text-green-300",
  };
  const variant = styles[status] ? status : "pending";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[variant]
      }`}
    >
      {children || status}
    </span>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <section
      {...props}
      className={`rounded-2xl border border-border bg-surface shadow-lg ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHeader({ onBack, userMenu }) {
  return (
    <header className="flex min-h-14 items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex size-11 items-center justify-center rounded-full text-text-secondary transition hover:bg-neutral-800 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
              <path d="M20 12H9" />
            </svg>
          </button>
        )}
        <a href="/" aria-label="SWink home" className="inline-flex items-center">
          <img src="/logo.png" alt="SWink" className="h-28 w-28" />
        </a>
      </div>
      {userMenu}
    </header>
  );
}

export function EmptyState({ icon, heading, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      {icon && <div className="text-text-muted">{icon}</div>}
      <h2 className="text-lg font-semibold text-text-primary">{heading}</h2>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <span
      aria-label="Loading"
      role="status"
      className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function SkeletonLoader({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-700 ${className}`}
    />
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200"
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="flex size-6 shrink-0 items-center justify-center rounded text-red-200 hover:bg-danger/20"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}

let nextArtworkFileId = 0;

export function FileUploadZone({ onFilesSelected, inputRef, multiple = true }) {
  const [dragging, setDragging] = useState(false);

  function chooseFiles(fileList) {
    const selectedFiles = Array.from(fileList || []);
    const files = (multiple ? selectedFiles : selectedFiles.slice(0, 1)).map((file) => {
      let error;
      if (file.size > 300 * 1024 * 1024) {
        error = "File exceeds 300MB limit. Please upload a smaller file.";
      } else if (!/\.(jpe?g|png|pdf|ai)$/i.test(file.name)) {
        error = "Unsupported format. Please upload JPG, PNG, PDF, or AI.";
      }

      return {
        id: `artwork-${nextArtworkFileId++}`,
        file,
        error,
      };
    });

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div
      role="group"
      tabIndex={0}
      onClick={() => openPicker()}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        chooseFiles(event.dataTransfer.files);
      }}
      className={`flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        dragging
          ? "border-primary bg-primary/10"
          : "border-neutral-600 bg-neutral-900/60 hover:border-primary/70"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mb-4 size-10 text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
      </svg>
      <p className="text-base font-semibold text-text-primary">
        Drag &amp; drop your file here
      </p>
      <p className="my-2 text-sm text-text-muted">or</p>
      <SecondaryButton
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openPicker();
        }}
      >
        Browse Files
      </SecondaryButton>
      <p className="mt-5 text-xs text-text-secondary">
        Accepted: JPG, PNG, PDF, AI
      </p>
      <p className="mt-1 text-xs text-text-muted">Maximum file size: 300MB</p>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,.ai"
        multiple={multiple}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          chooseFiles(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
