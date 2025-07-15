export default {
  async fetch(request, env, ctx) {
    // Untuk meneruskan request ke Next.js
    return env.ASSETS.fetch(request);
  },
};
