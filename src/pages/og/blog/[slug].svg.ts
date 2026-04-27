import type { APIRoute } from "astro";

export const GET: APIRoute = ({ params, redirect }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }

  return redirect(`/og/blog/${slug}.png`, 301);
};
