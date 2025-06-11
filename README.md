# 🤖 Shikara - WhatsApp AI Bot (Gemini)

## #NOTE: TIDAK BISA JALAN DI TERMUX!
---

## Feature

- ✅ Login WhatsApp via QR Code
- 🧾 Chat Histori per user
- 🗂 Custom Instruction
- 🎨 Support gambar, video, audio, dan stiker
- 🔇 Fitur mute
- 📊 Statistik user

---

## Struktur 

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

## 🛠 Tutor install

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

## 📦 Dependencies

- [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys)
- [`@google/generative-ai`](https://www.npmjs.com/package/@google/generative-ai)
- `sharp`, `pino`, `dotenv`, `qrcode-terminal`, dll.

---

## ⚠️ Catatan

- Maksimal 20 percakapan terakhir yang disimpan.
- Bot tidak menyimpan media di disk — hanya base64 sementara untuk prompt.

---

MIT © 2025 — Made with ? by Rehan
