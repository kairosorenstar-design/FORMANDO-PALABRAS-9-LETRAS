/* ═══════════════════════════════════════════════
   DB — Operaciones Supabase
   js/db.js
═══════════════════════════════════════════════ */

async function dbGetUserByEmail(email) {
  const { data } = await sb.from('users').select('*')
    .eq('email', email.toLowerCase().trim()).maybeSingle();
  return data;
}

async function dbGetUserById(id) {
  const { data, error } = await sb.from('users').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

async function dbCheckReferralCode(code) {
  const { data } = await sb.from('users').select('id')
    .eq('referral_code', code.toUpperCase().trim()).maybeSingle();
  return !!data;
}

async function dbCreateUser(email, displayName, referredBy) {
  // Generar código único
  let code, exists = true;
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data } = await sb.from('users').select('id').eq('referral_code', code).maybeSingle();
    exists = !!data;
  }

  const { data, error } = await sb.from('users').insert({
    email:         email.toLowerCase().trim(),
    display_name:  displayName.trim(),
    referral_code: code,
    referred_by:   referredBy ? referredBy.toUpperCase().trim() : null,
  }).select().single();

  if (error) throw error;

  // Sumar +1 al referidor
  if (referredBy) {
    await sb.rpc('increment_referrals', { p_code: referredBy.toUpperCase().trim() });
  }

  return data;
}

async function dbGetReferralCount(userId) {
  const { data } = await sb.from('users').select('referral_count').eq('id', userId).single();
  return data?.referral_count ?? 0;
}

async function dbGetWordsHistory(userId) {
  const { data } = await sb.from('words').select('combination')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(80);
  return data ? data.map(w => w.combination) : [];
}

async function dbSaveWord(combination, userId) {
  const { data: exists } = await sb.from('words').select('id')
    .eq('combination', combination).maybeSingle();
  if (exists) return false;
  const { error } = await sb.from('words').insert({ combination, user_id: userId });
  if (error) throw error;
  return true;
}

