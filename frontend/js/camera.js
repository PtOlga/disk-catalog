let currentType = "dvd";
let scannedItem = null;
let codeReader = null;

function setType(type) {
  currentType = type;
  document.getElementById("btn-dvd").classList.toggle("active", type === "dvd");
  document.getElementById("btn-cd_book").classList.toggle("active", type === "cd_book");
}

async function startBarcodeScan() {
  if (codeReader) codeReader.reset();
  codeReader = new ZXing.BrowserMultiFormatReader();
  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, "barcode-reader");
    codeReader.reset();
    const item = await scanBarcode(result.text, currentType);
    showResult(item);
  } catch (e) {
    alert("Barcode not recognised. Please try again or enter the title manually.");
  }
}

async function scanCover(input) {
  const file = input.files[0];
  if (!file) return;

  const preview = document.getElementById("preview");
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(",")[1];
    try {
      const item = await scanCoverBase64(base64, currentType);
      showResult(item);
    } catch (err) {
      alert("Could not recognise the cover. Please enter the title manually.");
    }
  };
  reader.readAsDataURL(file);
}

async function searchManual() {
  const title = document.getElementById("manual-title").value.trim();
  if (!title) return;
  try {
    const item = await scanBarcode(title, currentType);
    showResult(item);
  } catch {
    alert("Not found: «" + title + "»");
  }
}

function showResult(item) {
  scannedItem = item;
  document.getElementById("res-title").textContent = item.title;
  document.getElementById("res-details").textContent =
    [item.author, item.year, item.genre].filter(Boolean).join(" · ");
  const res = document.getElementById("result");
  res.style.display = "block";
  res.scrollIntoView({ behavior: "smooth" });
}

async function saveItem() {
  if (!scannedItem) return;
  try {
    await addToCatalog(scannedItem);
    alert("✅ Added to catalog!");
    window.location.href = "index.html";
  } catch (e) {
    alert("Save error: " + e.message);
  }
}