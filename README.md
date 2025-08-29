# 🎮 Tetris Mobile (vanilla JS)

Tetris ringan, responsive, dan siap upload ke GitHub Pages.  
Support **touch controls** (tombol besar), **keyboard**, **hold**, **next queue**, **ghost piece**, **level/speed**, **score**.

![screenshot](./preview.png)

---

## 🚀 Cara Jalanin
### Lokal
Cukup buka `index.html` di browser (Chrome/Firefox/Edge/Safari).  
Tips mobile: *Add to Home Screen* biar full-screen.

### Deploy ke GitHub Pages
1. Buat repo baru, misal `tetris-mobile`.
2. Upload semua file (`index.html`, `styles.css`, `script.js`, `README.md`, `LICENSE`).
3. Masuk Settings → Pages → Source: **Deploy from a branch** → pilih branch `main` dan folder `/ (root)`.
4. Tunggu sebentar sampai URL Pages aktif.

---

## 🎮 Kontrol
### Keyboard
- `←` / `→`: gerak
- `↓`: soft drop
- `Z` / `X`: rotate
- `Space`: hard drop
- `C`: hold
- `P` / `Esc`: pause

### Touch (HP)
- Tombol **◀ / ▼ / ▶**: gerak/soft drop (auto-repeat saat ditahan)
- **⟳**: rotate
- **⤓**: hard drop
- **H**: hold
- **Pause** di bar atas

---

## 🛠️ Catatan teknis
- Canvas auto-resize mengikuti lebar viewport (10×20 grid).
- SRS-like wall kicks sederhana (offset test).
- Speed naik tiap 10 lines. Soft/Hard drop kasih poin kecil.
- Kode murni vanilla JS, tidak pakai library.

Kalau mau dijadiin PWA (offline), tinggal tambah service worker di masa depan.

---

## 📜 Lisensi
Project ini dirilis dengan [MIT License](./LICENSE) © 2025 Ganbi
