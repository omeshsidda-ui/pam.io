import "./style.css";
import { World } from "./engine/world";
import { STEP, CHARGE_SECONDS } from "./config";
import { draw } from "./render/renderer";
import { profile, save, progress } from "./storage";
import { sound } from "./audio/sfx";
import { el, screen, animateMenu } from "./ui";
const input = el("nickname") as HTMLInputElement;
input.value = profile.name;
const portrait = matchMedia("(pointer:coarse) and (orientation:portrait)");
let world = new World(),
  playing = false,
  last = 0,
  acc = 0,
  holding = false,
  keyBoost = false,
  deathTime = 0;
let bestRank = 0,
  peakScore = 0,
  oldBest = 0,
  unlocked = profile.unlocked,
  toastUntil = 0;
const keys = new Set<string>();
function rank() {
  const pos = world.ranking.indexOf(world.player) + 1;
  if (pos > 0) bestRank = Math.min(bestRank || pos, pos);
  peakScore = Math.max(peakScore, Math.floor(world.player.mass));
}
const bossPanel = el("boss");
const chargeBar = bossPanel.querySelector("div")!;
const segments = Array.from(chargeBar.querySelectorAll("i"));
function chargeHUD() {
  const trap = world.trap;
  bossPanel.hidden = !trap;
  if (!trap) return;
  const fraction = Math.min(1, trap.charge / CHARGE_SECONDS);
  chargeBar.setAttribute("aria-valuenow", String(Math.round(100 * fraction)));
  el("charge-label").textContent =
    fraction > 0
      ? "Charging · " + Math.floor(100 * fraction) + "%"
      : "Find the bolt circle";
  segments.forEach((seg, i) =>
    seg.style.setProperty(
      "--fill",
      String(Math.max(0, Math.min(1, 3 * fraction - i))),
    ),
  );
}
function hud() {
  const rows = el("rows");
  rows.replaceChildren();
  function row(i: number) {
    const s = world.ranking[i];
    if (!s) return;
    const node = document.createElement("div");
    node.className = "row" + (s.id ? "" : " me");
    const place = document.createElement("i"),
      name = document.createElement("span"),
      value = document.createElement("span");
    place.textContent = i === 0 ? "♛" : String(i + 1);
    name.textContent = s.name;
    value.textContent = Math.floor(s.mass).toLocaleString();
    node.append(place, name, value);
    rows.append(node);
  }
  for (let i = 0; i < Math.min(10, world.ranking.length); i++) row(i);
  const me = world.ranking.indexOf(world.player);
  if (me >= 10) row(me);
  el("hud").textContent = Math.floor(world.player.mass).toLocaleString();
}
function start() {
  if (portrait.matches) return;
  profile.name = input.value.trim() || "Player";
  save();
  world = new World();
  oldBest = profile.best;
  bestRank = 0;
  peakScore = 0;
  deathTime = 0;
  playing = true;
  holding = false;
  keyBoost = false;
  keys.clear();
  input.blur();
  acc = 0;
  rank();
  screen("game");
  el("scores").setAttribute(
    "aria-expanded",
    String(!matchMedia("(pointer:coarse)").matches),
  );
  el("scores").lastElementChild!.textContent = matchMedia("(pointer:coarse)")
    .matches
    ? "⌄"
    : "⌃";
  chargeHUD();
  sound("play");
  hud();
}
function finish() {
  playing = false;
  progress(peakScore);
  profile.bestKills = Math.max(profile.bestKills, world.player.kills);
  profile.bestRank = Math.min(profile.bestRank || bestRank, bestRank);
  save();
  el("result-title").textContent =
    peakScore > oldBest ? "New best!" : "Game over";
  el("death-cause").textContent = world.deathCause;
  el("stats").replaceChildren();
  for (const values of [
    ["Score", peakScore, profile.best],
    ["Kills", world.player.kills, profile.bestKills],
    ["Top position", "#" + bestRank, "#" + profile.bestRank],
  ]) {
    const tr = document.createElement("tr");
    for (const value of values) {
      const td = document.createElement("td");
      td.textContent = value.toLocaleString();
      tr.append(td);
    }
    el("stats").append(tr);
  }
  screen("results");
}
el("play").onclick = el("again").onclick = start;
input.onkeydown = (e) => {
  if (e.key === "Enter") start();
};
function steer(x: number, y: number) {
  if (playing && !portrait.matches) world.player.aim = Math.atan2(y, x);
}
const arena = el("arena");
arena.onpointermove = (e) => {
  if (e.pointerType === "mouse")
    steer(e.clientX - innerWidth / 2, e.clientY - innerHeight / 2);
};
arena.onpointerdown = (e) => {
  if (e.button === 0 && e.pointerType === "mouse") holding = true;
};
let boostId = -1;
window.addEventListener("pointerup", release);
window.addEventListener("pointercancel", release);
function release(e: PointerEvent) {
  if (e.pointerType === "mouse" || e.pointerId === boostId) {
    holding = false;
    boostId = -1;
  }
}
onblur = () => {
  holding = false;
  keyBoost = false;
  keys.clear();
};
onkeydown = (e) => {
  if (!playing || portrait.matches) return;
  if (
    [
      "Space",
      "ShiftLeft",
      "ShiftRight",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
    ].includes(e.code)
  )
    e.preventDefault();
  keys.add(e.code);
};
onkeyup = (e) => {
  keys.delete(e.code);
};
const stick = el("stick"),
  knob = stick.firstElementChild as HTMLElement;
