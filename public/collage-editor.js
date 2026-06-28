(() => {
  const projectEndpoint = "/api/collage/project";
  const assetEndpoint = "/api/collage/assets";
  const projectId = "default";
  const historyLimit = 80;
  const defaultBoxCount = 12;
  const maxBoxes = 80;

  const canvasPresets = {
    "instagram-post": { label: "Instagram post", width: 1080, height: 1080 },
    "instagram-story": { label: "Instagram story", width: 1080, height: 1920 },
    "facebook-cover": { label: "Facebook cover", width: 1640, height: 924 },
    "youtube-thumbnail": { label: "YouTube thumbnail", width: 1280, height: 720 },
    "print-4x6": { label: "Print 4 x 6", width: 1800, height: 1200 },
    "print-8x10": { label: "Print 8 x 10", width: 2400, height: 3000 },
    custom: { label: "Custom", width: 1080, height: 1080 },
  };

  const templatePresets = {
    travel: {
      title: "Iya's Return Collage",
      subtitle: "Travel memories",
      layout: "grid",
      gradient: "linear-gradient(135deg, #315f64, #a06b76)",
      stickers: "travel, map, memory",
    },
    birthday: {
      title: "Birthday Collage",
      subtitle: "A day worth keeping",
      layout: "poster",
      gradient: "linear-gradient(135deg, #9e214d, #c0b28e)",
      stickers: "birthday, cake, joy",
    },
    wedding: {
      title: "Wedding Collage",
      subtitle: "Love and light",
      layout: "heart",
      gradient: "linear-gradient(135deg, #eadde0, #78aaa8)",
      stickers: "love, forever, family",
    },
    school: {
      title: "School Collage",
      subtitle: "Bright moments",
      layout: "mosaic",
      gradient: "linear-gradient(135deg, #101719, #315f64)",
      stickers: "school, friends, proud",
    },
    family: {
      title: "Family Collage",
      subtitle: "All together",
      layout: "circle",
      gradient: "linear-gradient(135deg, #315f64, #b9aa8c)",
      stickers: "family, home, love",
    },
    business: {
      title: "Business Collage",
      subtitle: "Clean and sharp",
      layout: "poster",
      gradient: "linear-gradient(135deg, #101719, #78aaa8)",
      stickers: "brand, launch, work",
    },
  };

  let editor = null;
  let preview = null;
  let fileInput = null;
  let cameraInput = null;
  let backgroundInput = null;
  let project = createDefaultProject();
  let selectedBoxId = "";
  let statusMessage = "";
  let statusIsError = false;
  let uploadTargetBoxId = "";
  let uploadMode = "replace";
  let historyStack = [];
  let redoStack = [];
  let dragBoxId = "";
  let pointerDrag = null;
  let renderQueued = false;
  const imageCache = new Map();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(Number(value) || 0, minimum), maximum);
  }

  function cleanText(value, fallback = "") {
    return String(value ?? fallback).slice(0, 2000);
  }

  function getFeelingPasscode() {
    return document.querySelector("#feeling-passcode")?.value.trim() || "";
  }

  function getPasscode() {
    return editor?.querySelector("#collage-passcode")?.value.trim()
      || sessionStorage.getItem("iya-collage-passcode")
      || getFeelingPasscode();
  }

  function rememberPasscode(value) {
    const passcode = String(value || "").trim();

    if (passcode) {
      sessionStorage.setItem("iya-collage-passcode", passcode);
    }
  }

  function setStatus(message = "", isError = false) {
    statusMessage = message;
    statusIsError = isError;
    const status = editor?.querySelector("#collage-status");

    if (status) {
      status.textContent = message;
      status.classList.toggle("error", isError);
    }
  }

  function createDefaultBox(index, overrides = {}) {
    const column = index % 4;
    const row = Math.floor(index / 4);

    return {
      id: overrides.id || uid(),
      name: cleanText(overrides.name, `Box ${String(index + 1).padStart(2, "0")}`),
      caption: cleanText(overrides.caption, ""),
      emoji: cleanText(overrides.emoji, ""),
      hiddenName: Boolean(overrides.hiddenName),
      locked: Boolean(overrides.locked),
      x: clamp(overrides.x ?? 5 + column * 23, 0, 96),
      y: clamp(overrides.y ?? 8 + row * 28, 0, 96),
      w: clamp(overrides.w ?? 20, 4, 100),
      h: clamp(overrides.h ?? 24, 4, 100),
      spanX: clamp(overrides.spanX ?? 1, 1, 4),
      spanY: clamp(overrides.spanY ?? 1, 1, 4),
      fit: overrides.fit === "contain" ? "contain" : "cover",
      zoom: clamp(overrides.zoom ?? 1, 0.2, 4),
      rotate: clamp(overrides.rotate ?? 0, -180, 180),
      flipX: Boolean(overrides.flipX),
      flipY: Boolean(overrides.flipY),
      panX: clamp(overrides.panX ?? 0, -100, 100),
      panY: clamp(overrides.panY ?? 0, -100, 100),
      borderColor: cleanText(overrides.borderColor, ""),
      borderThickness: clamp(overrides.borderThickness ?? 0, 0, 40),
      radius: clamp(overrides.radius ?? -1, -1, 80),
      asset: overrides.asset || null,
    };
  }

  function createDefaultProject() {
    return normalizeProject({
      id: projectId,
      title: "Iya's Return Collage",
      subtitle: "A full-screen wall of memories",
      layout: "grid",
      canvas: {
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
      },
      style: {
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
      },
      boxes: Array.from({ length: defaultBoxCount }, (_, index) => createDefaultBox(index)),
    });
  }

  function normalizeProject(raw = {}) {
    const canvas = {
      ...createDefaultProjectSafe().canvas,
      ...(raw.canvas || {}),
    };
    const style = {
      ...createDefaultProjectSafe().style,
      ...(raw.style || {}),
    };
    const boxes = Array.isArray(raw.boxes) && raw.boxes.length
      ? raw.boxes.slice(0, maxBoxes).map((box, index) => createDefaultBox(index, box))
      : Array.from({ length: defaultBoxCount }, (_, index) => createDefaultBox(index));

    return {
      id: cleanText(raw.id || raw.projectId || projectId, projectId).replace(/[^a-z0-9_-]/gi, "-") || projectId,
      title: cleanText(raw.title, "Iya's Return Collage"),
      subtitle: cleanText(raw.subtitle, "A full-screen wall of memories"),
      layout: ["grid", "mosaic", "heart", "circle", "story", "poster"].includes(raw.layout) ? raw.layout : "grid",
      canvas: {
        ...canvas,
        width: clamp(canvas.width || 1080, 320, 6000),
        height: clamp(canvas.height || 1080, 320, 6000),
        gap: clamp(canvas.gap ?? style.spacing ?? 14, 0, 80),
        watermark: canvas.watermark !== false,
        dateStamp: canvas.dateStamp !== false,
      },
      style: {
        ...style,
        borderThickness: clamp(style.borderThickness ?? 2, 0, 40),
        radius: clamp(style.radius ?? 16, 0, 80),
        spacing: clamp(style.spacing ?? canvas.gap ?? 14, 0, 80),
        brightness: clamp(style.brightness ?? 100, 20, 220),
        contrast: clamp(style.contrast ?? 100, 20, 220),
        saturation: clamp(style.saturation ?? 100, 0, 240),
        shadow: style.shadow !== false,
        blurBackground: Boolean(style.blurBackground),
        showBoxNames: style.showBoxNames !== false,
      },
      boxes,
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };
  }

  function createDefaultProjectSafe() {
    return {
      canvas: {
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
      },
      style: {
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
      },
    };
  }

  function selectedBox() {
    return project.boxes.find((box) => box.id === selectedBoxId) || project.boxes[0] || null;
  }

  function setSelectedBox(id) {
    selectedBoxId = id || project.boxes[0]?.id || "";
    renderSoon();
  }

  function rememberState() {
    historyStack.push(clone(project));
    if (historyStack.length > historyLimit) {
      historyStack.shift();
    }
    redoStack = [];
  }

  function mutate(callback, options = {}) {
    if (!options.silent) {
      rememberState();
    }
    callback();
    project = normalizeProject(project);
    if (!selectedBoxId || !project.boxes.some((box) => box.id === selectedBoxId)) {
      selectedBoxId = project.boxes[0]?.id || "";
    }
    renderSoon();
  }

  function undo() {
    const previous = historyStack.pop();

    if (!previous) {
      return;
    }

    redoStack.push(clone(project));
    project = normalizeProject(previous);
    selectedBoxId = project.boxes[0]?.id || "";
    renderSoon();
  }

  function redo() {
    const next = redoStack.pop();

    if (!next) {
      return;
    }

    historyStack.push(clone(project));
    project = normalizeProject(next);
    selectedBoxId = project.boxes[0]?.id || "";
    renderSoon();
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const error = new Error(data.error || "Request failed.");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async function loadProject() {
    setStatus("Loading collage...");
    const data = await requestJson(`${projectEndpoint}?id=${encodeURIComponent(projectId)}`);
    project = normalizeProject(data.project || {});
    selectedBoxId = project.boxes[0]?.id || "";
    historyStack = [];
    redoStack = [];
    setStatus("Collage loaded.");
    renderSoon();
  }

  async function saveProject() {
    const passcode = getPasscode();
    rememberPasscode(passcode);
    setStatus("Saving collage...");

    try {
      const data = await requestJson(projectEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode, project }),
      });
      project = normalizeProject(data.project || project);
      setStatus("Saved to Cloudflare.");
      renderSoon();
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  async function compressIfAvailable(file) {
    if (typeof compressPhoto === "function" && file.type?.startsWith("image/")) {
      return compressPhoto(file);
    }

    return file;
  }

  async function uploadAssets(files) {
    const passcode = getPasscode();
    rememberPasscode(passcode);
    const formData = new FormData();
    const imageFiles = [...files].filter((file) => file.type?.startsWith("image/")).slice(0, 30);

    if (!imageFiles.length) {
      throw new Error("Choose image files.");
    }

    formData.append("passcode", passcode);
    formData.append("projectId", project.id);
    for (const file of imageFiles) {
      const compressed = await compressIfAvailable(file);
      formData.append("files", compressed, file.name.replace(/\.[a-z0-9]+$/i, ".jpg") || "collage.jpg");
    }

    const data = await requestJson(assetEndpoint, {
      method: "POST",
      body: formData,
    });

    return data.assets || [];
  }

  async function assignUploadedFiles(files, targetBoxId = "", mode = "replace") {
    try {
      setStatus("Uploading photos...");
      const assets = await uploadAssets(files);

      if (!assets.length) {
        setStatus("No image files were uploaded.", true);
        return;
      }

      mutate(() => {
        if (mode === "background") {
          project.canvas.backgroundType = "image";
          project.canvas.backgroundImage = assets[0].url;
          return;
        }

        if (mode === "auto") {
          let assetIndex = 0;
          for (const box of project.boxes) {
            if (!box.asset && assets[assetIndex]) {
              box.asset = assets[assetIndex];
              assetIndex += 1;
            }
          }
          while (assetIndex < assets.length && project.boxes.length < maxBoxes) {
            const box = createDefaultBox(project.boxes.length);
            box.asset = assets[assetIndex];
            project.boxes.push(box);
            assetIndex += 1;
          }
          return;
        }

        const target = project.boxes.find((box) => box.id === targetBoxId) || selectedBox() || project.boxes[0];
        if (target) {
          target.asset = assets[0];
          selectedBoxId = target.id;
        }
      });
      setStatus(`${assets.length} photo${assets.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  async function deleteAssetIfUnused(asset) {
    if (!asset?.pathname) {
      return;
    }

    const usageCount = project.boxes.filter((box) => box.asset?.pathname === asset.pathname).length;
    if (usageCount > 1) {
      return;
    }

    try {
      await requestJson(assetEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode: getPasscode(), pathname: asset.pathname, assetId: asset.id }),
      });
    } catch {
      // Removing from the box should still work even if the stored asset cannot be deleted.
    }
  }

  function openFilePicker(targetBoxId = "", mode = "replace") {
    uploadTargetBoxId = targetBoxId;
    uploadMode = mode;
    fileInput.multiple = mode === "auto";
    fileInput.value = "";
    fileInput.click();
  }

  function openCamera(targetBoxId = "") {
    uploadTargetBoxId = targetBoxId;
    uploadMode = "replace";
    cameraInput.value = "";
    cameraInput.click();
  }

  function addBox() {
    mutate(() => {
      if (project.boxes.length >= maxBoxes) {
        return;
      }
      const box = createDefaultBox(project.boxes.length);
      project.boxes.push(box);
      selectedBoxId = box.id;
    });
  }

  function duplicateBox(id) {
    mutate(() => {
      const index = project.boxes.findIndex((box) => box.id === id);

      if (index < 0 || project.boxes.length >= maxBoxes) {
        return;
      }

      const copy = {
        ...clone(project.boxes[index]),
        id: uid(),
        name: `${project.boxes[index].name} Copy`,
        x: clamp(project.boxes[index].x + 4, 0, 96),
        y: clamp(project.boxes[index].y + 4, 0, 96),
      };
      project.boxes.splice(index + 1, 0, copy);
      selectedBoxId = copy.id;
    });
  }

  async function removePhoto(id) {
    const box = project.boxes.find((item) => item.id === id);
    const asset = box?.asset;

    if (!box || !asset) {
      return;
    }

    mutate(() => {
      box.asset = null;
    });
    await deleteAssetIfUnused(asset);
  }

  async function deleteBox(id) {
    const box = project.boxes.find((item) => item.id === id);

    if (!box || project.boxes.length <= 1) {
      return;
    }

    mutate(() => {
      project.boxes = project.boxes.filter((item) => item.id !== id);
    });
    await deleteAssetIfUnused(box.asset);
  }

  function shufflePhotos() {
    mutate(() => {
      const assets = project.boxes.map((box) => box.asset).filter(Boolean).sort(() => Math.random() - 0.5);
      for (const box of project.boxes) {
        box.asset = assets.shift() || null;
      }
    });
  }

  function autoFitPhotos() {
    mutate(() => {
      for (const box of project.boxes) {
        box.fit = "cover";
        box.zoom = 1;
        box.panX = 0;
        box.panY = 0;
        box.rotate = 0;
        box.flipX = false;
        box.flipY = false;
      }
    });
  }

  function resetProject() {
    if (!window.confirm("Reset this collage project?")) {
      return;
    }

    mutate(() => {
      project = createDefaultProject();
      selectedBoxId = project.boxes[0]?.id || "";
    });
  }

  function applyCanvasPreset(preset) {
    const selected = canvasPresets[preset] || canvasPresets["instagram-post"];

    mutate(() => {
      project.canvas.preset = preset;
      if (preset !== "custom") {
        project.canvas.width = selected.width;
        project.canvas.height = selected.height;
      }
    });
  }

  function applyTemplate(name) {
    const template = templatePresets[name] || templatePresets.travel;

    mutate(() => {
      project.title = template.title;
      project.subtitle = template.subtitle;
      project.layout = template.layout;
      project.canvas.backgroundType = "gradient";
      project.canvas.gradient = template.gradient;
      project.style.stickers = template.stickers;
      applyLayoutPositions(project.layout, false);
    });
  }

  function applyLayoutPositions(layout, shouldMutate = true) {
    const update = () => {
      project.layout = layout;
      const boxes = project.boxes;
      const count = Math.max(boxes.length, 1);

      boxes.forEach((box, index) => {
        if (layout === "grid") {
          box.spanX = 1;
          box.spanY = 1;
          return;
        }

        if (layout === "circle" || layout === "heart") {
          const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
          const radius = layout === "heart" ? 30 : 34;
          let x = 50 + Math.cos(angle) * radius;
          let y = 50 + Math.sin(angle) * radius;

          if (layout === "heart") {
            const t = (Math.PI * 2 * index) / count;
            x = 50 + 1.05 * 16 * Math.pow(Math.sin(t), 3);
            y = 45 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          }

          box.w = count > 16 ? 13 : 17;
          box.h = count > 16 ? 13 : 17;
          box.x = clamp(x - box.w / 2, 0, 100 - box.w);
          box.y = clamp(y - box.h / 2, 0, 100 - box.h);
          return;
        }

        if (layout === "story") {
          box.w = index === 0 ? 58 : 30;
          box.h = index === 0 ? 46 : 18;
          box.x = index === 0 ? 6 : 64;
          box.y = index === 0 ? 8 : 8 + ((index - 1) % 5) * 18;
          return;
        }

        if (layout === "poster") {
          box.w = index === 0 ? 60 : 28;
          box.h = index === 0 ? 58 : 24;
          box.x = index === 0 ? 7 : 66;
          box.y = index === 0 ? 21 : 18 + ((index - 1) % 3) * 26;
          return;
        }

        box.w = index % 5 === 0 ? 31 : index % 3 === 0 ? 24 : 19;
        box.h = index % 4 === 0 ? 30 : 22;
        box.x = (4 + (index * 19) % 74);
        box.y = (12 + (index * 23) % 62);
      });
    };

    if (shouldMutate) {
      mutate(update);
      return;
    }

    update();
  }

  function shareLink() {
    const url = `${location.origin}${location.pathname}?collage=${encodeURIComponent(project.id)}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => setStatus("Share link copied."));
    } else {
      setStatus(url);
    }
  }

  function closeEditor() {
    editor.hidden = true;
    document.body.classList.remove("collage-editor-open");
  }

  async function openEditor() {
    createEditor();
    editor.hidden = false;
    document.body.classList.add("collage-editor-open");
    if (!project.updatedAt || !historyStack.length) {
      try {
        await loadProject();
      } catch (error) {
        setStatus(error.message, true);
      }
    }
    renderSoon();
  }

  function createEditor() {
    if (editor) {
      return;
    }

    editor = document.createElement("section");
    editor.className = "collage-editor";
    editor.hidden = true;
    editor.setAttribute("aria-label", "Full screen collage editor");

    preview = document.createElement("div");
    preview.className = "collage-preview";
    preview.hidden = true;

    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;
    fileInput.className = "collage-hidden-input";

    cameraInput = document.createElement("input");
    cameraInput.type = "file";
    cameraInput.accept = "image/*";
    cameraInput.setAttribute("capture", "environment");
    cameraInput.className = "collage-hidden-input";

    backgroundInput = document.createElement("input");
    backgroundInput.type = "file";
    backgroundInput.accept = "image/*";
    backgroundInput.className = "collage-hidden-input";

    fileInput.addEventListener("change", () => {
      if (fileInput.files?.length) {
        assignUploadedFiles(fileInput.files, uploadTargetBoxId, uploadMode);
      }
    });
    cameraInput.addEventListener("change", () => {
      if (cameraInput.files?.length) {
        assignUploadedFiles(cameraInput.files, uploadTargetBoxId, "replace");
      }
    });
    backgroundInput.addEventListener("change", () => {
      if (backgroundInput.files?.length) {
        assignUploadedFiles(backgroundInput.files, "", "background");
      }
    });

    editor.addEventListener("keydown", handleKeyboard);
    preview.addEventListener("click", (event) => {
      if (event.target === preview) {
        preview.hidden = true;
      }
    });

    document.body.append(editor, preview, fileInput, cameraInput, backgroundInput);
  }

  function handleKeyboard(event) {
    const editingText = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveProject();
      return;
    }

    if (event.key === "Escape") {
      closeEditor();
      return;
    }

    if (!editingText && event.key === "Delete" && selectedBoxId) {
      event.preventDefault();
      deleteBox(selectedBoxId);
    }
  }

  function renderSoon() {
    if (renderQueued) {
      return;
    }

    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderEditor();
    });
  }

  function optionTags(options, selected) {
    return Object.entries(options)
      .map(([value, option]) => `<option value="${value}"${value === selected ? " selected" : ""}>${option.label || option}</option>`)
      .join("");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function checked(value) {
    return value ? " checked" : "";
  }

  function renderEditor() {
    if (!editor || editor.hidden) {
      return;
    }

    editor.classList.toggle("light", project.canvas.theme === "light");
    editor.innerHTML = `
      <header class="collage-editor-topbar">
        <div class="collage-toolbar-left">
          <button class="collage-icon-button" data-action="close" type="button" aria-label="Close collage editor">x</button>
          <button class="collage-tool-button primary" data-action="save" type="button">Save</button>
          <button class="collage-tool-button" data-action="share" type="button">Share link</button>
        </div>
        <div class="collage-topbar-title">
          <input id="collage-title-input" data-project-field="title" value="${escapeHtml(project.title)}" aria-label="Collage title" />
          <input id="collage-subtitle-input" data-project-field="subtitle" value="${escapeHtml(project.subtitle)}" aria-label="Collage subtitle" />
        </div>
        <div class="collage-toolbar-actions">
          <input id="collage-passcode" type="password" autocomplete="current-password" placeholder="Passcode" value="${escapeHtml(getPasscode())}" aria-label="Passcode" />
          <button class="collage-tool-button" data-action="undo" type="button"${historyStack.length ? "" : " disabled"}>Undo</button>
          <button class="collage-tool-button" data-action="redo" type="button"${redoStack.length ? "" : " disabled"}>Redo</button>
          <button class="collage-tool-button danger" data-action="reset" type="button">Reset</button>
        </div>
      </header>
      <div class="collage-editor-main">
        ${renderLeftPanel()}
        ${renderStageShell()}
        ${renderRightPanel()}
      </div>
    `;
    attachEditorEvents();
    setStatus(statusMessage, statusIsError);
  }

  function renderLeftPanel() {
    return `
      <aside class="collage-panel left">
        <section class="collage-panel-section">
          <h3>Project</h3>
          <label class="collage-field"><span>Layout</span><select data-project-field="layout">
            ${["grid", "mosaic", "heart", "circle", "story", "poster"].map((layout) => `<option value="${layout}"${project.layout === layout ? " selected" : ""}>${layout}</option>`).join("")}
          </select></label>
          <label class="collage-field"><span>Template</span><select data-action="template">
            ${Object.keys(templatePresets).map((name) => `<option value="${name}">${name}</option>`).join("")}
          </select></label>
          <label class="collage-field"><span>Canvas size</span><select data-action="canvas-preset">
            ${optionTags(canvasPresets, project.canvas.preset)}
          </select></label>
          <div class="collage-two-col">
            <label class="collage-field"><span>Width</span><input type="number" data-canvas-field="width" value="${project.canvas.width}" min="320" max="6000" /></label>
            <label class="collage-field"><span>Height</span><input type="number" data-canvas-field="height" value="${project.canvas.height}" min="320" max="6000" /></label>
          </div>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="add-box" type="button">Add box</button>
            <button class="collage-tool-button" data-action="auto-fill" type="button">Upload multiple</button>
          </div>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="shuffle" type="button">Shuffle photos</button>
            <button class="collage-tool-button" data-action="auto-fit" type="button">Auto-fit</button>
          </div>
        </section>
        <section class="collage-panel-section">
          <h3>Canvas style</h3>
          <label class="collage-field"><span>Theme</span><select data-canvas-field="theme">
            <option value="dark"${project.canvas.theme === "dark" ? " selected" : ""}>Dark</option>
            <option value="light"${project.canvas.theme === "light" ? " selected" : ""}>Light</option>
          </select></label>
          <label class="collage-field"><span>Background type</span><select data-canvas-field="backgroundType">
            <option value="color"${project.canvas.backgroundType === "color" ? " selected" : ""}>Color</option>
            <option value="gradient"${project.canvas.backgroundType === "gradient" ? " selected" : ""}>Gradient</option>
            <option value="pattern"${project.canvas.backgroundType === "pattern" ? " selected" : ""}>Pattern</option>
            <option value="image"${project.canvas.backgroundType === "image" ? " selected" : ""}>Image</option>
          </select></label>
          <label class="collage-field"><span>Background color</span><input type="color" data-canvas-field="backgroundColor" value="${escapeHtml(project.canvas.backgroundColor)}" /></label>
          <label class="collage-field"><span>Gradient</span><input data-canvas-field="gradient" value="${escapeHtml(project.canvas.gradient)}" /></label>
          <label class="collage-field"><span>Pattern</span><select data-canvas-field="pattern">
            ${["none", "dots", "diagonal", "grid"].map((pattern) => `<option value="${pattern}"${project.canvas.pattern === pattern ? " selected" : ""}>${pattern}</option>`).join("")}
          </select></label>
          <button class="collage-tool-button" data-action="background-upload" type="button">Add background image</button>
          <label class="collage-field"><span>Background image URL</span><input data-canvas-field="backgroundImage" value="${escapeHtml(project.canvas.backgroundImage || "")}" /></label>
        </section>
        <section class="collage-panel-section">
          <h3>Export</h3>
          <button class="collage-tool-button" data-action="preview" type="button">Preview before download</button>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="export-png" type="button">PNG</button>
            <button class="collage-tool-button" data-action="export-jpg" type="button">JPG</button>
          </div>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="export-pdf" type="button">PDF</button>
            <button class="collage-tool-button" data-action="export-webm" type="button">WebM</button>
          </div>
          <button class="collage-tool-button" data-action="download-selected" type="button">Download selected photo</button>
          <p id="collage-status" class="collage-status" aria-live="polite"></p>
        </section>
      </aside>
    `;
  }

  function renderRightPanel() {
    const box = selectedBox();

    if (!box) {
      return `<aside class="collage-panel right"><section class="collage-panel-section"><h3>No box selected</h3></section></aside>`;
    }

    return `
      <aside class="collage-panel right">
        <section class="collage-panel-section">
          <h3>Selected box</h3>
          <label class="collage-field"><span>Name</span><input data-box-field="name" value="${escapeHtml(box.name)}" /></label>
          <label class="collage-field"><span>Caption</span><textarea data-box-field="caption">${escapeHtml(box.caption)}</textarea></label>
          <label class="collage-field"><span>Emoji label</span><input data-box-field="emoji" value="${escapeHtml(box.emoji)}" /></label>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="replace-selected" type="button">Replace photo</button>
            <button class="collage-tool-button" data-action="camera-selected" type="button">Camera</button>
          </div>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="duplicate-selected" type="button">Duplicate</button>
            <button class="collage-tool-button danger" data-action="delete-selected" type="button">Delete box</button>
          </div>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="remove-selected-photo" type="button"${box.asset ? "" : " disabled"}>Remove photo</button>
            <button class="collage-tool-button" data-action="fullscreen-selected" type="button"${box.asset ? "" : " disabled"}>Full screen</button>
          </div>
          <label class="collage-field"><span><input type="checkbox" data-box-boolean="locked"${checked(box.locked)} /> Lock box</span></label>
          <label class="collage-field"><span><input type="checkbox" data-box-boolean="hiddenName"${checked(box.hiddenName)} /> Hide box name</span></label>
        </section>
        <section class="collage-panel-section">
          <h3>Photo crop</h3>
          <label class="collage-field"><span>Fit</span><select data-box-field="fit">
            <option value="cover"${box.fit === "cover" ? " selected" : ""}>Crop fill</option>
            <option value="contain"${box.fit === "contain" ? " selected" : ""}>Auto fit</option>
          </select></label>
          <label class="collage-field"><span>Zoom</span><input type="range" data-box-number="zoom" min="0.2" max="4" step="0.05" value="${box.zoom}" /></label>
          <label class="collage-field"><span>Move X</span><input type="range" data-box-number="panX" min="-100" max="100" step="1" value="${box.panX}" /></label>
          <label class="collage-field"><span>Move Y</span><input type="range" data-box-number="panY" min="-100" max="100" step="1" value="${box.panY}" /></label>
          <label class="collage-field"><span>Rotate</span><input type="range" data-box-number="rotate" min="-180" max="180" step="1" value="${box.rotate}" /></label>
          <div class="collage-two-col">
            <button class="collage-tool-button" data-action="flip-x" type="button">Flip X</button>
            <button class="collage-tool-button" data-action="flip-y" type="button">Flip Y</button>
          </div>
        </section>
        <section class="collage-panel-section">
          <h3>Box size</h3>
          <div class="collage-two-col">
            <label class="collage-field"><span>X</span><input type="range" data-box-number="x" min="0" max="96" step="1" value="${box.x}" /></label>
            <label class="collage-field"><span>Y</span><input type="range" data-box-number="y" min="0" max="96" step="1" value="${box.y}" /></label>
          </div>
          <div class="collage-two-col">
            <label class="collage-field"><span>Width</span><input type="range" data-box-number="w" min="4" max="100" step="1" value="${box.w}" /></label>
            <label class="collage-field"><span>Height</span><input type="range" data-box-number="h" min="4" max="100" step="1" value="${box.h}" /></label>
          </div>
          <div class="collage-two-col">
            <label class="collage-field"><span>Grid W</span><input type="range" data-box-number="spanX" min="1" max="4" step="1" value="${box.spanX}" /></label>
            <label class="collage-field"><span>Grid H</span><input type="range" data-box-number="spanY" min="1" max="4" step="1" value="${box.spanY}" /></label>
          </div>
        </section>
        <section class="collage-panel-section">
          <h3>Effects</h3>
          <div class="collage-two-col">
            <label class="collage-field"><span>Border</span><input type="color" data-style-field="borderColor" value="${escapeHtml(project.style.borderColor)}" /></label>
            <label class="collage-field"><span>Thickness</span><input type="range" data-style-number="borderThickness" min="0" max="40" step="1" value="${project.style.borderThickness}" /></label>
          </div>
          <label class="collage-field"><span>Rounded corners</span><input type="range" data-style-number="radius" min="0" max="80" step="1" value="${project.style.radius}" /></label>
          <label class="collage-field"><span>Spacing/gap</span><input type="range" data-style-number="spacing" min="0" max="80" step="1" value="${project.style.spacing}" /></label>
          <label class="collage-field"><span>Filter</span><select data-style-field="filter">
            ${["none", "black-white", "vintage", "warm", "cool"].map((filter) => `<option value="${filter}"${project.style.filter === filter ? " selected" : ""}>${filter}</option>`).join("")}
          </select></label>
          <label class="collage-field"><span>Brightness</span><input type="range" data-style-number="brightness" min="20" max="220" step="1" value="${project.style.brightness}" /></label>
          <label class="collage-field"><span>Contrast</span><input type="range" data-style-number="contrast" min="20" max="220" step="1" value="${project.style.contrast}" /></label>
          <label class="collage-field"><span>Saturation</span><input type="range" data-style-number="saturation" min="0" max="240" step="1" value="${project.style.saturation}" /></label>
          <label class="collage-field"><span><input type="checkbox" data-style-boolean="shadow"${checked(project.style.shadow)} /> Shadow effect</span></label>
          <label class="collage-field"><span><input type="checkbox" data-style-boolean="blurBackground"${checked(project.style.blurBackground)} /> Blur background</span></label>
          <label class="collage-field"><span><input type="checkbox" data-style-boolean="showBoxNames"${checked(project.style.showBoxNames)} /> Show box names</span></label>
          <label class="collage-field"><span><input type="checkbox" data-canvas-boolean="watermark"${checked(project.canvas.watermark)} /> Watermark</span></label>
          <label class="collage-field"><span>Watermark text</span><input data-canvas-field="watermarkText" value="${escapeHtml(project.canvas.watermarkText || "")}" /></label>
          <label class="collage-field"><span><input type="checkbox" data-canvas-boolean="dateStamp"${checked(project.canvas.dateStamp)} /> Date/time stamp</span></label>
          <label class="collage-field"><span>Stickers</span><input data-style-field="stickers" value="${escapeHtml(project.style.stickers || "")}" /></label>
        </section>
      </aside>
    `;
  }

  function renderStageShell() {
    const ratio = project.canvas.width / project.canvas.height;
    const background = stageBackgroundCss();
    const filter = imageFilterCss();

    return `
      <section class="collage-stage-shell" aria-label="Collage canvas">
        <div class="collage-stage-scroll">
          <div class="collage-stage layout-${project.layout}" style="--canvas-width:${project.canvas.width};--canvas-height:${project.canvas.height};--canvas-ratio:${ratio};--collage-gap:${project.style.spacing}px;--box-border:${project.style.borderThickness}px;--box-border-color:${escapeHtml(project.style.borderColor)};--box-radius:${project.style.radius}px;--box-shadow:${project.style.shadow ? "0 16px 42px rgba(0, 0, 0, 0.32)" : "none"};background:${background};--photo-filter:${filter};">
            ${renderTitleLayer()}
            ${project.canvas.dateStamp ? `<span class="collage-date-stamp">${escapeHtml(new Date().toLocaleDateString())}</span>` : ""}
            <div class="collage-stage-inner">
              ${project.boxes.map(renderBox).join("")}
            </div>
            ${renderStickerLayer()}
            ${project.canvas.watermark ? `<span class="collage-watermark">${escapeHtml(project.canvas.watermarkText || "Iya's Return")}</span>` : ""}
          </div>
        </div>
      </section>
    `;
  }

  function renderTitleLayer() {
    return `
      <div class="collage-title-layer">
        <h2>${escapeHtml(project.title)}</h2>
        <p>${escapeHtml(project.subtitle)}</p>
      </div>
    `;
  }

  function renderStickerLayer() {
    const stickers = String(project.style.stickers || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (!stickers.length) {
      return "";
    }

    return `<div class="collage-sticker-layer">${stickers.map((item) => `<span class="collage-sticker">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function renderBox(box) {
    const selected = box.id === selectedBoxId;
    const hasPhoto = Boolean(box.asset?.url);
    const nameHidden = box.hiddenName || !project.style.showBoxNames;
    const borderColor = box.borderColor || project.style.borderColor;
    const borderThickness = box.borderThickness || project.style.borderThickness;
    const radius = box.radius >= 0 ? box.radius : project.style.radius;
    const styles = [
      `--box-x:${box.x}%`,
      `--box-y:${box.y}%`,
      `--box-w:${box.w}%`,
      `--box-h:${box.h}%`,
      `--span-x:${box.spanX}`,
      `--span-y:${box.spanY}`,
      `--box-border:${borderThickness}px`,
      `--box-border-color:${borderColor}`,
      `--box-radius:${radius}px`,
    ].join(";");
    const photoPosition = `${clamp(50 + box.panX / 2, 0, 100)}% ${clamp(50 + box.panY / 2, 0, 100)}%`;
    const photoTransform = `scale(${box.zoom}) rotate(${box.rotate}deg) scaleX(${box.flipX ? -1 : 1}) scaleY(${box.flipY ? -1 : 1})`;

    return `
      <article class="collage-box${selected ? " selected" : ""}${box.locked ? " locked" : ""}${hasPhoto ? " has-photo" : ""}" data-box-id="${box.id}" draggable="${project.layout === "grid" && !box.locked}" style="${styles}">
        <button class="collage-box-drop" data-action="${hasPhoto ? "select-box" : "replace-box"}" data-box-id="${box.id}" type="button" aria-label="${hasPhoto ? "Select" : "Add photo to"} ${escapeHtml(box.name)}">
          ${hasPhoto ? `<img class="collage-photo-img" src="${escapeHtml(box.asset.url)}" alt="${escapeHtml(box.name)}" style="--photo-fit:${box.fit};--photo-position:${photoPosition};--photo-transform:${photoTransform};" />` : `<span class="collage-empty-box"><strong>Add photo</strong><span>${escapeHtml(box.name)}</span><span>Drop image here</span></span>`}
        </button>
        <div class="collage-box-controls">
          <button data-action="fullscreen-box" data-box-id="${box.id}" type="button"${hasPhoto ? "" : " disabled"}>Full</button>
          <button data-action="replace-box" data-box-id="${box.id}" type="button">${hasPhoto ? "Replace" : "Add"}</button>
          <button data-action="remove-box-photo" data-box-id="${box.id}" type="button"${hasPhoto ? "" : " disabled"}>Remove</button>
          <button data-action="duplicate-box" data-box-id="${box.id}" type="button">Copy</button>
          <button data-action="delete-box" data-box-id="${box.id}" type="button">Delete</button>
        </div>
        ${box.emoji ? `<span class="collage-box-emoji">${escapeHtml(box.emoji)}</span>` : ""}
        ${nameHidden ? "" : `<label class="collage-box-name"><input data-inline-box-name="${box.id}" value="${escapeHtml(box.name)}" aria-label="Box name" /><span class="collage-box-caption">${escapeHtml(box.caption)}</span></label>`}
        ${project.layout === "grid" || box.locked ? "" : `<button class="collage-resize-handle" data-resize-box="${box.id}" type="button" aria-label="Resize ${escapeHtml(box.name)}"></button>`}
      </article>
    `;
  }

  function stageBackgroundCss() {
    const color = project.canvas.backgroundColor || "#101719";

    if (project.canvas.backgroundType === "image" && project.canvas.backgroundImage) {
      return `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)), url("${project.canvas.backgroundImage}") center / cover`;
    }

    if (project.canvas.backgroundType === "gradient") {
      return project.canvas.gradient || color;
    }

    if (project.canvas.backgroundType === "pattern") {
      const pattern = project.canvas.pattern || "dots";
      if (pattern === "diagonal") {
        return `repeating-linear-gradient(135deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 18px), ${color}`;
      }
      if (pattern === "grid") {
        return `linear-gradient(rgba(255,255,255,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.13) 1px, transparent 1px), ${color}`;
      }
      return `radial-gradient(circle, rgba(255,255,255,0.18) 0 2px, transparent 3px), ${color}`;
    }

    return color;
  }

  function imageFilterCss() {
    const filters = [
      `brightness(${project.style.brightness}%)`,
      `contrast(${project.style.contrast}%)`,
      `saturate(${project.style.saturation}%)`,
    ];

    if (project.style.filter === "black-white") {
      filters.push("grayscale(1)");
    } else if (project.style.filter === "vintage") {
      filters.push("sepia(0.55)");
    } else if (project.style.filter === "warm") {
      filters.push("sepia(0.2) saturate(1.15)");
    } else if (project.style.filter === "cool") {
      filters.push("hue-rotate(175deg) saturate(0.9)");
    }

    if (project.style.blurBackground) {
      filters.push("blur(0.2px)");
    }

    return filters.join(" ");
  }

  function attachEditorEvents() {
    editor.querySelectorAll("[data-action]").forEach((control) => {
      control.addEventListener("click", handleAction);
      control.addEventListener("change", handleAction);
    });

    editor.querySelectorAll("[data-project-field]").forEach((input) => input.addEventListener("change", handleProjectField));
    editor.querySelectorAll("[data-canvas-field]").forEach((input) => input.addEventListener("change", handleCanvasField));
    editor.querySelectorAll("[data-canvas-boolean]").forEach((input) => input.addEventListener("change", handleCanvasBoolean));
    editor.querySelectorAll("[data-style-field]").forEach((input) => input.addEventListener("change", handleStyleField));
    editor.querySelectorAll("[data-style-number]").forEach((input) => input.addEventListener("input", handleStyleNumber));
    editor.querySelectorAll("[data-style-boolean]").forEach((input) => input.addEventListener("change", handleStyleBoolean));
    editor.querySelectorAll("[data-box-field]").forEach((input) => input.addEventListener("change", handleBoxField));
    editor.querySelectorAll("[data-box-number]").forEach((input) => input.addEventListener("input", handleBoxNumber));
    editor.querySelectorAll("[data-box-boolean]").forEach((input) => input.addEventListener("change", handleBoxBoolean));
    editor.querySelectorAll("[data-inline-box-name]").forEach((input) => input.addEventListener("change", handleInlineBoxName));
    editor.querySelectorAll(".collage-box").forEach(attachBoxEvents);
    editor.querySelector("#collage-passcode")?.addEventListener("change", (event) => rememberPasscode(event.currentTarget.value));
  }

  function handleAction(event) {
    const action = event.currentTarget.dataset.action;
    const boxId = event.currentTarget.dataset.boxId || selectedBoxId;

    event.stopPropagation();

    if (action === "close") closeEditor();
    if (action === "save") saveProject();
    if (action === "share") shareLink();
    if (action === "undo") undo();
    if (action === "redo") redo();
    if (action === "reset") resetProject();
    if (action === "add-box") addBox();
    if (action === "auto-fill") openFilePicker("", "auto");
    if (action === "shuffle") shufflePhotos();
    if (action === "auto-fit") autoFitPhotos();
    if (action === "background-upload") backgroundInput.click();
    if (action === "replace-selected") openFilePicker(selectedBoxId, "replace");
    if (action === "camera-selected") openCamera(selectedBoxId);
    if (action === "duplicate-selected") duplicateBox(selectedBoxId);
    if (action === "delete-selected") deleteBox(selectedBoxId);
    if (action === "remove-selected-photo") removePhoto(selectedBoxId);
    if (action === "fullscreen-selected") showPhotoFullScreen(selectedBoxId);
    if (action === "flip-x") mutate(() => { selectedBox().flipX = !selectedBox().flipX; });
    if (action === "flip-y") mutate(() => { selectedBox().flipY = !selectedBox().flipY; });
    if (action === "select-box") setSelectedBox(boxId);
    if (action === "replace-box") {
      setSelectedBox(boxId);
      openFilePicker(boxId, "replace");
    }
    if (action === "fullscreen-box") showPhotoFullScreen(boxId);
    if (action === "remove-box-photo") removePhoto(boxId);
    if (action === "duplicate-box") duplicateBox(boxId);
    if (action === "delete-box") deleteBox(boxId);
    if (action === "preview") previewExport();
    if (action === "export-png") exportImage("png");
    if (action === "export-jpg") exportImage("jpg");
    if (action === "export-pdf") exportPdf();
    if (action === "export-webm") exportWebm();
    if (action === "download-selected") downloadSelectedPhoto();
    if (action === "template" && event.type === "change") applyTemplate(event.currentTarget.value);
    if (action === "canvas-preset" && event.type === "change") applyCanvasPreset(event.currentTarget.value);
  }

  function handleProjectField(event) {
    const field = event.currentTarget.dataset.projectField;
    const value = event.currentTarget.value;

    mutate(() => {
      if (field === "layout") {
        applyLayoutPositions(value, false);
        return;
      }
      project[field] = value;
    });
  }

  function handleCanvasField(event) {
    const field = event.currentTarget.dataset.canvasField;
    const value = event.currentTarget.type === "number" ? Number(event.currentTarget.value) : event.currentTarget.value;

    mutate(() => {
      project.canvas[field] = value;
      if (field === "width" || field === "height") {
        project.canvas.preset = "custom";
      }
    });
  }

  function handleCanvasBoolean(event) {
    const field = event.currentTarget.dataset.canvasBoolean;

    mutate(() => {
      project.canvas[field] = event.currentTarget.checked;
    });
  }

  function handleStyleField(event) {
    const field = event.currentTarget.dataset.styleField;

    mutate(() => {
      project.style[field] = event.currentTarget.value;
    });
  }

  function handleStyleNumber(event) {
    const field = event.currentTarget.dataset.styleNumber;

    mutate(() => {
      project.style[field] = Number(event.currentTarget.value);
      if (field === "spacing") {
        project.canvas.gap = Number(event.currentTarget.value);
      }
    }, { silent: true });
  }

  function handleStyleBoolean(event) {
    const field = event.currentTarget.dataset.styleBoolean;

    mutate(() => {
      project.style[field] = event.currentTarget.checked;
    });
  }

  function handleBoxField(event) {
    const box = selectedBox();
    const field = event.currentTarget.dataset.boxField;

    if (!box) {
      return;
    }

    mutate(() => {
      box[field] = event.currentTarget.value;
    });
  }

  function handleBoxNumber(event) {
    const box = selectedBox();
    const field = event.currentTarget.dataset.boxNumber;

    if (!box || box.locked) {
      return;
    }

    mutate(() => {
      box[field] = Number(event.currentTarget.value);
    }, { silent: true });
  }

  function handleBoxBoolean(event) {
    const box = selectedBox();
    const field = event.currentTarget.dataset.boxBoolean;

    if (!box) {
      return;
    }

    mutate(() => {
      box[field] = event.currentTarget.checked;
    });
  }

  function handleInlineBoxName(event) {
    const id = event.currentTarget.dataset.inlineBoxName;
    const box = project.boxes.find((item) => item.id === id);

    if (!box) {
      return;
    }

    mutate(() => {
      box.name = event.currentTarget.value;
    });
  }

  function attachBoxEvents(boxElement) {
    const boxId = boxElement.dataset.boxId;

    boxElement.addEventListener("click", () => setSelectedBox(boxId));
    boxElement.addEventListener("dragstart", (event) => {
      dragBoxId = boxId;
      event.dataTransfer.effectAllowed = "move";
    });
    boxElement.addEventListener("dragover", (event) => {
      event.preventDefault();
      boxElement.classList.add("drag-over");
    });
    boxElement.addEventListener("dragleave", () => boxElement.classList.remove("drag-over"));
    boxElement.addEventListener("drop", (event) => {
      event.preventDefault();
      boxElement.classList.remove("drag-over");
      if (event.dataTransfer.files?.length) {
        assignUploadedFiles(event.dataTransfer.files, boxId, "replace");
        return;
      }
      if (dragBoxId && dragBoxId !== boxId) {
        reorderBoxes(dragBoxId, boxId);
      }
    });
    boxElement.addEventListener("pointerdown", (event) => startMove(event, boxId));
    boxElement.querySelector("[data-resize-box]")?.addEventListener("pointerdown", (event) => startResize(event, boxId));
  }

  function reorderBoxes(sourceId, targetId) {
    mutate(() => {
      const sourceIndex = project.boxes.findIndex((box) => box.id === sourceId);
      const targetIndex = project.boxes.findIndex((box) => box.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) {
        return;
      }
      const [box] = project.boxes.splice(sourceIndex, 1);
      project.boxes.splice(targetIndex, 0, box);
      selectedBoxId = box.id;
    });
  }

  function startMove(event, boxId) {
    if (project.layout === "grid" || event.target.closest("button, input, textarea, select") || event.target.dataset.resizeBox) {
      return;
    }
    const box = project.boxes.find((item) => item.id === boxId);
    const stage = editor.querySelector(".collage-stage");
    if (!box || box.locked || !stage) {
      return;
    }
    event.preventDefault();
    setSelectedBox(boxId);
    pointerDrag = {
      type: "move",
      boxId,
      startX: event.clientX,
      startY: event.clientY,
      original: clone(box),
      rect: stage.getBoundingClientRect(),
    };
    rememberState();
    window.addEventListener("pointermove", handlePointerDrag);
    window.addEventListener("pointerup", stopPointerDrag, { once: true });
  }

  function startResize(event, boxId) {
    const box = project.boxes.find((item) => item.id === boxId);
    const stage = editor.querySelector(".collage-stage");
    if (!box || box.locked || !stage) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setSelectedBox(boxId);
    pointerDrag = {
      type: "resize",
      boxId,
      startX: event.clientX,
      startY: event.clientY,
      original: clone(box),
      rect: stage.getBoundingClientRect(),
    };
    rememberState();
    window.addEventListener("pointermove", handlePointerDrag);
    window.addEventListener("pointerup", stopPointerDrag, { once: true });
  }

  function handlePointerDrag(event) {
    if (!pointerDrag) {
      return;
    }
    const box = project.boxes.find((item) => item.id === pointerDrag.boxId);
    if (!box) {
      return;
    }
    const dx = ((event.clientX - pointerDrag.startX) / pointerDrag.rect.width) * 100;
    const dy = ((event.clientY - pointerDrag.startY) / pointerDrag.rect.height) * 100;

    if (pointerDrag.type === "move") {
      box.x = clamp(pointerDrag.original.x + dx, 0, 100 - box.w);
      box.y = clamp(pointerDrag.original.y + dy, 0, 100 - box.h);
    } else {
      box.w = clamp(pointerDrag.original.w + dx, 4, 100 - box.x);
      box.h = clamp(pointerDrag.original.h + dy, 4, 100 - box.y);
    }
    renderSoon();
  }

  function stopPointerDrag() {
    pointerDrag = null;
    window.removeEventListener("pointermove", handlePointerDrag);
  }

  function showPhotoFullScreen(boxId) {
    const box = project.boxes.find((item) => item.id === boxId);

    if (!box?.asset?.url) {
      return;
    }

    preview.innerHTML = `
      <div class="collage-preview-card">
        <img src="${escapeHtml(box.asset.url)}" alt="${escapeHtml(box.name)}" />
        <div class="collage-preview-actions">
          <button class="collage-tool-button" data-preview-action="download-photo" type="button">Download photo</button>
          <button class="collage-tool-button" data-preview-action="close" type="button">Close</button>
        </div>
      </div>
    `;
    preview.querySelector("[data-preview-action='download-photo']").addEventListener("click", () => downloadAsset(box.asset));
    preview.querySelector("[data-preview-action='close']").addEventListener("click", () => { preview.hidden = true; });
    preview.hidden = false;
  }

  function downloadAsset(asset) {
    if (!asset?.url) {
      return;
    }
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = asset.filename || "collage-photo.jpg";
    document.body.append(link);
    link.click();
    link.remove();
  }

  function downloadSelectedPhoto() {
    downloadAsset(selectedBox()?.asset);
  }

  function getBoxRects(canvasWidth, canvasHeight) {
    if (project.layout !== "grid") {
      return project.boxes.map((box) => ({
        box,
        x: (box.x / 100) * canvasWidth,
        y: (box.y / 100) * canvasHeight,
        w: (box.w / 100) * canvasWidth,
        h: (box.h / 100) * canvasHeight,
      }));
    }

    const gap = project.style.spacing;
    const count = project.boxes.length;
    const columns = Math.max(1, Math.ceil(Math.sqrt(count * (canvasWidth / canvasHeight))));
    const rows = Math.max(1, Math.ceil(count / columns));
    const cellWidth = (canvasWidth - gap * (columns + 1)) / columns;
    const cellHeight = (canvasHeight - gap * (rows + 1)) / rows;

    return project.boxes.map((box, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const spanX = Math.min(box.spanX || 1, columns - column);
      const spanY = Math.min(box.spanY || 1, rows - row);

      return {
        box,
        x: gap + column * (cellWidth + gap),
        y: gap + row * (cellHeight + gap),
        w: cellWidth * spanX + gap * (spanX - 1),
        h: cellHeight * spanY + gap * (spanY - 1),
      };
    });
  }

  async function loadImage(url) {
    if (imageCache.has(url)) {
      return imageCache.get(url);
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = reject;
    });
    image.src = url;
    imageCache.set(url, loaded);

    return loaded;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  async function renderProjectToCanvas(scale = 1) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(project.canvas.width * scale);
    canvas.height = Math.round(project.canvas.height * scale);
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    drawCanvasBackground(ctx, width, height);
    drawCanvasTitle(ctx, width);

    const rects = getBoxRects(width, height);
    for (const rect of rects) {
      await drawBox(ctx, rect);
    }

    drawCanvasOverlays(ctx, width, height);

    return canvas;
  }

  function drawCanvasBackground(ctx, width, height) {
    ctx.fillStyle = project.canvas.backgroundColor || "#101719";
    ctx.fillRect(0, 0, width, height);

    if (project.canvas.backgroundType === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, project.canvas.backgroundColor || "#315f64");
      gradient.addColorStop(1, "#a06b76");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (project.canvas.backgroundType === "pattern") {
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(project.canvas.pattern === "diagonal" ? x + height : x, height);
        ctx.stroke();
      }
    }
  }

  function drawCanvasTitle(ctx, width) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#eef5f2";
    ctx.shadowColor = "rgba(0,0,0,0.34)";
    ctx.shadowBlur = 14;
    ctx.font = `700 ${Math.max(32, Math.round(width * 0.05))}px Georgia, serif`;
    ctx.fillText(project.title, width / 2, Math.max(54, width * 0.065));
    ctx.font = `800 ${Math.max(15, Math.round(width * 0.017))}px Manrope, Arial`;
    ctx.fillText(project.subtitle, width / 2, Math.max(84, width * 0.095));
    ctx.restore();
  }

  async function drawBox(ctx, rect) {
    const { box, x, y, w, h } = rect;
    const radius = box.radius >= 0 ? box.radius : project.style.radius;
    const border = box.borderThickness || project.style.borderThickness;

    ctx.save();
    if (project.style.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = 22;
      ctx.shadowOffsetY = 10;
    }
    ctx.fillStyle = "rgba(243,238,231,0.14)";
    roundedRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    if (box.asset?.url) {
      try {
        const image = await loadImage(box.asset.url);
        drawImageInRect(ctx, image, rect);
      } catch {
        ctx.fillStyle = "rgba(158,33,77,0.28)";
        ctx.fillRect(x, y, w, h);
      }
    } else {
      ctx.fillStyle = "rgba(243,238,231,0.12)";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "rgba(243,238,231,0.86)";
      ctx.font = `800 ${Math.max(14, Math.round(w * 0.08))}px Manrope, Arial`;
      ctx.textAlign = "center";
      ctx.fillText(box.name, x + w / 2, y + h / 2);
    }
    ctx.restore();

    ctx.save();
    roundedRect(ctx, x, y, w, h, radius);
    ctx.strokeStyle = box.borderColor || project.style.borderColor || "#eadde0";
    ctx.lineWidth = border;
    ctx.stroke();
    ctx.restore();

    if (project.style.showBoxNames && !box.hiddenName) {
      ctx.save();
      ctx.fillStyle = "rgba(243,238,231,0.88)";
      ctx.fillRect(x + 8, y + h - 42, w - 16, 30);
      ctx.fillStyle = "#121c1e";
      ctx.font = `900 ${Math.max(10, Math.round(w * 0.035))}px Manrope, Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`${box.emoji ? `${box.emoji} ` : ""}${box.name}`, x + w / 2, y + h - 22);
      ctx.restore();
    }
  }

  function drawImageInRect(ctx, image, rect) {
    const { box, x, y, w, h } = rect;
    const imageRatio = image.width / image.height;
    const rectRatio = w / h;
    let drawWidth = w;
    let drawHeight = h;

    if (box.fit === "contain" ? imageRatio > rectRatio : imageRatio < rectRatio) {
      drawHeight = w / imageRatio;
    } else {
      drawWidth = h * imageRatio;
    }

    drawWidth *= box.zoom;
    drawHeight *= box.zoom;
    const centerX = x + w / 2 + (box.panX / 100) * w * 0.5;
    const centerY = y + h / 2 + (box.panY / 100) * h * 0.5;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((box.rotate * Math.PI) / 180);
    ctx.scale(box.flipX ? -1 : 1, box.flipY ? -1 : 1);
    applyCanvasFilter(ctx);
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  function applyCanvasFilter(ctx) {
    const filters = [
      `brightness(${project.style.brightness}%)`,
      `contrast(${project.style.contrast}%)`,
      `saturate(${project.style.saturation}%)`,
    ];
    if (project.style.filter === "black-white") filters.push("grayscale(1)");
    if (project.style.filter === "vintage") filters.push("sepia(0.55)");
    if (project.style.filter === "warm") filters.push("sepia(0.2) saturate(1.15)");
    if (project.style.filter === "cool") filters.push("hue-rotate(175deg) saturate(0.9)");
    ctx.filter = filters.join(" ");
  }

  function drawCanvasOverlays(ctx, width, height) {
    ctx.save();
    ctx.filter = "none";
    ctx.fillStyle = "rgba(243,238,231,0.76)";
    ctx.font = `900 ${Math.max(14, Math.round(width * 0.014))}px Manrope, Arial`;
    if (project.canvas.watermark) {
      ctx.textAlign = "left";
      ctx.fillText(project.canvas.watermarkText || "Iya's Return", 22, height - 24);
    }
    if (project.canvas.dateStamp) {
      ctx.textAlign = "right";
      ctx.fillText(new Date().toLocaleString(), width - 22, 32);
    }
    const stickers = String(project.style.stickers || "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 6);
    ctx.textAlign = "right";
    stickers.forEach((sticker, index) => {
      ctx.fillText(sticker, width - 24, height - 24 - index * 24);
    });
    ctx.restore();
  }

  async function previewExport() {
    setStatus("Rendering preview...");
    try {
      const canvas = await renderProjectToCanvas(0.7);
      const url = canvas.toDataURL("image/png");
      preview.innerHTML = `
        <div class="collage-preview-card">
          <img src="${url}" alt="Collage export preview" />
          <div class="collage-preview-actions">
            <button class="collage-tool-button" data-preview-action="png" type="button">Download PNG</button>
            <button class="collage-tool-button" data-preview-action="jpg" type="button">Download JPG</button>
            <button class="collage-tool-button" data-preview-action="close" type="button">Close</button>
          </div>
        </div>
      `;
      preview.querySelector("[data-preview-action='png']").addEventListener("click", () => exportImage("png"));
      preview.querySelector("[data-preview-action='jpg']").addEventListener("click", () => exportImage("jpg"));
      preview.querySelector("[data-preview-action='close']").addEventListener("click", () => { preview.hidden = true; });
      preview.hidden = false;
      setStatus("Preview ready.");
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function exportImage(type) {
    setStatus(`Rendering ${type.toUpperCase()}...`);
    try {
      const canvas = await renderProjectToCanvas(1);
      const mime = type === "jpg" ? "image/jpeg" : "image/png";
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `iya-collage.${type === "jpg" ? "jpg" : "png"}`);
          setStatus(`${type.toUpperCase()} downloaded.`);
        }
      }, mime, 0.92);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  function jpegDataUrlToPdfBytes(dataUrl, width, height) {
    const jpeg = atob(dataUrl.split(",")[1]);
    const objects = [];
    const add = (content) => {
      objects.push(content);
      return objects.length;
    };
    add("<< /Type /Catalog /Pages 2 0 R >>");
    add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
    add(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n${jpeg}\nendstream`);
    add(`<< /Length 35 >>\nstream\nq\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\nendstream`);
    let pdf = "%PDF-1.3\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(pdf.length);
    for (let index = 0; index < pdf.length; index += 1) {
      bytes[index] = pdf.charCodeAt(index) & 0xff;
    }
    return bytes;
  }

  async function exportPdf() {
    setStatus("Rendering PDF...");
    try {
      const canvas = await renderProjectToCanvas(1);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const bytes = jpegDataUrlToPdfBytes(dataUrl, canvas.width, canvas.height);
      downloadBlob(new Blob([bytes], { type: "application/pdf" }), "iya-collage.pdf");
      setStatus("PDF downloaded.");
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  async function exportWebm() {
    if (!HTMLCanvasElement.prototype.captureStream || !window.MediaRecorder) {
      setStatus("This browser does not support video export.", true);
      return;
    }

    setStatus("Rendering WebM video...");
    try {
      const canvas = await renderProjectToCanvas(0.75);
      const stream = canvas.captureStream(24);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        downloadBlob(new Blob(chunks, { type: "video/webm" }), "iya-collage.webm");
        setStatus("WebM video downloaded.");
      };
      recorder.start();
      const ctx = canvas.getContext("2d");
      const started = performance.now();
      const animate = async (time) => {
        await renderProjectToCanvas(0.75).then((frame) => ctx.drawImage(frame, 0, 0));
        if (time - started < 3200) {
          requestAnimationFrame(animate);
        } else {
          recorder.stop();
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      requestAnimationFrame(animate);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  function interceptMemoriesButton() {
    const button = document.querySelector("#open-collage");

    if (!button) {
      return;
    }

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openEditor();
    }, true);
  }

  interceptMemoriesButton();
  if (new URLSearchParams(location.search).has("collage")) {
    openEditor();
  }

  window.IyaCollageEditor = {
    open: openEditor,
    save: saveProject,
    getProject: () => clone(project),
  };
})();
