import { mediaUrl } from "./media.js";
import { nowIso } from "./http.js";

const defaultProjectId = "default";
const defaultBoxCount = 12;
const maxBoxes = 80;
const allowedLayouts = new Set(["grid", "mosaic", "heart", "circle", "story", "poster"]);

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function text(value, fallback = "") {
  return String(value ?? fallback).slice(0, 2000);
}

function number(value, fallback, minimum, maximum) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, minimum), maximum);
}

function bool(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function assetFromRow(row, request) {
  if (!row?.r2_key) {
    return null;
  }

  return {
    id: row.asset_id || row.pathname || row.r2_key,
    url: mediaUrl(request, row.r2_key),
    pathname: row.pathname || row.r2_key,
    filename: row.filename || "",
    contentType: row.content_type || "",
    size: Number(row.size) || 0,
    uploadedAt: row.uploaded_at || "",
  };
}

export function defaultCanvas() {
  return {
    preset: "instagram-post",
    width: 1080,
    height: 1080,
    gap: 14,
    backgroundType: "gradient",
    backgroundColor: "#101719",
    backgroundImage: "",
    gradient: "linear-gradient(135deg, #315f64, #a06b76)",
    pattern: "none",
    theme: "dark",
    watermark: true,
    watermarkText: "Iya's Return",
    dateStamp: true,
  };
}

export function defaultStyle() {
  return {
    borderColor: "#eadde0",
    borderThickness: 2,
    radius: 16,
    shadow: true,
    spacing: 14,
    filter: "none",
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blurBackground: false,
    showBoxNames: true,
    stickers: "travel, memories",
  };
}

export function defaultBox(index, overrides = {}) {
  const column = index % 4;
  const row = Math.floor(index / 4);

  return {
    id: overrides.id || crypto.randomUUID(),
    name: text(overrides.name, `Box ${String(index + 1).padStart(2, "0")}`),
    caption: text(overrides.caption, ""),
    emoji: text(overrides.emoji, ""),
    hiddenName: bool(overrides.hiddenName, false),
    locked: bool(overrides.locked, false),
    x: number(overrides.x, 5 + column * 23, 0, 100),
    y: number(overrides.y, 7 + row * 28, 0, 100),
    w: number(overrides.w, 20, 4, 100),
    h: number(overrides.h, 24, 4, 100),
    spanX: number(overrides.spanX, 1, 1, 4),
    spanY: number(overrides.spanY, 1, 1, 4),
    fit: ["cover", "contain"].includes(overrides.fit) ? overrides.fit : "cover",
    zoom: number(overrides.zoom, 1, 0.2, 4),
    rotate: number(overrides.rotate, 0, -180, 180),
    flipX: bool(overrides.flipX, false),
    flipY: bool(overrides.flipY, false),
    panX: number(overrides.panX, 0, -100, 100),
    panY: number(overrides.panY, 0, -100, 100),
    borderColor: text(overrides.borderColor, ""),
    borderThickness: number(overrides.borderThickness, 0, 0, 40),
    radius: number(overrides.radius, -1, -1, 80),
    asset: overrides.asset || null,
  };
}

export function normalizeProject(input = {}) {
  const rawCanvas = { ...defaultCanvas(), ...(input.canvas || {}) };
  const rawStyle = { ...defaultStyle(), ...(input.style || {}) };
  const rawBoxes = Array.isArray(input.boxes) ? input.boxes.slice(0, maxBoxes) : [];

  return {
    id: text(input.id || input.projectId || defaultProjectId, defaultProjectId).replace(/[^a-z0-9_-]/gi, "-") || defaultProjectId,
    title: text(input.title, "Iya's Return Collage"),
    subtitle: text(input.subtitle, "A full-screen wall of memories"),
    layout: allowedLayouts.has(input.layout) ? input.layout : "grid",
    canvas: {
      ...rawCanvas,
      width: number(rawCanvas.width, 1080, 320, 6000),
      height: number(rawCanvas.height, 1080, 320, 6000),
      gap: number(rawCanvas.gap ?? rawStyle.spacing, 14, 0, 80),
      watermark: bool(rawCanvas.watermark, true),
      dateStamp: bool(rawCanvas.dateStamp, true),
    },
    style: {
      ...rawStyle,
      borderThickness: number(rawStyle.borderThickness, 2, 0, 40),
      radius: number(rawStyle.radius, 16, 0, 80),
      spacing: number(rawStyle.spacing ?? rawCanvas.gap, 14, 0, 80),
      brightness: number(rawStyle.brightness, 100, 20, 220),
      contrast: number(rawStyle.contrast, 100, 20, 220),
      saturation: number(rawStyle.saturation, 100, 0, 240),
      shadow: bool(rawStyle.shadow, true),
      blurBackground: bool(rawStyle.blurBackground, false),
      showBoxNames: bool(rawStyle.showBoxNames, true),
    },
    boxes: rawBoxes.length ? rawBoxes.map((box, index) => defaultBox(index, box)) : Array.from({ length: defaultBoxCount }, (_, index) => defaultBox(index)),
    updatedAt: text(input.updatedAt, nowIso()),
  };
}

function rowToProject(row) {
  if (!row) {
    return null;
  }

  return normalizeProject({
    id: row.project_id,
    title: row.title,
    subtitle: row.subtitle,
    layout: row.layout,
    canvas: parseJson(row.canvas_json, {}),
    boxes: parseJson(row.boxes_json, []),
    style: parseJson(row.style_json, {}),
    updatedAt: row.updated_at,
  });
}

export async function getCollageProject(db, request, projectId = defaultProjectId) {
  const cleanProjectId = text(projectId, defaultProjectId).replace(/[^a-z0-9_-]/gi, "-") || defaultProjectId;
  const row = await db
    .prepare(
      `SELECT project_id, title, subtitle, layout, canvas_json, boxes_json, style_json, updated_at
       FROM collage_projects
       WHERE project_id = ?`,
    )
    .bind(cleanProjectId)
    .first();
  const stored = rowToProject(row);

  if (stored) {
    return stored;
  }

  const legacyRows = await db
    .prepare(
      `SELECT slot, r2_key, pathname, uploaded_at
       FROM collage_photos
       ORDER BY COALESCE(slot, 9999), uploaded_at ASC`,
    )
    .all();
  const legacy = legacyRows.results || [];
  const count = Math.max(defaultBoxCount, ...legacy.map((photo) => Number(photo.slot) + 1).filter(Number.isFinite));
  const boxes = Array.from({ length: Math.min(count, maxBoxes) }, (_, index) => defaultBox(index));

  for (const photo of legacy) {
    const slot = Number(photo.slot);
    const index = Number.isInteger(slot) && slot >= 0 && slot < boxes.length ? slot : boxes.findIndex((box) => !box.asset);

    if (index < 0) {
      continue;
    }

    boxes[index].asset = {
      id: photo.pathname || photo.r2_key,
      url: mediaUrl(request, photo.r2_key),
      pathname: photo.pathname || photo.r2_key,
      filename: "",
      contentType: "",
      size: 0,
      uploadedAt: photo.uploaded_at || "",
    };
  }

  return normalizeProject({
    id: cleanProjectId,
    boxes,
  });
}

export async function saveCollageProject(db, project) {
  const normalized = normalizeProject(project);
  const updatedAt = nowIso();

  await db
    .prepare(
      `INSERT INTO collage_projects (project_id, title, subtitle, layout, canvas_json, boxes_json, style_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id) DO UPDATE SET
         title = excluded.title,
         subtitle = excluded.subtitle,
         layout = excluded.layout,
         canvas_json = excluded.canvas_json,
         boxes_json = excluded.boxes_json,
         style_json = excluded.style_json,
         updated_at = excluded.updated_at`,
    )
    .bind(
      normalized.id,
      normalized.title,
      normalized.subtitle,
      normalized.layout,
      JSON.stringify(normalized.canvas),
      JSON.stringify(normalized.boxes),
      JSON.stringify(normalized.style),
      updatedAt,
    )
    .run();

  return { ...normalized, updatedAt };
}

export async function listCollageAssets(db, request, projectId = defaultProjectId) {
  const rows = await db
    .prepare(
      `SELECT asset_id, project_id, r2_key, pathname, filename, content_type, size, uploaded_at
       FROM collage_assets
       WHERE project_id = ?
       ORDER BY uploaded_at DESC`,
    )
    .bind(projectId)
    .all();

  return (rows.results || []).map((row) => assetFromRow(row, request)).filter(Boolean);
}

export function collageAssetFromStored(row, request) {
  return assetFromRow(row, request);
}
