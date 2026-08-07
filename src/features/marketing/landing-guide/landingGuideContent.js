export const LANDING_GUIDE_CONTENT = Object.freeze({
  version: 1,
  audiences: Object.freeze({
    owner: Object.freeze({
      id: "owner",
      label: "I run a business",
      prompt: "What kind of business do you run?",
      businesses: Object.freeze({
        restaurant: Object.freeze({
          id: "restaurant",
          label: "Restaurant",
          title: "Restaurant owners",
          guidance: "Create your storefront, publish your menu, and manage orders from one dashboard.",
          actionId: "owner-restaurant-register",
        }),
        salon: Object.freeze({
          id: "salon",
          label: "Salon",
          title: "Salon owners",
          guidance: "Publish your services and make bookings easier to manage from one dashboard.",
          actionId: "owner-salon-register",
        }),
      }),
    }),
    customer: Object.freeze({
      id: "customer",
      label: "I'm a customer",
      prompt: "What are you looking for today?",
      businesses: Object.freeze({
        restaurant: Object.freeze({
          id: "restaurant",
          label: "Restaurant",
          title: "Find a restaurant",
          guidance: "Discover local restaurants, browse their menus, and choose where to order.",
          actionId: "customer-restaurant-discover",
        }),
        salon: Object.freeze({
          id: "salon",
          label: "Salon",
          title: "Find a salon",
          guidance: "Discover local salon services and choose where to book an appointment.",
          actionId: "customer-salon-discover",
        }),
      }),
    }),
  }),
});

export function getLandingGuideContent(source = LANDING_GUIDE_CONTENT) {
  return source;
}
