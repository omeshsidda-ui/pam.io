import { resolvedTheme, setAppearance } from "./theme";
import { skins } from "./config";
import { profile, save } from "./storage";
import { preview, face } from "./render/spriteCache";
export const el = (id: string) => document.getElementById(id)!;
const paths: Record<string, string> = {
  forward: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  light:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  dark: '<path d="M20.7 14.1A8.8 8.8 0 0 1 9.9 3.3 9 9 0 1 0 20.7 14.1Z"/>',
  skins:
    '<path d="M8 3 3 6l-2 5 4 2 2-2v10h10V11l2 2 4-2-2-5-5-3c-1 4-7 4-8 0Z"/>',
  settings:
    '<path d="m10 2-.6 2.5-2 .9L5 4.7 2.8 8.4l1.8 1.8v3.5l-1.8 1.8L5 19.3l2.4-.7 2 .9.6 2.5h4l.6-2.5 2-.9 2.4.7 2.2-3.8-1.8-1.8v-3.5l1.8-1.8L19 4.7l-2.4.7-2-.9L14 2Z"/><circle cx="12" cy="12" r="3.4"/>',
  cup: '<path d="M7 3h10v6a5 5 0 0 1-10 0zm0 2H3v2q0 5 5 5m9-7h4v2q0 5-5 5m-4 2v5m-4 2h8"/>',
  pencil: '<path d="m4 16 12-12 4 4L8 20l-5 1zm10-10 4 4"/>',
  play: '<path fill="currentColor" d="m6 3 14 9-14 9z"/>',
  sound: '<path d="M3 9h4l5-4v14l-5-4H3zm13-1q4 4 0 8m3-11q7 7 0 14"/>',
  silent: '<path d="M3 9h4l5-4v14l-5-4H3zm13 1 6 5m0-5-6 5"/>',
  back: '<path d="m13 5-7 7 7 7m-6-7h15"/>',
  bolt: '<path fill="currentColor" d="m14 2-11 12h8l-1 8 11-13h-8z"/>',
  phone:
    '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};
function icon(name: string) {
  return (
    '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">' +
    paths[name] +
    "</svg>"
  );
}
document
  .querySelectorAll<HTMLElement>("[data-icon]")
  .forEach((n) => (n.innerHTML = icon(n.dataset.icon!)));
export function screen(name: string) {
  document.body.dataset.screen = name;
  el("best").textContent = profile.best.toLocaleString();
  el("equipped").textContent = skins[profile.skin][0];
}
const groups: Record<string, number[]> = {
  All: skins.map((_, i) => i),
  Basic: [0, 1, 2, 3],
  Neon: [4, 6, 11],
  Animals: [5, 8],
  Rare: [7, 9, 10],
};
let category = "All",
  selected = 0;
const previews = new Map<HTMLCanvasElement, number>();
function details() {
  const portrait = (el("skin-portrait") as HTMLCanvasElement).getContext("2d")!;
  portrait.clearRect(0, 0, 192, 192);
  face(portrait, 97, 98, -0.34, 54, selected);
  const level = selected - 3,
    owned = selected < profile.unlocked;
  el("skin-name").textContent = skins[selected][0];
  el("condition").textContent = owned
    ? selected === profile.skin
      ? "Equipped"
      : "Ready to equip"
    : `Score ${level * 300} in one game or earn ${level * 3} total kills`;
  const bar = el("milestone") as HTMLProgressElement;
  bar.value = owned
    ? 1
    : Math.max(profile.best / (level * 300), profile.kills / (level * 3));
  bar.setAttribute("aria-label", "Unlock progress");
  (el("use") as HTMLButtonElement).disabled = !owned;
  for (const [canvas, id] of previews)
    canvas.parentElement!.setAttribute("aria-pressed", String(id === selected));
}
function showShop() {
  el("categories").replaceChildren();
  el("cards").replaceChildren();
  previews.clear();
  for (const [name, ids] of Object.entries(groups)) {
    const btn = document.createElement("button"),
      count = ids.filter((i) => i < profile.unlocked).length;
    btn.textContent = name;
    const num = document.createElement("small");
    num.textContent =
      (count === ids.length ? "♛ " : "") + count + "/" + ids.length;
    btn.append(num);
    btn.setAttribute("aria-pressed", String(name === category));
    btn.onclick = () => {
      category = name;
      if (!ids.includes(selected)) selected = ids[0];
      showShop();
    };
    el("categories").append(btn);
  }
  for (const id of groups[category]) {
    const btn = document.createElement("button");
    btn.className = "skin-card";
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 1140;
    previews.set(canvas, id);
    btn.append(canvas);
    if (id >= profile.unlocked) {
      const lock = document.createElement("i");
      lock.className = "lock";
      lock.innerHTML = icon("lock");
      btn.append(lock);
    }
    const name = document.createElement("strong");
    name.textContent = skins[id][0];
    btn.append(name);
    btn.onclick = () => {
      selected = id;
      details();
    };
    el("cards").append(btn);
  }
  details();
}
export function animateMenu(time: number) {
  if (document.body.dataset.screen === "shop") {
    for (const [canvas, id] of previews) preview(canvas, id, time + id, true);
  } else if (document.body.dataset.screen === "home")
    preview(el("outfit") as HTMLCanvasElement, profile.skin, time);
}
el("skins").onclick = el("change").onclick = () => {
  selected = profile.skin;
  category = "All";
  showShop();
  screen("shop");
  el("cards").children[selected]?.scrollIntoView({ inline: "nearest" });
};
el("use").onclick = () => {
  profile.skin = selected;
  save();
  screen("home");
};
function themeControls() {
  const next = resolvedTheme() === "dark" ? "light" : "dark";
  const toggle = el("theme-switch");
  toggle.innerHTML = icon(next);
  toggle.title = "Switch to " + next + " mode";
  toggle.setAttribute("aria-label", toggle.title);
  toggle.onclick = () => setAppearance(next);
  for (const button of el("appearance").querySelectorAll("button"))
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.mode === profile.appearance),
    );
}
for (const mode of ["system", "light", "dark"] as const) {
  const button = document.createElement("button");
  button.textContent = mode[0].toUpperCase() + mode.slice(1);
  button.dataset.mode = mode;
  button.onclick = () => setAppearance(mode);
  el("appearance").append(button);
}
window.addEventListener("pam-theme", themeControls);
themeControls();
function options() {
  for (const [container, items] of [
    ["hands", ["Right handed", "Left handed"]],
    ["modes", ["Joystick", "Arrow", "Follow"]],
  ] as const) {
    el(container).replaceChildren();
    for (const item of items) {
      const btn = document.createElement("button");
      btn.textContent = item;
      btn.setAttribute(
        "aria-pressed",
        String(
          item === (container === "hands" ? profile.hand : profile.control),
        ),
      );
      btn.onclick = () => {
        if (container === "hands") profile.hand = item;
        else profile.control = item;
        save();
        options();
      };
      el(container).append(btn);
    }
  }
  document.body.classList.toggle("lefty", profile.hand === "Left handed");
  document.body.dataset.mode = profile.control;
  el("mute").innerHTML = icon(profile.mute ? "silent" : "sound");
  el("mute").setAttribute("aria-pressed", String(profile.mute));
  el("audio-option").textContent = "Sound " + (profile.mute ? "off" : "on");
}
el("settings").onclick = () => screen("options");
el("mute").onclick = el("audio-option").onclick = () => {
  profile.mute = !profile.mute;
  save();
  options();
};
document
  .querySelectorAll<HTMLButtonElement>(".back")
  .forEach((btn) => (btn.onclick = () => screen("home")));
options();
screen("home");
