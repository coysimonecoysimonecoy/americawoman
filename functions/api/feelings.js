import { error, json, readJson, requireBindings, requirePasscode, isDateKey, nowIso } from "../_lib/http.js";
import { getFeelingsPayload } from "../_lib/data.js";

export async function onRequestGet({ env, request }) {
  try {
    requireBindings(env, ["DB"]);

    const passcode = new URL(request.url).searchParams.get("passcode");
    const passcodeError = requirePasscode(env, passcode);

    if (passcodeError) {
      return passcodeError;
    }

    return json(await getFeelingsPayload(env.DB));
  } catch (exception) {
    return error(exception.message || "Feelings could not load.", 500);
  }
}

export async function onRequestPost({ env, request }) {
  try {
    requireBindings(env, ["DB"]);

    const body = await readJson(request);

    if (body.action === "hug") {
      return saveHug(env, body);
    }

    const passcodeError = requirePasscode(env, body.passcode);

    if (passcodeError) {
      return passcodeError;
    }

    return saveFeeling(env, body);
  } catch (exception) {
    return error(exception.message || "Feelings could not be saved right now.", 500);
  }
}

async function saveHug(env, body) {
  const dateKey = String(body.date || "");

  if (!isDateKey(dateKey)) {
    return error("Invalid date.", 400);
  }

  const updatedAt = nowIso();

  await env.DB.prepare(
    `INSERT INTO hugs (date_key, count, updated_at)
     VALUES (?, 1, ?)
     ON CONFLICT(date_key) DO UPDATE SET
       count = count + 1,
       updated_at = excluded.updated_at`,
  )
    .bind(dateKey, updatedAt)
    .run();

  const hug = await env.DB.prepare("SELECT date_key, count, updated_at FROM hugs WHERE date_key = ?").bind(dateKey).first();
  const payload = await getFeelingsPayload(env.DB);

  return json({
    ...payload,
    hug: {
      date: hug.date_key,
      count: Number(hug.count) || 0,
      updatedAt: hug.updated_at || updatedAt,
    },
  });
}

async function saveFeeling(env, body) {
  const dateKey = String(body.date || "");
  const score = Number(body.score);
  const note = String(body.note || "").slice(0, 1000);

  if (!isDateKey(dateKey)) {
    return error("Invalid date.", 400);
  }

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return error("Choose a feeling first.", 400);
  }

  const existing = await env.DB.prepare("SELECT date_key FROM feelings WHERE date_key = ?").bind(dateKey).first();
  const payload = existing ? await getFeelingsPayload(env.DB) : null;

  if (existing) {
    return error("This day already has a saved feeling.", 409, payload || {});
  }

  const savedAt = nowIso();

  await env.DB.prepare(
    `INSERT INTO feelings (date_key, score, note, saved_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(dateKey, score, note, savedAt, savedAt)
    .run();

  return json({
    ...(await getFeelingsPayload(env.DB)),
    feeling: {
      date: dateKey,
      score,
      note,
      savedAt,
      updatedAt: savedAt,
    },
  });
}
