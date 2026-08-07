export { default as Logo } from "@/shared/components/branding/Logo";
export { default as ThemeToggle } from "@/shared/components/controls/ThemeToggle";
export { default as Modal } from "@/shared/components/feedback/Modal";
export { default as StatusBadge } from "@/shared/components/feedback/StatusBadge";
export { default as UpgradeGate } from "@/shared/components/feedback/UpgradeGate";
export { Container } from "@/shared/components/layout/Container";
export { default as PublicFooter } from "@/shared/components/layout/PublicFooter";
export { default as NavDrawer } from "@/shared/components/navigation/NavDrawer";
export { default as NavToggle } from "@/shared/components/navigation/NavToggle";
export { default as PublicHeader } from "@/shared/components/navigation/PublicHeader";

export const designSystemClasses = Object.freeze({
  button: Object.freeze({ primary: "btn-primary", secondary: "btn-ghost" }),
  field: "input-field",
  card: Object.freeze({ base: "card-surface", interactive: "card-surface card-hover" }),
  tag: "tag",
  divider: "divider-x",
  effects: Object.freeze({ glass: "glass", grain: "grain" }),
});
