# StifIn — Humanize AI Text

**StifIn** adalah aplikasi berbasis web untuk mengubah teks yang terdengar seperti buatan AI menjadi teks yang natural sesuai gaya menulis seseorang.

## Daftar Isi

- [Cara Kerja](#cara-kerja)
- [Struktur Project](#struktur-project)
- [Setup & Cara Pakai](#setup--cara-pakai)
- [Alur Sistem](#alur-sistem)
- [Fitur](#fitur)
- [API Reference](#api-reference)
- [Teknologi](#teknologi)
- [Pengembangan Selanjutnya](#pengembangan-selanjutnya)

---

## Cara Kerja

```
┌──────────┐     ┌──────────────┐     ┌───────────┐
│  Sampel  │──→  │  DeepSeek    │──→  │  Profil   │
│ Tulisan  │     │  Analisis    │     │  Gaya     │
│ Asli     │     │  Gaya        │     │  (JSON)   │
└──────────┘     └──────────────┘     └─────┬─────┘
                                            │
┌──────────┐     ┌──────────────┐           │
│  Teks AI │──→  │  DeepSeek    │←──────────┘
│          │     │  Rewrite     │──→  Hasil Humanize
└──────────┘     └──────────────┘
```

**Dua langkah utama:**

1. **Analisis Gaya** — User memberikan 2-3 contoh tulisannya. DeepSeek menganalisis karakteristik gaya (formalitas, pilihan kata, partikel, emoji, dll). Data ini disimpan sebagai profil gaya.

2. **Humanize** — Teks AI dikirim ke DeepSeek bersama profil gaya. DeepSeek menulis ulang teks agar terdengar persis seperti gaya pengguna, tanpa mengubah fakta atau informasi.

---

## Struktur Project

```
stifin/
├── index.html       # Halaman utama: header, 2 panel, footer
├── styles.css       # Styling biru/putih minimalis, responsif
├── script.js        # Semua logika frontend
├── AGENTS.md        # Catatan untuk AI assistant
└── README.md        # Dokumentasi ini
```

### `index.html`

Struktur layout:

```
┌──────────────────────────────────────────────────────┐
│  StifIn              [🔑 API Key ••••••] [Simpan]    │
├─────────────────────┬────────────────────────────────┤
│  [📋 Hasil] [🎨 Gaya Saya]  │  ✏️ Teks AI          │
│                     │                                │
│  Panel Output       │  Panel Input                   │
│  (read-only)        │  (textarea)                    │
│                     │                                │
│  🔤 0 kata · 0 chr │  🔤 0 kata · 0 chr            │
│  [📋 Copy]          │  [🗑️ Hapus]                   │
├─────────────────────┴────────────────────────────────┤
│              [🤖 Humanize!]                          │
└──────────────────────────────────────────────────────┘
```

### `styles.css`

Tema warna:

| Warna | Hex | Penggunaan |
|-------|-----|------------|
| Primary Blue | `#2563eb` | Tombol, border focus, aksen |
| Blue Light | `#eff6ff` | Background header, hover |
| White | `#ffffff` | Panel, background utama |
| Text Dark | `#1e293b` | Teks utama |
| Text Muted | `#64748b` | Counter, placeholder |
| Border | `#e2e8f0` | Garis pemisah, border panel |

### `script.js`

Modul dalam JavaScript:

| Bagian | Baris | Fungsi |
|--------|-------|--------|
| DOM refs | 1-24 | Ambil semua element HTML |
| Toast | 27-32 | Notifikasi pop-up bawah |
| API Key | 35-61 | Simpan/tampilkan/sembunyikan key |
| Tabs | 63-76 | Switch tab Hasil ↔ Gaya Saya |
| Counters | 78-106 | Update kata/karakter real-time |
| Clear | 108-116 | Hapus teks input & output |
| Copy | 118-133 | Copy hasil ke clipboard |
| **Style Analysis** | **135-270** | **Analisis gaya via DeepSeek** |
| **Humanize** | **272-347** | **Rewrite teks AI via DeepSeek** |

---

## Setup & Cara Pakai

### 1. Persyaratan

- Browser modern (Chrome, Firefox, Edge, Safari)
- Akun DeepSeek dengan API key (format: `sk-...`)

### 2. Instalasi

```bash
# Clone repositori
git clone https://github.com/iZcy/stifin.git
cd stifin

# Buka di browser
open index.html    # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

Tidak perlu install dependency — aplikasi 100% client-side.

### 3. Alur Lengkap

#### Langkah 1: Masukkan API Key

1. Buka `index.html` di browser
2. Di pojok kanan atas, paste DeepSeek API key
3. Klik **Simpan**
4. Key tersimpan otomatis di localStorage (tidak perlu input ulang)

#### Langkah 2: Analisis Gaya Menulis

1. Klik tab **🎨 Gaya Saya**
2. Paste minimal 2 contoh tulisan asli kamu di kolom Sample
   - Bisa dari chat WhatsApp, notes, caption IG, email — bebas
   - Tiap sampel minimal 5 kata
3. Klik **🎯 Analisis Gaya Saya!**
4. DeepSeek akan menganalisis:
   - Tingkat formalitas
   - Rata-rata panjang kalimat
   - Partikel yang sering dipakai (`sih`, `kok`, `deh`, dll)
   - Penggunaan emoji
   - Singkatan khas chat
   - Kata-kata khas
5. Hasil ditampilkan sebagai badges + deskripsi + system prompt yang akan dipakai

#### Langkah 3: Humanize Teks AI

1. Klik tab **📋 Hasil**
2. Paste teks AI di panel kanan (textarea)
3. Klik **🤖 Humanize!**
4. DeepSeek menulis ulang teks sesuai gaya yang sudah dianalisis
5. Hasil muncul di panel kiri
6. Klik **Copy** untuk menyalin hasil

---

## Alur Sistem

### Diagram Alir

```
START
  │
  ├─→ Input API Key ──→ Simpan ke localStorage
  │
  ├─→ Tab "Gaya Saya"
  │     │
  │     ├─→ Paste 2-3 sampel tulisan
  │     │
  │     └─→ Klik "Analisis Gaya Saya!"
  │           │
  │           ├─→ GET apiKey dari localStorage
  │           │
  │           ├─→ POST ke DeepSeek API
  │           │     Model: deepseek-chat
  │           │     System prompt: "Analisis gaya tulisan..."
  │           │     User message: sampel teks
  │           │
  │           ├─→ Parse JSON response
  │           │     { formality, avgSentenceLength, 
  │           │       particles, hasEmoji, topWords, ... }
  │           │
  │           ├─→ buildHumanizePrompt(profile)
  │           │     → Generate hardcoded rewrite prompt
  │           │
  │           ├─→ Simpan profile + builtPrompt ke localStorage
  │           │
  │           └─→ Tampilkan badges + prompt di UI
  │
  ├─→ Tab "Hasil"
  │     │
  │     ├─→ Paste teks AI
  │     │
  │     └─→ Klik "Humanize!"
  │           │
  │           ├─→ Validasi: API key + profil tersedia?
  │           │
  │           ├─→ Ambil builtPrompt dari localStorage
  │           │
  │           ├─→ POST ke DeepSeek API
  │           │     Model: deepseek-chat
  │           │     System prompt: builtPrompt (rewrite)
  │           │     User message: teks AI
  │           │
  │           ├─→ Tampilkan hasil rewrite di panel kiri
  │           │
  │           └─→ Update word/char counter
  │
  └─→ Selesai
```

### Prompt Rewrite (Hardcoded)

Prompt di bawah **dibuat oleh frontend**, bukan oleh DeepSeek. Ini penting agar DeepSeek tidak bisa mengubah instruksi menjadi summarization.

```
Kamu adalah asisten yang mengubah teks AI agar terdengar natural
seperti tulisan manusia. Berikut profil gaya menulis orang ini:

- Tingkat formalitas: Casual (35% formal)
- Rata-rata panjang kalimat: 12 kata
- Sering menggunakan partikel: sih, kok, deh
- Suka menggunakan emoji
- Gaya chatty, sering pakai singkatan tidak baku
- Kata-kata khas: gue, banget, anjir

TUGASMU:
TULIS ULANG teks AI berikut dengan gaya persis seperti profil di atas.
PERTAHANKAN semua detail, informasi, struktur, dan panjang teks asli.
JANGAN buat ringkasan atau poin-poin.
JANGAN ubah format paragraf menjadi bullet list atau daftar.
Tulis ulang secara natural, seolah-olah orang tersebut yang menulis.
Jawab LANGSUNG dengan teks yang sudah diubah, tanpa kata pengantar.
```

### Prompt Analisis Gaya (Dikirim ke DeepSeek)

```
Kamu adalah analis gaya menulis bahasa Indonesia.
Tugasmu adalah menganalisis sampel tulisan seseorang dan
mengembalikan JSON valid.

Fields: formality, styleLabel, avgSentenceLength, particles,
        hasEmoji, hasSingkatan, topWords, desc
```

---

## Fitur

### ✅ Aktif

| Fitur | Keterangan |
|-------|-----------|
| **Input API Key** | Masked input, tersimpan di localStorage |
| **Analisis Gaya via DeepSeek** | Deteksi formalitas, partikel, emoji, dll |
| **Rewrite (bukan summarize)** | Prompt hardcoded mencegah DeepSeek membuat ringkasan |
| **Word & Char Counter** | Real-time di kedua panel |
| **Copy to Clipboard** | Dengan feedback visual (Copied! ✅) |
| **Clear / Reset** | Hapus teks input & output |
| **Loading State** | Spinner + disabled button selama proses |
| **Error Handling** | 401 (key salah), 429 (quota habis), dll |
| **Toast Notifikasi** | Pop-up bawah untuk feedback |
| **Responsive** | Stack vertikal di layar < 768px |

### 📋 Rencana

| Fitur | Status |
|-------|--------|
| Tombol hapus/reset API Key | Rencana |
| Ekspor/Impor profil gaya | Rencana |
| Multiple style profiles | Rencana |
| History humanize | Rencana |
| Dark mode | Rencana |

---

## API Reference

### DeepSeek Chat Completion

**Endpoint:**
```
POST https://api.deepseek.com/v1/chat/completions
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

**Request Body (Analisis Gaya):**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "Kamu adalah analis gaya menulis..."
    },
    {
      "role": "user",
      "content": "Analisis gaya tulisan ini:\n\n[Sample 1]..."
    }
  ],
  "temperature": 0.3,
  "max_tokens": 2000
}
```

**Response (Analisis Gaya):**
```json
{
  "formality": 35,
  "styleLabel": "Casual",
  "avgSentenceLength": 12,
  "particles": ["sih", "kok", "deh"],
  "hasEmoji": true,
  "hasSingkatan": true,
  "topWords": ["gue", "banget", "anjir"],
  "desc": "Gaya casual dengan banyak partikel..."
}
```

**Request Body (Humanize):**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "Kamu adalah asisten yang mengubah teks AI..."
    },
    {
      "role": "user",
      "content": "Pemrograman C merupakan salah satu..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 4096
}
```

### localStorage Keys

| Key | Tipe | Fungsi |
|-----|------|--------|
| `stifin_apikey` | `string` | DeepSeek API key |
| `stifin_style_profile` | `JSON string` | Profil gaya + builtPrompt |

---

## Teknologi

- **Frontend:** HTML5, CSS3, JavaScript (ES2020+)
- **AI API:** [DeepSeek Chat](https://platform.deepseek.com/) (API format kompatibel dengan OpenAI)
- **Storage:** Browser localStorage
- **Dependencies:** None

### Kenapa Frontend-Only?

- **Sederhana** — tidak perlu server, tinggal buka file HTML
- **Privasi** — API key input oleh user sendiri, tidak disimpan di server pihak ketiga
- **Mudah di-deploy** — bisa di-host di GitHub Pages, Netlify, Vercel, atau langsung dari file

---

## Pengembangan Selanjutnya

### Menambahkan Backend

Agar API key tidak terekspos di browser, bisa tambah backend sederhana:

```bash
stifin/
├── backend/
│   ├── package.json
│   ├── server.js      # Proxy API key
│   └── .env           # DEEPSEEK_API_KEY=sk-...
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── README.md
```

### Mengganti ke LLM Lain

Karena DeepSeek kompatibel dengan format OpenAI, tinggal ganti:
- `endpoint` → endpoint provider lain
- `model` → model yang diinginkan
- Format request/response tetap sama

### Catatan Penting

- **Prompt rewrite hardcoded** di frontend — jangan biarkan AI yang membuat prompt untuk dirinya sendiri, karena hasilnya tidak bisa dikontrol (cenderung summarization).
- **Semua data tersimpan di localStorage** — data tidak akan hilang saat refresh, tapi akan hilang jika cache browser dibersihkan.
