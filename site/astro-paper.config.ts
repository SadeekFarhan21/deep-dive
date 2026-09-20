import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://sadeekfarhan21.github.io/blog/",
    title: "Farhan Sadeek",
    description:
      "Deep dives by Farhan Sadeek: mechanistic interpretability, reinforcement learning, efficient training and inference, and memos on the companies building the hardware and infrastructure underneath.",
    author: "Farhan Sadeek",
    profile: "https://farhansadeek.com",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "America/New_York",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: false,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/SadeekFarhan21" },
    { name: "x", url: "https://x.com/farhansadeek.com" },
    { name: "linkedin", url: "https://www.linkedin.com/in/farhansadeek/" },
    { name: "mail", url: "mailto:farhan@farhansadeek.com" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
