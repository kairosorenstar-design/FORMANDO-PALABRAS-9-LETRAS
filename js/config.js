/* ═══════════════════════════════════════════════
   CONFIG — Supabase & App Constants
   js/config.js
═══════════════════════════════════════════════ */

// ⚠️ IMPORTANTE: este proyecto debe usar un proyecto de Supabase DISTINTO
// al de "Formando Palabras" (4 letras), para no mezclar usuarios, códigos
// de referido ni el historial de combinaciones entre ambos juegos.
// Crea un nuevo proyecto en supabase.com, corre database/setup.sql ahí,
// y reemplaza estos dos valores con los tuyos (Project Settings → API).
const SUPABASE_URL      = 'https://TU-PROYECTO-NUEVO.supabase.co';
const SUPABASE_ANON_KEY = 'TU-ANON-KEY-NUEVA';

// Ajusta esto al nombre real de tu repo en GitHub Pages
// (o a tu dominio propio si le pones uno a este proyecto).
const SITE_URL = 'https://kairosorenstar-design.github.io/FORMANDO-PALABRAS-9';

// Game constants
const LETTERS      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WORD_LENGTH  = 9; // <- longitud de la combinación de este proyecto

// Supabase client
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
