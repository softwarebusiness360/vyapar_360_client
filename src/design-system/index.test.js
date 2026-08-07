import * as designSystem from "./index";

test("publishes the global reusable component surface", () => {
  for (const name of [
    "Logo", "ThemeToggle", "Modal", "StatusBadge", "UpgradeGate",
    "Container", "PublicFooter", "NavDrawer", "NavToggle", "PublicHeader",
  ]) {
    expect(designSystem[name]).toBeDefined();
  }
});

test("publishes stable primitive class recipes", () => {
  expect(designSystem.designSystemClasses.button.primary).toBe("btn-primary");
  expect(designSystem.designSystemClasses.field).toBe("input-field");
  expect(designSystem.designSystemClasses.card.interactive).toContain("card-hover");
});
