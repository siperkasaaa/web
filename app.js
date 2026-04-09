import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { collection, getDocs, getFirestore, orderBy, query } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { LOCAL_FALLBACK_ROWS, PERSONEL_COLUMNS, PERSONEL_FIELD_KEYS } from "./personel-data.js";
bootstrap();

async function bootstrap() {
  const rows = await loadRowsFromFirestore();
  const personelRows = rows.length ? rows : LOCAL_FALLBACK_ROWS;

  const data = {
    title: "DAFTAR PERSONEL OVERWEIGHT (OW) BATALYON C PELOPOR TAHUN 2026",
    unitName: rows.length ? "BATALYON C PELOPOR (FIREBASE)" : "BATALYON C PELOPOR (LOCAL FALLBACK)",
    kondisi: [
      ["Total Data Ditampilkan", `${personelRows.length} personel`],
      ["Mode Tabel", "Scrollable"],
      ["Maksimum Kolom", "50 kolom"],
      ["Sumber", rows.length ? "Cloud Firestore" : "Local fallback"],
      ["Status", "AKTIF"],
    ],
  };

  renderDashboard(data, personelRows);
}

async function loadRowsFromFirestore() {
  try {
    if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) {
      console.warn("FIREBASE_CONFIG belum diisi. Menggunakan local fallback.");
      return [];
    }

    const app = initializeApp(window.FIREBASE_CONFIG);
    const db = getFirestore(app);
    const q = query(collection(db, "personel_overweight_2026"), orderBy("no"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => mapFirestoreDocToRow(doc.data()));
  } catch (error) {
    console.error("Gagal ambil data Firestore:", error);
    return [];
  }
}

function mapFirestoreDocToRow(doc) {
  return PERSONEL_FIELD_KEYS.map((key) => (doc[key] ?? "-"));
}

function renderDashboard(model, personelRows) {
  document.getElementById("dashboardTitle").textContent = model.title;
  document.getElementById("unitName").textContent = model.unitName;

  renderSummary(personelRows);
  renderPersonelTable(PERSONEL_COLUMNS, personelRows);
  renderKondisi(model.kondisi);
  renderDiscipline([
    { name: "Kehadiran Data", value: 100, label: "Lengkap" },
    { name: "Tampilan Tabel", value: 95, label: "Gulir Aktif" },
    { name: "Filter Manual", value: 70, label: "Siap tambah" },
    { name: "Akses Mobile", value: 80, label: "Responsif" },
  ]);

  const owCount = personelRows.filter((r) => String(r[30]).toUpperCase() === "OW").length;
  const obCount = personelRows.filter((r) => String(r[30]).toUpperCase() === "OB").length;

  renderList("nilaiList", [
    ["Total Record", personelRows.length],
    ["Jumlah OW", owCount],
    ["Jumlah OB", obCount],
    ["Maks. Kolom Render", Math.min(50, PERSONEL_COLUMNS.length)],
  ]);

  renderList("progressList", [
    ["Data Masuk", `${personelRows.length} personel`],
    ["Kolom Aktif", `${Math.min(50, PERSONEL_COLUMNS.length)} kolom`],
    ["Kolom Tersedia", `${PERSONEL_COLUMNS.length} kolom`],
    ["Mode", "Horizontal & Vertical Scroll"],
  ]);

  setupCharts(owCount, obCount, personelRows.length);
}

function renderSummary(rows) {
  const total = rows.length || 1;
  const ow = rows.filter((r) => String(r[30]).toUpperCase() === "OW").length;
  const ob = rows.filter((r) => String(r[30]).toUpperCase() === "OB").length;

  const items = [
    { label: "Total Personel", value: rows.length },
    { label: "Overweight", value: ow, percent: `${((ow / total) * 100).toFixed(1)}%` },
    { label: "Obesitas", value: ob, percent: `${((ob / total) * 100).toFixed(1)}%`, highlight: "danger" },
    { label: "Kolom Aktif", value: Math.min(50, PERSONEL_COLUMNS.length), percent: `${PERSONEL_COLUMNS.length} total` },
  ];

  const wrap = document.getElementById("summaryRow");
  wrap.innerHTML = items
    .map(
      (item) => `
      <article class="summary-card">
        <div class="label">${item.label}</div>
        <div>
          <span class="value" style="color:${item.highlight === "danger" ? "#ff8e8e" : "#fff"}">${item.value}</span>
          ${item.percent ? `<span class="percent"> (${item.percent})</span>` : ""}
        </div>
      </article>
    `,
    )
    .join("");
}

function renderPersonelTable(columns, rows) {
  const maxColumns = 50;
  const activeColumns = columns.slice(0, maxColumns);

  const head = document.getElementById("personelHead");
  head.innerHTML = `<tr>${activeColumns.map((col) => `<th>${col}</th>`).join("")}</tr>`;

  const tbody = document.getElementById("personelRows");
  tbody.innerHTML = rows
    .map((row) => `<tr>${row.slice(0, maxColumns).map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
}

function renderKondisi(items) {
  const wrap = document.getElementById("kondisiStats");
  wrap.innerHTML = items
    .map(
      ([name, value]) => `
      <div class="stat-item ${name === "Status" ? "status" : ""}">
        <div class="name">${name}</div>
        <div class="value">${value}</div>
      </div>
    `,
    )
    .join("");
}

function renderDiscipline(items) {
  const wrap = document.getElementById("disciplineList");
  wrap.innerHTML = items
    .map(
      (item) => `
      <div class="progress-item">
        <div>${item.name}</div>
        <div>${item.label}</div>
        <div class="progress-track" style="grid-column: 1 / -1;">
          <div class="progress-fill" style="width:${item.value}%"></div>
        </div>
      </div>
    `,
    )
    .join("");
}

function renderList(targetId, items) {
  const wrap = document.getElementById(targetId);
  wrap.innerHTML = items.map(([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`).join("");
}

function setupCharts(owCount, obCount, total) {
  new Chart(document.getElementById("lineChartMain"), {
    type: "line",
    data: {
      labels: ["Total", "OW", "OB"],
      datasets: [{ data: [total, owCount, obCount], borderColor: "#ff6a5c", backgroundColor: "rgba(255, 106, 92, 0.2)", pointRadius: 4, tension: 0.35, fill: true }],
    },
    options: chartOptions(),
  });

  new Chart(document.getElementById("lineChartSmall"), {
    type: "line",
    data: {
      labels: ["OW", "OB"],
      datasets: [{ data: [owCount, obCount], borderColor: "#ff6a5c", backgroundColor: "rgba(255, 106, 92, 0.15)", pointRadius: 3, tension: 0.3, fill: true }],
    },
    options: chartOptions(),
  });

  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["OW", "OB"],
      datasets: [{ data: [owCount, obCount], backgroundColor: "#9de46a", borderRadius: 4 }],
    },
    options: { ...chartOptions(), plugins: { legend: { display: false } } },
  });

  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: ["OW", "OB"],
      datasets: [{ data: [owCount, obCount], backgroundColor: ["#3f91ff", "#ff4d4d"], borderColor: "#0d1d2f" }],
    },
    options: { plugins: { legend: { labels: { color: "#d9edff" } } } },
  });
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: "#bad1e6" }, grid: { color: "rgba(255,255,255,0.06)" } },
      y: { ticks: { color: "#bad1e6" }, grid: { color: "rgba(255,255,255,0.06)" } },
    },
    plugins: { legend: { display: false } },
  };
}
