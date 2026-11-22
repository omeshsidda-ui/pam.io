import {skins} from '../config';
function sprite(n:number,paint:(c:CanvasRenderingContext2D)=>void){const el=document.createElement('canvas');el.width=el.height=n;paint(el.getContext('2d')!);return el}
export const beads=skins.map((skin)=>[0,1].map(band=>sprite(80,c=>{
 const tone=c.createLinearGradient(0,0,0,80);
 tone.addColorStop(0,skin[1]);tone.addColorStop(band?.32:.75,skin[1]);tone.addColorStop(1,skin[2]);
 c.fillStyle=tone;c.beginPath();c.arc(40,40,39,0,Math.PI*2);c.fill();
})));
export const orbs=skins.map(s=>sprite(64,c=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'white');g.addColorStop(.12,s[1]);g.addColorStop(.22,s[1]);g.addColorStop(.27,s[2]+'a0');g.addColorStop(.45,s[2]+'36');g.addColorStop(1,s[2]+'00');c.fillStyle=g;c.fillRect(0,0,64,64)}));
export const eye=sprite(48,c=>{c.fillStyle='white';c.beginPath();c.ellipse(24,24,21,17,0,0,7);c.fill();c.fillStyle='#131520';c.beginPath();c.arc(31,24,10,0,7);c.fill();c.fillStyle='white';c.fillRect(32,19,4,4)});
export const crown=sprite(64,c=>{c.fillStyle='#ffd85c';c.beginPath();c.moveTo(6,19);c.lineTo(20,29);c.lineTo(32,9);c.lineTo(45,29);c.lineTo(58,19);c.lineTo(52,47);c.lineTo(12,47);c.fill()});
export function face(c:CanvasRenderingContext2D,x:number,y:number,a:number,r:number){c.save();c.translate(x,y);c.rotate(a);for(const sign of [-1,1])c.drawImage(eye,0,sign*r*.49-r*.35,r*.92,r*.74);c.restore()}
export function preview(c:CanvasRenderingContext2D,skin:number){
 c.clearRect(0,0,800,490);
 const [ ,light,dark]=skins[skin];
 // Draw overlapping rounded segments along a continuous cubic curve.
 const curves=[[100,349,55,240,168,108,250,167],[250,167,340,234,180,370,322,377],[322,377,474,386,350,105,465,98],[465,98,601,80,488,344,665,246]];
 let i=0;
 for(const [ax,ay,bx,by,cx,cy,dx,dy] of curves)for(let j=0;j<=85;j++,i++){
 const t=j/85,u=1-t,x=u*u*u*ax+3*u*u*t*bx+3*u*t*t*cx+t*t*t*dx,y=u*u*u*ay+3*u*u*t*by+3*u*t*t*cy+t*t*t*dy;
 const a=Math.atan2(u*u*(by-ay)+2*u*t*(cy-by)+t*t*(dy-cy),u*u*(bx-ax)+2*u*t*(cx-bx)+t*t*(dx-cx));
 const r=Math.min(32,4+i*.55);
 c.fillStyle=i%19<3?dark:light;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
 if(i===343)face(c,x,y,a,r);
 }
 for(const [x,y,r] of [[123,118,5],[382,205,4],[707,212,8],[732,196,5],[675,370,4]]){c.fillStyle=light;c.globalAlpha=.72;c.beginPath();c.arc(x,y,r,0,7);c.fill()}c.globalAlpha=1;
}
