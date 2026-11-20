import { cacheTag } from "next/cache";
import { readJsonFile, updateJsonFile } from "./store";
import { sanitizeContent, type SiteContent } from "./content-types";

export const CONTENT_TAG = "site-content";
const FILE = "site-content.json";

/** Cached read for the public site. Invalidated via CONTENT_TAG on save. */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  const stored = await readJsonFile<unknown>(FILE, {});
  return sanitizeContent(stored);
}

/** Uncached read for the admin editor. */
export async function getSiteContentFresh(): Promise<SiteContent> {
  return sanitizeContent(await readJsonFile<unknown>(FILE, {}));
}

export async function saveSiteContent(input: unknown): Promise<SiteContent> {
  const clean = sanitizeContent(input);
  await updateJsonFile<unknown, void>(FILE, {}, () => ({ next: clean, result: undefined }));
  return clean;
}
