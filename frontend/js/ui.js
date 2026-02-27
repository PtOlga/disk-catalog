let allItems = [];
let currentFilter = "all";

async function loadCatalog() {
  try {
    allItems = await fetchCatalog();
    document.getElementById("count").textContent = `${allItems.length} discs`;
    renderList(allItems);
  } catch (e) {
    document.getElementById("list").innerHTML = '<div class="empty">Failed to load. Check your connection.</div>';
  }
}

function setFilter(type, btn) {
  currentFilter = type;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  filterItems();
}

function filterItems() {
  const search = document.getElementById("search").value.toLowerCase();
  let filtered = allItems;
  if (currentFilter !== "all") filtered = filtered.filter(i => i.type === currentFilter);
  if (search) filtered = filtered.filter(i => {
    const inTitle = i.title.toLowerCase().includes(search);
    const inSeries = i.series_name && i.series_name.toLowerCase().includes(search);
    return inTitle || inSeries;
  });
  renderList(filtered);
}

function renderList(items) {
  const list = document.getElementById("list");
  if (!items.length) {
    list.innerHTML = '<div class="empty">Nothing found</div>';
    return;
  }

  // Separate series from regular items
  const seriesItems = items.filter(i => i.type === "series");
  const regularItems = items.filter(i => i.type !== "series");

  let html = "";

  // Group series by series_name
  if (seriesItems.length) {
    const groups = {};
    seriesItems.forEach(item => {
      const key = item.series_name || item.title;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    Object.entries(groups).forEach(([name, discs]) => {
      // Sort discs by season then episodes
      discs.sort((a, b) => (a.season || 0) - (b.season || 0));

      // Build season summary
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
            <img class="item-cover" src="${cover}" onerror="this.style.visibility='hidden'" alt="">
            <div class="series-info">
              <h3>${name}</h3>
              <p class="series-seasons">${seasonSummary}</p>
              <span class="item-badge badge-series">📺 TV Series · ${discs.length} disc${discs.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div class="series-discs">
            ${discs.map(d => `
              <div class="series-disc-row" onclick="location.href='edit.html?id=${d.id}'" style="cursor:pointer">
                <span class="disc-season">S${d.season || "?"}E${d.episodes || "?"}</span>
                <span class="disc-title">${d.title}</span>
                <span class="disc-arrow">›</span>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    });
  }

  // Regular items (dvd + cd_book)
  regularItems.forEach(item => {
    html += `
      <div class="item-card" onclick="location.href='edit.html?id=${item.id}'" style="cursor:pointer">
        <img class="item-cover"
          src="${item.cover_url || ''}"
          onerror="this.style.background='#ddd';this.src=''"
          alt="">
        <div class="item-info">
          <h3>${item.title}</h3>
          <p>${[item.author, item.year].filter(Boolean).join(" · ")}</p>
          <p>${item.genre || ''}</p>
          <span class="item-badge ${item.type === 'dvd' ? 'badge-dvd' : 'badge-book'}">
            ${item.type === 'dvd' ? '🎬 DVD' : '📚 CD Book'}
          </span>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;padding-left:8px;color:#aaa;font-size:1.2rem">›</div>
      </div>
    `;
  });

  list.innerHTML = html;
}
