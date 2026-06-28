import { error, json, readJson, requireBindings, requirePasscode, nowIso } from "../_lib/http.js";
import { buildObjectKey, deleteMedia, putFile, requireMediaStore, sanitizeObjectKey } from "../_lib/media.js";
import { getMemoryPayload } from "../_lib/data.js";

const maxCollageSlots = 100;

function stopId(cityKey, index) {
  return `${cityKey}-${Number(index)}`;
}

function validCityKey(value) {
  return value === "myrtle" || value === "nyc";
}

function validStopIndex(value) {
  const index = Number(value);

  return Number.isInteger(index) && index >= 0;
}

function validSlot(value) {
  const slot = Number(value);

  return Number.isInteger(slot) && slot >= 0 && slot < maxCollageSlots;
}

function getUploadedFile(formData) {
  const file = formData.get("file");

  if (!file || typeof file.arrayBuffer !== "function" || !file.size) {
    return null;
  }

  return file;
}

export async function onRequestGet({ env, request }) {
  try {
    requireBindings(env, ["DB"]);

    return json(await getMemoryPayload(env.DB, request));
  } catch (exception) {
    return error(exception.message || "Memory photos could not load.", 500);
  }
}

export async function onRequestPost({ env, request }) {
  try {
    requireBindings(env, ["DB"]);
    requireMediaStore(env);

    const formData = await request.formData();
    const passcodeError = requirePasscode(env, formData.get("passcode"));

    if (passcodeError) {
      return passcodeError;
    }

    const action = String(formData.get("action") || "");

    if (action === "journal") {
      return saveJournal(env, request, formData);
    }

    if (action === "collage") {
      return saveCollagePhoto(env, request, formData);
    }

    return saveMapPhoto(env, request, formData);
  } catch (exception) {
    return error(exception.message || "Memory photos could not be saved right now.", 500);
  }
}

export async function onRequestDelete({ env, request }) {
  try {
    requireBindings(env, ["DB"]);
    requireMediaStore(env);

    const body = await readJson(request);
    const passcodeError = requirePasscode(env, body.passcode);

    if (passcodeError) {
      return passcodeError;
    }

    if (body.action === "collage") {
      return deleteCollagePhoto(env, request, body);
    }

    return deleteMapPhoto(env, request, body);
  } catch (exception) {
    return error(exception.message || "Memory photo could not be removed right now.", 500);
  }
}

async function saveMapPhoto(env, request, formData) {
  const cityKey = String(formData.get("cityKey") || "");
  const index = Number(formData.get("index"));
  const file = getUploadedFile(formData);

  if (!validCityKey(cityKey) || !validStopIndex(index)) {
    return error("Invalid map stop.", 400);
  }

  if (!file) {
    return error("Choose an image file.", 400);
  }

  const id = stopId(cityKey, index);
  const previous = await env.DB.prepare("SELECT r2_key, journal FROM memory_photos WHERE id = ?").bind(id).first();
  const key = buildObjectKey(["memories", "map", id], file.name);
  const uploadedAt = nowIso();

  await putFile(env, key, file);

  await env.DB.prepare(
    `INSERT INTO memory_photos (id, city_key, stop_index, r2_key, pathname, journal, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       r2_key = excluded.r2_key,
       pathname = excluded.pathname,
       journal = COALESCE(memory_photos.journal, excluded.journal),
       uploaded_at = excluded.uploaded_at`,
  )
    .bind(id, cityKey, index, key, key, previous?.journal || "", uploadedAt)
    .run();

  if (previous?.r2_key && previous.r2_key !== key) {
    await deleteMedia(env, previous.r2_key);
  }

  return json({
    photo: {
      url: new URL(`/api/media/${key}`, request.url).toString(),
      pathname: key,
      uploadedAt,
      journal: previous?.journal || "",
    },
  });
}

async function saveCollagePhoto(env, request, formData) {
  const slot = Number(formData.get("slot"));
  const previousPathname = String(formData.get("previousPathname") || "");
  const file = getUploadedFile(formData);

  if (!validSlot(slot)) {
    return error("Invalid collage slot.", 400);
  }

  if (!file) {
    return error("Choose an image file.", 400);
  }

  if (previousPathname) {
    await removeCollageRecord(env, previousPathname, slot);
  }

  const key = buildObjectKey(["memories", "collage", `slot-${String(slot + 1).padStart(3, "0")}`], file.name);
  const uploadedAt = nowIso();

  await putFile(env, key, file);

  await env.DB.prepare(
    `INSERT INTO collage_photos (slot, r2_key, pathname, uploaded_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(pathname) DO UPDATE SET
       slot = excluded.slot,
       r2_key = excluded.r2_key,
       uploaded_at = excluded.uploaded_at`,
  )
    .bind(slot, key, key, uploadedAt)
    .run();

  const payload = await getMemoryPayload(env.DB, request);

  return json({
    photo: {
      url: new URL(`/api/media/${key}`, request.url).toString(),
      pathname: key,
      uploadedAt,
      slot,
    },
    collage: payload.collage,
  });
}

async function saveJournal(env, request, formData) {
  const cityKey = String(formData.get("cityKey") || "");
  const index = Number(formData.get("index"));
  const id = stopId(cityKey, index);
  const journal = String(formData.get("journal") || "").slice(0, 5000);

  if (!validCityKey(cityKey) || !validStopIndex(index)) {
    return error("Invalid map stop.", 400);
  }

  await env.DB.prepare(
    `INSERT INTO memory_photos (id, city_key, stop_index, journal, uploaded_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET journal = excluded.journal`,
  )
    .bind(id, cityKey, index, journal, nowIso())
    .run();

  return json({
    journal,
    ...(await getMemoryPayload(env.DB, request)),
  });
}

async function deleteMapPhoto(env, request, body) {
  const cityKey = String(body.cityKey || "");
  const index = Number(body.index);

  if (!validCityKey(cityKey) || !validStopIndex(index)) {
    return error("Invalid map stop.", 400);
  }

  const id = stopId(cityKey, index);
  const previous = await env.DB.prepare("SELECT r2_key FROM memory_photos WHERE id = ?").bind(id).first();

  await env.DB.prepare("DELETE FROM memory_photos WHERE id = ?").bind(id).run();

  if (previous?.r2_key) {
    await deleteMedia(env, previous.r2_key);
  }

  return json(await getMemoryPayload(env.DB, request));
}

async function deleteCollagePhoto(env, request, body) {
  const pathname = String(body.pathname || "");
  const slot = Number(body.slot);

  if (!pathname && !validSlot(slot)) {
    return error("Invalid collage photo.", 400);
  }

  await removeCollageRecord(env, pathname, slot);

  return json(await getMemoryPayload(env.DB, request));
}

async function removeCollageRecord(env, pathname, slot) {
  const cleanPathname = pathname ? sanitizeObjectKey(pathname) : "";
  const row = cleanPathname
    ? await env.DB.prepare("SELECT r2_key FROM collage_photos WHERE pathname = ?").bind(cleanPathname).first()
    : await env.DB.prepare("SELECT r2_key FROM collage_photos WHERE slot = ?").bind(slot).first();

  if (cleanPathname) {
    await env.DB.prepare("DELETE FROM collage_photos WHERE pathname = ?").bind(cleanPathname).run();
  } else {
    await env.DB.prepare("DELETE FROM collage_photos WHERE slot = ?").bind(slot).run();
  }

  if (row?.r2_key) {
    await deleteMedia(env, row.r2_key);
  }
}
