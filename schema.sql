CREATE TABLE IF NOT EXISTS memory_photos (
  id TEXT PRIMARY KEY,
  city_key TEXT NOT NULL,
  stop_index INTEGER NOT NULL,
  r2_key TEXT,
  pathname TEXT,
  journal TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memory_photos_city_stop
ON memory_photos (city_key, stop_index);

CREATE TABLE IF NOT EXISTS collage_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot INTEGER,
  r2_key TEXT NOT NULL,
  pathname TEXT NOT NULL UNIQUE,
  source_url TEXT,
  uploaded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collage_photos_slot
ON collage_photos (slot);

CREATE TABLE IF NOT EXISTS feelings (
  date_key TEXT PRIMARY KEY,
  score INTEGER NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  saved_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hugs (
  date_key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
