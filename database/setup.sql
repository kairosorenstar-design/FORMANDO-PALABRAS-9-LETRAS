-- ═══════════════════════════════════════════════════════════════
--  FORMANDO PALABRAS 9 — Database Setup
--  ⚠️ Ejecutar en un proyecto de Supabase NUEVO y separado del de
--  "Formando Palabras" (4 letras), para no mezclar datos entre juegos.
--  Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- ── TABLA: users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email          TEXT        NOT NULL UNIQUE,
  display_name   TEXT        NOT NULL,
  referral_code  TEXT        NOT NULL UNIQUE,
  referred_by    TEXT,                            -- código del referidor
  referral_count INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── TABLA: words ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.words (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  combination  TEXT        NOT NULL UNIQUE,        -- 9 letras, irrepetible
  user_id      UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── FUNCIÓN: increment_referrals ────────────────────────────
-- Suma 1 al referral_count del usuario con el código dado
CREATE OR REPLACE FUNCTION public.increment_referrals(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
     SET referral_count = referral_count + 1
   WHERE referral_code = p_code;
END;
$$;

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

-- USERS: lectura y escritura pública (app sin auth de Supabase)
CREATE POLICY "users_select" ON public.users
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "users_insert" ON public.users
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "users_update" ON public.users
  FOR UPDATE TO anon, authenticated USING (true);

-- WORDS: lectura y escritura pública
CREATE POLICY "words_select" ON public.words
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "words_insert" ON public.words
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ── REALTIME ─────────────────────────────────────────────────
-- Permite recibir cambios en tiempo real en la tabla words
ALTER PUBLICATION supabase_realtime ADD TABLE public.words;

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email         ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_words_combination   ON public.words(combination);
CREATE INDEX IF NOT EXISTS idx_words_created_at    ON public.words(created_at DESC);
