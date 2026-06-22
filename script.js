/* ====== DOM refs ====== */
const inputArea = document.getElementById('inputArea');
const outputArea = document.getElementById('outputArea');
const humanizeBtn = document.getElementById('humanizeBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const inputStats = document.getElementById('inputStats');
const outputStats = document.getElementById('outputStats');
const toast = document.getElementById('toast');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const toggleKeyBtn = document.getElementById('toggleKeyBtn');
const tabs = document.querySelectorAll('.tab');
const tabResult = document.getElementById('tabResult');
const tabProfile = document.getElementById('tabProfile');
const sample1 = document.getElementById('sample1');
const sample2 = document.getElementById('sample2');
const sample3 = document.getElementById('sample3');
const analyzeBtn = document.getElementById('analyzeBtn');
const profileResult = document.getElementById('profileResult');
const profileBadges = document.getElementById('profileBadges');
const profileDetail = document.getElementById('profileDetail');
const profilePrompt = document.getElementById('profilePrompt');
const outputLoader = document.getElementById('outputLoader');

/* ====== Toast ====== */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ====== API Key ====== */
const STORAGE_KEY = 'stifin_apikey';
const PROFILE_KEY = 'stifin_style_profile';

if (localStorage.getItem(STORAGE_KEY)) {
  apiKeyInput.value = localStorage.getItem(STORAGE_KEY);
  apiKeyInput.classList.add('saved');
}

toggleKeyBtn.addEventListener('click', () => {
  apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
  toggleKeyBtn.textContent = apiKeyInput.type === 'password' ? '👁️' : '🙈';
});

saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showToast('Masukin API Key dulu');
    return;
  }
  if (!key.startsWith('sk-')) {
    showToast('API Key DeepSeek biasanya mulai dengan "sk-"');
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  apiKeyInput.classList.add('saved');
  showToast('API Key tersimpan!');
});

/* ====== Tabs ====== */
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('tab-active'));
    tab.classList.add('tab-active');
    if (tab.dataset.tab === 'result') {
      tabResult.classList.remove('hidden');
      tabProfile.classList.add('hidden');
    } else {
      tabResult.classList.add('hidden');
      tabProfile.classList.remove('hidden');
    }
  });
});

/* ====== Counters ====== */
function updateCounters() {
  const input = inputArea.value;
  const output = getOutputText();

  const inWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const inChars = input.length;
  const outWords = output.trim() ? output.trim().split(/\s+/).length : 0;
  const outChars = output.length;

  inputStats.textContent = `🔤 ${inWords} kata · ${inChars} karakter`;
  outputStats.textContent = `🔤 ${outWords} kata · ${outChars} karakter`;
}

function getOutputText() {
  if (outputArea.querySelector('.placeholder-text')) return '';
  return outputArea.textContent;
}

function setOutputText(text) {
  outputArea.innerHTML = '';
  outputArea.textContent = text;
}

let debounceTimer;
inputArea.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updateCounters, 100);
});

/* ====== Clear ====== */
clearBtn.addEventListener('click', () => {
  if (!inputArea.value.trim()) return;
  inputArea.value = '';
  outputArea.innerHTML = '<p class="placeholder-text">Hasil humanize akan muncul di sini...</p>';
  updateCounters();
  inputArea.focus();
  showToast('Teks udah dibersihin');
});

/* ====== Copy ====== */
copyBtn.addEventListener('click', () => {
  const text = getOutputText();
  if (!text) {
    showToast('Belum ada hasil buat di-copy');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = '<span class="btn-icon">📋</span> Copy';
    }, 2000);
  }).catch(() => showToast('Gagal copy, coba manual yah'));
});

/* =================================================================
   STYLE ANALYSIS
   ================================================================= */



function countWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

