export async function onRequest(context) {
  const url = new URL(context.request.url);
  url.pathname = '/committee.html';
  const response = await fetch(url.toString(), {
    headers: context.request.headers,
    cf: context.request.cf,
  });
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
