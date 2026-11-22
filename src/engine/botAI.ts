import {R,rand,SECTORS,angleDiff} from '../config';
import type {Snake,Pellet,Segment} from '../types';
import type {Grid} from './spatialGrid';
export function decide(s:Snake,food:Grid<Pellet>,body:Grid<Segment>,leader:Snake){
 const open=new Float32Array(SECTORS).fill(220),value=new Float32Array(SECTORS);
 const sector=(a:number)=>(Math.round(a*SECTORS/(2*Math.PI))+SECTORS)%SECTORS;
 let prey:Snake|undefined,loot=false;
 body.near(s.x,s.y,400,p=>{if(p.s===s)return;const dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy),i=sector(Math.atan2(dy,dx));open[i]=Math.min(open[i],d);if(p.i===0&&d<380&&p.s.mass<s.mass*.92)prey=p.s});
 food.near(s.x,s.y,380,p=>{const dx=p.x-s.x,dy=p.y-s.y;value[sector(Math.atan2(dy,dx))]+=p.v/(45+Math.hypot(dx,dy));if(p.loot&&Math.hypot(dx,dy)<260)loot=true});
 let best=-Infinity;s.boost=false;
 let goal=s.a;
 if(s.boss)prey=leader;
 if(prey&&(s.boss||[0,2,4].includes(s.role))){const offset=s.role===2?1:0;goal=Math.atan2(prey.y+Math.sin(prey.a+offset)*115-s.y,prey.x+Math.cos(prey.a+offset)*115-s.x);s.boost=s.role!==2}
 else if(loot&&(s.role===1||s.role===4))s.boost=true;
 for(let i=0;i<SECTORS;i++){const a=i*2*Math.PI/SECTORS;if(Math.hypot(s.x+Math.cos(a)*165,s.y+Math.sin(a)*165)>R-35)open[i]=0}
 for(let i=0;i<SECTORS;i++){const a=i*2*Math.PI/SECTORS,margin=s.role===3?145:s.boost?75:105;const clear=Math.min(open[i],open[(i+19)%20]+28,open[(i+1)%20]+28);
 const score=Math.min(0,clear-margin)*.14+Math.cos(angleDiff(a,goal))*(prey?2:.5)+Math.cos(a-s.a)*.6+value[i]*8+Math.random()*.18;
 if(score>best){best=score;s.aim=a+rand(-.09,.09)}}
 if(best<-3)s.boost=true;s.think=rand(.12,.24)
}
