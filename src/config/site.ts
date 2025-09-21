export const siteConfig = {
  // Main branding
  name: "Tom and Deb",
  shortName: "T&D",
  tagline: "Travel & Worldschooling Blog",
  description: "Join our family's journey around the world through travel and worldschooling. Discover amazing destinations, educational adventures, and stunning photography from around the globe.",
  
  // URLs
  url: "https://tomanddeb.com",
  domain: "tomanddeb.com",
  
  // Contact & Social Media
  email: "hello@tomanddeb.com",
  social: {
    instagram: "https://instagram.com/tomanddeb",
    twitter: "https://twitter.com/tomanddeb",
    youtube: "https://youtube.com/@tomanddeb",
    instagramUsername: "tomanddeb",
    twitterHandle: "@tomanddeb",
  },
  
  // Team/Authors
  team: {
    name: "Tom and Deb Family",
    defaultAuthor: "Tom and Deb",
  },
  
  // SEO
  seo: {
    keywords: ["travel", "worldschooling", "family travel", "nomad life", "education", "photography", "remote work"] as string[],
    creator: "Tom and Deb",
    publisher: "Tom and Deb",
  },
  
  // Admin
  admin: {
    title: "Tom and Deb Admin",
    teamName: "The Tom and Deb Team",
  },
  
  // Footer
  footer: {
    currentLocation: "Thailand",
    tagline: "Following our curiosity around the world while educating our children and building financial freedom.",
    madeBy: "by nomads, for nomads",
  },
  
  // Logo
  logo: {
    initial: "T&D", // For the circular logo
    singleInitial: "T", // For single letter logo if needed
  },
} as const;

export type SiteConfig = typeof siteConfig;