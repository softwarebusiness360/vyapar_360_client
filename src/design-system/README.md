# Vyapar360 Design System

## Global Sources of Truth

- `src/index.css` owns theme tokens, typography, base behavior, and global
  primitive classes.
- `tailwind.config.js` maps those tokens into Tailwind utilities.
- `src/shared/components/**` contains the reusable component implementations
  and colocated behavior tests.
- `src/design-system/index.js` is the stable public API for application-wide
  reusable components and primitive class recipes.

Feature-local components remain inside `src/features/**`. Promote a component
into the design system only after at least two experiences genuinely reuse it.

## Token Policy

Use semantic tokens such as `bg-surface`, `ink-primary`, `line`, `brand`,
`restaurant`, `salon`, `success`, and `danger`. Do not define another `:root`
theme inside a feature or duplicate dark/light theme variables.

New business types such as clinics add only their needed accent/capability
tokens; they reuse the global typography, spacing, controls, cards, navigation,
feedback, and accessibility behavior.

## Component Policy

- Import globally reusable UI from `@/design-system` in new code.
- Keep page-specific UI beside its feature.
- Keep tests beside the component.
- Validate component behavior, including validation, disabled states, empty
  data, permissions, and error handling—not rendering alone.
- Extend an existing primitive before introducing a visually competing one.

## Verification

Run `npm run design-system:check`. It verifies the required global token and
primitive contract and rejects feature-local root/theme declarations.
