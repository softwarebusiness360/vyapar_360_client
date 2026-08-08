import {
  DEFAULT_LANDING_CONFIG,
  LANDING_STORAGE_KEY,
  getLandingConfig,
  saveLandingConfig,
} from "./configurationRepository";

beforeEach(() => localStorage.clear());

test("migrates an older landing record through every current CMS section", () => {
  localStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify({
    contentVersion: 1,
    brand: { name: "Legacy Brand" },
    hero: { headlineLine1: "Old launch copy" },
    plans: [{ id: "free", price: 0 }],
  }));

  const migrated = getLandingConfig();
  expect(migrated.contentVersion).toBe(DEFAULT_LANDING_CONFIG.contentVersion);
  expect(migrated.hero.eyebrow).toBe(DEFAULT_LANDING_CONFIG.hero.eyebrow);
  expect(migrated.pricing.title).toBe(DEFAULT_LANDING_CONFIG.pricing.title);
  expect(migrated.features.cards).toHaveLength(6);
  expect(migrated.businessTypes.available).toHaveLength(2);
  expect(migrated.howItWorks.steps).toHaveLength(4);
  expect(migrated.faqs).toHaveLength(6);
  expect(migrated.finalCta.secondaryTo).toBe("/discover");
  expect(migrated.footer.links.map(({ id }) => id)).toContain("privacy");
  expect(migrated.legal.terms.paragraphs.length).toBeGreaterThan(0);
});

test("rejects unsafe CMS destinations while preserving approved copy changes", () => {
  const saved = saveLandingConfig({
    ...DEFAULT_LANDING_CONFIG,
    brand: { ...DEFAULT_LANDING_CONFIG.brand, name: "CMS Brand" },
    navigation: { ...DEFAULT_LANDING_CONFIG.navigation, loginTo: "javascript:alert(1)", ctaTo: "https://evil.example" },
    hero: { ...DEFAULT_LANDING_CONFIG.hero, ctaPrimaryTo: "javascript:alert(1)", ctaSecondaryTo: "#unknown" },
    finalCta: { ...DEFAULT_LANDING_CONFIG.finalCta, title: "CMS final title", primaryTo: "/admin", secondaryTo: "https://evil.example" },
    footer: {
      ...DEFAULT_LANDING_CONFIG.footer,
      links: DEFAULT_LANDING_CONFIG.footer.links.map((item) => item.id === "privacy" ? { ...item, to: "javascript:alert(1)" } : item),
    },
  });

  expect(saved.navigation.loginTo).toBe("/login");
  expect(saved.navigation.ctaTo).toBe("/register");
  expect(saved.hero.ctaPrimaryTo).toBe("/register");
  expect(saved.hero.ctaSecondaryTo).toBe("#how-it-works");
  expect(saved.finalCta.primaryTo).toBe("/register");
  expect(saved.finalCta.secondaryTo).toBe("/discover");
  expect(saved.footer.links.find(({ id }) => id === "privacy").to).toBe("/privacy");
  expect(getLandingConfig().finalCta.title).toBe("CMS final title");
  expect(getLandingConfig().brand.name).toBe("CMS Brand");
});
