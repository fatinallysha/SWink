import { useEffect, useRef, useState } from "react";
import {
  Card,
  DestructiveButton,
  FileUploadZone,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
} from "./components.jsx";

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArtworkThumbnail({ file }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <img
      src={previewUrl}
      alt={`Preview of ${file.name}`}
      className="size-14 shrink-0 rounded-lg border border-border object-cover"
    />
  );
}

function UploadedFileCard({ entry, onRemove, onTryAgain }) {
  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      {!entry.error && /\.(jpe?g|png)$/i.test(entry.file.name) && (
        <ArtworkThumbnail file={entry.file} />
      )}
      <div className="min-w-0 flex-1">
        <p className="break-all text-sm font-medium text-text-primary">
          {entry.file.name}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {formatFileSize(entry.file.size)}
        </p>
        {entry.error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {entry.error}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {entry.error && (
          <SecondaryButton
            type="button"
            onClick={() => onTryAgain(entry.id)}
          >
            Try Again
          </SecondaryButton>
        )}
        <DestructiveButton type="button" onClick={() => onRemove(entry.id)}>
          Remove
        </DestructiveButton>
      </div>
    </Card>
  );
}

function ArtworkUploadPage({
  files,
  onFilesChange,
  onContinue,
  onBack,
}) {
  const fileInputRef = useRef(null);
  const canContinue = files.some((entry) => !entry.error);

  function addFiles(newFiles) {
    onFilesChange((currentFiles) => [...currentFiles, ...newFiles]);
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-8 pt-3 text-text-primary sm:px-6 sm:pt-6">
      <div className="mx-auto w-full max-w-[640px]">
        <PageHeader onBack={onBack} />

        <div className="pb-6 pt-7 sm:pt-9">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Upload Artwork
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Attach your design file to this quotation request.
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <FileUploadZone
            inputRef={fileInputRef}
            onFilesSelected={addFiles}
          />
        </Card>

        <Card className="mt-5 flex gap-3 p-4 sm:p-5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 size-5 shrink-0 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5m0-8h.01" />
          </svg>
          <p className="text-sm leading-6 text-text-secondary">
            Your artwork will be linked to this quotation request. Our team
            will review it before sending your price.
          </p>
        </Card>

        <PrimaryButton
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="mt-5 w-full"
        >
          Continue
        </PrimaryButton>

        <section className="mt-8" aria-labelledby="uploaded-files-heading">
          <h2
            id="uploaded-files-heading"
            className="mb-3 text-base font-semibold"
          >
            Uploaded files
          </h2>
          {files.length === 0 ? (
            <Card className="px-4 py-6 text-center text-sm text-text-muted">
              No files uploaded yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {files.map((entry) => (
                <UploadedFileCard
                  key={entry.id}
                  entry={entry}
                  onRemove={(id) =>
                    onFilesChange((currentFiles) =>
                      currentFiles.filter((file) => file.id !== id),
                    )
                  }
                  onTryAgain={(id) => {
                    onFilesChange((currentFiles) =>
                      currentFiles.filter((file) => file.id !== id),
                    );
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                      fileInputRef.current.click();
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default ArtworkUploadPage;
