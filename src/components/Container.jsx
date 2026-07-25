import React from "react";

export function Container({ children, className = "", ...rest }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Section({ children, className = "", ...rest }) {
  return (
    <section className={`py-16 sm:py-24 ${className}`} {...rest}>
      {children}
    </section>
  );
}
