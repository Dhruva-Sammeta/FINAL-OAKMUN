export async function onRequest(context) {
  const url = new URL(context.request.url);
  const slug = url.pathname.split('/').filter(Boolean).pop() || 'disec';
  return Response.redirect(`${url.origin}/committee.html?committee=${slug}`, 302);
}
