let allItems = [];
let currentFilter = "all";

async function loadCatalog() {
  try {
    allItems = await fetchCatalog();
    document.getElementById("count").textContent = `${allItems.length} дисков`;
    renderList(allItems);
  } catch (e) {
    document.getElementById("list").innerHTML = '<div class="empty">Ошибка загрузки. Проверьте подключение.</div>';
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
  if (search) filtered = filtered.filter(i => i.title.toLowerCase().includes(search));
  renderList(filtered);
}

function renderList(items) {
  const list = document.getElementById("list");
  if (!items.length) {
    list.innerHTML = '<div class="empty">Ничего не найдено</div>';
    return;
  }
  list.innerHTML = items.map(item => `
    <div class="item-card">
      <img class="item-cover"
        src="${item.cover_url || ''}"
        onerror="this.style.background='#ddd';this.src=''"
        alt="">
      <div class="item-info">
        <h3>${item.title}</h3>
        <p>${[item.author, item.year].filter(Boolean).join(" · ")}</p>
        <p>${item.genre || ''}</p>
        <span class="item-badge ${item.type === 'dvd' ? 'badge-dvd' : 'badge-book'}">
          ${item.type === 'dvd' ? '🎬 DVD' : '📚 CD книга'}
        </span>
      </div>
    </div>
  `).join("");
}
