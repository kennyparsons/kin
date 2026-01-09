CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  manager_name TEXT,
  role TEXT,
  tags TEXT,
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  summary TEXT,
  date INTEGER DEFAULT (unixepoch()),
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  due_date INTEGER,
  status TEXT DEFAULT 'pending',
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
);
