/* How Cars Work — interactive blueprint car explorer */
(function () {
  "use strict";

  const infoName = document.getElementById("info-name");
  const infoDesc = document.getElementById("info-desc");
  const infoLink = document.getElementById("info-link");
  const infoBox = document.getElementById("info-box");
  const tapHint = document.getElementById("tap-hint");
  const systemGrid = document.getElementById("system-grid");
  const explorePrompt = document.getElementById("explore-prompt");
  const regions = [...document.querySelectorAll(".region[data-slug]")];
  const systemsBySlug = new Map();
  let previewSlug = null;

  function showSystem(slug) {
    const system = systemsBySlug.get(slug);
    if (!system) return;

    previewSlug = slug;
    systemGrid?.querySelectorAll(".system-chip").forEach((chip) => {
      const selected = chip.dataset.slug === slug;
      chip.classList.toggle("active", selected);
      if (selected) chip.setAttribute("aria-current", "true");
      else chip.removeAttribute("aria-current");
    });

    if (explorePrompt) explorePrompt.hidden = true;
    if (infoName) infoName.textContent = system.name;
    if (infoDesc) infoDesc.textContent = system.description;
    if (infoLink) infoLink.href = `system.html?slug=${encodeURIComponent(slug)}`;
    infoBox?.classList.remove("hidden");
  }

  function renderSystemChips(systems) {
    if (!systemGrid) return;
    systemGrid.innerHTML = systems.map((system) =>
      `<a href="system.html?slug=${encodeURIComponent(system.slug)}" class="system-chip" data-slug="${system.slug}">${system.name}<span aria-hidden="true">↗</span></a>`
    ).join("");
  }

  function setupRegions() {
    regions.forEach((region) => {
      const slug = region.dataset.slug;
      const systemName = region.getAttribute("aria-label") || region.dataset.slug;
      region.setAttribute("tabindex", "0");
      region.setAttribute("role", "link");
      region.setAttribute("aria-label", `Preview ${systemName.replace(/^Explore the /i, "")} system; press Enter to open`);

      // The browser's :hover state controls the orange glow. We only update the
      // information panel here, so the SVG always returns to blue on pointer exit.
      region.addEventListener("mouseenter", () => showSystem(slug));
      region.addEventListener("focus", () => showSystem(slug));
      region.addEventListener("click", () => {
        const isTouchInput = window.matchMedia("(hover: none)").matches;
        if (isTouchInput && previewSlug !== slug) {
          showSystem(slug);
          return;
        }
        window.location.href = `system.html?slug=${encodeURIComponent(slug)}`;
      });
      region.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.href = `system.html?slug=${encodeURIComponent(slug)}`;
        }
      });
    });
  }

  async function init() {
    try {
      const response = await fetch("data/systems.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      data.systems.forEach((system) => systemsBySlug.set(system.slug, system));
      renderSystemChips(data.systems);
    } catch (error) {
      console.error("Failed to load system list:", error);
      if (systemGrid) systemGrid.innerHTML = "<p class='muted-copy'>System list unavailable. Try refreshing.</p>";
    }

    setupRegions();
    if (("ontouchstart" in window || navigator.maxTouchPoints > 0) && tapHint) {
      tapHint.style.display = "block";
    }
  }

  init();
})();
