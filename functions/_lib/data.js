import { mediaUrl } from "./media.js";

export async function getMemoryPayload(db, request) {
  const photoRows = await db
    .prepare(
      `SELECT id, city_key, stop_index, r2_key, pathname, journal, uploaded_at
       FROM memory_photos
       ORDER BY uploaded_at DESC`,
    )
    .all();

  const collageRows = await db
    .prepare(
      `SELECT slot, r2_key, pathname, uploaded_at
       FROM collage_photos
       ORDER BY uploaded_at ASC`,
    )
    .all();

  const photos = {};

  for (const row of photoRows.results || []) {
    if (!row.r2_key) {
      continue;
    }

    photos[row.id] = {
      url: mediaUrl(request, row.r2_key),
      pathname: row.pathname || row.r2_key,
      uploadedAt: row.uploaded_at || "",
      journal: row.journal || "",
    };
  }

  const collage = (collageRows.results || [])
    .filter((row) => row.r2_key)
    .map((row) => ({
      url: mediaUrl(request, row.r2_key),
      pathname: row.pathname || row.r2_key,
      uploadedAt: row.uploaded_at || "",
      ...(row.slot === null || row.slot === undefined ? {} : { slot: Number(row.slot) }),
    }));

  return { photos, collage };
}

export async function getFeelingsPayload(db) {
  const feelingRows = await db
    .prepare(
      `SELECT date_key, score, note, saved_at, updated_at
       FROM feelings
       ORDER BY date_key ASC`,
    )
    .all();

  const hugRows = await db
    .prepare(
      `SELECT date_key, count, updated_at
       FROM hugs
       ORDER BY date_key ASC`,
    )
    .all();

  const feelings = {};
  const hugs = {};

  for (const row of feelingRows.results || []) {
    feelings[row.date_key] = {
      date: row.date_key,
      score: Number(row.score),
      note: row.note || "",
      savedAt: row.saved_at || "",
      updatedAt: row.updated_at || "",
    };
  }

  for (const row of hugRows.results || []) {
    hugs[row.date_key] = {
      date: row.date_key,
      count: Number(row.count) || 0,
      updatedAt: row.updated_at || "",
    };
  }

  return { feelings, hugs };
}
