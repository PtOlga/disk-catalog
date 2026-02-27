// Заменить URL после деплоя на Cloud Run
const API_URL = "https://disk-catalog-api-759669863291.europe-west1.run.app";

async function fetchCatalog(search = "", type = "") {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type && type !== "all") params.append("item_type", type);
  const res = await fetch(`${API_URL}/catalog/?${params}`);
  if (!res.ok) throw new Error("Ошибка загрузки каталога");
  return res.json();
}

async function scanBarcode(barcode, itemType) {
  const res = await fetch(`${API_URL}/scan/barcode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode, item_type: itemType })
  });
  if (!res.ok) throw new Error("Не найдено");
  return res.json();
}

async function scanCoverBase64(base64, itemType) {
  const res = await fetch(`${API_URL}/scan/cover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: base64, item_type: itemType })
  });
  if (!res.ok) throw new Error("Не распознано");
  return res.json();
}

async function searchMultiple(query, itemType) {
  const res = await fetch(`${API_URL}/scan/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode: query, item_type: itemType })
  });
  if (!res.ok) throw new Error("Nothing found");
  return res.json();
}

async function addToCatalog(item) {
  const res = await fetch(`${API_URL}/catalog/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Ошибка сохранения");
  return res.json();
}

async function getItem(id) {
  const res = await fetch(`${API_URL}/catalog/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

async function updateItem(id, item) {
  const res = await fetch(`${API_URL}/catalog/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Save error");
  return res.json();
}

async function deleteItem(id) {
  const res = await fetch(`${API_URL}/catalog/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete error");
}
