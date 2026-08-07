import { LANDING_GUIDE_CONTENT } from "./landingGuideContent";
import { GUIDE_EVENTS, GUIDE_STEPS, initialLandingGuideState, resolveLandingGuide } from "./landingGuideFlow";

const send = (state, type, extra) => resolveLandingGuide(state, { type, ...extra });
const open = () => send(initialLandingGuideState, GUIDE_EVENTS.OPEN);
const chooseAudience = (audienceId) => send(open(), GUIDE_EVENTS.CHOOSE_AUDIENCE, { audienceId });
const result = (audienceId, businessId) => send(
  chooseAudience(audienceId),
  GUIDE_EVENTS.CHOOSE_BUSINESS,
  { businessId },
);

test("opens a fresh guide at audience selection", () => {
  expect(open()).toMatchObject({ step: GUIDE_STEPS.AUDIENCE, audienceId: null, businessId: null });
});

test.each(["owner", "customer"])("selects the %s audience without mixing branches", (audienceId) => {
  const state = chooseAudience(audienceId);
  expect(state).toMatchObject({ step: GUIDE_STEPS.BUSINESS_TYPE, audienceId });
  expect(LANDING_GUIDE_CONTENT.audiences[state.audienceId].id).toBe(audienceId);
});

test.each([
  ["owner", "restaurant", "owner-restaurant-register"],
  ["owner", "salon", "owner-salon-register"],
  ["customer", "restaurant", "customer-restaurant-discover"],
  ["customer", "salon", "customer-salon-discover"],
])("resolves %s/%s to %s", (audienceId, businessId, actionId) => {
  expect(result(audienceId, businessId)).toMatchObject({
    step: GUIDE_STEPS.RESULT,
    audienceId,
    businessId,
    action: { id: actionId },
  });
});

test("backs from a result to its business choices", () => {
  expect(send(result("owner", "restaurant"), GUIDE_EVENTS.BACK)).toMatchObject({
    step: GUIDE_STEPS.BUSINESS_TYPE,
    audienceId: "owner",
    businessId: null,
  });
});

test("backs from business choices to a clean audience state", () => {
  expect(send(chooseAudience("customer"), GUIDE_EVENTS.BACK)).toEqual({
    ...initialLandingGuideState,
    step: GUIDE_STEPS.AUDIENCE,
  });
});

test("start over clears every selection", () => {
  expect(send(result("customer", "salon"), GUIDE_EVENTS.RESET)).toEqual({
    ...initialLandingGuideState,
    step: GUIDE_STEPS.AUDIENCE,
  });
});

test("close and reopen resume the same in-memory step", () => {
  const beforeClose = result("owner", "salon");
  const closed = send(beforeClose, GUIDE_EVENTS.CLOSE);
  expect(closed.step).toBe(GUIDE_STEPS.CLOSED);
  expect(closed.resume).toMatchObject({ step: GUIDE_STEPS.RESULT, audienceId: "owner", businessId: "salon" });
  expect(send(closed, GUIDE_EVENTS.OPEN)).toMatchObject(beforeClose);
});

test("unknown options are ignored and missing actions fail closed", () => {
  const audience = open();
  expect(send(audience, GUIDE_EVENTS.CHOOSE_AUDIENCE, { audienceId: "unknown" })).toBe(audience);
  const business = chooseAudience("owner");
  expect(resolveLandingGuide(
    business,
    { type: GUIDE_EVENTS.CHOOSE_BUSINESS, businessId: "restaurant" },
    { content: LANDING_GUIDE_CONTENT, actions: {} },
  ).step).toBe(GUIDE_STEPS.UNAVAILABLE);
});
