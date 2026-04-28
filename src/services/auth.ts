import { supabase } from '../lib/supabase';

type AuthErrorResult = {
  error: Error | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toError(message: string) {
  return new Error(message);
}

export async function signInParent(email: string, password: string): Promise<AuthErrorResult> {
  const normalizedEmail = normalizeEmail(email);
  const cleanPassword = password.trim();

  if (!normalizedEmail) {
    return { error: toError('Vul je e-mailadres in.') };
  }

  if (!cleanPassword) {
    return { error: toError('Vul je wachtwoord in.') };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: cleanPassword,
  });

  return { error };
}

export async function signUpParent(name: string, email: string, password: string): Promise<{ error: Error | null; needsEmailConfirmation: boolean; user: any }> {
  const normalizedEmail = normalizeEmail(email);
  const cleanName = name.trim();
  const cleanPassword = password.trim();

  if (!cleanName) {
    return { error: toError('Vul je naam in.'), needsEmailConfirmation: false, user: null };
  }

  if (!normalizedEmail) {
    return { error: toError('Vul een geldig e-mailadres in.'), needsEmailConfirmation: false, user: null };
  }

  if (cleanPassword.length < 6) {
    return { error: toError('Wachtwoord moet minstens 6 karakters hebben.'), needsEmailConfirmation: false, user: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: cleanPassword,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  const needsEmailConfirmation = !!data.user && !data.session;
  return { error, needsEmailConfirmation, user: data.user };
}

export async function signOutCurrentUser(): Promise<AuthErrorResult> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }

  return data.user;
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { error: toError('Vul een e-mailadres in.') };
  }

  return supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: 'tasko://reset-password',
  });
}

export async function changePassword(newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: toError('Wachtwoord moet minstens 6 karakters hebben.'), data: null };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    return { error: sessionError, data: null };
  }

  if (!sessionData.session) {
    return { error: toError('Je sessie is verlopen. Log opnieuw in en probeer het opnieuw.'), data: null };
  }

  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}
