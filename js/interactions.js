/* How Cars Work — interactive car explorer */
(function () {
  "use strict";

  const infoName = document.getElementById("info-name");
  const infoDesc = document.getElementById("info-desc");
  const infoLink = document.getElementById("info-link");
  const infoBox = document.getElementById("info-box");
  const tapHint = document.getElementById("tap-hint");
  const systemGrid = document.getElementById("system-grid");
  const explorePrompt = document.getElementById("explore-prompt");
  const regions = [...document.querySelectorAll(".region")];
  const systemsBySlug = new Map();
  let activeSlug = null;

  function selectSystem(slug) {
    const system = systemsBySlug.get(slug);
    if (!system) return;

    activeSlug = slug;
    regions.forEach((region) => {
      const selected = region.dataset.slug === slug;
      region.classList.toggle("active", selected);
      region.setAttribute("aria-pressed", String(selected));
    });

    systemGrid?.querySelectorAll(".system-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.slug === slug);
      chip.setAttribute("aria-current", chip.dataset.slug === slug ? "true" : "false");
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
      const systemName = region.getAttribute("title") || slug;
      region.setAttribute("tabindex", "0");
      region.setAttribute("role", "link");
      region.setAttribute("aria-label", `Explore the ${systemName} system`);

      // Hover previews stay visible when the pointer moves to the information panel.
      region.addEventListener("mouseenter", () => selectSystem(slug));
      region.addEventListener("focus", () => selectSystem(slug));
      region.addEventListener("click", () => {
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
