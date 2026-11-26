import { getContent } from "@/lib/content";

export const runtime = "nodejs";
export const revalidate = 60;

// Kept for compatibility; the homepage now loads content on the server (see app/page.tsx).
export async function GET() {
  return Response.json(await getContent(), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
