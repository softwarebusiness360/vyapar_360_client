export const LANDING_GUIDE_ACTIONS = Object.freeze({
  ownerRestaurantRegister: Object.freeze({
    id: "owner-restaurant-register",
    label: "Start restaurant setup",
    to: "/register",
  }),
  ownerSalonRegister: Object.freeze({
    id: "owner-salon-register",
    label: "Start salon setup",
    to: "/register",
  }),
  customerRestaurantDiscover: Object.freeze({
    id: "customer-restaurant-discover",
    label: "Discover restaurants",
    to: "/discover",
  }),
  customerSalonDiscover: Object.freeze({
    id: "customer-salon-discover",
    label: "Discover salons",
    to: "/discover",
  }),
});

export const LANDING_GUIDE_ACTION_IDS = Object.freeze(
  Object.values(LANDING_GUIDE_ACTIONS).map(({ id }) => id),
);

export function findLandingGuideAction(actionId, actions = LANDING_GUIDE_ACTIONS) {
  return Object.values(actions).find(({ id }) => id === actionId) || null;
}
