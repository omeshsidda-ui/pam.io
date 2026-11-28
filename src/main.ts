import "./style.css";
import { World } from "./engine/world";
import { STEP, CHARGE_SECONDS, BASIC_SKIN_COUNT, skins } from "./config";
import { draw } from "./render/renderer";
import { profile, save, progress } from "./storage";
import { sound } from "./audio/sfx";
import { el, screen, animateMenu } from "./ui";
const input = el("nickname") as HTMLInputElement;
input.value = profile.name;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const endingSeconds = 1.05;
const portrait = matchMedia("(pointer:coarse) and (orientation:portrait)");
let world = new World(true),
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
  if (bossPanel.hidden !== !trap) bossPanel.hidden = !trap;
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
const leaderboardRows = el("rows");
const scoreFormat = new Intl.NumberFormat();
function updateText(node: Element, text: string) {
  if (node.textContent !== text) node.textContent = text;
}
function hud() {
  let count = 0;
  function row(i: number) {
    const s = world.ranking[i];
    let node = leaderboardRows.children[count++];
    if (!node) {
      node = document.createElement("div");
      node.append(
        document.createElement("i"),
        document.createElement("span"),
        document.createElement("span"),
      );
      leaderboardRows.append(node);
    }
    const name = s.id ? "row" : "row me";
    if (node.className !== name) node.className = name;
    updateText(node.children[0], i === 0 ? "♛" : String(i + 1));
    updateText(node.children[1], s.name);
    updateText(node.children[2], scoreFormat.format(Math.floor(s.mass)));
  }
  for (let i = 0; i < Math.min(10, world.ranking.length); i++) row(i);
  const me = world.ranking.indexOf(world.player);
  if (me >= 10) row(me);
  while (leaderboardRows.children.length > count)
    leaderboardRows.lastElementChild!.remove();
  updateText(el("hud"), scoreFormat.format(Math.floor(world.player.mass)));
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
  document.body.classList.remove("round-ending");
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
  el("boost").classList.remove("boosting");
  chargeHUD();
  sound("play");
  hud();
}
function finish() {
  playing = false;
  profile.recentDifficulty = world.difficulty.nextRound(
    world.tick,
    bestRank,
    world.player.kills,
  );
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
  boostId = -1;
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
const boostButton = el("boost");
for (const name of ["contextmenu", "selectstart", "dblclick"]) {
  document.addEventListener(name, (e) => {
    if (playing) e.preventDefault();
  });
}
// Claim the touch before the browser recognizes a double-tap gesture.
for (const event of ["touchstart", "touchend"] as const) {
  boostButton.addEventListener(event, (e) => e.preventDefault(), { passive: false });
}
boostButton.addEventListener("lostpointercapture", release);
boostButton.onpointerdown = (e) => {
  if (!playing || portrait.matches || boostId !== -1 || e.button !== 0) return;
  e.preventDefault();
  boostId = e.pointerId;
  boostButton.setPointerCapture(e.pointerId);
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
    if (deathTime >= (reducedMotion.matches ? 0.35 : endingSeconds)) finish();
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
  world.player.boost = boost;
  world.update();
  const activeBoost = world.player.boost && !world.player.dead;
  if (activeBoost && !keyBoost) sound("boost");
  keyBoost = activeBoost;
  el("boost").classList.toggle("boosting", activeBoost);
  if (world.player.dead) document.body.classList.add("round-ending");
  chargeHUD();
  rank();
  if (
    Math.floor(peakScore / 300) + BASIC_SKIN_COUNT > profile.unlocked &&
    profile.unlocked < skins.length
  )
    progress(peakScore);
  if (world.tick % 10 === 0) hud();
}
function frame(now: number) {
  const dt = last ? Math.min(0.08, (now - last) / 1000) : STEP;
  last = now;
  if (!portrait.matches) {
    const menu = !playing && document.body.dataset.screen !== "results";
    if (menu && !world.spectator) {
      world = new World(true);
      acc = 0;
    }
    if (playing || (menu && document.body.dataset.screen === "home" && !reducedMotion.matches)) {
      acc += dt;
      while ((playing || menu) && acc >= STEP) {
        acc -= STEP;
        if (menu) world.update();
        else step();
      }
    }
    const pullback = reducedMotion.matches
      ? 0
      : Math.min(1, deathTime / endingSeconds);
    draw(world, acc / STEP, now / 1000, menu ? 0 : pullback);
    if (!playing) animateMenu(now * 0.0015);
  }
  if (profile.unlocked > unlocked) {
    unlocked = profile.unlocked;
    toastUntil = now + 2400;
    el("toast").textContent = "Skin unlocked!";
  }
  if (toastUntil && now > toastUntil) {
    el("toast").textContent = "";
    toastUntil = 0;
  }
  const notice = playing && world.noticeTime > 0 ? world.notice : "";
  if (el("notice").textContent !== notice) el("notice").textContent = notice;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
