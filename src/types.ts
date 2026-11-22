export interface Point{x:number;y:number}
export interface Pellet extends Point{v:number;c:number;loot:boolean}
export interface Snake extends Point{id:number;name:string;skin:number;mass:number;a:number;prevA:number;aim:number;boost:boolean;body:Point[];old:Point[];think:number;role:number;dead:boolean;kills:number;boss:boolean}
export interface Segment extends Point{s:Snake;i:number}
export interface Particle extends Point{dx:number;dy:number;life:number;color:string;label:string}
export interface Trap extends Point{charge:number}
export interface HUD{rank:number;length:number;kills:number}
