import { error, json, readJson, requireBindings, requirePasscode, nowIso } from "../../_lib/http.js";
import { buildObjectKey, deleteMedia, putFile, requireMediaStore, sanitizeObjectKey } from "../../_lib/media.js";

function getUploadedFiles(formData) {
  const files = [...formData.getAll("files"), ...formData.getAll("file")];

  return files.filter((file) => file && typeof file.arrayBuffer === "function" && file.size);
}

function cleanProjectId(value) {
  return String(value || "default").replace(/[^a-z0-9_-]/gi, "-") || "default";
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

    const projectId = cleanProjectId(formData.get("projectId"));
    const files = getUploadedFiles(formData).slice(0, 30);

    if (!files.length) {
      return error("Choose at least one image file.", 400);
    }

    const assets = [];

    for (const file of files) {
      if (file.type && !file.type.startsWith("image/")) {
        continue;
      }

      const assetId = crypto.randomUUID();
      const key = buildObjectKey(["collage", projectId, assetId], file.name);
      const uploadedAt = nowIso();

      await putFile(env, key, file);
      await env.DB.prepare(
        `INSERT INTO collage_assets (asset_id, project_id, r2_key, pathname, filename, content_type, size, uploaded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(assetId, projectId, key, key, file.name || "", file.type || "application/octet-stream", Number(file.size) || 0, uploadedAt)
        .run();

      assets.push({
        id: assetId,
        url: new URL(`/api/media/${key}`, request.url).toString(),
        pathname: key,
        filename: file.name || "",
        contentType: file.type || "application/octet-stream",
        size: Number(file.size) || 0,
        uploadedAt,
      });
    }

    return json({ assets });
  } catch (exception) {
    return error(exception.message || "Collage asset could not upload.", 500);
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

    const pathname = body.pathname ? sanitizeObjectKey(body.pathname) : "";
    const assetId = String(body.assetId || "");
    const row = pathname
      ? await env.DB.prepare("SELECT asset_id, r2_key FROM collage_assets WHERE pathname = ?").bind(pathname).first()
      : await env.DB.prepare("SELECT asset_id, r2_key FROM collage_assets WHERE asset_id = ?").bind(assetId).first();

    if (!row) {
      return json({ ok: true });
    }

    await env.DB.prepare("DELETE FROM collage_assets WHERE asset_id = ?").bind(row.asset_id).run();
    await deleteMedia(env, row.r2_key);

    return json({ ok: true });
  } catch (exception) {
    return error(exception.message || "Collage asset could not be deleted.", 500);
  }
}
