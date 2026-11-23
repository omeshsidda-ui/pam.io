import { profile } from "../storage";
let ctx: AudioContext | undefined;
let airflow: AudioBuffer | undefined;
function boostSound(audio: AudioContext) {
  if (!airflow) {
    airflow = audio.createBuffer(
      1,
      Math.ceil(audio.sampleRate * 0.16),
      audio.sampleRate,
    );
    const samples = airflow.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }
  const t = audio.currentTime,
    source = audio.createBufferSource(),
    filter = audio.createBiquadFilter(),
    volume = audio.createGain();
  source.buffer = airflow;
  filter.type = "bandpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(750, t);
  filter.frequency.exponentialRampToValueAtTime(2200, t + 0.15);
  volume.gain.setValueAtTime(0.001, t);
  volume.gain.exponentialRampToValueAtTime(0.15, t + 0.024);
  volume.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  source.connect(filter).connect(volume).connect(audio.destination);
  source.start(t);
}
export function sound(type: "eat" | "boost" | "kill" | "boss" | "play") {
  if (profile.mute) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    if (type === "boost") {
      boostSound(ctx);
      return;
    }
    const o = ctx.createOscillator(),
      g = ctx.createGain(),
      t = ctx.currentTime;
    o.type = type === "boss" ? "sawtooth" : "sine";
    const f = { eat: 630, kill: 330, boss: 95, play: 430 }[type];
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(
      type === "eat" || type === "play" ? f * 1.6 : f * 0.3,
      t + 0.16,
    );
    g.gain.setValueAtTime(0.045, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(t + 0.19);
  } catch {}
}
