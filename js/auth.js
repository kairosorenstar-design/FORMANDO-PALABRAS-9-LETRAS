/* ═══════════════════════════════════════════════
   AUTH — Tabs · Login · Register
   js/auth.js
═══════════════════════════════════════════════ */

/* ── Tab switcher ───────────────────────────── */
(function initTabs() {
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const indicator   = document.getElementById('tab-indicator');
  const track       = document.getElementById('auth-track');
  const wrapper     = document.getElementById('auth-wrapper');

  let current = 0;

  function panelHeight(index) {
    return track.querySelectorAll('.auth-panel')[index].scrollHeight;
  }

  function moveIndicator(tab) {
    indicator.style.left  = (tab.offsetLeft + 8) + 'px';
    indicator.style.width = (tab.offsetWidth - 16) + 'px';
  }

  function switchTo(index) {
    if (index === current) return;
    current = index;

    track.style.transform    = `translateX(-${index * 100}%)`;
    wrapper.style.height     = panelHeight(index) + 'px';

    tabLogin.classList.toggle('active',    index === 0);
    tabRegister.classList.toggle('active', index === 1);
    tabLogin.setAttribute('aria-selected',    String(index === 0));
    tabRegister.setAttribute('aria-selected', String(index === 1));

    moveIndicator(index === 0 ? tabLogin : tabRegister);
    document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
  }

  function init() {
    wrapper.style.height = panelHeight(0) + 'px';
    moveIndicator(tabLogin);
  }

  tabLogin.addEventListener('click',    () => switchTo(0));
  tabRegister.addEventListener('click', () => switchTo(1));
  window.addEventListener('resize', () => {
    wrapper.style.height = panelHeight(current) + 'px';
    moveIndicator(current === 0 ? tabLogin : tabRegister);
  });

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);

  // Exponer para usar desde auth.js si se necesita ir a registro
  window.switchAuthTab = switchTo;
})();

/* ── Forzar mayúsculas en campo código ──────── */
document.getElementById('reg-ref-code').addEventListener('input', function () {
  this.value = this.value.toUpperCase();
});

/* ── LOGIN ──────────────────────────────────── */
async function handleLogin() {
  const email  = document.getElementById('login-email').value.trim();
  const btn    = document.getElementById('btn-login');
  const errEl  = document.getElementById('login-error');

  const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.getElementById('login-email-error').classList.toggle('show', !emailOk);
  errEl.classList.remove('show');
  if (!emailOk) return;

  btn.disabled = true;
  btn.textContent = 'Buscando...';

  try {
    const user = await dbGetUserByEmail(email);

    if (!user) {
      errEl.textContent = 'No encontramos una cuenta con ese correo. ¿Ya te registraste?';
      errEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Entrar';
      return;
    }

    setCurrentUser(user);
    enterMain();

  } catch (e) {
    errEl.textContent = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

/* ── REGISTRO ───────────────────────────────── */
async function handleRegister() {
  const email   = document.getElementById('reg-email').value.trim();
  const name    = document.getElementById('reg-name').value.trim();
  const refCode = document.getElementById('reg-ref-code').value.trim().toUpperCase();
  const btn     = document.getElementById('btn-register');
  const errEl   = document.getElementById('register-error');

  // Validaciones
  const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.getElementById('reg-email-error').classList.toggle('show', !emailOk);
  const nameOk = !!name;
  document.getElementById('reg-name-error').classList.toggle('show', !nameOk);
  document.getElementById('reg-ref-error').classList.remove('show');
  errEl.classList.remove('show');

  if (!emailOk || !nameOk) return;

  btn.disabled = true;
  btn.textContent = 'Verificando...';

  try {
    // Verificar si el email ya existe
    const existing = await dbGetUserByEmail(email);
    if (existing) {
      errEl.textContent = 'Este correo ya tiene cuenta. Usa "Iniciar sesión".';
      errEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Crear cuenta';
      return;
    }

    // Validar código de referido si se ingresó
    let validRef = null;
    if (refCode.length > 0) {
      const codeExists = await dbCheckReferralCode(refCode);
      if (!codeExists) {
        document.getElementById('reg-ref-error').classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Crear cuenta';
        return;
      }
      validRef = refCode;
    }

    // Si venía por URL (?ref=...) y no escribió código manual, usar el de URL
    const urlRef = sessionStorage.getItem('fp_ref');
    const finalRef = validRef || urlRef || null;

    btn.textContent = 'Creando cuenta...';
    const user = await dbCreateUser(email, name, finalRef);
    sessionStorage.removeItem('fp_ref');

    setCurrentUser(user);
    enterMain();

  } catch (e) {
    errEl.textContent = 'Error al crear la cuenta. Intenta de nuevo.';
    errEl.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Crear cuenta';
  }
}

/* ── Eventos ────────────────────────────────── */
document.getElementById('btn-login').addEventListener('click', handleLogin);
document.getElementById('btn-register').addEventListener('click', handleRegister);

document.getElementById('login-email').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});
document.getElementById('reg-email').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('reg-name').focus();
});
document.getElementById('reg-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('reg-ref-code').focus();
});
document.getElementById('reg-ref-code').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleRegister();
});
