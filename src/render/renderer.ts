import {R,skins,angleDiff} from '../config';
import type {World} from '../engine/world';
import {width} from '../engine/physics';
import {beads,orbs,crown,face} from './spriteCache';
const canvas=document.querySelector<HTMLCanvasElement>('#arena')!,c=canvas.getContext('2d')!,map=document.querySelector<HTMLCanvasElement>('#map')!.getContext('2d')!;
const tile=document.createElement('canvas');tile.width=84;tile.height=48;const t=tile.getContext('2d')!;t.strokeStyle='#272931';t.lineWidth=1;
for(let j=-2;j<4;j++)for(let i=-2;i<4;i++){let x=i*42,y=j*48+(i%2)*24;t.beginPath();for(let k=0;k<=6;k++){let a=k*Math.PI/3;t.lineTo(x+28*Math.cos(a),y+24/Math.sin(Math.PI/3)*Math.sin(a))}t.stroke()}
const pattern=c.createPattern(tile,'repeat')!;let w=0,h=0,zoom=1,cx=0,cy=0;
const stars=Array.from({length:180},(_,i)=>({x:((i*0.61803399)%1),y:((Math.sin(i*843.7)*92832)%1+1)%1,c:i%12,r:11+i%15}));
function demoSkin(x:number,y:number,skin:number,scale:number,rotate:number,name:string,time:number){
 c.save();c.translate(x,y);c.rotate(rotate);c.scale(scale,scale);let hx=0,hy=0,a=0;
 for(let i=0;i<=62;i++){let u=i/62,px=(u-.5)*290+25*Math.sin(u*8+time*.13),py=Math.sin(u*(6.1+skin*.23)+time*.13+skin*.65)*52,r=(8+13*Math.min(1,u*4))*(.99+.03*Math.cos(i));c.drawImage(beads[skin][Math.floor(i/4)%2],px-r,py-r,r*2,r*2);if(i===62){a=Math.atan2(py-hy,px-hx);face(c,px,py,a,r)}hx=px;hy=py}c.translate(hx,hy);c.rotate(-rotate);c.fillStyle='#d3d2deb0';c.font='bold 11px monospace';c.textAlign='center';c.fillText(name,0,-31);c.restore()}
export function draw(world:World,playing:boolean,f:number,time:number){
 const dpr=Math.min(devicePixelRatio,2);if(w!==innerWidth||h!==innerHeight||canvas.width!==Math.round(innerWidth*dpr)){w=innerWidth;h=innerHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
 c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#111219';c.fillRect(0,0,w,h);c.save();
 if(playing){const s=world.player;zoom+=(Math.max(.53,1.08-Math.log1p(s.mass/200)*.16)-zoom)*.035;cx=s.old[0].x+(s.x-s.old[0].x)*f;cy=s.old[0].y+(s.y-s.old[0].y)*f;c.translate(w/2+(Math.random()-.5)*world.shake,h/2+(Math.random()-.5)*world.shake);c.scale(zoom,zoom);c.translate(-cx,-cy)}
 const left=playing?cx-w/(2*zoom):0,top=playing?cy-h/(2*zoom):0,vw=playing?w/zoom:w,vh=playing?h/zoom:h;
 c.fillStyle=pattern;c.fillRect(left-10,top-10,vw+20,vh+20);
 if(!playing){for(const p of stars)c.drawImage(orbs[p.c],p.x*w-p.r,p.y*h-p.r,p.r*2,p.r*2);
 const sc=Math.min(1.24,Math.max(.64,w/1150));demoSkin(w*.16,h*.32,4,sc,-.44,'GhostByte',time);demoSkin(w*.81,h*.65,2,sc,-.83,'Orbit',time);demoSkin(w*.19,h*.77,1,sc*.95,-.7,'Mochi',time);demoSkin(w*.64,h*.10,0,sc*.9,.35,'PixelPilot',time);demoSkin(w*.57,h*1.04,3,sc,.18,'Blaze',time)
 }else{const visible=(x:number,y:number)=>x>left-55&&x<left+vw+55&&y>top-55&&y<top+vh+55;
 c.beginPath();c.arc(0,0,R,0,7);c.strokeStyle='#ff4558';c.lineWidth=12;c.stroke();
 for(const p of world.food){if(!visible(p.x,p.y))continue;const r=p.loot?24+3*Math.sin(time*5+p.x):17;c.drawImage(orbs[p.c],p.x-r,p.y-r,r*2,r*2)}
 const tr=world.trap;if(tr){c.beginPath();c.arc(tr.x,tr.y,140,0,7);c.fillStyle='#78ffff22';c.fill();c.strokeStyle='#69faff';c.lineWidth=4;c.stroke();c.beginPath();c.arc(tr.x,tr.y,130,-Math.PI/2,-Math.PI/2+6.28*tr.charge/2.5);c.lineWidth=10;c.stroke();c.fillStyle='white';c.textAlign='center';c.fillText('HOLD TO CHARGE',tr.x,tr.y)}
 for(const s of world.snakes){if(s.dead)continue;const r=width(s);for(let i=s.body.length-1;i>=0;i--){const pt=s.body[i],old=s.old[i],x=old.x+(pt.x-old.x)*f,y=old.y+(pt.y-old.y)*f;if(!visible(x,y))continue;const rr=r*Math.min(1,.48+(s.body.length-i)*.085);c.drawImage(beads[s.skin][Math.floor(i/3)%2],x-rr,y-rr,2*rr,2*rr);if(!i){face(c,x,y,s.prevA+angleDiff(s.a,s.prevA)*f,r);c.fillStyle='#e2e3ed';c.font='bold 12px Arial';c.textAlign='center';c.fillText(s.name,x,y-r-9);if(world.ranking[0]===s)c.drawImage(crown,x-13,y-r-47,26,26)}}}
 for(const p of world.particles){if(!visible(p.x,p.y))continue;c.fillStyle=p.color;c.globalAlpha=Math.min(1,p.life*2);if(p.label)c.fillText(p.label,p.x,p.y);else c.fillRect(p.x,p.y,4,4)}c.globalAlpha=1}
 c.restore();const lead=world.ranking[0];if(playing&&lead&&lead!==world.player){const dx=(lead.x-cx)*zoom,dy=(lead.y-cy)*zoom,k=Math.min((w*.5-38)/Math.max(1,Math.abs(dx)),(h*.5-85)/Math.max(1,Math.abs(dy)));if(k<1)c.drawImage(crown,w/2+dx*k-14,h/2+dy*k-14,28,28)}
 if(!playing||world.tick%4===0){map.clearRect(0,0,160,160);map.beginPath();map.arc(80,80,73,0,7);map.fillStyle='#101517';map.fill();map.strokeStyle='#484e51';map.stroke();map.save();map.clip();map.strokeStyle='#242c30';for(let n=0;n<160;n+=20){map.beginPath();map.moveTo(n,0);map.lineTo(n,160);map.moveTo(0,n);map.lineTo(160,n);map.stroke()}for(const s of world.snakes){map.fillStyle=s.id?skins[s.skin][1]:'#cdff49';map.beginPath();map.arc(80+s.x/R*73,80+s.y/R*73,s.id?1.8:4,0,7);map.fill();if(s===lead)map.drawImage(crown,72+s.x/R*73,71+s.y/R*73,16,16)}if(world.trap){map.strokeStyle='cyan';map.strokeRect(77+world.trap.x/R*73,77+world.trap.y/R*73,6,6)}map.restore()}
}

