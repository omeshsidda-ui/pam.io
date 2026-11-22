import { profile, save } from "./storage";

export type Appearance = "system" | "light" | "dark";
export const schemeQuery = matchMedia("(prefers-color-scheme: dark)");
export function resolvedTheme() {
  if (profile.appearance === "dark" || profile.appearance === "light")
    return profile.appearance;
  return schemeQuery.matches ? "dark" : "light";
}
export function setAppearance(mode: Appearance) {
  profile.appearance = mode;
  save();
  applyTheme();
}
function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = resolvedTheme();
  root.style.colorScheme = root.dataset.theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(root).getPropertyValue("--field").trim(),
    );
  window.dispatchEvent(new Event("pam-theme"));
}
schemeQuery.addEventListener("change", applyTheme);
applyTheme();
