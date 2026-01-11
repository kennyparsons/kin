# Visual Design Principles

This document defines the visual identity and user interface standards for the application. It ensures a cohesive, professional, and accessible aesthetic across all modules.

---

## 1. Core Aesthetic: "Professional Simplicity"

The design language is rooted in **Material Design principles** and **Tailwind CSS defaults**. It aims for a "Clean SaaS" look: high contrast, generous whitespace, and subtle depth.

### A. Minimalist Foundation
- **Backgrounds:** Use light grays (`bg-gray-50`) for page backgrounds to provide subtle contrast against white content containers.
- **Surface Elevation:** Content containers (cards, lists) should be white (`bg-white`) with rounded corners (`rounded-xl`) and a very soft shadow (`shadow-sm`) or a thin border (`border-gray-200`).

---

## 2. Color Palette

We use a restricted color palette to convey status, primary actions, and hierarchy. All colors are derived from the Tailwind CSS v3 default palette.

### A. Primary Branding (Blue)
- **Primary:** `blue-600` (#2563EB) - Used for primary buttons, active sidebar icons, and text links.
- **Surface:** `blue-50` (#EFF6FF) - Used for the background of active navigation items and "Success" notification banners.
- **Border:** `blue-200` (#BFDBFE) - Used for borders on focused inputs or active cards.

### B. Neutral Scale (Grayscale)
- **Page Background:** `gray-50` (#F9FAFB) - Use for the main app background to lift white cards.
- **Card Background:** `white` (#FFFFFF) - All content containers.
- **Primary Text:** `gray-900` (#111827) - Used for headings, names, and high-emphasis labels.
- **Secondary Text:** `gray-600` (#4B5563) - Used for body text, metadata descriptions, and secondary labels.
- **Muted Text:** `gray-400` (#9CA3AF) - Used for icons, placeholders, and disabled states.
- **Surface Border:** `gray-200` (#E5E7EB) - Standard divider and container border color.
- **Subtle Surface:** `gray-100` (#F3F4F6) - Hover states for rows and buttons.

### C. Semantic / Status Colors
- **Success:** `emerald-600` (#059669)
    - *Usage:* Completion checkmarks, "Healthy" status dots, success toasts.
- **Warning:** `amber-500` (#F59E0B)
    - *Usage:* "Due Soon" date warnings, low-priority alerts.
- **Danger:** `red-600` (#DC2626)
    - *Usage:* Delete buttons, "Overdue" status dots, error messages.
- **Isolation/Context:** `indigo-600` (#4F46E5)
    - *Usage:* Multi-project indicators or "Function" tags to distinguish from primary actions.

---

## 3. Typography

- **Font Family:** Standard sans-serif stack (Inter, system fonts).
- **Headings:**
    - Page Titles: `text-3xl font-bold text-gray-900`.
    - Section Headers: `text-lg font-bold text-gray-900`.
    - Subheaders: `text-sm font-bold text-gray-400 uppercase tracking-wider`.
- **Body Text:** `text-sm` or `text-base` with `text-gray-600` or `text-gray-800`.
- **Emphasis:** Use font weight (`font-medium` or `font-semibold`) rather than color where possible to maintain clean aesthetics.

---

## 4. Components & Interaction

### A. Buttons
- **Primary:** `bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700`.
- **Secondary/Outline:** `border border-gray-300 text-gray-700 hover:bg-gray-50`.
- **Ghost/Action:** `text-gray-400 hover:text-blue-600 p-2 transition-colors`.
- **Critical Action:** `text-red-600 hover:bg-red-50`.

### B. Input Fields
- **Standard:** `rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none`.
- **Selects:** Always use a custom styled appearance or standard rounded border to match inputs. Ensure icons (like `ChevronDown`) are used to indicate interactivity.

### C. Lists & Tables
- **Standard:** "Empty" state padding should be consistent (`p-8`).
- **Rows:** `hover:bg-gray-50 transition-colors` to indicate clickability.
- **Dividers:** Use `divide-y divide-gray-100` for subtle separation.

---

## 5. Layout & Spacing

### A. The "8px Grid"
All margins and paddings should ideally be multiples of 4 (Tailwind units).
- `p-4` (16px) for small cards.
- `p-6` (24px) for main content areas.
- `mb-8` (32px) for spacing between major sections (e.g., Header to List).

### B. Responsive Containers
- **Main Content:** Max width of `max-w-5xl` or `max-w-4xl` depending on content density, centered with `mx-auto`.
- **Sidebars:**
    - Fixed width (`w-64`) on desktop.
    - Mobile: Full height overlay with smooth transition (`translate-x`).

---

## 6. Icons & Imagery

- **Iconography:** Exclusively use [Lucide React](https://lucide.dev/).
- **Sizing:** Standardize on `size={20}` for nav/primary actions, `size={16}` or `size={14}` for metadata/inline icons.
- **Avatars:** Use rounded-full backgrounds with initials for people and projects to provide a personal touch without requiring images.
