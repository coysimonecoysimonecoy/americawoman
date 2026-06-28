import { error, json, readJson, requireBindings, requirePasscode } from "../../_lib/http.js";
import { getCollageProject, saveCollageProject } from "../../_lib/collage.js";

export async function onRequestGet({ env, request }) {
  try {
    requireBindings(env, ["DB"]);

    const url = new URL(request.url);
    const projectId = url.searchParams.get("id") || "default";

    return json({
      project: await getCollageProject(env.DB, request, projectId),
    });
  } catch (exception) {
    return error(exception.message || "Collage project could not load.", 500);
  }
}

export async function onRequestPut({ env, request }) {
  try {
    requireBindings(env, ["DB"]);

    const body = await readJson(request);
    const passcodeError = requirePasscode(env, body.passcode);

    if (passcodeError) {
      return passcodeError;
    }

    return json({
      project: await saveCollageProject(env.DB, body.project || {}),
    });
  } catch (exception) {
    return error(exception.message || "Collage project could not save.", 500);
  }
}
