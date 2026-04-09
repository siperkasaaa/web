const data = {
  title: "OVERWEIGHT MONITORING DASHBOARD",
  unitName: "SIPERKASA BRIMOB",
  summary: [
    { label: "Total Personel", value: 200 },
    { label: "Postur Ideal", value: 120, percent: "60%" },
    { label: "Overweight", value: 60, percent: "30%", highlight: "danger" },
    { label: "Obesitas", value: 20, percent: "10%", highlight: "danger" },
  ],
  personelRows: [
    { nama: "Bripka A", nrp: "870123", pangkat: "Bripka", kompi: "Kompi 1", usia: 32 },
    { nama: "Brigpol B", nrp: "854567", pangkat: "Brigpol", kompi: "Kompi 2", usia: 30 },
    { nama: "Briptu C", nrp: "899001", pangkat: "Briptu", kompi: "Kompi 3", usia: 29 },
  ],
  kondisi: [
    ["Tinggi", "170 cm"],
    ["Berat", "85 kg"],
    ["BMI", "29.4"],
    ["Lingkar Perut", "96 cm"],
    ["Status", "OVERWEIGHT"],
  ],
  disiplin: [
    { name: "Kehadiran", value: 85, label: "85%" },
    { name: "Lari", value: 76, label: "Baik" },
    { name: "Push-Up", value: 64, label: "Cukup" },
    { name: "Sit-Up", value: 74, label: "Baik" },
  ],
  nilai: [
    ["Lari 12 Menit", "2100 M"],
    ["Push-Up", "35"],
    ["Sit-Up", "38"],
    ["Nilai Akhir", "74"],
  ],
  progress: [
    ["Berat Awal", "88 kg"],
    ["Berat Sekarang", "85 kg"],
    ["Target", "75 kg"],
    ["Total Penurunan", "-3 kg"],
  ],
};

renderDashboard(data);

function renderDashboard(model) {
  document.getElementById("dashboardTitle").textContent = model.title;
  document.getElementById("unitName").textContent = model.unitName;

  renderSummary(model.summary);
  renderPersonel(model.personelRows);
  renderKondisi(model.kondisi);
  renderDiscipline(model.disiplin);
  renderList("nilaiList", model.nilai);
  renderList("progressList", model.progress);

  setupCharts();
}

function renderSummary(items) {
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

function renderPersonel(rows) {
  const tbody = document.getElementById("personelRows");
  tbody.innerHTML = rows
    .map(
      (row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${row.nama}</td>
        <td>${row.nrp}</td>
        <td>${row.pangkat}</td>
        <td>${row.kompi}</td>
        <td>${row.usia}</td>
      </tr>
    `,
    )
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
  wrap.innerHTML = items
    .map(([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`)
    .join("");
}

function setupCharts() {
  new Chart(document.getElementById("lineChartMain"), {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei"],
      datasets: [
        {
          data: [56, 53, 50, 47, 45],
          borderColor: "#ff6a5c",
          backgroundColor: "rgba(255, 106, 92, 0.2)",
          pointRadius: 4,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: chartOptions(),
  });

  new Chart(document.getElementById("lineChartSmall"), {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei"],
      datasets: [
        {
          data: [57, 55, 52, 50, 47],
          borderColor: "#ff6a5c",
          backgroundColor: "rgba(255, 106, 92, 0.15)",
          pointRadius: 3,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: chartOptions(),
  });

  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei"],
      datasets: [
        {
          data: [-1, -1.5, -2.3, -3.1, -4],
          backgroundColor: "#9de46a",
          borderRadius: 4,
        },
      ],
    },
    options: {
      ...chartOptions(),
      plugins: { legend: { display: false } },
    },
  });

  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: ["Tercapai", "Berjalan", "Belum"],
      datasets: [
        {
          data: [60, 30, 10],
          backgroundColor: ["#3f91ff", "#ff4d4d", "#9ade5d"],
          borderColor: "#0d1d2f",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "#d9edff" },
        },
      },
    },
  });
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#bad1e6" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
      y: {
        ticks: { color: "#bad1e6" },
        grid: { color: "rgba(255,255,255,0.06)" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };
}
