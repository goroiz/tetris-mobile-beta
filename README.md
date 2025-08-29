# 🎮 Tetris Mobile (vanilla JS)

Tetris ringan, responsive.
Support **touch controls** (tombol besar), **keyboard**, **hold**, **next queue**, **ghost piece**, **level/speed**, **score**.

![screenshot](./preview.png)

---

## 🚀 Cara Jalanin
### Lokal
Cukup buka https://goroiz.github.io/tetris-mobile-beta/ di browser (Chrome/Firefox/Edge/Safari).  
Tips mobile: *Add to Home Screen* biar full-screen.

---

## 🎮 Kontrol
### Keyboard (Computer)
- `←` / `→`: gerak
- `↓`: soft drop
- `Z` / `X`: rotate
- `Space`: hard drop
- `C`: hold
- `P` / `Esc`: pause

### Touch (Mobile)
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

---

## 📜 Lisensi
Project ini dirilis dengan [MIT License](./LICENSE) © 2025 Ganbi
