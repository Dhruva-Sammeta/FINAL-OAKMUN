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

// Awaited (not fire-and-forget) since serverless functions can be frozen
// or torn down the instant the handler returns, before a background
// promise gets to finish. A logging failure never fails the lookup itself.
async function logLookup(db, email, found, delegateId) {
  try {
    const { error } = await db
      .from('qr_lookups')
      .insert({ email, found, delegate_id: delegateId || null });
    if (error) console.error('qr_lookups log error:', error.message);
    return error ? error.message : null;
  } catch (e) {
    console.error('qr_lookups log threw:', e);
    return String(e && e.message);
  }
}

// Shared logic, independent of which platform (Vercel vs Netlify) invoked it.
async function lookup(email) {
  email = String(email || '').trim().toLowerCase();
  if (!email) return { statusCode: 400, data: { error: 'Email is required.' } };
  // ilike treats % and _ as wildcards - many real emails contain literal
  // underscores, which without escaping can match multiple rows and make
  // maybeSingle() throw.
  const pattern = email.replace(/[%_\\]/g, '\\$&');

  try {
    const db = getSupabase();
    const { data, error } = await db
      .from('delegates')
      .select('id, name, committee, country')
      .ilike('email', pattern)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      const logErr = await logLookup(db, email, false);
      return { statusCode: 404, data: { error: 'No delegate found with that email.', _debug: 'v2-logging', _logErr: logErr } };
    }
    const logErr = await logLookup(db, email, true, data.id);
    return { statusCode: 200, data: { delegate: data, _debug: 'v2-logging', _logErr: logErr } };
  } catch (err) {
    console.error('lookup-qr error:', err);
    return { statusCode: 500, data: { error: 'Something went wrong. Please try again.', _debug: 'v2-logging', _catchErr: String(err && err.message) } };
  }
}

// Vercel-style handler: module.exports is called directly as (req, res).
async function vercelHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { statusCode, data } = await lookup(req.body?.email);
  return res.status(statusCode).json(data);
}

// Netlify-style handler: looked up via `exports.handler`.
async function netlifyHandler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  let email = '';
  try {
    email = JSON.parse(event.body || '{}').email;
  } catch {
    // handled by lookup()'s own empty-email check
  }
  const { statusCode, data } = await lookup(email);
  return { statusCode, body: JSON.stringify(data) };
}

module.exports = vercelHandler;
module.exports.handler = netlifyHandler;