let steeringId = -1,
  originX = 0,
  originY = 0;
function aimTouch(e: PointerEvent) {
  if (e.pointerId !== steeringId) return;
  const follow = profile.control === "Follow";
  const dx = e.clientX - (follow ? innerWidth / 2 : originX),
    dy = e.clientY - (follow ? innerHeight / 2 : originY),
    d = Math.hypot(dx, dy);
  if (d < 3) return;
  steer(dx, dy);
  const k = Math.min(1, 23 / d);
  knob.style.transform =
    "translate(" +
    dx * k +
    "px," +
    dy * k +
    "px) rotate(" +
    (profile.control === "Arrow" ? Math.atan2(dy, dx) : 0) +
    "rad)";
}
for (const surface of [arena, stick]) {
  surface.addEventListener("pointerdown", (e) => {
    if (
      !playing ||
      portrait.matches ||
      e.pointerType === "mouse" ||
      steeringId !== -1
    )
      return;
    steeringId = e.pointerId;
    const r = stick.getBoundingClientRect();
    originX = surface === stick ? r.left + r.width / 2 : e.clientX;
    originY = surface === stick ? r.top + r.height / 2 : e.clientY;
    surface.setPointerCapture(e.pointerId);
    aimTouch(e);
  });
  surface.addEventListener("pointermove", aimTouch);
  surface.addEventListener("lostpointercapture", (e) => {
    if (e.pointerId === steeringId) {
      steeringId = -1;
      knob.style.transform = "";
    }
  });
}
el("boost").onpointerdown = (e) => {
  boostId = e.pointerId;
  el("boost").setPointerCapture(e.pointerId);
  holding = true;
};
el("scores").onclick = () => {
  const btn = el("scores"),
    open = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!open));
  btn.lastElementChild!.textContent = open ? "⌄" : "⌃";
};
function orientation() {
  for (const section of document.querySelectorAll<HTMLElement>(".screen"))
    section.inert = portrait.matches;
  holding = false;
  keyBoost = false;
  steeringId = -1;
  boostId = -1;
  knob.style.transform = "";
  keys.clear();
  acc = 0;
}
portrait.addEventListener("change", orientation);
orientation();
function step() {
  if (world.player.dead) {
    deathTime += STEP;
    world.shake *= 0.9;
    for (const p of world.particles) {
      p.x += p.dx * STEP;
      p.y += p.dy * STEP;
      p.life -= STEP;
    }
    if (deathTime >= 0.8) finish();
    return;
  }
  const x =
      Number(keys.has("KeyD") || keys.has("ArrowRight")) -
      Number(keys.has("KeyA") || keys.has("ArrowLeft")),
    y =
      Number(keys.has("KeyS") || keys.has("ArrowDown")) -
      Number(keys.has("KeyW") || keys.has("ArrowUp"));
  if (x || y) steer(x, y);
  const boost =
    holding ||
    keys.has("Space") ||
    keys.has("ShiftLeft") ||
    keys.has("ShiftRight");
  if (boost && !keyBoost && world.player.mass >= 35) sound("boost");
  keyBoost = boost;
  world.player.boost = boost;
  world.update();
  chargeHUD();
  rank();
  if (
    Math.floor(peakScore / 300) + 4 > profile.unlocked &&
    profile.unlocked < 12
  )
    progress(peakScore);
  if (world.tick % 10 === 0) hud();
}
function frame(now: number) {
  const dt = Math.min(0.08, (now - last) / 1000);
  last = now;
  if (!portrait.matches) {
    if (playing) {
      acc += dt;
      while (playing && acc >= STEP) {
        acc -= STEP;
        step();
      }
    }
    draw(world, playing, acc / STEP, now / 1000);
    if (!playing) animateMenu(now * 0.0015);
  }
  if (profile.unlocked > unlocked) {
    unlocked = profile.unlocked;
    toastUntil = now + 2400;
    el("toast").textContent = "Skin unlocked!";
  }
  if (now > toastUntil) el("toast").textContent = "";
  el("notice").textContent =
    playing && world.noticeTime > 0 ? world.notice : "";
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
