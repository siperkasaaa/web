import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { collection, getDocs, getFirestore, orderBy, query } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { LOCAL_FALLBACK_ROWS, PERSONEL_COLUMNS, PERSONEL_FIELD_KEYS } from "./personel-data.js";

const HIDDEN_COLUMN_INDEXES = new Set([1]); // SUB NO disembunyikan dari tampilan
const ADMIN_KEYWORD = "adminperkasa";
const NUMERIC_FIELDS = new Set([
  "no",
  "sub_no",
  "umur",
  "tinggi_badan",
  "berat_badan",
  "lingkar_perut",
  "gol",
  "putaran_1x400m",
  "kelebihan",
  "lari_12m_hasil",
  "lari_12m_nilai",
  "pull_up_hasil",
  "pull_up_nilai",
  "sit_up_hasil",
  "sit_up_nilai",
  "push_up_hasil",
  "push_up_nilai",
  "shuttle_run_hasil",
  "shuttle_run_nilai",
  "nilai_samapta_b",
  "nilai_kesjas_akhir",
  "imt",
]);

const state = {
  personelRows: [],
  initialized: false,
};
bootstrap();

async function bootstrap() {
  const rows = await loadRowsFromFirestore();
  const personelRows = rows.length ? rows : LOCAL_FALLBACK_ROWS;

  const data = {
    title: "SIPERKASA",
    unitName: rows.length ? "BATALYON C PELOPOR (FIREBASE)" : "BATALYON C PELOPOR (LOCAL FALLBACK)",
    kondisi: [
      ["Total Data Ditampilkan", `${personelRows.length} personel`],
      ["Mode Tabel", "Scrollable"],
      ["Maksimum Kolom", "50 kolom"],
      ["Sumber", rows.length ? "Cloud Firestore" : "Local fallback"],
      ["Status", "AKTIF"],
    ],
  };

  state.personelRows = personelRows.map((row) => [...row]);
  renderDashboard(data, state.personelRows);
  initOverlayFeatures();
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
    ["Maks. Kolom Render", Math.min(50, getVisibleColumnCount())],
  ]);

  renderList("progressList", [
    ["Data Masuk", `${personelRows.length} personel`],
    ["Kolom Aktif", `${Math.min(50, getVisibleColumnCount())} kolom`],
    ["Kolom Tersedia", `${getVisibleColumnCount()} kolom`],
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
    { label: "Kolom Aktif", value: Math.min(50, getVisibleColumnCount()), percent: `${getVisibleColumnCount()} total` },
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
  const visibleColumnIndexes = columns
    .map((_, index) => index)
    .filter((index) => !HIDDEN_COLUMN_INDEXES.has(index))
    .slice(0, maxColumns);

  const head = document.getElementById("personelHead");
  head.innerHTML = `<tr>${visibleColumnIndexes.map((index) => `<th>${columns[index]}</th>`).join("")}</tr>`;

  const tbody = document.getElementById("personelRows");
  tbody.innerHTML = rows
    .map(
      (row) =>
        `<tr>${visibleColumnIndexes
          .map((index) => `<td>${row[index] ?? "-"}</td>`)
          .join("")}</tr>`,
    )
    .join("");
}

function getVisibleColumnCount() {
  return PERSONEL_COLUMNS.filter((_, index) => !HIDDEN_COLUMN_INDEXES.has(index)).length;
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

function initOverlayFeatures() {
  if (state.initialized) return;
  state.initialized = true;

  document.getElementById("searchNameButton").addEventListener("click", openSearchOverlay);
  document.getElementById("searchNameInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      openSearchOverlay();
    }
  });
  document.getElementById("openAdminButton").addEventListener("click", () => {
    document.getElementById("overlayAdminLogin").scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("adminKeywordInput").focus();
  });
  document.getElementById("adminLoginSubmit").addEventListener("click", handleAdminLogin);
  document.getElementById("adminAddSubmit").addEventListener("click", handleAddPersonel);
  document.getElementById("adminEditSubmit").addEventListener("click", handleEditPersonel);
  document.getElementById("adminEditSelect").addEventListener("change", populateEditForm);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => hideOverlay(button.dataset.close));
  });

  buildForm("adminAddForm");
  buildForm("adminEditForm");
  refreshEditSelect();
}

