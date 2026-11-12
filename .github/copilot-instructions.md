# SWink Project Custom Instructions

You are an expert React and Tailwind CSS developer helping build "SWink" — a customized printing order and quotation system PWA for SW Personalize Signature.

Please always follow these design system rules and create these reusable components for every page you build:

**Brand & Style:**
- Logo: Text wordmark "SWink" in bold.
- Colors: Neutral dark + gold accent colors (use placeholders until real assets arrive).
- Mobile-first responsive scaling. All tap targets must be at least 44px tall.

**Typography:**
- System sans-serif stack. Define Heading 1/2/3 sizes, Body text, and Caption text.

**Tailwind Color Tokens:**
- primary, primary-hover, secondary, danger, success, warning, neutral-50 through neutral-900, background, surface, border, text-primary, text-secondary, text-muted.

**Reusable Components to Create/Use:**
1. **Buttons:** PrimaryButton, SecondaryButton, DestructiveButton, DisabledButton (with hover, focus, loading, and disabled states).
2. **TextInput:** Label, placeholder, helper text, required asterisk, and error state (red border + red message below).
3. **SelectDropdown:** Same states as TextInput.
4. **StatusBadge:** Color-coded variants: pending (amber), in-progress (blue), completed (green), cancelled (red), received, printing, finishing, delivered.
5. **FormFieldWrapper:** Label + input + error message + required indicator.
6. **Card:** Rounded container with subtle shadow.
7. **PageHeader:** Wordmark logo left, optional back button, optional user menu.
8. **EmptyState:** Icon + heading + description + optional action button.
9. **LoadingSpinner** and **SkeletonLoader**.
10. **ErrorBanner:** Dismissible top banner for form-level errors.
11. **FileUploadZone:** Dashed border drop zone with icon, "Drag & drop or browse" text, format + size hint, click-to-browse support, and states: idle, drag-over, uploading, uploaded, error.

Ensure all components are exported so they can be imported into pages.