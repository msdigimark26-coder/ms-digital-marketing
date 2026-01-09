import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);
  return { session };
}

export default function AuthForm() {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('sign-in');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (mode === 'sign-up') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else console.log('Sign-up OK, check email', data);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else console.log('Signed in', data);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (session) {
    return (
      <div>
        Signed in as {session.user.email}
        <button onClick={handleSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="password" type="password" />
      <button type="submit">{mode === 'sign-up' ? 'Sign up' : 'Sign in'}</button>
      <button type="button" onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}>Toggle</button>
      {error && <div>{error}</div>}
    </form>
  );
}