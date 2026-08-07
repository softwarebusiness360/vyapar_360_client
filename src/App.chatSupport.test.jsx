import React, { act } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverStub;

test("does not globally mount the legacy chat launcher", async () => {
  window.history.pushState({}, "", "/");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => root.render(<App />));

  expect(container.querySelector('[data-testid="chat-support-toggle"]')).toBeNull();
  expect(container.querySelector('[data-testid="landing-guide-launcher"]')).not.toBeNull();

  await act(async () => root.unmount());
  container.remove();
});
