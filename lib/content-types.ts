// Client-safe: types, defaults and sanitiser for the editable site content.

export const ICON_KEYS = [
  "team",
  "book",
  "smile",
  "chart",
  "menu",
  "building",
  "coffee",
  "star",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export interface ServiceItem {
  id: string;
  icon: IconKey;
  title: string;
  description: string;
  visible: boolean;
}

export interface ContactCard {
  id: string;
  title: string;
  description: string;
  /** Text shown on the button, e.g. "+252 61 8270011" */
  phoneLabel: string;
  /** Digits only, used for wa.me link, e.g. "252618270011" */
  whatsapp: string;
  style: "green" | "navy";
}

export interface SiteContent {
  siteName: string;
  tagline: string;
  announcement: { enabled: boolean; text: string };
  hero: {
    badge: string;
    titleLead: string;
    titleHighlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    stats: { value: string; label: string }[];
  };
  servicesSection: { eyebrow: string; title: string; subtitle: string };
  services: ServiceItem[];
  contactSection: { eyebrow: string; title: string; subtitle: string };
  contacts: ContactCard[];
  footer: { about: string; copyright: string };
  forms: {
    jobSeekersOpen: boolean;
    employersOpen: boolean;
    positions: string[];
    experienceLevels: string[];
    staffTypes: string[];
    experienceRequired: string[];
  };
}

export const defaultContent: SiteContent = {
  siteName: "Barista Job's",
  tagline: "Great Barista, Better Business",
  announcement: { enabled: false, text: "" },
  hero: {
    badge: "Now hiring across Somalia",
    titleLead: "Welcome to",
    titleHighlight: "Barista Job's",
    subtitle:
      "We provide skilled Baristas, training, and professional services for Coffee Shops, Restaurants, Hotels, and other businesses.",
    primaryCta: "Looking for a Job?",
    secondaryCta: "Need Staff?",
    stats: [
      { value: "500+", label: "Baristas Placed" },
      { value: "100+", label: "Partner Businesses" },
      { value: "6", label: "Expert Services" },
    ],
  },
  servicesSection: {
    eyebrow: "What We Offer",
    title: "Our Services",
    subtitle:
      "From staffing to full coffee shop setup, we provide everything you need for a successful coffee business.",
  },
  services: [
    {
      id: "svc-supply",
      icon: "team",
      title: "Professional Barista Supply",
      description:
        "We provide skilled and experienced Baristas ready to work in your business from day one.",
      visible: true,
    },
    {
      id: "svc-training",
      icon: "book",
      title: "Basic Barista Training",
      description:
        "Comprehensive training programs for people who want to learn professional barista skills.",
      visible: true,
    },
    {
      id: "svc-customer",
      icon: "smile",
      title: "Customer Service Training",
      description:
        "Help your staff improve customer service and create memorable experiences for guests.",
      visible: true,
    },
    {
      id: "svc-consult",
      icon: "chart",
      title: "Coffee Shop Consultation",
      description:
        "Expert consulting on improving operations, management, and growth of your Coffee Shop.",
      visible: true,
    },
    {
      id: "svc-menu",
      icon: "menu",
      title: "Menu & Recipe Development",
      description:
        "Design your Coffee Menu, develop unique recipes, and master drink preparation techniques.",
      visible: true,
    },
    {
      id: "svc-setup",
      icon: "building",
      title: "Coffee Shop Setup",
      description:
        "Full planning and setup services for launching your new Coffee Shop from concept to opening day.",
      visible: true,
    },
  ],
  contactSection: {
    eyebrow: "Get In Touch",
    title: "Contact Us",
    subtitle:
      "Reach out to us via WhatsApp or call. We're here to help both job seekers and businesses.",
  },
  contacts: [
    {
      id: "contact-seekers",
      title: "Job Seekers",
      description: "Looking for barista work? Reach us on WhatsApp",
      phoneLabel: "+252 61 8270011",
      whatsapp: "252618270011",
      style: "green",
    },
    {
      id: "contact-business",
      title: "Businesses",
      description: "Need staff for your business? Call or WhatsApp us",
      phoneLabel: "+252 61 6983751",
      whatsapp: "252616983751",
      style: "navy",
    },
  ],
  footer: {
    about:
      "Connecting skilled baristas with the best coffee businesses across Somalia.",
    copyright: "2026 Barista Job's. All rights reserved.",
  },
  forms: {
    jobSeekersOpen: true,
    employersOpen: true,
    positions: [
      "Barista",
      "Senior Barista",
      "Head Barista",
      "Barista Trainer",
      "Coffee Shop Manager",
      "Other",
    ],
    experienceLevels: [
      "No experience",
      "Less than 1 year",
      "1-2 years",
      "3-5 years",
      "5+ years",
    ],
    staffTypes: [
      "Barista",
      "Senior Barista",
      "Head Barista",
      "Barista Trainer",
      "Coffee Shop Manager",
      "Multiple Roles",
    ],
    experienceRequired: [
      "No experience needed",
      "1+ year",
      "2+ years",
      "3+ years",
      "5+ years",
    ],
  },
};

const str = (v: unknown, fallback: string, max = 2000): string =>
  typeof v === "string" ? v.trim().slice(0, max) : fallback;

const bool = (v: unknown, fallback: boolean): boolean =>
  typeof v === "boolean" ? v : fallback;

const strList = (v: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(v)) return fallback;
  const out = v
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim().slice(0, 120))
    .filter(Boolean);
  return Array.from(new Set(out)).slice(0, 50);
};

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const genId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

