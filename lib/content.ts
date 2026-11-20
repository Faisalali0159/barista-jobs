import { cacheTag } from "next/cache";
import { kvGet, kvSet } from "./pg";
import { sanitizeContent, type SiteContent } from "./content-types";

export const CONTENT_TAG = "site-content";
const KEY = "site-content";

/** Cached read for the public site. Invalidated via CONTENT_TAG on save. */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  const stored = await kvGet<unknown>(KEY, {});
  return sanitizeContent(stored);
}

/** Uncached read for the admin editor. */
export async function getSiteContentFresh(): Promise<SiteContent> {
  return sanitizeContent(await kvGet<unknown>(KEY, {}));
}

export async function saveSiteContent(input: unknown): Promise<SiteContent> {
  const clean = sanitizeContent(input);
  await kvSet(KEY, clean);
  return clean;
}
