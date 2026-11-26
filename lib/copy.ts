// Client-safe helpers: merge CMS text/images over the built-in defaults in lib/messages.ts.
// If a field (or one language of a field) is empty in Sanity, the built-in text is used.
import type { Txt } from "@/lib/site";

// These names must match the field names in the Studio schema (studio/schemas/siteCopy.ts).
export const COPY_KEYS = [
  "eyebrow", "h1", "sub", "heroNote",
  "workerTitle", "workerText", "employerTitle", "employerText",
  "aboutTitle", "aboutText", "whyTitle", "whySub",
  "cvcta", "ctaText", "contactTitle", "contactSub", "footerText",
] as const;

export type QA = { q: Txt; a: Txt };
export type Img = { url: string; alt?: string };
export type ImageSlot = "hero" | "worker" | "employer" | "why";
export type Copy = { text: Record<string, Txt>; faq: QA[]; steps: QA[] };

export const EMPTY_COPY: Copy = { text: {}, faq: [], steps: [] };

const pick = (v: Txt | undefined, l: string) => (typeof v === "string" ? v : v?.[l as "pl"] ?? "").trim();
const pickWithFallback = (v: Txt | undefined, l: string) => pick(v, l) || pick(v, "en") || pick(v, "pl");

export function applyCopy(base: Record<string, any>, copy: Copy | undefined, lang: string): Record<string, any> {
  if (!copy) return base;
  const t = { ...base };
  for (const k of COPY_KEYS) {
    const v = pick(copy.text?.[k], lang);
    if (v) t[k] = v;
  }
  const faq = (copy.faq || []).map((i) => ({ q: pickWithFallback(i.q, lang), a: pickWithFallback(i.a, lang) })).filter((i) => i.q);
  if (faq.length) { t.faq = faq.map((i) => i.q); t.faqa = faq.map((i) => i.a); }
  const steps = (copy.steps || []).map((i) => ({ q: pickWithFallback(i.q, lang), a: pickWithFallback(i.a, lang) })).filter((i) => i.q);
  if (steps.length) { t.steps = steps.map((i) => i.q); t.stepTexts = steps.map((i) => i.a); }
  return t;
}

// Sanity's image CDN resizes and converts the image (webp/avif) on the fly.
export const imgSrc = (img: Img | null | undefined, width: number) =>
  img?.url ? `${img.url}?w=${width}&auto=format&q=85` : undefined;
