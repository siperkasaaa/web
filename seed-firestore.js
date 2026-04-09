import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { doc, getFirestore, writeBatch } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { LOCAL_FALLBACK_ROWS, PERSONEL_FIELD_KEYS } from "./personel-data.js";

const log = document.getElementById("log");
const btn = document.getElementById("seedButton");

btn.addEventListener("click", async () => {
  try {
    if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) {
      throw new Error("firebase-config.js belum diisi.");
    }

    btn.disabled = true;
    log.textContent = "Memulai upload data...\n";

    const app = initializeApp(window.FIREBASE_CONFIG);
    const db = getFirestore(app);

    const rows = LOCAL_FALLBACK_ROWS;
    const collectionName = "personel_overweight_2026";

    let batch = writeBatch(db);
    let ops = 0;
    let batchCount = 0;

    for (const row of rows) {
      const payload = mapRowToDoc(row);
      const ref = doc(db, collectionName, String(payload.no));
      batch.set(ref, payload);
      ops += 1;

      if (ops === 450) {
        await batch.commit();
        batchCount += 1;
        log.textContent += `Batch ${batchCount} commit sukses (450 docs max).\n`;
        batch = writeBatch(db);
        ops = 0;
      }
    }

    if (ops > 0) {
      await batch.commit();
      batchCount += 1;
    }

    log.textContent += `Selesai. Total data terupload: ${rows.length} dokumen.`;
  } catch (error) {
    log.textContent += `\nGagal: ${error.message}`;
    console.error(error);
  } finally {
    btn.disabled = false;
  }
});

function mapRowToDoc(row) {
  return PERSONEL_FIELD_KEYS.reduce((acc, key, index) => {
    acc[key] = row[index] ?? null;
    return acc;
  }, {});
}
