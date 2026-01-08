# Outreach Campaigns Feature Plan

**Goal:** Turn Kin into an outbound relationship management tool by allowing users to draft and track bulk personalized emails.

## 1. Core Concept
Users can create "Campaigns" consisting of an email template and a list of recipients. The system facilitates sending these emails by generating pre-filled Gmail draft links (`mailto` or Gmail specific URLs). Crucially, clicking the "Draft" button automatically logs the interaction in Kin, keeping history up to date without manual data entry.

## 2. Database Schema

We need two new tables to track the campaigns and who is in them.

### `campaigns`
*   `id`: Primary Key (INTEGER AUTOINCREMENT)
*   `title`: Internal name (e.g., "Jan 2026 Update") (TEXT)
*   `subject_template`: The email subject line. (TEXT)
*   `body_template`: The email body. Support simple variables like `{name}`. (TEXT)
*   `created_at`: Timestamp. (INTEGER)

### `campaign_recipients`
*   `id`: Primary Key (INTEGER AUTOINCREMENT)
*   `campaign_id`: Foreign Key referencing `campaigns(id)`.
*   `person_id`: Foreign Key referencing `people(id)`.
*   `status`: 'pending' | 'sent'. (TEXT)
*   `sent_at`: Timestamp (nullable). (INTEGER)

## 3. Workflow & Logic

### A. Creating & Editing
*   User creates a campaign (e.g. "Monthly Newsletter").
*   User writes the body using placeholders: *"Hi {name}, just checking in..."*
*   User searches and adds people to the list (using the existing search API).

### B. The "Send" Action (The Magic)
When the user clicks "Draft Email" for a specific recipient (e.g., Alice):

1.  **Frontend Generation:** The app generates a specific Gmail URL:
    `https://mail.google.com/mail/?view=cm&fs=1&to=alice@example.com&su=Hello&body=Hi Alice...`
    *   *Note:* The body template variables (`{name}`) are replaced with the actual person's data before generating the link.
2.  **Browser Action:** Opens this URL in a new tab.
3.  **Background Action:** The Frontend *simultaneously* fires a request to `POST /api/campaigns/{id}/log-send`.
4.  **Backend Logic:**
    *   Updates `campaign_recipients` status to `sent`.
    *   **Crucial:** Inserts a record into the `interactions` table:
        *   `type`: 'email'
        *   `summary`: "Sent campaign email: [Campaign Title]"
        *   `person_id`: [Recipient ID]
        *   `date`: Now.

## 4. API Endpoints

*   `GET /api/campaigns`: List all campaigns.
*   `POST /api/campaigns`: Create new.
*   `GET /api/campaigns/:id`: Get details + list of recipients (with their status).
*   `PUT /api/campaigns/:id`: Update templates.
*   `POST /api/campaigns/:id/recipients`: Add a person (or list of people) to the campaign.
*   `DELETE /api/campaigns/:id/recipients/:person_id`: Remove a person.
*   `POST /api/campaigns/:id/send/:person_id`: Mark as sent & log interaction.

## 5. UI/UX

*   **New Sidebar Item:** "Campaigns".
*   **Campaign Detail Page:**
    *   **Header:** Title, Subject input, Body input (TextArea).
    *   **Recipient Management:** "Add Person" autocomplete search.
    *   **List:** Table of recipients.
        *   Columns: Name, Email, Status.
        *   **Action:** A "Open Gmail" button.
            *   *Pending State:* Blue "Draft" button.
            *   *Sent State:* Green "Sent" checkmark (maybe disabled or clickable to re-send).

## 6. Technical Considerations
*   **Gmail URL Limits:** URLs have length limits (approx 2000 chars). For very long emails, this method might truncate. We should warn the user or suggest shorter templates.
*   **Variable Replacement:** Simple string replacement `template.replace('{name}', person.name)` is sufficient for Phase 1.
*   **Safety:** Ensure `mailto` or Gmail links are properly URI encoded to handle spaces and special characters.
