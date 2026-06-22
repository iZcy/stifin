# StifIn - AI Text Humanizer

## Stack
- HTML + CSS + JavaScript murni (frontend-only)
- DeepSeek API (via browser, user input API key sendiri)

## Struktur File
```
stifin/
├── index.html    # layout: header, 2 panel (output kiri / input kanan), footer
├── styles.css    # tema biru/putih minimalis, responsive
├── script.js     # semua logic: API key, style analysis, humanize
└── AGENTS.md     # catatan project
```

## Alur Kerja
1. **Input API Key** → header, disimpan ke localStorage (`stifin_apikey`)
2. **Tab Gaya Saya** → user paste 2-3 sampel tulisan asli → klik Analisis
   - Kirim sampel ke DeepSeek → balikin JSON profil gaya (formality, particles, dll)
   - Frontend generate prompt rewrite hardcoded dari data profil
   - `builtPrompt` disimpan ke localStorage (`stifin_style_profile`)
3. **Tab Hasil** → user paste teks AI → klik Humanize!
   - Kirim system prompt (builtPrompt) + teks AI ke DeepSeek
   - DeepSeek rewrite teks sesuai gaya, bukan summarize

## Key Design Decisions
- **Prompt hardcoded di frontend**, bukan digenerate DeepSeek → prevent summary behavior
- Prompt eksplisit: "TULIS ULANG, jangan ringkasan, jangan poin-poin, jangan ubah format paragraf"
- Tidak perlu backend → user input API key langsung di browser

## API
- Model: `deepseek-chat`
- Endpoint: `https://api.deepseek.com/v1/chat/completions`
- Temperature: 0.3 (analisis), 0.7 (humanize)

## LocalStorage Keys
- `stifin_apikey` — DeepSeek API key
- `stifin_style_profile` — profil gaya + builtPrompt

## Todo / Next (kalau mau lanjut)
- [ ] Tambah tombol hapus API key / reset
- [ ] Ekspor / impor profil gaya
- [ ] Multiple style profiles
- [ ] History humanize
