export const APP_CONFIG = Object.freeze({
  brandName: "Vyapar360",
  companyName: "Vyapar360",
  currency: "INR",
  locale: "en-IN",
  supportEmail: "sales@vyapar360.com",
});

export const withBrand = (text) => String(text).replaceAll("{brand}", APP_CONFIG.brandName);
