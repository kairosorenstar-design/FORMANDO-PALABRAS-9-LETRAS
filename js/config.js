/* ═══════════════════════════════════════════════
   CONFIG — Supabase & App Constants
   js/config.js
═══════════════════════════════════════════════ */

// ⚠️ IMPORTANTE: este proyecto debe usar un proyecto de Supabase DISTINTO
// al de "Formando Palabras" (4 letras), para no mezclar usuarios, códigos
// de referido ni el historial de combinaciones entre ambos juegos.
// Crea un nuevo proyecto en supabase.com, corre database/setup.sql ahí,
// y reemplaza estos dos valores con los tuyos (Project Settings → API).
const SUPABASE_URL      = 'https://zlsynvatcelvqwvzptjo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsc3ludmF0Y2VsdnF3dnpwdGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODg2MTksImV4cCI6MjEwMTM2NDYxOX0.Hpmj_FpclCV-o_MfaAbw3u9FeLDMHqf_XiUIY8h3EHg';

// Ajusta esto al nombre real de tu repo en GitHub Pages
// (o a tu dominio propio si le pones uno a este proyecto).
const SITE_URL = 'https://kairosorenstar-design.github.io/FORMANDO-PALABRAS-9-LETRAS';

// Game constants
const LETTERS      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const WORD_LENGTH  = 9; // <- longitud de la combinación de este proyecto

// Supabase client
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
});
