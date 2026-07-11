// Serves the static build via the assets binding. The only logic here is a
// noindex header on the workers.dev staging hostname, so the preview can
// never be indexed while production stays fully indexable.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (new URL(request.url).hostname.endsWith('.workers.dev')) {
      const staged = new Response(response.body, response);
      staged.headers.set('X-Robots-Tag', 'noindex');
      return staged;
    }
    return response;
  },
};
