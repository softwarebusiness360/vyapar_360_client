import { CLINIC_BUSINESS_TYPE, getBusinessType, listBusinessTypes, registerBusinessType } from "./registry";

test("ships restaurant and salon definitions", () => {
  expect(listBusinessTypes().map(({ id }) => id)).toEqual(["restaurant", "salon"]);
});

test("provides a clinics extension seam", () => {
  registerBusinessType({ id: CLINIC_BUSINESS_TYPE, capabilities: ["appointments"] });
  expect(getBusinessType("clinic").capabilities).toEqual(["appointments"]);
});

test("rejects malformed business types", () => {
  expect(() => registerBusinessType({ id: "invalid" })).toThrow("requires an id and capabilities");
});
