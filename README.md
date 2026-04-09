# Template Dashboard Web (Siap Dikembangkan)

Project ini adalah starter template dashboard web dengan tampilan awal gaya **monitoring command center** seperti contoh gambar yang Anda kirim.

## Isi project

- `index.html` → struktur dashboard.
- `styles.css` → tema gelap, panel, tabel, layout responsive.
- `app.js` → data dummy + render komponen + grafik menggunakan Chart.js CDN.
- `.github/workflows/deploy-pages.yml` → auto deploy ke GitHub Pages.

## Cara menjalankan lokal

Karena ini project murni HTML/CSS/JS, cukup buka file `index.html` langsung, atau jalankan server lokal:

```bash
python3 -m http.server 5500
```

Lalu buka `http://localhost:5500`.

## Kenapa domain belum muncul di Pages?

Biasanya karena salah satu hal ini:

1. **Belum di-deploy ke hosting** (masih jalan lokal, jadi belum punya domain publik).
2. **GitHub Pages belum diaktifkan** di repository settings.
3. **Workflow deploy belum jalan sukses**.
4. **Repo private / branch salah** untuk source GitHub Pages.
5. **Custom domain** belum diset (`CNAME` + DNS).

## Cara publish ke GitHub Pages (sudah disiapkan)

1. Push project ke GitHub repo.
2. Workflow ini sudah disetel untuk **branch apa pun** (jadi tetap jalan walau branch utama Anda bukan `main`/`master`).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Source: GitHub Actions**.
5. Push commit baru ke branch repo Anda / jalankan workflow manual.
6. Setelah sukses (tab **Actions** status hijau), URL biasanya jadi:
   - `https://<username>.github.io/<nama-repo>/`
   - Jika repo bernama `<username>.github.io`, URL jadi `https://<username>.github.io/`

## Cara ganti isi tampilan

Semua data awal dikumpulkan di object `data` pada `app.js`:

- `summary`
- `personelRows`
- `kondisi`
- `disiplin`
- `nilai`
- `progress`

Anda tinggal ganti nilainya tanpa harus ubah struktur HTML.


## Peta file: update apa di file mana

Agar tidak bingung saat menambah fitur, gunakan panduan ini:

- **Ubah struktur tampilan** (tambah/hapus panel, tabel, tombol, section) → edit `index.html`.
- **Ubah warna/tema/layout/responsive** → edit `styles.css`.
- **Ubah isi data dashboard** (angka, nama, progress, nilai, label grafik) → edit object `data` di `app.js`.
- **Ubah perilaku render atau logika UI** (fungsi render, interaksi, validasi) → edit fungsi di `app.js`.
- **Ubah proses publish domain GitHub Pages** → edit `.github/workflows/deploy-pages.yml` dan setting Pages di GitHub repo.

> Aturan praktis: jika yang berubah adalah **isi** dashboard, mulai dari `app.js`; jika yang berubah adalah **bentuk** dashboard, mulai dari `index.html`; jika yang berubah adalah **gaya** dashboard, mulai dari `styles.css`.

## Saran pengembangan berikutnya

1. Tambahkan autentikasi/login.
2. Sambungkan ke backend API (Node.js/Laravel/Django, dll).
3. Pisahkan komponen ke framework (React/Vue) jika dashboard makin besar.
4. Tambahkan fitur ekspor PDF/Excel.
5. Tambahkan manajemen role user (Admin/Operator/Pimpinan).

## Catatan

Template ini disiapkan **dari nol** agar mudah Anda modifikasi untuk fitur baru ke depannya.
