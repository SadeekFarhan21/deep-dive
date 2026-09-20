import type { CollectionEntry } from "astro:content";
import config from "@/config";

/** A post that has shipped, and so is guaranteed to carry a publication date. */
export type PublishedPost = CollectionEntry<"posts"> & {
  data: CollectionEntry<"posts">["data"] & { pubDatetime: Date };
};

/**
 * Determines whether a post is eligible to be listed/rendered.
 *
 * - Excludes drafts always, and with them any post that has no `pubDatetime`
 * - In production, excludes scheduled posts until `pubDatetime` minus the configured margin
 * - In dev, always shows non-draft posts to make authoring easier
 */
export function postFilter(
  post: CollectionEntry<"posts">
): post is PublishedPost {
  const { data } = post;
  if (data.draft || !data.pubDatetime) return false;
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - config.posts.scheduledPostMargin;
  return import.meta.env.DEV || isPublishTimePassed;
}
