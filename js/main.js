/* ═══════════════════════════════════════════════
   MAIN — Estado · UI · Init
   js/main.js
═══════════════════════════════════════════════ */

/* ── Estado ─────────────────────────────────── */
let _currentUser = null;

function setCurrentUser(u) {
  _currentUser = u;
  localStorage.setItem('fp_user', JSON.stringify(u));
}

function getCurrentUser() { return _currentUser; }

/* ── UI helpers ─────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function showLoader(v) {
  document.getElementById('loader').classList.toggle('hidden', !v);
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show ' + type;
  setTimeout(() => (t.className = 'toast'), 3200);
}

/* ── Copy buttons ───────────────────────────── */
function setupCopy(btnId, fieldId) {
  const btn   = document.getElementById(btnId);
  const field = document.getElementById(fieldId);
  const go = () => {
    const val = field.getAttribute('data-val') || field.textContent;
    navigator.clipboard.writeText(val).then(() => {
      btn.textContent = '¡Copiado!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
    });
  };
  btn.addEventListener('click', go);
  field.addEventListener('click', go);
}

/* ── Poblar página principal ────────────────── */
async function enterMain() {
  const user = getCurrentUser();
  document.getElementById('display-username').textContent = user.display_name;

  const link = `${SITE_URL}?ref=${user.referral_code}`;
  const lEl  = document.getElementById('ref-link');
  lEl.textContent = link;
  lEl.setAttribute('data-val', link);

  const cEl = document.getElementById('ref-code');
  cEl.textContent = user.referral_code;
  cEl.setAttribute('data-val', user.referral_code);

  setRandomLetters();
  await Promise.all([refreshReferralCount(), loadWordsHistory()]);

  showPage('page-main');
  showLoader(false);

  // Si venimos de la página externa de 5 pasos (?formar=1),
  // revela y guarda automáticamente la palabra que quedó pendiente.
  resumeWordFlowIfNeeded();
}

/* ── Referidos ──────────────────────────────── */
async function refreshReferralCount() {
  const user = getCurrentUser();
  if (!user) return;
  const n = await dbGetReferralCount(user.id);
  document.getElementById('referral-count-num').textContent = n;
  document.getElementById('stat-referral-big').textContent  = n;
}

/* ── Historial palabras (solo las propias) ──── */
async function loadWordsHistory() {
  const user  = getCurrentUser();
  const words = await dbGetWordsHistory(user.id);
  const grid  = document.getElementById('words-grid');
  if (words.length === 0) {
    grid.innerHTML = '<span class="words-empty">Aún no has formado ninguna combinación.</span>';
    updateWordsCount(0);
    return;
  }
  grid.innerHTML = '';
  words.forEach(w => addWordChip(w, false));
}

function addWordChip(word, isNew) {
  const grid  = document.getElementById('words-grid');
  const empty = grid.querySelector('.words-empty');
  if (empty) empty.remove();
  if (grid.querySelector(`[data-word="${word}"]`)) return;
  const chip = document.createElement('div');
  chip.className    = 'word-chip' + (isNew ? ' new-word' : '');
  chip.dataset.word = word;
  chip.textContent  = word;
  grid.prepend(chip);
  if (isNew) setTimeout(() => chip.classList.remove('new-word'), 600);
  updateWordsCount(grid.querySelectorAll('.word-chip').length);
}

function updateWordsCount(n) {
  document.getElementById('words-count-badge').textContent = `${n} formadas`;
}

/* ── Leer ?ref= de la URL ───────────────────── */
function checkRefParam() {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) {
    sessionStorage.setItem('fp_ref', ref.toUpperCase());
    // Limpiar URL sin recargar
    const clean = SITE_URL + '/';
    history.replaceState(null, '', clean);

    // Pre-rellenar campo de código si está en la pantalla de registro
    const codeInput = document.getElementById('reg-ref-code');
    if (codeInput) codeInput.value = ref.toUpperCase();

    // Cambiar al tab de registro automáticamente
    if (window.switchAuthTab) window.switchAuthTab(1);
  }
}

/* ── Init ───────────────────────────────────── */
async function init() {
  showLoader(true);

  try {
    const saved = localStorage.getItem('fp_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const user   = await dbGetUserById(parsed.id);
      if (user) {
        setCurrentUser(user);
        await enterMain();
        return;
      }
      localStorage.removeItem('fp_user');
    }
  } catch {
    localStorage.removeItem('fp_user');
  }

  // Verificar ref DESPUÉS de que los tabs estén inicializados
  setTimeout(checkRefParam, 100);

  showLoader(false);
  showPage('page-auth');
}

/* ── Eventos de página principal ────────────── */
document.getElementById('btn-form-word').addEventListener('click', () => {
  if (!getCurrentUser()) return;
  if (isSpinning) { showToast('Espera a que termine la animación.'); return; }
  startWaitFlow();
});

setupCopy('btn-copy-link', 'ref-link');
setupCopy('btn-copy-code', 'ref-code');

/* ── Arrancar ───────────────────────────────── */
init();
