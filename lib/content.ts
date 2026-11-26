// Server-only: loads company details, job postings, page text and images from Sanity.
import { cache } from "react";
import { createClient } from "@sanity/client";
import { S, type Job } from "@/lib/site";
import { COPY_KEYS, EMPTY_COPY, type Copy, type Img, type ImageSlot, type QA } from "@/lib/copy";

export type Content = typeof S & { copy: Copy; images: Partial<Record<ImageSlot, Img>> };

const fallback = (): Content => ({ ...S, copy: EMPTY_COPY, images: {} });

export const getContent = cache(async (): Promise<Content> => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
  // Until Sanity is connected, the site uses the local fallback content.
  if (!projectId) return fallback();

  try {
    const client = createClient({ projectId, dataset, apiVersion: "2025-02-19", useCdn: false });
    const [company, jobRecords, copyDoc] = await Promise.all([
      client.fetch<Record<string, unknown> | null>(
        `*[_type == "siteSettings" && _id == "siteSettings"][0]{ name, address, phone, email, nip, krs, regon }`,
      ),
      client.fetch<(Record<string, unknown> & { _id: string })[]>(
        `*[_type == "job" && isActive == true] | order(_createdAt desc){
          _id, title, loc, pay, hours, contract, housing, transport, description
        }`,
      ),
      client.fetch<Record<string, any> | null>(
        `*[_type == "siteCopy" && _id == "siteCopy"][0]{
          ${COPY_KEYS.join(", ")},
          "faq": faq[]{ "q": question, "a": answer },
          "steps": steps[]{ "q": question, "a": answer },
          "images": {
            "hero": heroImage{ "url": asset->url, alt },
            "worker": workerImage{ "url": asset->url, alt },
            "employer": employerImage{ "url": asset->url, alt },
            "why": whyImage{ "url": asset->url, alt }
          }
        }`,
      ),
    ]);

    const jobs = (jobRecords || []).map(({ _id, ...job }) => ({ ...job, id: _id })) as Job[];

    const text: Copy["text"] = {};
    for (const k of COPY_KEYS) if (copyDoc?.[k]) text[k] = copyDoc[k];
    const images: Content["images"] = {};
    for (const [slot, img] of Object.entries(copyDoc?.images || {})) {
      if (img && (img as Img).url) images[slot as ImageSlot] = img as Img;
    }
    const copy: Copy = { text, faq: (copyDoc?.faq || []) as QA[], steps: (copyDoc?.steps || []) as QA[] };

    return { ...S, ...(company || {}), jobs, copy, images };
  } catch (error) {
    console.error("Sanity content fetch failed:", error);
    // A temporary CMS/network issue should not take the public website offline.
    return fallback();
  }
});
