import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

/** Top-level sections posts are split into; each gets its own listing page. */
export const POST_CATEGORIES = ["projects", "ventures"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z
      .object({
        author: z.string().default(config.site.author),
        // Drafts are undated: a post gets a publication date when it ships.
        pubDatetime: z.date().optional(),
        modDatetime: z.date().optional().nullable(),
        title: z.string(),
        featured: z.boolean().optional(),
        draft: z.boolean().optional(),
        tags: z.array(z.string()).default(["others"]),
        category: z.enum(POST_CATEGORIES).default("projects"),
        ogImage: image().or(z.string()).optional(),
        description: z.string(),
        company: z.string().optional(),
        stage: z.string().optional(),
        sector: z.string().optional(),
        canonicalURL: z.string().optional(),
        hideEditPost: z.boolean().optional(),
        timezone: z.string().optional(),
      })
      .refine(data => data.draft || data.pubDatetime !== undefined, {
        message: "pubDatetime is required unless the post is a draft",
        path: ["pubDatetime"],
      }),
});

export const collections = { posts };
