export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Email is required.' }, 400);
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!email) {
    return json({ error: 'Email is required.' }, 400);
  }

  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return json({ error: 'Server configuration error.' }, 500);
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };

  try {
    // Look up delegate by email (ilike for case-insensitive match)
    const pattern = email.replace(/[%_\\]/g, '\\$&');
    const res = await fetch(
      `${url}/rest/v1/delegates?email=ilike.${encodeURIComponent(pattern)}&select=id,name,committee,country`,
      { headers }
    );

    if (!res.ok) throw new Error('Database query failed.');
    const rows = await res.json();
    const delegate = rows[0] || null;

    // Log the lookup. Must go through waitUntil() — Cloudflare Workers can
    // (and does) tear down the isolate the instant the response below is
    // returned, killing any in-flight fetch that isn't registered as
    // extended background work first.
    context.waitUntil(
      fetch(`${url}/rest/v1/qr_lookups`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ email, found: !!delegate, delegate_id: delegate?.id || null }),
      }).catch((err) => console.error('qr_lookups log failed:', err))
    );

    if (!delegate) {
      return json({ error: 'No delegate found with that email.' }, 404);
    }

    return json({ delegate }, 200);
  } catch (err) {
    console.error('lookup-qr error:', err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}

export async function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
