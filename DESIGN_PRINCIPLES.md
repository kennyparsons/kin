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

We use a restricted color palette to convey status, primary actions, and hierarchy without overwhelming the user.

- **Primary (Blue):** `#2563EB` (Tailwind `blue-600`). Used for primary buttons, active navigation states, and branding.
- **Neutral (Gray):** A scale from `gray-50` to `gray-900`. 
    - `gray-900`: Headings and primary text.
    - `gray-600`: Secondary text/labels.
    - `gray-400`: Placeholder text and disabled icons.
- **Status Colors:**
    - **Success (Green):** `emerald-600` / `green-600`. Toggles, completed statuses.
    - **Warning (Yellow):** `amber-500` / `yellow-500`. "Due Soon" indicators.
    - **Danger (Red):** `red-600`. Delete buttons, overdue statuses, errors.
    - **Info (Indigo/Purple):** `indigo-600`. Special groupings or metadata.

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
