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

CREATE TABLE IF NOT EXISTS collage_projects (
  project_id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  layout TEXT NOT NULL DEFAULT 'grid',
  canvas_json TEXT NOT NULL DEFAULT '{}',
  boxes_json TEXT NOT NULL DEFAULT '[]',
  style_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collage_assets (
  asset_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'default',
  r2_key TEXT NOT NULL,
  pathname TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT '',
  size INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collage_assets_project
ON collage_assets (project_id, uploaded_at);