analyzeBtn.addEventListener('click', async () => {
  const samples = [sample1.value.trim(), sample2.value.trim(), sample3.value.trim()].filter(Boolean);
  if (samples.length < 2) {
    showToast('Isi minimal 2 sampel tulisan aslimu');
    return;
  }
  if (samples.some(s => countWords(s) < 5)) {
    showToast('Tiap sampel minimal 5 kata');
    return;
  }

  const apiKey = localStorage.getItem(STORAGE_KEY) || apiKeyInput.value.trim();
  if (!apiKey || !apiKey.startsWith('sk-')) {
    showToast('Masukin & simpan DeepSeek API Key dulu');
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = '⏳ Menganalisis...';

  try {
    const profile = await analyzeStyleWithDeepSeek(apiKey, samples);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

    const systemPrompt = buildHumanizePrompt(profile);
    profile.builtPrompt = systemPrompt;
    profileBadges.innerHTML = profile.badges.map(b => `<span class="badge ${b.cls}">${b.label}</span>`).join('');
    profileDetail.textContent = profile.desc;
    profilePrompt.textContent = systemPrompt;
    profileResult.classList.remove('hidden');

    showToast('Selesai! Profil gaya bahasamu udah siap 🎯');
  } catch (err) {
    showToast('Error: ' + err.message);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '🎯 Analisis Gaya Saya!';
  }
});

function buildHumanizePrompt(profile) {
  const parts = profile.particles || [];
  const topWords = profile.topWords || [];

  let prompt = `Kamu adalah asisten yang mengubah teks AI agar terdengar natural seperti tulisan manusia. Berikut profil gaya menulis orang ini:\n\n`;
  prompt += `- Tingkat formalitas: ${profile.styleLabel} (${profile.formality}% formal)\n`;
  prompt += `- Rata-rata panjang kalimat: ${profile.avgSentenceLength} kata\n`;
  if (parts.length > 0) {
    prompt += `- Sering menggunakan partikel: ${parts.join(', ')}\n`;
  }
  if (profile.hasEmoji) prompt += `- Suka menggunakan emoji\n`;
  if (profile.hasSingkatan) prompt += `- Gaya chatty, sering pakai singkatan tidak baku (bgt, tp, krn, lg, dll)\n`;
  if (topWords.length > 0) {
    prompt += `- Kata-kata khas yang sering dipakai: ${topWords.join(', ')}\n`;
  }
  prompt += `\nTUGASMU:\n`;
  prompt += `TULIS ULANG teks AI berikut dengan gaya persis seperti profil di atas.\n`;
  prompt += `PERTAHANKAN semua detail, informasi, struktur, dan panjang teks asli.\n`;
  prompt += `JANGAN buat ringkasan atau poin-poin.\n`;
  prompt += `JANGAN ubah format paragraf menjadi bullet list atau daftar.\n`;
  prompt += `Tulis ulang secara natural, seolah-olah orang tersebut yang menulis.\n`;
  prompt += `Jawab LANGSUNG dengan teks yang sudah diubah, tanpa kata pengantar.\n`;

  return prompt;
}

async function analyzeStyleWithDeepSeek(apiKey, samples) {
  const sampleText = samples.map((s, i) => `[Sample ${i + 1}]\n${s}`).join('\n\n');

  const systemPrompt = `Kamu adalah analis gaya menulis bahasa Indonesia. 
Tugasmu adalah menganalisis sampel tulisan seseorang dan mengembalikan JSON valid (tanpa markdown, tanpa \`\`\`).

Fields yang wajib diisi:
- "formality": angka 0-100 (0 = sangat casual, 100 = sangat formal)
- "styleLabel": string label (contoh: "Casual Banget", "Casual", "Semi-Formal", "Formal")
- "avgSentenceLength": rata-rata jumlah kata per kalimat (angka)
- "particles": array partikel yang sering dipakai (contoh: ["sih", "kok", "deh"])
- "hasEmoji": boolean
- "hasSingkatan": boolean (apakah ada singkatan chat kayak bgt, tp, krn, lg)
- "topWords": array 5-8 kata khas yang sering dipakai (bukan kata umum)
- "desc": string deskripsi singkat tentang gaya tulisannya dalam bahasa Indonesia`

  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analisis gaya tulisan ini:\n\n${sampleText}` },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!resp.ok) {
    const msg = resp.status === 401 ? 'API Key salah atau expired'
      : resp.status === 429 ? 'Quota habis'
      : `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  const data = await resp.json();
  const raw = data.choices[0].message.content.trim();
  const profile = JSON.parse(raw);

  const allParticles = ['sih', 'kok', 'deh', 'lho', 'dong', 'yah', 'nah', 'tuh'];
  const particleList = allParticles.filter(p => (profile.particles || []).includes(p));

  const badges = [
    { label: `${profile.formality < 35 ? '😎' : profile.formality < 50 ? '😊' : profile.formality < 70 ? '🧐' : '🤵'} ${profile.styleLabel}`, cls: profile.formality < 35 ? 'badge-orange' : profile.formality < 50 ? 'badge-green' : profile.formality < 70 ? 'badge-blue' : 'badge-purple' },
    { label: `📏 ${profile.avgSentenceLength} kata/kalimat`, cls: 'badge-blue' },
  ];
  if (particleList.length > 0) badges.push({ label: `💬 ${particleList.join(', ')}`, cls: 'badge-purple' });
  if (profile.hasEmoji) badges.push({ label: '😊 Pake emoji', cls: 'badge-green' });
  if (profile.hasSingkatan) badges.push({ label: '📱 Chatty', cls: 'badge-orange' });

  return {
    ...profile,
    badges,
  };
}

/* =================================================================
   DEEPSEEK HUMANIZE
   ================================================================= */

humanizeBtn.addEventListener('click', async () => {
  const input = inputArea.value.trim();
  if (!input) {
    showToast('Isi teks AI dulu ya!');
    inputArea.focus();
    return;
  }

  const apiKey = localStorage.getItem(STORAGE_KEY) || apiKeyInput.value.trim();
  if (!apiKey || !apiKey.startsWith('sk-')) {
    showToast('Masukin & simpan DeepSeek API Key dulu');
    return;
  }

  let profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
  if (!profile) {
    showToast('Analisis gaya tulisanmu dulu di tab "Gaya Saya"');
    return;
  }

  humanizeBtn.disabled = true;
  humanizeBtn.textContent = '⏳ Memproses...';
  outputArea.innerHTML = '';
  outputLoader.classList.add('active');
  outputStats.textContent = '🔤 0 kata · 0 karakter';

  try {
    const systemPrompt = profile.builtPrompt || buildHumanizePrompt(profile);
    const result = await callDeepSeek(apiKey, systemPrompt, input);
    outputLoader.classList.remove('active');
    setOutputText(result);
    updateCounters();
    showToast('Selesai! teks udah di-humanize 👍');
  } catch (err) {
    outputLoader.classList.remove('active');
    outputArea.innerHTML = '<p class="placeholder-text">Terjadi error. Cek API Key atau coba lagi.</p>';
    showToast('Error: ' + err.message);
  } finally {
    humanizeBtn.disabled = false;
    humanizeBtn.innerHTML = '<span class="btn-icon">🤖</span> Humanize!';
  }
});

async function callDeepSeek(apiKey, systemPrompt, userText) {
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    let msg = resp.status === 401 ? 'API Key salah atau expired'
      : resp.status === 429 ? 'Quota habis atau terlalu banyak request'
      : `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  const data = await resp.json();
  return data.choices[0].message.content.trim();
}

/* ====== Init ====== */
updateCounters();
