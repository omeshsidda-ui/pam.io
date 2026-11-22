import type {Point} from '../types';
export class Grid<T extends Point>{
 cells=new Map<number,T[]>();
 buckets:T[][]=[];
 clear(){for(const list of this.cells.values()){list.length=0;this.buckets.push(list)}this.cells.clear()}
 key(x:number,y:number){return (Math.floor(x/128)+64)*256+Math.floor(y/128)+64}
 add(p:T){const k=this.key(p.x,p.y),list=this.cells.get(k);if(list)list.push(p);else {const bucket=this.buckets.pop()??[];bucket.push(p);this.cells.set(k,bucket)}}
 near(x:number,y:number,r:number,visit:(p:T)=>void){for(let i=Math.floor((x-r)/128);i<=Math.floor((x+r)/128);i++)for(let j=Math.floor((y-r)/128);j<=Math.floor((y+r)/128);j++){const list=this.cells.get((i+64)*256+j+64);if(list)for(const p of list)visit(p)}}
}
