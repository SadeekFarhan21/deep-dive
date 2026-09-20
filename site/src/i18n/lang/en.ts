import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Home",
    posts: "Posts",
    projects: "Projects",
    ventures: "Ventures",
    tags: "Tags",
    archives: "Archives",
    search: "Search",
  },
  post: {
    publishedAt: "Published at",
    updatedAt: "Updated",
    sharePostIntro: "Share this post:",
    sharePostOn: "Share this post on {{platform}}",
    sharePostViaEmail: "Share this post via email",
    tagLabel: "Tags",
    backToTop: "Back to top",
    goBack: "Go back",
    editPage: "Edit page",
    previousPost: "Previous Post",
    nextPost: "Next Post",
  },
  pagination: {
    prev: "Prev",
    next: "Next",
    page: "Page",
  },
  home: {
    socialLinks: "Elsewhere",
    recentPosts: "Recent Posts",
    allPosts: "All Posts",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "Tag",
    tagDesc: "Everything tagged",

    tagsTitle: "Tags",
    tagsDesc: "Every topic covered here, from interpretability to photonics.",

    postsTitle: "Posts",
    postsDesc: "Everything here, newest first \u2014 project write-ups and venture memos together.",

    projectsTitle: "Projects",
    projectsDesc:
      "Models I trained, circuits I probed, pipelines I broke and fixed \u2014 written up with the setup, the measurements, and the claims they do not support.",

    venturesTitle: "Ventures",
    venturesDesc:
      "Deep dives on companies building AI hardware, infrastructure, and tooling: what they actually do, what is verified, and what is still a company-reported number.",

    archivesTitle: "Archives",
    archivesDesc: "Everything published, grouped by year and month.",

    searchTitle: "Search",
    searchDesc: "Search across every project write-up and venture memo.",
  },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    searchPlaceholder: "Search posts...",
    noResults: "No results found",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
  },
  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
} satisfies UIStrings;
