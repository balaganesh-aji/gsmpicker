import { supabase } from '../lib/supabase'

// ─── Sign In ─────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ─── Sign Up ─────────────────────────────────────────────────
export async function signUp(email, password, fullName, role = 'picker') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  })
  if (error) throw error
  return data
}

// ─── Sign Out ────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Get Current Session ─────────────────────────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// ─── Get Profile ─────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

// ─── Update Last Login ───────────────────────────────────────
export async function updateLastLogin(userId) {
  await supabase
    .from('profiles')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)
}

// ─── Auth State Listener ─────────────────────────────────────
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return data.subscription
}
