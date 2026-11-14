/* ==========================================================================
   How Cars Work — Interactions
   SVG region highlights (hover + mobile tap fallback) and system chips.
   ========================================================================== */

(function () {
  const INFO_NAME = document.getElementById("info-name");
  const INFO_DESC = document.getElementById("info-desc");
  const INFO_LINK = document.getElementById("info-link");
  const INFO_BOX = document.getElementById("info-box");
  const TAP_HINT = document.getElementById("tap-hint");
  const SYSTEM_GRID = document.getElementById("system-grid");

  let systemsBySlug = {};

  // ------------------------------------------------------------------ Init
  async function init() {
    try {
      const res = await fetch("data/systems.json");
      const data = await res.json();
      data.systems.forEach((s) => {
        systemsBySlug[s.slug] = s;
      });
      renderSystemChips(data.systems);
    } catch (err) {
      console.error("Failed to load systems.json:", err);
      if (SYSTEM_GRID) SYSTEM_GRID.innerHTML = "<p>Content unavailable.</p>";
    }

    setupRegions();

    // Show tap hint on touch-capable devices only
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      if (TAP_HINT) TAP_HINT.style.display = "block";
    }
  }

  // ------------------------------------------------------------------ System chips
  function renderSystemChips(systems) {
    if (!SYSTEM_GRID) return;
    SYSTEM_GRID.innerHTML = systems
      .map(
        (s) =>
          `<a href="system.html?slug=${s.slug}" class="system-chip" data-slug="${s.slug}">${s.name}</a>`
      )
      .join("");
  }

  // ------------------------------------------------------------------ Region setup
  function setupRegions() {
    const regions = document.querySelectorAll(".region");
    if (!regions.length) return;

    let activeRegion = null;

    function show(slug) {
      const s = systemsBySlug[slug];
      if (!s) return;

      // highlight
      if (activeRegion) activeRegion.classList.remove("active");
      const el = document.querySelector(`.region[data-slug="${slug}"]`);
      if (el) {
        el.classList.add("active");
        activeRegion = el;
      }

      // info box
      INFO_NAME.textContent = s.name;
      INFO_DESC.textContent = s.description;
      INFO_LINK.href = `system.html?slug=${slug}`;
      INFO_BOX.classList.remove("hidden");
    }

    function hide() {
      if (activeRegion) {
        activeRegion.classList.remove("active");
        activeRegion = null;
      }
      INFO_BOX.classList.add("hidden");
    }

    // Mouse (desktop)
    regions.forEach((region) => {
      const slug = region.getAttribute("data-slug");
      region.addEventListener("mouseenter", () => show(slug));
      region.addEventListener("mouseleave", hide);
      region.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = `system.html?slug=${slug}`;
      });
    });

    // Mobile tap fallback
    regions.forEach((region) => {
      const slug = region.getAttribute("data-slug");
      region.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        show(slug);
      });
    });

    // Tap anywhere else clears the highlight
    document.addEventListener("touchstart", (e) => {
      if (!e.target.closest(".region")) {
        hide();
      }
    });
  }

  init();
})();
