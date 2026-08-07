import { LANDING_GUIDE_CONTENT } from "./landingGuideContent";
import { GUIDE_EVENTS, GUIDE_STEPS, initialLandingGuideState, resolveLandingGuide } from "./landingGuideFlow";

const send = (state, type, extra) => resolveLandingGuide(state, { type, ...extra });
const open = () => send(initialLandingGuideState, GUIDE_EVENTS.OPEN);
const result = (businessId) => send(open(), GUIDE_EVENTS.CHOOSE_BUSINESS, { businessId });

test("opens directly at business-type selection", () => {
  expect(open()).toEqual({ ...initialLandingGuideState, step: GUIDE_STEPS.BUSINESS_TYPE });
});

test.each([
  ["restaurant", "owner-restaurant-register"],
])("resolves %s to %s", (businessId, actionId) => {
  expect(result(businessId)).toMatchObject({
    step: GUIDE_STEPS.RESULT,
    businessId,
    action: { id: actionId, to: "/register" },
  });
});

test("resolves salon to a recoverable coming-soon state", () => {
  expect(result("salon")).toMatchObject({ step: GUIDE_STEPS.UNAVAILABLE, businessId: "salon", action: null });
});

test("backs from a result to clean business choices", () => {
  expect(send(result("restaurant"), GUIDE_EVENTS.BACK)).toEqual({
    ...initialLandingGuideState,
    step: GUIDE_STEPS.BUSINESS_TYPE,
  });
});

test("start over clears the selected business", () => {
  expect(send(result("salon"), GUIDE_EVENTS.RESET)).toEqual({
    ...initialLandingGuideState,
    step: GUIDE_STEPS.BUSINESS_TYPE,
  });
});

test("close and reopen resume the same in-memory result", () => {
  const beforeClose = result("restaurant");
  const closed = send(beforeClose, GUIDE_EVENTS.CLOSE);
  expect(closed.step).toBe(GUIDE_STEPS.CLOSED);
  expect(closed.resume).toMatchObject({ step: GUIDE_STEPS.RESULT, businessId: "restaurant" });
  expect(send(closed, GUIDE_EVENTS.OPEN)).toMatchObject(beforeClose);
});

test("unknown businesses are ignored and missing actions fail closed", () => {
  const businessTypes = open();
  expect(send(businessTypes, GUIDE_EVENTS.CHOOSE_BUSINESS, { businessId: "unknown" })).toBe(businessTypes);
  expect(resolveLandingGuide(
    businessTypes,
    { type: GUIDE_EVENTS.CHOOSE_BUSINESS, businessId: "restaurant" },
    { content: LANDING_GUIDE_CONTENT, actions: {} },
  ).step).toBe(GUIDE_STEPS.UNAVAILABLE);
});
