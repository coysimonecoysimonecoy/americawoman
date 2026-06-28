import { error } from "../../_lib/http.js";
import { getMedia, requireMediaStore, sanitizeObjectKey } from "../../_lib/media.js";

export async function onRequestGet({ env, params }) {
  return mediaResponse(env, params, false);
}

export async function onRequestHead({ env, params }) {
  return mediaResponse(env, params, true);
}

async function mediaResponse(env, params, headOnly) {
  try {
    requireMediaStore(env);
  } catch (exception) {
    return error(exception.message, 500);
  }

  const rawPath = params.path;
  const key = sanitizeObjectKey(Array.isArray(rawPath) ? rawPath.join("/") : rawPath);
  const object = await getMedia(env, key);

  if (!object) {
    return error("Media not found.", 404);
  }

  const headers = object.headers;
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (object.etag) {
    headers.set("ETag", object.etag);
  }

  return new Response(headOnly ? null : object.body, { headers });
}
