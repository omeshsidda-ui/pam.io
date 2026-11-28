import { BASIC_SKIN_COUNT, skins } from "./config";

const defaults = {
  name: "",
  appearance: "system",
  skin: 0,
  best: 0,
  kills: 0,
  mute: false,
  unlocked: BASIC_SKIN_COUNT,
  hand: "Right handed",
  control: "Joystick",
  bestKills: 0,
  bestRank: 0,
  recentDifficulty: .45,
};
export const profile = { ...defaults };
try {
  Object.assign(
    profile,
    JSON.parse(localStorage.getItem("pam.profile") || "{}"),
  );
} catch {}
if (!Number.isInteger(profile.skin) || profile.skin < 0 || profile.skin >= skins.length)
  profile.skin = defaults.skin;
if (!Number.isInteger(profile.unlocked) || profile.unlocked < BASIC_SKIN_COUNT)
  profile.unlocked = BASIC_SKIN_COUNT;
if (profile.unlocked > skins.length) profile.unlocked = skins.length;

export function save() {
  try {
    localStorage.setItem("pam.profile", JSON.stringify(profile));
  } catch {}
}
export function progress(score: number) {
  profile.best = Math.max(profile.best, Math.floor(score));
  profile.unlocked = Math.min(
    skins.length,
    Math.max(
      profile.unlocked,
      BASIC_SKIN_COUNT + Math.floor(profile.best / 300),
      BASIC_SKIN_COUNT + Math.floor(profile.kills / 3),
    ),
  );
  save();
}