/** Validates untrusted input and merges it over the defaults. Never throws. */
export function sanitizeContent(input: unknown): SiteContent {
  const d = defaultContent;
  const i = obj(input);
  const hero = obj(i.hero);
  const ss = obj(i.servicesSection);
  const cs = obj(i.contactSection);
  const footer = obj(i.footer);
  const forms = obj(i.forms);
  const ann = obj(i.announcement);

  const services: ServiceItem[] = Array.isArray(i.services)
    ? i.services.slice(0, 30).map((raw) => {
        const s = obj(raw);
        const icon = ICON_KEYS.includes(s.icon as IconKey) ? (s.icon as IconKey) : "star";
        return {
          id: str(s.id, "", 60) || genId("svc"),
          icon,
          title: str(s.title, "", 120),
          description: str(s.description, "", 500),
          visible: bool(s.visible, true),
        };
      })
    : d.services;

  const contacts: ContactCard[] = Array.isArray(i.contacts)
    ? i.contacts.slice(0, 6).map((raw) => {
        const c = obj(raw);
        return {
          id: str(c.id, "", 60) || genId("contact"),
          title: str(c.title, "", 80),
          description: str(c.description, "", 300),
          phoneLabel: str(c.phoneLabel, "", 40),
          whatsapp: str(c.whatsapp, "", 30).replace(/\D/g, ""),
          style: c.style === "navy" ? "navy" : "green",
        };
      })
    : d.contacts;

  const stats = Array.isArray(hero.stats)
    ? hero.stats.slice(0, 4).map((raw) => {
        const s = obj(raw);
        return { value: str(s.value, "", 20), label: str(s.label, "", 60) };
      })
    : d.hero.stats;

  return {
    siteName: str(i.siteName, d.siteName, 80) || d.siteName,
    tagline: str(i.tagline, d.tagline, 120),
    announcement: {
      enabled: bool(ann.enabled, false),
      text: str(ann.text, "", 300),
    },
    hero: {
      badge: str(hero.badge, d.hero.badge, 120),
      titleLead: str(hero.titleLead, d.hero.titleLead, 80),
      titleHighlight: str(hero.titleHighlight, d.hero.titleHighlight, 80),
      subtitle: str(hero.subtitle, d.hero.subtitle, 500),
      primaryCta: str(hero.primaryCta, d.hero.primaryCta, 60),
      secondaryCta: str(hero.secondaryCta, d.hero.secondaryCta, 60),
      stats,
    },
    servicesSection: {
      eyebrow: str(ss.eyebrow, d.servicesSection.eyebrow, 80),
      title: str(ss.title, d.servicesSection.title, 120),
      subtitle: str(ss.subtitle, d.servicesSection.subtitle, 500),
    },
    services,
    contactSection: {
      eyebrow: str(cs.eyebrow, d.contactSection.eyebrow, 80),
      title: str(cs.title, d.contactSection.title, 120),
      subtitle: str(cs.subtitle, d.contactSection.subtitle, 500),
    },
    contacts,
    footer: {
      about: str(footer.about, d.footer.about, 500),
      copyright: str(footer.copyright, d.footer.copyright, 200),
    },
    forms: {
      jobSeekersOpen: bool(forms.jobSeekersOpen, true),
      employersOpen: bool(forms.employersOpen, true),
      positions: strList(forms.positions, d.forms.positions),
      experienceLevels: strList(forms.experienceLevels, d.forms.experienceLevels),
      staffTypes: strList(forms.staffTypes, d.forms.staffTypes),
      experienceRequired: strList(forms.experienceRequired, d.forms.experienceRequired),
    },
  };
}
