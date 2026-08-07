import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../lib/theme";
import { CustomerAuthProvider } from "../lib/customerAuth";

export function renderComponent(element) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <ThemeProvider>
        <CustomerAuthProvider>{element}</CustomerAuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

export function componentContract(name, cases) {
  test(`${name}: happy path`, () => {
    expect(renderComponent(cases.happy())).toEqual(expect.any(String));
  });
  test(`${name}: empty or missing input`, () => {
    expect(renderComponent(cases.empty())).toEqual(expect.any(String));
  });
  test(`${name}: alternate input`, () => {
    expect(renderComponent(cases.alternate())).toEqual(expect.any(String));
  });
}
