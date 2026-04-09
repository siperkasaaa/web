# Template Dashboard Web (Siap Dikembangkan)

Project ini adalah starter template dashboard web dengan tampilan awal gaya **monitoring command center** seperti contoh gambar yang Anda kirim.

## Isi project

- `index.html` → struktur dashboard.
- `styles.css` → tema gelap, panel, tabel, layout responsive.
- `app.js` → data dummy + render komponen + grafik menggunakan Chart.js CDN.

## Cara menjalankan

Karena ini project murni HTML/CSS/JS, cukup buka file `index.html` langsung, atau jalankan server lokal:

```bash
python3 -m http.server 5500
```

Lalu buka `http://localhost:5500`.

## Cara ganti isi tampilan

Semua data awal dikumpulkan di object `data` pada `app.js`:

- `summary`
- `personelRows`
- `kondisi`
- `disiplin`
- `nilai`
- `progress`

Anda tinggal ganti nilainya tanpa harus ubah struktur HTML.

## Saran pengembangan berikutnya

1. Tambahkan autentikasi/login.
2. Sambungkan ke backend API (Node.js/Laravel/Django, dll).
3. Pisahkan komponen ke framework (React/Vue) jika dashboard makin besar.
4. Tambahkan fitur ekspor PDF/Excel.
5. Tambahkan manajemen role user (Admin/Operator/Pimpinan).

## Catatan

Template ini disiapkan **dari nol** agar mudah Anda modifikasi untuk fitur baru ke depannya.
