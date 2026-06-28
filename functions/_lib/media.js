const safeNamePattern = /[^a-z0-9._-]+/gi;
const mediaCacheControl = "public, max-age=31536000, immutable";

export function mediaUrl(request, key) {
  const url = new URL(request.url);
  const encodedKey = String(key || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${url.origin}/api/media/${encodedKey}`;
}

export function sanitizeFilename(name, fallback = "memory.jpg") {
  const clean = String(name || "")
    .trim()
    .replace(safeNamePattern, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return clean || fallback;
}

export function sanitizeObjectKey(key) {
  const clean = String(key || "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .join("/");

  if (!clean || clean.includes("..")) {
    throw new Error("Invalid media pathname.");
  }

  return clean;
}

export function buildObjectKey(parts, filename) {
  const prefix = parts.map((part) => sanitizeFilename(part, "part")).join("/");
  const random = crypto.randomUUID().slice(0, 8);
  const cleanName = sanitizeFilename(filename);

  return `${prefix}/${Date.now()}-${random}-${cleanName}`;
}

export function requireMediaStore(env) {
  if (!env.MEMORIES_BUCKET && !env.MEMORY_MEDIA) {
    throw new Error("Missing Cloudflare media binding: enable R2 or bind MEMORY_MEDIA KV.");
  }
}

function getMediaStore(env) {
  if (env.MEMORIES_BUCKET) {
    return { type: "r2", binding: env.MEMORIES_BUCKET };
  }

  if (env.MEMORY_MEDIA) {
    return { type: "kv", binding: env.MEMORY_MEDIA };
  }

  requireMediaStore(env);
}

export async function putFile(env, key, file) {
  const bytes = await file.arrayBuffer();
  const contentType = file.type || "application/octet-stream";

  await putMedia(env, key, bytes, contentType);
}

export async function putMedia(env, key, bytes, contentType = "application/octet-stream") {
  const store = getMediaStore(env);
  const cleanKey = sanitizeObjectKey(key);

  if (store.type === "r2") {
    await store.binding.put(cleanKey, bytes, {
      httpMetadata: {
        contentType,
        cacheControl: mediaCacheControl,
      },
    });
    return;
  }

  await store.binding.put(cleanKey, bytes, {
    metadata: {
      contentType,
      cacheControl: mediaCacheControl,
      etag: crypto.randomUUID(),
    },
  });
}

export async function copyRemoteFile(env, key, sourceUrl) {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Could not download ${sourceUrl} (HTTP ${response.status})`);
  }

  const contentType = response.headers.get("Content-Type") || "application/octet-stream";
  const store = getMediaStore(env);

  if (store.type === "r2") {
    await store.binding.put(sanitizeObjectKey(key), response.body, {
      httpMetadata: {
        contentType,
        cacheControl: mediaCacheControl,
      },
    });
    return;
  }

  await putMedia(env, key, await response.arrayBuffer(), contentType);
}

export async function deleteMedia(env, key) {
  const store = getMediaStore(env);

  await store.binding.delete(sanitizeObjectKey(key));
}

export async function getMedia(env, key) {
  const store = getMediaStore(env);
  const cleanKey = sanitizeObjectKey(key);

  if (store.type === "r2") {
    const object = await store.binding.get(cleanKey);

    if (!object) {
      return null;
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);

    return {
      body: object.body,
      headers,
      etag: object.httpEtag,
    };
  }

  const object = await store.binding.getWithMetadata(cleanKey, { type: "arrayBuffer" });

  if (!object?.value) {
    return null;
  }

  const headers = new Headers();
  const metadata = object.metadata || {};

  headers.set("Content-Type", metadata.contentType || "application/octet-stream");

  return {
    body: object.value,
    headers,
    etag: metadata.etag || "",
  };
}
