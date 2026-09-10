/* ═══════════════════════════════════════════════
   GAME — Flujo de espera (externo) · Reveal
   js/game.js
═══════════════════════════════════════════════ */

let pendingWord = null;
let isSpinning  = false;

// URL de tu página externa de espera/anuncios (contador-retro u otra).
// Al terminar los pasos, esa página debe redirigir de vuelta aquí
// con ?formar=1 para revelar automáticamente la palabra.
// ⚠️ Reemplaza esto por el dominio que vas a comprar para este proyecto.
const WAIT_FLOW_URL = 'https://TU-DOMINIO-DE-ESPERA.com/';

// Cuánto tiempo (ms) se considera válida una palabra pendiente
// antes de descartarla por seguridad (evita revelar algo viejo
// si alguien vuelve a cargar la URL con ?formar=1 días después).
const PENDING_WORD_MAX_AGE_MS = 60 * 60 * 1000; // 1 hora

// Se captura y limpia el parámetro ?formar=1 apenas carga el script,
// sin importar si hay sesión activa o no (evita que quede pegado en
// la URL si el usuario perdió la sesión mientras veía los anuncios).
const _formarRequested = new URLSearchParams(window.location.search).get('formar') === '1';
if (_formarRequested) {
  history.replaceState(null, '', SITE_URL + '/');
}

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * 26)];
}

function generateWord() {
  return Array.from({ length: WORD_LENGTH }, () => randomLetter()).join('');
}

function setRandomLetters() {
  for (let i = 0; i < WORD_LENGTH; i++)
    document.getElementById(`box-${i}`).textContent = randomLetter();
}

/* ── Arranque del flujo: genera la palabra, la deja en espera
   y manda al usuario a la página externa de anuncios ────── */
function startWaitFlow() {
  const user = getCurrentUser();
  if (!user) return;

  const word = generateWord();
  localStorage.setItem('fp_pending_word', JSON.stringify({
    word:   word,
    userId: user.id,
    ts:     Date.now()
  }));

  window.location.href = `${WAIT_FLOW_URL}?step=1`;
}

/* ── Se llama al cargar index.html si la URL trajo ?formar=1
   (es decir, el usuario ya pasó por los 5 pasos externos) ── */
function resumeWordFlowIfNeeded() {
  if (!_formarRequested) return;

  const raw = localStorage.getItem('fp_pending_word');
  if (!raw) return; // no había ninguna palabra pendiente
  localStorage.removeItem('fp_pending_word');

  let data;
  try { data = JSON.parse(raw); } catch { return; }
  if (!data || !data.word || !data.userId) return;

  const user = getCurrentUser();
  if (!user || data.userId !== user.id) return; // seguridad: mismo usuario
  if (Date.now() - data.ts > PENDING_WORD_MAX_AGE_MS) return; // muy vieja, descartar

  pendingWord = data.word;
  revealWord(pendingWord);
}

/* ── Reveal ─────────────────────────────────── */
async function revealWord(word) {
  if (isSpinning) return;
  isSpinning = true;
  const boxes = Array.from({ length: WORD_LENGTH }, (_, i) => document.getElementById(`box-${i}`));

  boxes.forEach(b => { b.textContent = randomLetter(); b.classList.add('spinning'); });

  let n = 0;
  const si = setInterval(() => {
    boxes.forEach(b => b.textContent = randomLetter());
    if (++n > 28) {
      clearInterval(si);
      boxes.forEach(b => b.classList.remove('spinning'));
      revealStaggered(boxes, word.split(''));
    }
  }, 75);
}

async function revealStaggered(boxes, letters) {
  for (let i = 0; i < WORD_LENGTH; i++) {
    await new Promise(r => setTimeout(r, 210));
    boxes[i].textContent = letters[i];
    boxes[i].classList.add('reveal');
    setTimeout(() => boxes[i].classList.remove('reveal'), 600);
  }

  showLoader(true);
  try {
    const saved = await dbSaveWord(pendingWord, getCurrentUser().id);
    if (saved) {
      addWordChip(pendingWord, true);
      showToast(`¡Combinación "${pendingWord}" guardada!`, 'success');
      refreshReferralCount();
    } else {
      showToast('Esta combinación ya fue formada antes.', 'error');
    }
  } catch {
    showToast('Error guardando la combinación.', 'error');
  }
  showLoader(false);
  isSpinning  = false;
  pendingWord = null;
}
