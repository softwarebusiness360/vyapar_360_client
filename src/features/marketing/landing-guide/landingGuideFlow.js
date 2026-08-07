import { LANDING_GUIDE_CONTENT } from "./landingGuideContent";
import { LANDING_GUIDE_ACTIONS, findLandingGuideAction } from "./landingGuideRoutes";

export const GUIDE_STEPS = Object.freeze({
  CLOSED: "closed",
  BUSINESS_TYPE: "business-type",
  RESULT: "result",
  UNAVAILABLE: "unavailable",
});

export const GUIDE_EVENTS = Object.freeze({
  OPEN: "open",
  CLOSE: "close",
  CHOOSE_BUSINESS: "choose-business",
  BACK: "back",
  RESET: "reset",
});

export const initialLandingGuideState = Object.freeze({
  step: GUIDE_STEPS.CLOSED,
  businessId: null,
  result: null,
  action: null,
  resume: null,
});

const businessTypeState = () => ({
  ...initialLandingGuideState,
  step: GUIDE_STEPS.BUSINESS_TYPE,
});

export function resolveLandingGuide(
  state = initialLandingGuideState,
  event = {},
  { content = LANDING_GUIDE_CONTENT, actions = LANDING_GUIDE_ACTIONS } = {},
) {
  if (event.type === GUIDE_EVENTS.OPEN && state.step === GUIDE_STEPS.CLOSED) {
    return state.resume ? { ...state.resume, resume: null } : businessTypeState();
  }

  if (event.type === GUIDE_EVENTS.CLOSE && state.step !== GUIDE_STEPS.CLOSED) {
    const { resume: ignored, ...resume } = state;
    return { ...initialLandingGuideState, resume };
  }

  if (event.type === GUIDE_EVENTS.RESET && state.step !== GUIDE_STEPS.CLOSED) {
    return businessTypeState();
  }

  if (event.type === GUIDE_EVENTS.CHOOSE_BUSINESS && state.step === GUIDE_STEPS.BUSINESS_TYPE) {
    const result = content.businesses?.[event.businessId];
    if (!result) return state;
    const action = findLandingGuideAction(result.actionId, actions);
    if (!action) {
      return { ...state, step: GUIDE_STEPS.UNAVAILABLE, businessId: event.businessId, result, action: null };
    }
    return { ...state, step: GUIDE_STEPS.RESULT, businessId: event.businessId, result, action };
  }

  if (event.type === GUIDE_EVENTS.BACK
    && (state.step === GUIDE_STEPS.RESULT || state.step === GUIDE_STEPS.UNAVAILABLE)) {
    return businessTypeState();
  }

  return state;
}
