import { AuthApiError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { AuthResult } from '@/types/khatmah'
import type { Session } from '@supabase/supabase-js'
import type { OAuthProvider } from '@/types/khatmah'

// Simple RFC-5322-inspired email regex for client-side validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

function mapSupabaseError(error: unknown): AuthResult['error'] {
  if (error instanceof AuthApiError) {
    return { message: error.message, code: error.code }
  }
  if (error instanceof Error) {
    return { message: error.message }
  }
  return { message: 'Unknown error' }
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!validateEmail(email)) {
    return { session: null, error: { message: 'Invalid email format', code: 'invalid_email' } }
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { session: null, error: mapSupabaseError(error) }
  }

  const session = data.session
  return {
    session: session
      ? { accessToken: session.access_token, expiresAt: session.expires_at ?? 0 }
      : null,
    error: null,
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!validateEmail(email)) {
    return { session: null, error: { message: 'Invalid email format', code: 'invalid_email' } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { session: null, error: mapSupabaseError(error) }
  }

  const session = data.session
  return {
    session: session
      ? { accessToken: session.access_token, expiresAt: session.expires_at ?? 0 }
      : null,
    error: null,
  }
}

export async function signInWithOAuth(provider: OAuthProvider): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({ provider })

  if (error) {
    return { session: null, error: mapSupabaseError(error) }
  }

  // OAuth redirects the user; session is established after redirect
  return { session: null, error: null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}
