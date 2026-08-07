export const LANDING_GUIDE_CONTENT = Object.freeze({
  version: 2,
  prompt: "What kind of business do you run?",
  businesses: Object.freeze({
    restaurant: Object.freeze({
      id: "restaurant",
      label: "Restaurant / Café",
      title: "Grow your food business",
      guidance: "Create your storefront, publish your menu, and manage orders from one dashboard.",
      actionId: "owner-restaurant-register",
    }),
    salon: Object.freeze({
      id: "salon",
      label: "Salon",
      title: "Grow your salon business",
      guidance: "Publish your services and make bookings easier to manage from one dashboard.",
      actionId: "owner-salon-register",
    }),
  }),
});

export function getLandingGuideContent(source = LANDING_GUIDE_CONTENT) {
  return source;
}
