# 🤖 Shikara - WhatsApp AI Bot (Gemini)

## #NOTE: TIDAK BISA JALAN DI TERMUX!
---

## 🚀 Fitur Utama

- ✅ Login WhatsApp via QR Code (dengan sesi disimpan)
- 🧠 Interaksi AI berbasis Gemini (via `@google/generative-ai`)
- 🧾 Penyimpanan histori per pengguna
- 🗂 Instruksi custom per user
- 🎨 Dukungan gambar, video, audio, dan stiker
- 🔇 Fitur mute per user
- 📊 Statistik harian penggunaan

---

## 🧱 Struktur Folder

```bash
.
├── auth/                # File autentikasi Baileys
├── history/             # Histori percakapan per user
├── instructions/        # Instruksi kustom per user
├── usrdata/             # Metadata dan statistik per user
├── respond.json         # Template respons bot
├── index.js             # File utama bot
├── .env                 # API Key Gemini
└── package.json
```

---

## 🛠 Instalasi

1. **Clone repo & install dependency**
   ```bash
   npm install
   ```

2. **Siapkan file `.env`**
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. **Jalankan bot**
   ```bash
   node index.js
   ```

4. **Scan QR dari terminal** untuk login WhatsApp.

---

## 💬 Command List

| Command             | Deskripsi                                      |
|---------------------|-----------------------------------------------|
| `/menu`             | Menampilkan menu dasar                        |
| `/command` atau `/cmd` | Menampilkan daftar perintah                |
| `/reset`            | Reset histori, instruksi, dan statistik       |
| `/seti [teks]`      | Set instruksi kustom untuk AI                 |
| `/info`             | Menampilkan info user + statistik             |
| `/reg [nama]`       | Mendaftarkan nama pengguna                    |
| `/unreg`            | Menghapus nama pengguna                       |
| `/mute`             | Mematikan respons AI untuk user ini          |
| `/unmute`           | Menghidupkan kembali AI                      |

---

## 🤖 Cara Kerja

- Setiap pesan masuk akan diproses:
  - Jika command: dieksekusi langsung
  - Jika bukan command & AI tidak dimute:
    - Pesan + histori terakhir dikirim ke Gemini
    - Jawaban ditulis ke histori & dikirim ke WhatsApp

- File `respond.json` berisi template pesan yang digunakan oleh bot.

---

## 📦 Dependencies Utama

- [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys)
- [`@google/generative-ai`](https://www.npmjs.com/package/@google/generative-ai)
- `sharp`, `pino`, `dotenv`, `qrcode-terminal`, dll.

---

## ⚠️ Catatan

- API Gemini versi Flash digunakan agar lebih cepat.
- Maksimal 20 percakapan terakhir yang disimpan.
- Bot tidak menyimpan media di disk — hanya base64 sementara untuk prompt.

---

## 📜 Lisensi

MIT © 2025 — Made with ☕ by Rehan
