import {angleDiff,BOOST,SPEED,STEP} from '../config';
import type {Snake} from '../types';
export const width=(s:Snake)=>Math.min(38,9+2.6*Math.log1p(s.mass/18));
export function move(s:Snake){
 const w=width(s),n=Math.min(280,Math.floor(12+s.mass/5));
 while(s.body.length<n){const tail=s.body.at(-1)??s;s.body.push({x:tail.x,y:tail.y});s.old.push({x:tail.x,y:tail.y})}
 s.body.length=s.old.length=n;
 s.body.forEach((p,i)=>{s.old[i].x=p.x;s.old[i].y=p.y});
 s.prevA=s.a;s.a+=Math.max(-1,Math.min(1,angleDiff(s.aim,s.a)/(STEP*4.8*15/w)))*STEP*4.8*15/w;
 if(s.mass<35)s.boost=false;
 const d=SPEED*STEP*(s.boost?BOOST:1);s.x+=Math.cos(s.a)*d;s.y+=Math.sin(s.a)*d;
 s.body[0].x=s.x;s.body[0].y=s.y;
 for(let i=1;i<n;i++){const p=s.body[i],q=s.body[i-1],dx=p.x-q.x,dy=p.y-q.y,len=Math.hypot(dx,dy);if(len>w*.64){p.x=q.x+dx*w*.64/len;p.y=q.y+dy*w*.64/len}}
}
