const { createClient } = require('@supabase/supabase-js');

let supabase = null;
function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }
  supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
  return supabase;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const db = getSupabase();
    const { data, error } = await db
      .from('delegates')
      .select('id, name, committee, country')
      .ilike('email', email)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return res.status(404).json({ error: 'No delegate found with that email.' });
    }

    return res.status(200).json({ delegate: data });
  } catch (err) {
    console.error('lookup-qr error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
