import { createLandingGuideEventPort } from "./landingGuideEvents";

test("is a safe no-op without an adapter", () => {
  expect(createLandingGuideEventPort().emit("chatbot_opened")).toBe(false);
});

test("emits an approved event with allowlisted stable identifiers", () => {
  const adapter = jest.fn();
  const port = createLandingGuideEventPort(adapter);
  expect(port.emit("chatbot_option_selected", { optionId: "restaurant" })).toBe(true);
  expect(adapter).toHaveBeenCalledWith("chatbot_option_selected", { optionId: "restaurant" });
});

test("emits the WhatsApp contact selection without contact data", () => {
  const adapter = jest.fn();
  const port = createLandingGuideEventPort(adapter);
  expect(port.emit("chatbot_whatsapp_selected")).toBe(true);
  expect(adapter).toHaveBeenCalledWith("chatbot_whatsapp_selected", {});
});

test("never forwards payload data with a WhatsApp contact event", () => {
  const adapter = jest.fn();
  const port = createLandingGuideEventPort(adapter);
  expect(port.emit("chatbot_whatsapp_selected", {
    actionId: "owner-restaurant-register",
    phone: "919876543210",
  })).toBe(true);
  expect(adapter).toHaveBeenCalledWith("chatbot_whatsapp_selected", {});
});

test("drops personal, free-text, and arbitrary metadata", () => {
  const adapter = jest.fn();
  createLandingGuideEventPort(adapter).emit("chatbot_action_selected", {
    actionId: "owner-restaurant-register",
    message: "private question",
    phone: "9000000000",
    routeQuery: "?email=user@example.com",
  });
  expect(adapter).toHaveBeenCalledWith("chatbot_action_selected", {
    actionId: "owner-restaurant-register",
  });
});

test("rejects unknown event names and unsafe identifiers", () => {
  const adapter = jest.fn();
  const port = createLandingGuideEventPort(adapter);
  expect(port.emit("chatbot_message", { optionId: "owner" })).toBe(false);
  expect(port.emit("chatbot_option_selected", { optionId: "owner?email=x" })).toBe(false);
  expect(adapter).not.toHaveBeenCalled();
});
