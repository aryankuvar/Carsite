/* How Cars Work — shared system and component page renderer */
(function () {
  "use strict";

  const getParam = (name) => new URLSearchParams(window.location.search).get(name);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function showImageFallback(img) {
    img.hidden = true;
    const wrap = img.closest(".image-wrap");
    if (!wrap || wrap.querySelector(".image-placeholder")) return;

    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", "Image unavailable");
    placeholder.innerHTML = "<span aria-hidden='true'>🖼️</span><span>Image unavailable</span>";
    wrap.appendChild(placeholder);
  }

  function renderSystem(system) {
    document.getElementById("page-title").textContent = `${system.name} | How Cars Work`;
    const root = document.getElementById("system-root");

    root.innerHTML = `
      <section class="system-hero">
        <div class="system-intro">
          <p class="eyebrow">CAR SYSTEM / 01</p>
          <h1>${escapeHtml(system.name)}</h1>
          <p class="system-description">${escapeHtml(system.description)}</p>
          <p>${escapeHtml(system.intro)}</p>
        </div>
        <div class="system-media">
          <div class="image-wrap">
            <img class="system-image" src="${escapeHtml(system.image)}" alt="${escapeHtml(system.imageAlt || system.name)}" loading="lazy" />
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-section-heading">
          <p class="eyebrow">TAKE A CLOSER LOOK</p>
          <h2 class="section-title">Meet the components</h2>
          <p class="section-lead">These are the key parts that work together to make the ${escapeHtml(system.name.toLowerCase())} system do its job.</p>
        </div>
        <div class="component-list">
          ${system.components.map((component) => `
            <a href="component.html?system=${encodeURIComponent(system.slug)}&slug=${encodeURIComponent(component.slug)}" class="component-card">
              <span class="component-card-icon" aria-hidden="true">⚙</span>
              <span class="comp-name">${escapeHtml(component.name)}</span>
              <span class="comp-slug">Explore component <span aria-hidden="true">↗</span></span>
            </a>
          `).join("")}
        </div>
      </section>
    `;

    const image = root.querySelector(".system-image");
    if (image) image.addEventListener("error", () => showImageFallback(image), { once: true });
  }

  function renderNotFound(root, title, message) {
    document.getElementById("page-title").textContent = `${title} | How Cars Work`;
    root.innerHTML = `
      <section class="card not-found">
        <span class="not-found-icon" aria-hidden="true">🔎</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        <a class="btn btn--primary" href="index.html">Back to the car <span aria-hidden="true">→</span></a>
      </section>
    `;
  }

  function renderComponent(component) {
    const system = component.system;
    const comp = component.data;
    document.getElementById("page-title").textContent = `${comp.name} | How Cars Work`;
    const root = document.getElementById("component-root");

    const connectionItems = (comp.connections || []).map((slug) => {
      let linkedSystem = null;
      let linkedComponent = null;
      for (const candidateSystem of window.__HOW_CARS_SYSTEMS__) {
        const found = candidateSystem.components.find((item) => item.slug === slug);
        if (found) {
          linkedSystem = candidateSystem;
          linkedComponent = found;
          break;
        }
      }
      if (!linkedComponent) return "";
      return `<a href="component.html?system=${encodeURIComponent(linkedSystem.slug)}&slug=${encodeURIComponent(linkedComponent.slug)}" class="connection-chip">${escapeHtml(linkedComponent.name)}</a>`;
    }).filter(Boolean).join("");

    root.innerHTML = `
      <section class="component-header">
        <p class="eyebrow">${escapeHtml(system.name)} SYSTEM / COMPONENT</p>
        <h1>${escapeHtml(comp.name)}</h1>
        <p>${escapeHtml(comp.definition)}</p>
      </section>

      <section class="component-details">
        <article class="detail-card">
          <span class="detail-icon" aria-hidden="true">🎯</span>
          <div class="field-group"><h2>What's its job?</h2><p>${escapeHtml(comp.purpose)}</p></div>
        </article>
        <article class="detail-card">
          <span class="detail-icon" aria-hidden="true">📍</span>
          <div class="field-group"><h2>Where will you find it?</h2><p>${escapeHtml(comp.location)}</p></div>
        </article>
        <article class="detail-card detail-card--wide">
          <span class="detail-icon" aria-hidden="true">⚙️</span>
          <div class="field-group"><h2>How does it work?</h2><p>${escapeHtml(comp.howItWorks)}</p></div>
        </article>
        <article class="detail-card detail-card--wide">
          <span class="detail-icon" aria-hidden="true">🔗</span>
          <div class="field-group">
            <h2>Connected to</h2>
            <div class="connections-list">${connectionItems || "<span class='muted-copy'>No linked components documented yet.</span>"}</div>
          </div>
        </article>
        <article class="detail-card detail-card--wide detail-card--warning">
          <span class="detail-icon" aria-hidden="true">🧰</span>
          <div class="field-group"><h2>What if it goes wrong?</h2><p>${escapeHtml(comp.failure)}</p></div>
        </article>
      </section>
      <a class="back-system-link" href="system.html?slug=${encodeURIComponent(system.slug)}">← Back to the ${escapeHtml(system.name)} system</a>
    `;
  }

  async function loadData() {
    const systemRoot = document.getElementById("system-root");
    const componentRoot = document.getElementById("component-root");
    const root = systemRoot || componentRoot;
    if (!root) return;

    try {
      const response = await fetch("data/systems.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.systems)) throw new Error("Invalid systems data");

      window.__HOW_CARS_SYSTEMS__ = data.systems;
      const systemSlug = getParam("system") || getParam("slug");

      if (systemRoot) {
        const system = data.systems.find((item) => item.slug === systemSlug);
        if (system) renderSystem(system);
        else renderNotFound(systemRoot, "System not found", "That system link doesn't match anything in our garage.");
        return;
      }

      const componentSlug = getParam("component") || getParam("slug");
      const system = data.systems.find((item) => item.slug === systemSlug);
      const componentSystem = system || data.systems.find((item) => item.components.some((item) => item.slug === componentSlug));
      const component = componentSystem?.components.find((item) => item.slug === componentSlug);

      if (!component) {
        renderNotFound(componentRoot, "Component not found", "We couldn't find that component. Try exploring the car from the homepage.");
        return;
      }
      renderComponent({ system: componentSystem, data: component });
    } catch (error) {
      console.error("Failed to load Carsite content:", error);
      root.innerHTML = `
        <section class="card not-found">
          <h1>We hit a little roadblock.</h1>
          <p>We couldn't load the car guide. Check your connection and try refreshing the page.</p>
          <a class="btn btn--primary" href="index.html">Back to home</a>
        </section>
      `;
    }
  }

  loadData();
})();
