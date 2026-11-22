import './style.css';
import {World} from './engine/world';
import {STEP,skins} from './config';
import {draw} from './render/renderer';
import {preview} from './render/spriteCache';
import {profile,save,progress} from './storage';
import {sound} from './audio/sfx';
const el=(id:string)=>document.getElementById(id)!;
const input=el('nickname') as HTMLInputElement;input.value=profile.name;
let deathTime=0;
let selected=profile.skin,world=new World(),playing=false,last=0,acc=0,holding=false,keyBoost=false;
const keys=new Set<string>();
function skin(){preview((el('preview') as HTMLCanvasElement).getContext('2d')!,selected);el('skinname').textContent=skins[selected][0]+(selected>=profile.unlocked?' · Locked':'');el('count').textContent=String(selected+1).padStart(2,'0')+' / 12';el('play').textContent=selected>=profile.unlocked?'Unlock at '+((selected-3)*300)+' length':(el('state').textContent==='ROUND OVER'?'Play again':'Enter arena');(el('play') as HTMLButtonElement).disabled=selected>=profile.unlocked}
el('prev').onclick=()=>{selected=(selected+11)%12;skin()};el('next').onclick=()=>{selected=(selected+1)%12;skin()};
function mute(){el('mute').innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="'+(profile.mute?'m16 9 6 6m0-6-6 6':'M15 8q5 4 0 8m3-11q8 7 0 14')+'"/></svg>';el('mute').setAttribute('aria-pressed',String(profile.mute))}
el('mute').onclick=()=>{profile.mute=!profile.mute;save();mute()};
function hud(){const rows=el('rows');rows.replaceChildren();world.ranking.slice(0,10).forEach((s,i)=>{const row=document.createElement('div');row.className='row'+(!s.id?' me':'');row.innerHTML='<i></i><b></b><span></span><span></span>';row.children[0].textContent=String(i+1).padStart(2,'0');(row.children[1] as HTMLElement).style.background=skins[s.skin][1];row.children[2].textContent=s.name;row.children[3].textContent=Math.floor(s.mass).toLocaleString();rows.append(row)});el('hud').textContent=Math.floor(world.player.mass)+' length · '+world.player.kills+' kills · #'+(world.ranking.indexOf(world.player)+1)}
el('play').onclick=()=>{profile.name=input.value.trim()||'Player';profile.skin=selected;save();world=new World();world.player.a=world.player.aim=0;input.blur();el('scores').parentElement!.classList.remove('expanded');el('scores').setAttribute('aria-expanded',String(!matchMedia('(pointer:coarse)').matches));acc=0;playing=true;holding=false;keyBoost=false;keys.clear();document.body.classList.add('playing');sound('play');hud()};
input.onkeydown=e=>{if(e.key==='Enter')el('play').click()};
function steer(x:number,y:number){if(playing)world.player.aim=Math.atan2(y,x)}
const arena=el('arena');arena.onpointermove=e=>{if(e.pointerType==='mouse')steer(e.clientX-innerWidth/2,e.clientY-innerHeight/2)};arena.onpointerdown=e=>{if(e.button===0&&e.pointerType==='mouse')holding=true};let boostId=-1;
window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);
function release(e:PointerEvent){if(e.pointerType==='mouse'||e.pointerId===boostId){holding=false;boostId=-1}}
onblur=()=>{holding=false;keyBoost=false;keys.clear()};
onkeydown=e=>{if(!playing)return;if(['Space','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code)};onkeyup=e=>{keys.delete(e.code)};
const stick=el('stick'),knob=stick.firstElementChild as HTMLElement;
let steeringId=-1,originX=0,originY=0;
function aimTouch(e:PointerEvent){if(e.pointerId!==steeringId)return;const dx=e.clientX-originX,dy=e.clientY-originY,d=Math.hypot(dx,dy);if(d<3)return;steer(dx,dy);const k=Math.min(1,23/d);knob.style.transform='translate('+dx*k+'px,'+dy*k+'px)'}
for(const surface of [arena,stick]){
 surface.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||steeringId!==-1)return;steeringId=e.pointerId;const r=stick.getBoundingClientRect();originX=surface===stick?r.left+r.width/2:e.clientX;originY=surface===stick?r.top+r.height/2:e.clientY;surface.setPointerCapture(e.pointerId);aimTouch(e)});
 surface.addEventListener('pointermove',aimTouch);
 surface.addEventListener('lostpointercapture',e=>{if(e.pointerId===steeringId){steeringId=-1;knob.style.transform=''}})
}
el('boost').onpointerdown=e=>{boostId=e.pointerId;el('boost').setPointerCapture(e.pointerId);holding=true};
el('scores').onclick=()=>{const toggled=el('scores').parentElement!.classList.toggle('expanded');const expanded=matchMedia('(pointer:coarse)').matches?toggled:!toggled;el('scores').setAttribute('aria-expanded',String(expanded))};
function frame(now:number){acc+=Math.min(.08,(now-last)/1000);last=now;while(acc>=STEP){acc-=STEP;if(playing&&world.player.dead&&(deathTime+=STEP)<.45){world.shake*=.9;for(const p of world.particles){p.x+=p.dx*STEP;p.y+=p.dy*STEP}continue}if(playing){const x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),y=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));if(x||y)steer(x,y);const boost=holding||keys.has('Space')||keys.has('ShiftLeft')||keys.has('ShiftRight');if(boost&&!keyBoost&&world.player.mass>=35)sound('boost');keyBoost=boost;world.player.boost=boost;world.update();if(world.tick%12===0)hud();if(world.player.dead&&deathTime===0){deathTime=STEP;continue}if(world.player.dead){deathTime=0;progress(world.player.mass);playing=false;document.body.classList.remove('playing');el('state').textContent='ROUND OVER';el('title').textContent='Round over.';el('intro').textContent='Length '+Math.floor(world.player.mass)+'　·　'+world.player.kills+' kills　·　Best '+profile.best;skin();el('play').textContent='Play again'}}}
 el('notice').textContent=playing&&world.noticeTime>0?world.notice:'';if(playing)draw(world,true,acc/STEP,now/1000);requestAnimationFrame(frame)}
skin();mute();hud();requestAnimationFrame(frame);
