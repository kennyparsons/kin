# Email Import Skill

This document defines the procedure for importing email export JSON data into the Kin CRM database.

## 1. Input Format
The input is a JSON array of email objects matching this schema:
```json
[
  {
    "threadId": "19b9efb64618a684",
    "participants": [
      { "name": "Me", "email": "my.email@wiz.io" },
      { "name": "External Contact", "email": "contact@example.com" }
    ],
    "subject": "Meeting Follow-up",
    "date": "Thu, Jan 8, 2026, 1:24 PM",
    "snippet": "Great chatting with you...",
    "fullBody": "..."
  }
]
```

## 2. Processing Rules

### A. Filtering Participants
*   **Ignore Internal:** Any participant with an email domain of `@wiz.io` is considered internal and MUST be ignored.
*   **Identify External:** Any participant *without* `@wiz.io` is a **Target Contact**.
*   **Empty:** If a thread has NO external participants, skip the entire thread.

### B. Person Resolution
For every Target Contact found in the `participants` list:
1.  **Check Existence:** Query the `people` table by `email`.
    ```sql
    SELECT id, name FROM people WHERE email = 'contact@example.com';
    ```
2.  **Create (If Missing):** If the person does not exist, they must be created.
    *   **Name:** Use the `name` field from the JSON.
    *   **Email:** Use the `email` field.
    *   **Company:** Attempt to infer from email domain (e.g., `@google.com` -> "Google") or leave blank.
    *   **Action:** Execute `INSERT INTO people ...` and capture the new `id`.

### C. Interaction Logging
For every unique thread, create an Interaction record for **EACH** Target Contact involved in that thread.

*   **Date Parsing:** Convert the `date` string (e.g., "Thu, Jan 8, 2026, 1:24 PM") to a Unix Timestamp (seconds).
    *   *Note:* Ensure timezone handling is consistent (UTC vs Local).
*   **Summary:** Construct a summary string.
    *   Format: `"{Subject}"`
    *   Optionally append: ` - {Snippet}` if useful context.
*   **Type:** Always `'email'`.
*   **Action:** Execute SQL:
    ```sql
    INSERT INTO interactions (person_id, type, summary, date) 
    VALUES ({person_id}, 'email', '{Subject}', {timestamp});
    ```

## 3. Execution Steps (Agent Workflow)

1.  **Analyze:** Read the JSON and compile a list of **Unique New People** and **Interactions to Create**.
2.  **Report:** Present the list of "People to Create" to the user for verification (and optional details like Title/Location).
3.  **Execute Person Creation:** Run `INSERT` statements for new people.
4.  **Fetch IDs:** retrieve `id`s for all contacts (new and existing).
5.  **Execute Interaction Logging:** Run batch `INSERT` statements for the interactions.
6.  **Verify:** Run a `SELECT` count or list to confirm the data landed correctly.

## 4. Edge Cases
*   **Duplicate Threads:** If the same thread appears multiple times (e.g., multiple exports), check for existing interactions on that date/subject before inserting to avoid duplicates.
*   **Missing Emails:** If a participant has no email, try to resolve by Name, otherwise flag for manual review.
