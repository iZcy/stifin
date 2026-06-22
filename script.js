const inputArea = document.getElementById('inputArea');
const outputArea = document.getElementById('outputArea');
const humanizeBtn = document.getElementById('humanizeBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const inputStats = document.getElementById('inputStats');
const outputStats = document.getElementById('outputStats');
const headerCounter = document.getElementById('headerCounter');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._hide);
  toast._hide = setTimeout(() => toast.classList.remove('show'), 2000);
}

function updateCounters() {
  const input = inputArea.value;
  const output = outputArea.textContent === 'Hasil humanize akan muncul di sini...'
    ? '' : getOutputText();

  const inWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const inChars = input.length;
  const outWords = output.trim() ? output.trim().split(/\s+/).length : 0;
  const outChars = output.length;

  inputStats.textContent = `🔤 ${inWords} kata · ${inChars} karakter`;
  outputStats.textContent = `🔤 ${outWords} kata · ${outChars} karakter`;
  headerCounter.textContent = `${inChars} karakter`;
}

function getOutputText() {
  const p = outputArea.querySelector('p');
  return p ? p.textContent : outputArea.textContent;
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

const formalToCasual = [
  { from: /\bmerupakan\b/gi, to: () => pick(['adalah', 'termasuk']) },
  { from: /\bdalam rangka\b/gi, to: () => pick(['buat', 'untuk', 'demi']) },
  { from: /\bterdapat\b/gi, to: () => pick(['ada', 'ada aja']) },
  { from: /\bsehingga\b/gi, to: () => pick(['jadi', 'sampai-sampai']) },
  { from: /\bakan tetapi\b/gi, to: () => 'tapi' },
  { from: /\bnamun\b/gi, to: () => 'tapi' },
  { from: /\bolek karena itu\b/gi, to: () => pick(['makanya', 'jadi', 'nah makanya']) },
  { from: /\bdengan demikian\b/gi, to: () => pick(['jadi', 'nah']) },
  { from: /\bmelakukan\b/gi, to: () => pick(['ngerjain', 'lakuin', 'melakukan']) },
  { from: /\bmenggunakan\b/gi, to: () => pick(['pakai', 'pake']) },
  { from: /\bmemiliki\b/gi, to: () => pick(['punya', 'ada']) },
  { from: /\bmemberikan\b/gi, to: () => pick(['kasih', 'ngasih']) },
  { from: /\bberdasarkan\b/gi, to: () => pick(['menurut', 'dari']) },
  { from: /\bmelalui\b/gi, to: () => pick(['lewat', 'via']) },
  { from: /\btersebut\b/gi, to: () => pick(['itu', 'tadi']) },
  { from: /\bdapat\b/gi, to: () => 'bisa' },
  { from: /\btelah\b/gi, to: () => pick(['udah', 'sudah']) },
  { from: /\bialah\b/gi, to: () => 'yaitu' },
  { from: /\byakni\b/gi, to: () => 'yaitu' },
  { from: /\bsangat\b/gi, to: () => pick(['sangat', 'amat', 'cukup', 'banget', 'benar-benar']) },
  { from: /\bberbagai\b/gi, to: () => pick(['bermacam-macam', 'banyak', 'beragam']) },
  { from: /\bsebagai\b/gi, to: () => pick(['jadi', 'sebagai']) },
  { from: /\bbagi\b/gi, to: () => 'buat' },
  { from: /\bdimana\b/gi, to: () => 'yang' },
];

const sentenceStarters = [
  { from: /^Selanjutnya,/gim, to: 'Terus,' },
  { from: /^Kemudian,/gim, to: 'Terus,' },
  { from: /^Selain itu,/gim, to: 'Di samping itu,' },
  { from: /^Oleh karena itu,/gim, to: 'Makanya,' },
  { from: /^Dengan demikian,/gim, to: 'Jadi,' },
  { from: /^Pertama-tama,/gim, to: 'Pertama,' },
  { from: /^Sebagai kesimpulan,/gim, to: 'Kesimpulannya,' },
  { from: /^Pertama,\s*sekali\b/gim, to: 'Pertama-tama,' },
];

const particles = ['sih', 'kok', 'deh', 'lho', 'dong', 'yah', 'nah', 'tuh'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybeAddParticle(sentence) {
  if (sentence.length < 20 || Math.random() > 0.2) return sentence;
  const particle = pick(particles);
  const words = sentence.trim().split(/\s+/);
  if (words.length < 5) return sentence;
  const insertAt = Math.min(2 + Math.floor(Math.random() * 3), words.length - 1);
  words.splice(insertAt, 0, particle);
  return words.join(' ');
}

function humanizeText(text) {
  if (!text.trim()) return '';

  let result = text;

  for (const rule of formalToCasual) {
    result = result.replace(rule.from, rule.to);
  }

  for (const rule of sentenceStarters) {
    result = result.replace(rule.from, rule.to);
  }

  result = result.replace(/\bbahwa\b/gi, '');

  result = result.replace(/\s{2,}/g, ' ');

  const sentences = result.split(/(?<=[.!?])\s*/);
  result = sentences.map(s => maybeAddParticle(s)).join(' ');

  result = result.trim();

  const suffix = pick([
    '',
    '',
    '',
    ' Kurang lebih gitu deh.',
    ' Semoga membantu yah.',
    ' Nah, gitu kira-kira.',
    ' Anyway, semoga jelas.',
  ]);
  result += suffix;

  return result;
}

humanizeBtn.addEventListener('click', () => {
  const input = inputArea.value.trim();
  if (!input) {
    showToast('Isi teks AI dulu ya!');
    inputArea.focus();
    return;
  }

  humanizeBtn.disabled = true;
  humanizeBtn.classList.add('loading');
  humanizeBtn.querySelector('.btn-icon').textContent = '⏳';

  setTimeout(() => {
    const result = humanizeText(input);
    setOutputText(result);
    updateCounters();
    humanizeBtn.disabled = false;
    humanizeBtn.classList.remove('loading');
    humanizeBtn.querySelector('.btn-icon').textContent = '🤖';
    showToast('Selesai! teks udah di-humanize 👍');
  }, 400 + Math.random() * 300);
});

copyBtn.addEventListener('click', () => {
  const text = getOutputText();
  if (!text || outputArea.querySelector('.placeholder-text')) {
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
    showToast('Berhasil di-copy ke clipboard!');
  }).catch(() => {
    showToast('Gagal copy, coba manual yah');
  });
});

clearBtn.addEventListener('click', () => {
  if (!inputArea.value.trim()) return;
  inputArea.value = '';
  outputArea.innerHTML = '<p class="placeholder-text">Hasil humanize akan muncul di sini...</p>';
  updateCounters();
  inputArea.focus();
  showToast('Teks udah dibersihin');
});

updateCounters();
