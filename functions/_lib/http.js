export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export function error(message, status = 400, details = {}) {
  return json({ error: message, ...details }, status);
}

export async function readJson(request) {
  return request.json().catch(() => ({}));
}

export function requireBindings(env, names) {
  for (const name of names) {
    if (!env[name]) {
      throw new Error(`Missing Cloudflare binding: ${name}`);
    }
  }
}

export function requirePasscode(env, passcode) {
  const configured = String(env.MEMORY_PASSCODE || "");

  if (!configured) {
    return error("MEMORY_PASSCODE is not configured.", 500);
  }

  if (!String(passcode || "").trim()) {
    return error("Enter the memory passcode first.", 401);
  }

  if (String(passcode) !== configured) {
    return error("Wrong passcode.", 403);
  }

  return null;
}

export function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

export function nowIso() {
  return new Date().toISOString();
}
