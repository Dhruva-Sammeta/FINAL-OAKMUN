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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let email = '';
  try {
    email = String(JSON.parse(event.body || '{}').email || '').trim().toLowerCase();
  } catch {
    // fall through, empty email handled below
  }

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email is required.' }) };
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
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No delegate found with that email.' }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ delegate: data }) };
  } catch (err) {
    console.error('lookup-qr error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong. Please try again.' }),
    };
  }
};
