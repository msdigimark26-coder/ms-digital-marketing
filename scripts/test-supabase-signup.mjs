import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tmvzkdragpvqmcrqedhk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Sf3pwTHy1Ujc1jsuzkl20w_-wx4YiiI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const email = `test${Date.now()}@example.com`;
  const password = 'Test1234!';
  console.log('Using test account:', email);

  // Sign up
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Test User' } }
  });

  if (signupError) {
    console.error('Sign up error:', signupError.message || signupError);
  } else {
    console.log('Sign up response:', signupData);
  }

  // Try to sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    console.error('Sign in error:', signInError.message || signInError);
    process.exit(1);
  }

  console.log('Sign in success, session available.');

  // Query profiles as the signed-in user
  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*').limit(1);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError.message || profilesError);
    process.exit(1);
  }

  console.log('Profiles query result:', profiles);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});