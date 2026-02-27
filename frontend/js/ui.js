let allItems = [];
let currentFilter = "all";
let currentView = "list";

async function loadCatalog() {
  try {
    allItems = await fetchCatalog();
    document.getElementById("count").textContent = `${allItems.length} discs`;
    filterItems();
  } catch (e) {
    document.getElementById("catalog").innerHTML = '<div class="empty">Failed to load. Check your connection.</div>';
  }
}

function setFilter(type, btn) {
  currentFilter = type;
  document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  filterItems();
}

function setView(view, btn) {
  currentView = view;
  document.querySelectorAll(".view-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const groupBar = document.getElementById("group-bar");
  groupBar.style.display = view === "grouped" ? "flex" : "none";
  filterItems();
}

function filterItems() {
  const search = document.getElementById("search").value.toLowerCase();
  let filtered = allItems;
  if (currentFilter !== "all") filtered = filtered.filter(i => i.type === currentFilter);
  if (search) filtered = filtered.filter(i => {
    return i.title.toLowerCase().includes(search) ||
      (i.series_name && i.series_name.toLowerCase().includes(search)) ||
      (i.author && i.author.toLowerCase().includes(search)) ||
      (i.genre && i.genre.toLowerCase().includes(search));
  });

  if (currentView === "list") renderList(filtered);
  else if (currentView === "gallery") renderGallery(filtered);
  else if (currentView === "grouped") renderGrouped(filtered);
}

// ===== LIST VIEW =====
function renderList(items) {
  const catalog = document.getElementById("catalog");
  if (!items.length) { catalog.innerHTML = '<div class="empty">Nothing found</div>'; return; }

  const seriesItems = items.filter(i => i.type === "series");
  const regularItems = items.filter(i => i.type !== "series");

  let html = '<div class="list-view">';

  if (seriesItems.length) {
    html += renderSeriesGroups(seriesItems);
  }

  regularItems.forEach(item => {
    html += `
      <div class="item-card" onclick="location.href='edit.html?id=${item.id}'">
        <img class="item-cover" src="${item.cover_url || ''}" onerror="this.style.background='var(--surface2)';this.src=''" alt="">
        <div class="item-info">
          <div class="item-title">${item.title}</div>
          <div class="item-meta">${[item.author, item.year].filter(Boolean).join(" · ")}</div>
          ${item.genre ? `<div class="item-meta">${item.genre}</div>` : ""}
          <span class="type-badge ${item.type === 'dvd' ? 'badge-dvd' : 'badge-book'}">
            ${item.type === 'dvd' ? '🎬 DVD' : '📚 CD Book'}
          </span>
        </div>
        <div class="item-arrow">›</div>
      </div>`;
  });

  html += '</div>';
  catalog.innerHTML = html;
}

// ===== GALLERY VIEW =====
function renderGallery(items) {
  const catalog = document.getElementById("catalog");
  if (!items.length) { catalog.innerHTML = '<div class="empty">Nothing found</div>'; return; }

  const colorMap = { dvd: 'var(--dvd)', series: 'var(--series)', cd_book: 'var(--book)' };

  let html = '<div class="gallery-view">';
  items.forEach(item => {
    const color = colorMap[item.type] || 'var(--accent)';
    html += `
      <div class="gallery-item" onclick="location.href='edit.html?id=${item.id}'">
        ${item.cover_url
          ? `<img src="${item.cover_url}" onerror="this.style.display='none'" alt="">`
          : `<div style="width:100%;height:100%;background:var(--surface2)"></div>`
        }
        <div class="gallery-badge" style="background:${color}"></div>
        <div class="gallery-overlay">
          <div class="gallery-title">${item.series_name || item.title}</div>
        </div>
      </div>`;
  });
  html += '</div>';
  catalog.innerHTML = html;
}

// ===== GROUPED VIEW =====
function renderGrouped(items) {
  const catalog = document.getElementById("catalog");
  if (!items.length) { catalog.innerHTML = '<div class="empty">Nothing found</div>'; return; }

  const groupBy = document.getElementById("group-by")?.value || "genre";
  const seriesItems = items.filter(i => i.type === "series");
  const regularItems = items.filter(i => i.type !== "series");

  let html = '<div class="grouped-view">';

  // Series always first as special group
  if (seriesItems.length) {
    html += `
      <div class="group-section">
        <div class="group-heading">
          <h2>TV Series</h2>
          <span class="group-count">${seriesItems.length} disc${seriesItems.length > 1 ? "s" : ""}</span>
          <div class="group-line"></div>
        </div>
        ${renderSeriesGroups(seriesItems)}
      </div>`;
  }

  // Group regular items
  const groups = {};
  regularItems.forEach(item => {
    let key = item[groupBy];
    if (!key) key = "—";
    if (groupBy === "year" && key !== "—") key = Math.floor(key / 10) * 10 + "s"; // decade
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "—") return 1;
    if (b === "—") return -1;
    return a.localeCompare(b);
  });

  sortedKeys.forEach(key => {
    const groupItems = groups[key];
    html += `
      <div class="group-section">
        <div class="group-heading">
          <h2>${key}</h2>
          <span class="group-count">${groupItems.length} disc${groupItems.length > 1 ? "s" : ""}</span>
          <div class="group-line"></div>
        </div>`;

    groupItems.forEach(item => {
      html += `
        <div class="item-card" onclick="location.href='edit.html?id=${item.id}'" style="margin-bottom:8px">
          <img class="item-cover" src="${item.cover_url || ''}" onerror="this.style.background='var(--surface2)';this.src=''" alt="">
          <div class="item-info">
            <div class="item-title">${item.title}</div>
            <div class="item-meta">${[item.author, item.year].filter(Boolean).join(" · ")}</div>
            <span class="type-badge ${item.type === 'dvd' ? 'badge-dvd' : 'badge-book'}">
              ${item.type === 'dvd' ? '🎬 DVD' : '📚 CD Book'}
            </span>
          </div>
          <div class="item-arrow">›</div>
        </div>`;
    });

    html += '</div>';
  });

  html += '</div>';
  catalog.innerHTML = html;
}

