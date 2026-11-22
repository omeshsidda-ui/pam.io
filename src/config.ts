export const R=3200, FOOD=1100, BOTS=32, STEP=1/60, SPEED=147, BOOST=1.75, SECTORS=20;
export const skins=[
 ['Viper','#c4ff38','#65a900'],['Bubblegum','#ff66cf','#d12279'],['Glacier','#76efff','#0088bb'],['Inferno','#ff9152','#ee3b12'],['Ultraviolet','#bc7dff','#6b37e4'],['Bumble','#ffe566','#745016'],['Lagoon','#34ffbc','#078879'],['Galaxy','#e199ff','#4e37b4'],['Dragon','#a7f679','#17805f'],['Lava','#ffcc3a','#ab2618'],['Frost','#effaff','#537ddd'],['Prism','#ff88ae','#51cfff']
];
export const names='PixelPilot NeonNoodle Mochi GhostByte Zippy LimeTime Orbit HexKid Nova Slippy ByteMe NoodleKing DotDash Vortex Ripple Slinky NightOwl Echo JellyBean Blaze Toast Glitch Nimbus ZigZag Hydra Spark Drift Koji Loopz Kiki Rook Mango'.split(' ');
export const rand=(a:number,b:number)=>a+Math.random()*(b-a);
export const angleDiff=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
