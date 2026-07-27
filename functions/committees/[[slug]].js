export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  url.pathname = '/committee.html';
  return env.ASSETS.fetch(new Request(url.toString(), request));
}
