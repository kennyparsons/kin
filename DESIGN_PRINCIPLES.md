# Design Principles & Architecture Guide

This document outlines the core architectural decisions, design patterns, and standards for the application. It serves as the "Constitution" for development, ensuring consistency, scalability, and security as the project evolves.

---

## 1. Technology Stack

We leverage a modern, edge-first stack designed for performance, low operational overhead, and developer experience.

*   **Runtime & API:** [Cloudflare Workers](https://workers.cloudflare.com/) (Serverless, V8-based).
*   **Framework:** [Hono](https://hono.dev/) (Lightweight, web-standards compliant, ultrafast router).
*   **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the Edge).
*   **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Build tool).
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first).
*   **Deployment:** Cloudflare Pages (Frontend) + Workers (Backend).

---

## 2. Data Architecture

### A. Identification (UUIDs)
*   **Principle:** **Use UUIDs (Universally Unique Identifiers) for all Primary Keys.**
*   **Why:**
    *   **Security:** Prevents ID enumeration (e.g., guessing `id=101` after seeing `id=100`).
    *   **Scale:** Allows distributed ID generation without database coordination.
    *   **Merging:** Simplifies merging datasets or syncing between environments.
*   **Implementation:** Use standard UUID v4 or v7 (time-sortable) stored as TEXT in SQLite.

### B. Multi-Tenancy (Projects)
*   **Principle:** **"Project" is the hard isolation boundary.**
*   **Concept:** The application allows a single user identity to manage multiple distinct contexts (e.g., "Work", "Personal", "Side Business") via **Projects**.
*   **Rule:** Every domain entity (e.g., Contacts, Tasks, Campaigns) **MUST** belong to a specific Project (`project_id`).
*   **Isolation:** Data from Project A must *never* leak into Project B, neither in the UI nor via the API.

---

## 3. Security & Access Control

### A. Zero Trust API
*   **Principle:** **The API is the boundary. The Frontend is untrusted.**
*   **Enforcement:**
    *   Never rely on the frontend to filter data.
    *   Every API request (GET, POST, PUT, DELETE) must verify:
        1.  **Authentication:** Who is the user?
        2.  **Context:** Which Project are they accessing? (`X-Project-ID` header).
        3.  **Authorization:** Does this User have permission to access this Project?
    *   **Query Scope:** All SQL queries must explicitly include `WHERE project_id = ?` to prevent crafted requests from accessing unauthorized data.

### B. RBAC (Role-Based Access Control)
*   **Principle:** **Permissions are granular; Roles are grouping mechanisms.**
*   **Definitions:**
    *   **Permission:** A granular ability (e.g., `project:write`, `user:invite`, `billing:read`).
    *   **Role:** A collection of permissions (e.g., `Owner` = `*`, `Editor` = `project:write`, `Viewer` = `project:read`).
*   **Authorization Engine:** API middleware should evaluate permissions, not just roles.
    *   *Bad:* `if (user.role === 'Admin')`
    *   *Good:* `if (can(user, 'project:delete'))`

---

## 4. UI/UX Patterns ("The Standard")

To maintain a consistent and professional user experience, we adhere to a strict **List-Detail-Edit** separation pattern. Avoid "Inline Editing" for complex entities.

### A. Page Structure
1.  **List View (`/resource`)**
    *   **Purpose:** Scan, search, and filter.
    *   **Components:** Search bar (top), Filters (grid/row), Data Grid/List.
    *   **Actions:** "Create New" (Primary Button), Bulk Actions.
    *   **Interaction:** Clicking a row navigates to the **Detail View**.

2.  **Detail View (`/resource/:id`)**
    *   **Purpose:** Read and consume information.
    *   **State:** Read-only by default.
    *   **Layout:** High-level summary at top, detailed tabs or sections below.
    *   **Actions:** "Edit" (Navigates to Form), "Delete" (Critical action).

3.  **Edit/Create Form (`/resource/:id/edit` or `/resource/new`)**
    *   **Purpose:** Focused data entry.
    *   **State:** Full page form (or large modal for simple entities).
    *   **Validation:** Client-side validation before submission.
    *   **Navigation:** "Cancel" returns to previous view. "Save" commits and redirects to Detail View.

### B. Navigation Hierarchy
*   **Primary Sidebar:** High-level app modules (Dashboard, Resources, Settings).
*   **Context Switcher:** Project/Workspace selector resides at the top of the Sidebar.
*   **Sub-Navigation (Settings):** For complex modules like Settings, use an **Inner Sidebar** pattern (`/settings/users`, `/settings/billing`) rather than a dropdown or tabs, to maintain a clean URL structure and deep-linking capability.

---

## 5. Development Guidelines

### A. Extensibility
*   **Schema First:** When adding a feature, start with the Database Schema (`migrations`).
*   **API Second:** Build robust endpoints (`api/src`) that enforce the Security Principles above.
*   **UI Last:** Build the Frontend (`web/src`) to consume the API.

### B. "No Orphan" Rule
*   **Cascading Deletes:** Use Database Foreign Keys (`ON DELETE CASCADE`) to ensure data hygiene. If a Project is deleted, all its Contacts, Tasks, and Notes must vanish instantly.

### C. State Management
*   **Context:** Use React Context for global, slowly-changing state (Auth, Current Project).
*   **Local State:** Use `useState`/`useEffect` for page-specific data.
*   **Optimistic Updates:** For simple toggles (e.g., "Mark Complete"), update the UI immediately while the API request processes in the background.