// ===== SERIES GROUPS (shared) =====
function renderSeriesGroups(seriesItems) {
  const groups = {};
  seriesItems.forEach(item => {
    const key = item.series_name || item.title;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  let html = "";
  Object.entries(groups).forEach(([name, discs]) => {
    discs.sort((a, b) => (a.season || 0) - (b.season || 0));

    const seasonMap = {};
    discs.forEach(d => {
      const s = d.season || "?";
      if (!seasonMap[s]) seasonMap[s] = [];
      seasonMap[s].push(d);
    });

    const seasonSummary = Object.entries(seasonMap).map(([season, sDiscs]) => {
      const epList = sDiscs.map(d => d.episodes || "?").join(", ");
      return `S${season}: ep. ${epList}`;
    }).join(" · ");

    const cover = discs[0].cover_url || "";

    html += `
      <div class="series-group">
        <div class="series-header">
          <img class="series-cover" src="${cover}" onerror="this.style.background='var(--surface2)';this.src=''" alt="">
          <div class="series-info">
            <div class="series-title">${name}</div>
            <div class="series-seasons">${seasonSummary}</div>
            <span class="type-badge badge-series">📺 TV Series · ${discs.length} disc${discs.length > 1 ? "s" : ""}</span>
          </div>
        </div>
        <div class="series-discs">
          ${discs.map(d => `
            <div class="series-disc-row" onclick="location.href='edit.html?id=${d.id}'">
              <span class="disc-season">S${d.season || "?"}E${d.episodes || "?"}</span>
              <span class="disc-title-text">${d.title}</span>
              <span class="disc-chevron">›</span>
            </div>`).join("")}
        </div>
      </div>`;
  });

  return html;
}
