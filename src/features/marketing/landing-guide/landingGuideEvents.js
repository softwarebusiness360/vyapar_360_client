export const LANDING_GUIDE_EVENT_NAMES = Object.freeze([
  "chatbot_opened",
  "chatbot_option_selected",
  "chatbot_back_selected",
  "chatbot_reset",
  "chatbot_action_selected",
  "chatbot_whatsapp_selected",
  "chatbot_closed",
]);

const ALLOWED_PAYLOAD_KEYS = new Set(["optionId", "actionId"]);
const OPTION_IDS = new Set(["restaurant", "salon"]);
const ACTION_IDS = new Set([
  "owner-restaurant-register",
]);

function isAllowedValue(key, value) {
  if (typeof value !== "string") return false;
  return key === "optionId" ? OPTION_IDS.has(value) : ACTION_IDS.has(value);
}

export function createLandingGuideEventPort(adapter) {
  return Object.freeze({
    emit(name, payload = {}) {
      if (!LANDING_GUIDE_EVENT_NAMES.includes(name) || typeof adapter !== "function") return false;
      if (name === "chatbot_whatsapp_selected") {
        adapter(name, {});
        return true;
      }
      const submitted = Object.entries(payload).filter(([key]) => ALLOWED_PAYLOAD_KEYS.has(key));
      if (submitted.some(([key, value]) => !isAllowedValue(key, value))) return false;
      const safePayload = Object.fromEntries(
        submitted,
      );
      adapter(name, safePayload);
      return true;
    },
  });
}

export const noopLandingGuideEventPort = createLandingGuideEventPort();