function showOverlay(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hideOverlay(id) {
  document.getElementById(id).classList.add("hidden");
}

function openSearchOverlay() {
  const keyword = document.getElementById("searchNameInput").value.trim().toLowerCase();
  if (!keyword) return;

  const row = state.personelRows.find((personel) => String(personel[2]).toLowerCase().includes(keyword));
  const content = document.getElementById("searchResultContent");

  if (!row) {
    content.innerHTML = "<p>Data personel tidak ditemukan.</p>";
    showOverlay("overlaySearchResult");
    return;
  }

  content.innerHTML = PERSONEL_COLUMNS.map((label, index) => `<div><strong>${label}:</strong> ${row[index] ?? "-"}</div>`).join("");
  showOverlay("overlaySearchResult");
}

function handleAdminLogin() {
  const value = document.getElementById("adminKeywordInput").value;
  if (value !== ADMIN_KEYWORD) {
    alert("Kata kunci admin salah.");
    return;
  }

  showOverlay("overlayAdminPanel");
}

function buildForm(formId) {
  const form = document.getElementById(formId);
  form.innerHTML = PERSONEL_FIELD_KEYS.map((key, index) => {
    const type = NUMERIC_FIELDS.has(key) ? "number" : "text";
    return `<label>${PERSONEL_COLUMNS[index]}<input name="${key}" type="${type}" required /></label>`;
  }).join("");
}

function handleAddPersonel() {
  const form = document.getElementById("adminAddForm");
  const row = getRowFromForm(form);
  if (!row) return;

  state.personelRows.push(row);
  sortRowsByNo();
  refreshAfterMutation();
  form.reset();
  alert("Personel baru berhasil ditambahkan.");
}

function handleEditPersonel() {
  const select = document.getElementById("adminEditSelect");
  const selectedNo = Number(select.value);
  const index = state.personelRows.findIndex((row) => Number(row[0]) === selectedNo);
  if (index === -1) return;

  const row = getRowFromForm(document.getElementById("adminEditForm"));
  if (!row) return;
  state.personelRows[index] = row;
  sortRowsByNo();
  refreshAfterMutation();
  select.value = String(row[0]);
  populateEditForm();
  alert("Data personel berhasil diperbarui.");
}

function getRowFromForm(form) {
  const row = [];
  for (const key of PERSONEL_FIELD_KEYS) {
    const input = form.querySelector(`[name="${key}"]`);
    const raw = input.value.trim();
    if (!raw) {
      alert("Semua field wajib diisi.");
      return null;
    }

    row.push(NUMERIC_FIELDS.has(key) ? Number(raw) : raw);
  }
  return row;
}

function refreshEditSelect() {
  const select = document.getElementById("adminEditSelect");
  select.innerHTML = state.personelRows
    .map((row) => `<option value="${row[0]}">${row[0]} - ${row[2]}</option>`)
    .join("");
  populateEditForm();
}

function populateEditForm() {
  const select = document.getElementById("adminEditSelect");
  const no = Number(select.value);
  const row = state.personelRows.find((item) => Number(item[0]) === no);
  if (!row) return;

  const form = document.getElementById("adminEditForm");
  PERSONEL_FIELD_KEYS.forEach((key, index) => {
    const input = form.querySelector(`[name="${key}"]`);
    input.value = row[index] ?? "";
  });
}

function sortRowsByNo() {
  state.personelRows.sort((a, b) => Number(a[0]) - Number(b[0]));
}

function refreshAfterMutation() {
  renderDashboard(
    {
      title: "SIPERKASA",
      unitName: "BATALYON C PELOPOR (ADMIN UPDATE)",
      kondisi: [
        ["Total Data Ditampilkan", `${state.personelRows.length} personel`],
        ["Mode Tabel", "Scrollable"],
        ["Maksimum Kolom", "50 kolom"],
        ["Sumber", "Cloud Firestore / Local"],
        ["Status", "AKTIF"],
      ],
    },
    state.personelRows,
  );
  refreshEditSelect();
}
