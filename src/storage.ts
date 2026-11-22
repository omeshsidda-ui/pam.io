const defaults = {
  name: "",
  skin: 0,
  best: 0,
  kills: 0,
  mute: false,
  unlocked: 4,
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
export function save() {
  try {
    localStorage.setItem("pam.profile", JSON.stringify(profile));
  } catch {}
}
export function progress(score: number) {
  profile.best = Math.max(profile.best, Math.floor(score));
  profile.unlocked = Math.min(
    12,
    Math.max(
      profile.unlocked,
      4 + Math.floor(profile.best / 300),
      4 + Math.floor(profile.kills / 3),
    ),
  );
  save();
}
