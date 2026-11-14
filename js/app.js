/* ==========================================================================
   How Cars Work — App
   Renders system and component pages from data/systems.json using URL params.
   ========================================================================== */

(function () {
  function getParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function imageFallback(img) {
    img.style.display = "none";
    const wrap = img.closest(".image-wrap");
    if (!wrap) return;
    const existing = wrap.querySelector(".image-placeholder");
    if (!existing) {
      const ph = document.createElement("div");
      ph.className = "image-placeholder";
      ph.textContent = "Image not available";
      wrap.appendChild(ph);
    }
  }

  // ------------------------------------------------------------------ System page
  function renderSystem(system) {
    document.getElementById("page-title").textContent = `${system.name} | How Cars Work`;

    const root = document.getElementById("system-root");
    root.innerHTML = `
      <div class="system-hero">
        <div class="system-intro">
          <h1>${escapeHtml(system.name)}</h1>
          <p style="font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent); margin-bottom:0.5rem;">System</p>
          <p>${escapeHtml(system.description)}</p>
          <p>${escapeHtml(system.intro)}</p>
        </div>
        <div class="system-media">
          <div class="image-wrap">
            <img src="${escapeHtml(system.image)}" alt="${escapeHtml(system.imageAlt || system.name)}" onerror="imageFallback(this)" />
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <section>
        <h2 class="section-title">Key components</h2>
        <p class="section-lead">Each component below links to its own page with definition, purpose, location, and failure symptoms.</p>
        <div class="component-list">
          ${system.components
            .map(
              (c) =>
                `<a href="component.html?system=${system.slug}&slug=${c.slug}" class="component-card">
                   <span class="comp-name">${escapeHtml(c.name)}</span>
                   <span class="comp-slug">${c.slug}</span>
                 </a>`
            )
            .join("")}
        </div>
      </section>
    `;
  }

  // ------------------------------------------------------------------ Component page
  function renderComponent(systemSlug, componentSlug) {
    // find system + component (slugs are unique across all systems)
    let foundSystem = null;
    let foundComponent = null;

    // `systems` is populated by loadData(); read from closure variable
    for (const s of window.__HOW_CARS_SYSTEMS__) {
      const c = s.components.find((x) => x.slug === componentSlug);
      if (c) {
        foundSystem = s;
        foundComponent = c;
        break;
      }
    }

    if (!foundComponent) {
      document.getElementById("page-title").textContent = "Not found | How Cars Work";
      document.getElementById("component-root").innerHTML = `
        <div class="card">
          <h1>Component not found</h1>
          <p>Could not find component <code>${escapeHtml(componentSlug)}</code>. <a href="index.html">Return to the car</a>.</p>
        </div>
      `;
      return;
    }

    const system = foundSystem;
    const comp = foundComponent;
    document.getElementById("page-title").textContent = `${comp.name} | How Cars Work`;

    const connectionsHtml = comp.connections && comp.connections.length
      ? comp.connections
          .map((connSlug) => {
            // find which system this connection belongs to
            let connSystemSlug = systemSlug;
            for (const s of window.__HOW_CARS_SYSTEMS__) {
              if (s.components.some((x) => x.slug === connSlug)) {
                connSystemSlug = s.slug;
                break;
              }
            }
            return `<a href="component.html?system=${connSystemSlug}&slug=${connSlug}" class="connection-chip">${escapeHtml(connSlug)}</a>`;
          })
          .join("")
      : `<p style="color:var(--muted); font-size:0.9rem;">No linked components documented yet.</p>`;

    document.getElementById("component-root").innerHTML = `
      <div class="component-header">
        <div class="comp-system">${escapeHtml(system.name)} system</div>
        <h1>${escapeHtml(comp.name)}</h1>
        <p>${escapeHtml(comp.definition)}</p>
      </div>

      <div class="divider"></div>

      <div class="field-group">
        <h4>Purpose</h4>
        <p>${escapeHtml(comp.purpose)}</p>
      </div>

      <div class="field-group">
        <h4>Location</h4>
        <p>${escapeHtml(comp.location)}</p>
      </div>

      <div class="field-group">
        <h4>How it works</h4>
        <p>${escapeHtml(comp.howItWorks)}</p>
      </div>

      <div class="field-group">
        <h4>Connections</h4>
        <div class="connections-list">${connectionsHtml}</div>
      </div>

      <div class="field-group">
        <h4>What happens if it fails</h4>
        <p>${escapeHtml(comp.failure)}</p>
      </div>
    `;
  }

  // ------------------------------------------------------------------ Load + route
  async function loadData() {
    try {
      const res = await fetch("data/systems.json");
      const data = await res.json();
      window.__HOW_CARS_SYSTEMS__ = data.systems;

      const systemSlug = getParam("slug");
      const componentSlug = getParam("component") || getParam("slug");

      if (document.getElementById("system-root") && systemSlug) {
        const system = data.systems.find((s) => s.slug === systemSlug);
        if (system) renderSystem(system);
        else {
          document.getElementById("page-title").textContent = "Not found | How Cars Work";
          document.getElementById("system-root").innerHTML = `
            <div class="card"><h1>System not found</h1><p><a href="index.html">Return to the car</a>.</p></div>
          `;
        }
      } else if (document.getElementById("component-root")) {
        const sysParam = getParam("system");
        renderComponent(sysParam, componentSlug);
      }
    } catch (err) {
      console.error("Failed to load systems.json:", err);
      const root = document.getElementById("system-root") || document.getElementById("component-root");
      if (root) root.innerHTML = "<p style='color:var(--muted);'>Content unavailable. Please check data/systems.json.</p>";
    }
  }

  loadData();
})();
