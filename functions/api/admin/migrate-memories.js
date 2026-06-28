import { error, json, readJson, requireBindings, requirePasscode, nowIso } from "../../_lib/http.js";
import { copyRemoteFile, requireMediaStore, sanitizeObjectKey } from "../../_lib/media.js";
import { getMemoryPayload } from "../../_lib/data.js";

const defaultSourceUrl = "https://americanwoman.vercel.app/api/memories";

export async function onRequestPost({ env, request }) {
  try {
    requireBindings(env, ["DB"]);
    requireMediaStore(env);

    const body = await readJson(request);
    const passcodeError = requirePasscode(env, body.passcode);

    if (passcodeError) {
      return passcodeError;
    }

    const sourceUrl = String(body.sourceUrl || defaultSourceUrl);
    const sourceResponse = await fetch(sourceUrl);

    if (!sourceResponse.ok) {
      return error("Could not fetch source memories.", 502);
    }

    const source = await sourceResponse.json();
    const stats = {
      sourceUrl,
      mapCopied: 0,
      collageCopied: 0,
      skipped: 0,
      failed: [],
    };

    for (const [id, record] of Object.entries(source.photos || {})) {
      try {
        if (!record?.url) {
          stats.skipped += 1;
          continue;
        }

        const match = id.match(/^(myrtle|nyc)-(\d+)$/);

        if (!match) {
          stats.skipped += 1;
          continue;
        }

        const cityKey = match[1];
        const index = Number(match[2]);
        const pathname = sanitizeObjectKey(record.pathname || `memories/map/${id}/${Date.now()}-${id}.jpg`);

        await copyRemoteFile(env, pathname, record.url);
        await env.DB.prepare(
          `INSERT INTO memory_photos (id, city_key, stop_index, r2_key, pathname, journal, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             r2_key = excluded.r2_key,
             pathname = excluded.pathname,
             journal = excluded.journal,
             uploaded_at = excluded.uploaded_at`,
        )
          .bind(id, cityKey, index, pathname, pathname, record.journal || "", record.uploadedAt || nowIso())
          .run();
        stats.mapCopied += 1;
      } catch (exception) {
        stats.failed.push({ id, error: exception.message });
      }
    }

    for (const record of source.collage || []) {
      try {
        if (!record?.url || !record.pathname) {
          stats.skipped += 1;
          continue;
        }

        const pathname = sanitizeObjectKey(record.pathname);
        const slot = Number.isInteger(Number(record.slot)) ? Number(record.slot) : null;

        await copyRemoteFile(env, pathname, record.url);
        await env.DB.prepare(
          `INSERT INTO collage_photos (slot, r2_key, pathname, source_url, uploaded_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(pathname) DO UPDATE SET
             slot = excluded.slot,
             r2_key = excluded.r2_key,
             source_url = excluded.source_url,
             uploaded_at = excluded.uploaded_at`,
        )
          .bind(slot, pathname, pathname, record.url, record.uploadedAt || nowIso())
          .run();
        stats.collageCopied += 1;
      } catch (exception) {
        stats.failed.push({ pathname: record?.pathname || "", error: exception.message });
      }
    }

    return json({
      ...stats,
      memories: await getMemoryPayload(env.DB, request),
    });
  } catch (exception) {
    return error(exception.message || "Migration failed.", 500);
  }
}
