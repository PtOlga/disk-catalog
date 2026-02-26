let currentType = "dvd";
let scannedItem = null;
let codeReader = null;
let scanningActive = false;

function setType(type) {
  currentType = type;
  document.getElementById("btn-dvd").classList.toggle("active", type === "dvd");
  document.getElementById("btn-cd_book").classList.toggle("active", type === "cd_book");
}

async function startBarcodeScan() {
  const container = document.getElementById("barcode-reader");
  const btn = document.querySelector(".btn-scan-barcode");

  // Stop if already scanning
  if (scanningActive) {
    stopBarcodeScan();
    return;
  }

  // Reset previous reader
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }

  // Check camera availability before doing anything else
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera is not supported in this browser. Please use Chrome or Safari.");
    return;
  }

  // Request camera permission explicitly first — so we get a clear error if denied
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    // Permission granted — release this test stream, ZXing will open its own
    stream.getTracks().forEach(t => t.stop());
  } catch (permError) {
    if (permError.name === "NotAllowedError") {
      alert("Camera access was denied. Please allow camera access in your browser settings and try again.");
    } else if (permError.name === "NotFoundError") {
      alert("No camera found on this device.");
    } else {
      alert("Could not access camera: " + permError.message);
    }
    return;
  }

  // Show camera UI
  scanningActive = true;
  if (btn) {
    btn.textContent = "Stop Scanning";
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-danger");
  }
  container.innerHTML = '<p style="text-align:center;padding:8px;color:#555;font-size:0.9rem">Point camera at barcode...</p>';

  codeReader = new ZXing.BrowserMultiFormatReader();

  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, "barcode-reader");
    stopBarcodeScan();
    const item = await scanBarcode(result.text, currentType);
    showResult(item);
  } catch (e) {
    stopBarcodeScan();
    // NotFoundException is thrown when user stops scanning — don't show error in that case
    if (e && e.name !== "NotFoundException" && !String(e.message).includes("No MultiFormat Readers")) {
      alert("Barcode not recognised. Please try again or enter the title manually.");
    }
  }
}

function stopBarcodeScan() {
  scanningActive = false;
  if (codeReader) {
    codeReader.reset();
    codeReader = null;
  }
  const container = document.getElementById("barcode-reader");
  container.innerHTML = "";
  const btn = document.querySelector(".btn-scan-barcode");
  if (btn) {
    btn.textContent = "Open Camera";
    btn.classList.add("btn-primary");
    btn.classList.remove("btn-danger");
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
    alert("Not found: " + title);
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
    alert("Added to catalog!");
    window.location.href = "index.html";
  } catch (e) {
    alert("Save error: " + e.message);
  }
}
