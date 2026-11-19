const canvas=document.getElementById('arena'),ctx=canvas.getContext('2d');
let balls=[],particles=[],trails=[],waves=[],pizzas=[],pizzaWheels=[],pizzaSlices=[],cupcakes=[],projectiles=[],hooks=[],lasers=[],mangleHeads=[],prizeBalls=[],hotCheese=[],shards=[],deathSequence=false,deathTimer=0,deathResult="",paused=false,finished=false,started=false,contactPairs=new Set(),weaponClashPairs=new Set(),weaponHits=0,lastTime=0,acc=0,battleMode='duel',setupMode='duel',activeTeams={left:['freddy'],right:['foxy']},setupTeams={left:['freddy'],right:['foxy']},pausedBeforeCustomization=false;
let teamProgress={left:0,right:0};
let matchElapsed=0,suddenDeath=false,nextSuddenDeathTick=241;
let rainbow=null,lastRainbowOwner=-1,lastRainbowSpawn=null;
let recorder=null,recordChunks=[],recordCanvas=document.createElement('canvas'),recordCtx=recordCanvas.getContext('2d');recordCanvas.width=1080;recordCanvas.height=1920;
let simulationSpeed=1,limitBreaksEnabled=localStorage.getItem('bounceBattleLimitBreaks')!=='false';
const el=id=>document.getElementById(id),teamColor=team=>team==='left'?'#ff6565':'#61a9ff',opponents=b=>balls.filter(other=>other.team!==b.team&&other.hp>0),opponent=b=>{const candidates=balls.filter(other=>other.team!==b.team);return candidates.filter(other=>other.hp>0).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0]||candidates[0]||b;};

function announce(message){el('live-status').textContent=message;}
function playSound(key) {
  if (finished && key !== 'death') return;
  globalThis.BattleSounds?.play(key);
}
function makeBall(key,id,team,slot,total){const spec=CHARACTERS[key],speedScale=spec.startingSpeedScale??1,rows=Math.ceil(Math.sqrt(total)),col=Math.floor(slot/rows),row=slot%rows,teamX=team==='left'?75+col*90:405-col*90,teamY=rows===1?H/2:60+row*(H-120)/(rows-1),x=spec.boss?W-spec.radius:battleMode==='boss'&&key==='goldenfreddy'?W/2:battleMode!=='duel'?teamX:key==='goldenfreddy'?W/2:id?370:110,y=spec.boss?H/2:battleMode==='boss'&&key==='goldenfreddy'?H/2:battleMode!=='duel'?teamY:key==='goldenfreddy'?H/2:id?175:115;return {id,team,key,name:spec.name,color:spec.color,x,y,vx:key==='goldenfreddy'?0:(team==='left'?450:-450)*speedScale,vy:key==='goldenfreddy'?0:(battleMode!=='duel'?(slot%2?-186:186):id?-186:186)*speedScale,radius:spec.radius??R,startingSpeedScale:speedScale,hp:spec.hp,maxHp:spec.hp,limitDamage:spec.limitDamage,hpLost:0,springBonnieLeft:0,nextSuitAt:spec.boss?SPRING_BONNIE.damageGoal:Infinity,maxSpeed:BASE_SPEED*spec.speedCap,limitBreak:false,critChance:.1,regenTimer:0,powerDrainTimer:0,shockTimer:0,pizzaWheelTimer:0,micTossTimer:0,goldenTimer:0,endoTimer:0,endoCooldown:5,endoDamage:5,minions:[],lightTimer:0,lightHitCount:0,lightStunCount:0,powerless:false,batteryX:null,batteryY:null,stunTimer:0,stunnedVx:0,stunnedVy:0,shieldHits:0,goldenDrainTimer:0,goldenDrainInsideTargets:new Map(),dashTimer:0,roxyDashTimer:0,dashLeft:0,invincibleLeft:0,dashScale:1,dashHit:false,towed:false,pinTimer:0,pinX:0,pinY:0,pinNX:0,pinNY:0,grappled:false,grappleOwner:-1,grappleTimer:0,grappleWallPending:false,grappleWallOwner:-1,grappleWallFixedDamage:false,grappleThrowDistance:0,lastWall:null,trailTimer:0,pizzaTimer:0,pizzaSlicesEaten:0,cupcakeCooldown:4,cupcakeTimer:0,burstTimer:0,powerTimer:0,burstRemaining:0,burstWait:0,headThrowTimer:0,prizeTimer:0,cheeseTimer:0,weapon:spec.weapon?{...(key==='foxy'&&activeTeams[team==='left'?'right':'left']?.includes('nightguard')?{...spec.weapon,name:'Crowbar',damage:5}:spec.weapon),angle:id?Math.PI:0,dir:1,touchingTargets:new Set()}:null};}
function label(b){return b.name+(battleMode!=='duel'?' ('+(b.team==='left'?'Left':'Right')+')':balls.filter(other=>other.key===b.key).length>1?' ('+(b.team==='left'?'Left':'Right')+')':'');}
function syncFoxyWeapon(){const f=balls.find(b=>b.key==='foxy'&&!b.limitBreak);if(!f)return;const target=balls.find(b=>b.team!==f.team),crowbar=target?.key==='nightguard',name=crowbar?'Crowbar':'Hook';if(f.weapon&&f.weapon.name!==name){const spec=CHARACTERS.foxy.weapon;f.weapon={...spec,name,damage:crowbar?5:3,angle:f.weapon.angle,dir:f.weapon.dir,touchingTargets:new Set()};}}
function maybeFoxyNightguardLimitBreak(){if(!limitBreaksEnabled)return;const foxy=balls.find(b=>b.key==='foxy'),ng=balls.find(b=>b.key==='nightguard'&&b.team!==foxy?.team);if(foxy&&ng&&Math.random()<.05)activateLimitBreak(foxy);}
function reset(teams=activeTeams,run=true,mode=setupMode){const left=[...new Set((teams.left||[]).filter(key=>CHARACTERS[key]&&!CHARACTERS[key].boss))],right=[...new Set((teams.right||[]).filter(key=>CHARACTERS[key]&&!!CHARACTERS[key].boss===(mode==='boss')))];if(!left.length||!right.length){announce('Choose at least one fighter for each team.');return;}activeTeams={left,right};battleMode=mode;matchElapsed=0;suddenDeath=false;nextSuddenDeathTick=241;teamProgress={left:0,right:0};balls=[makeBall(left[0],0,'left',0,left.length),makeBall(right[0],1,'right',0,right.length)];particles=[];trails=[];shards=[];deathSequence=false;deathTimer=0;deathResult="";waves=[];pizzas=[];pizzaWheels=[];pizzaSlices=[];cupcakes=[];projectiles=[];hooks=[];lasers=[];mangleHeads=[];prizeBalls=[];hotCheese=[];rainbow=null;lastRainbowOwner=-1;lastRainbowSpawn=null;paused=false;finished=false;started=run;contactPairs.clear();weaponClashPairs.clear();weaponHits=0;acc=0;globalThis.BattleSounds?.stopAll();syncFoxyWeapon();maybeFoxyNightguardLimitBreak();el('result').style.display='none';announce(run?(mode==='boss'?'Boss Battle: ':mode==='teams'?'Team battle: ':'')+label(balls[0])+' vs. '+label(balls[1]):'Choose fighters, then press Start Battle.');updateUI();}
function mangleCooldowns(b){const scale=b.limitBreak?.5:1;return {head:3*scale,prize:5*scale,cheese:1.5*scale};}
function cooldownMeters(b){if(b.bossPower)return [
  {id:'dash',label:'Dash',elapsed:b.dashTimer,duration:2.5},
  {id:'burst',label:'Burst',elapsed:b.burstTimer,duration:2},
  {id:'power',label:'Soundwave',elapsed:b.powerTimer,duration:6},
  {id:'regen',label:'Regeneration',elapsed:b.regenTimer,duration:1}
];if(b.key==='purpleguy')return [springBonnieMeter(b)];if(b.key==='toychica')return [{id:'cupcake',label:'Cupcake',elapsed:b.cupcakeTimer,duration:b.cupcakeCooldown}];if(b.key==='mangle'){const c=mangleCooldowns(b);return [{id:'boomerang',label:'Head boomerang',elapsed:b.headThrowTimer,duration:c.head},{id:'prize',label:'Prize Ball',elapsed:b.prizeTimer,duration:c.prize},{id:'cheese',label:'Hot cheese',elapsed:b.cheeseTimer,duration:c.cheese}];}if(b.key==='endo')return [{id:'summon',label:'Minion spawn',elapsed:b.endoTimer,duration:b.endoCooldown}];if(b.key==='nightguard')return [{id:'light',label:b.limitBreak?'Limit Break beam':'Flashlight beam',elapsed:b.lightTimer,duration:.5},...(b.limitBreak?[{id:'shield',label:'Shield hits',elapsed:10-b.shieldHits,duration:10,slices:true}]:[])];if(isFreddyVariant(b)){const m=[b.key==='toyfreddy'?{id:'mic-toss',label:'Mic toss',elapsed:b.micTossTimer,duration:2,status:b.weapon.detached?'In flight':null}:{id:'wheel',label:'Pizza wheel',elapsed:b.pizzaWheelTimer,duration:6},{id:'shock',label:'Shockwave',elapsed:b.shockTimer,duration:6.5}];if(b.limitBreak)m.push(b.key==='toyfreddy'?{id:'wheel',label:'Pizza wheel',elapsed:b.pizzaWheelTimer,duration:1}:{id:'drain',label:'Power drain',elapsed:b.powerDrainTimer,duration:1});return m;}if(b.key==='foxy')return[{id:'dash',label:'Dash',elapsed:b.dashTimer,duration:b.limitBreak?.25:2.5}];if(b.key==='bonnie')return[{id:'burst',label:'Burst',elapsed:b.burstTimer,duration:2},{id:'power',label:b.limitBreak?'Laser':'Soundwave',elapsed:b.powerTimer,duration:b.limitBreak?3:6}];if(b.key==='chica')return[{id:'cupcake',label:'Cupcake',elapsed:b.cupcakeTimer,duration:b.cupcakeCooldown},{id:'pizza',label:'Pizza drop',elapsed:b.pizzaTimer,duration:1.5},{id:'slices',label:'Pizza slices',elapsed:b.pizzaSlicesEaten%10,duration:10,slices:true}];if(b.key==='roxy')return[{id:'lunge',label:'Lunge',elapsed:b.roxyDashTimer,duration:b.limitBreak?.2:3}];if(b.key==='goldenfreddy')return b.limitBreak?[{id:'drain',label:'Life drain',elapsed:b.goldenDrainTimer,duration:1}]:[{id:'teleport',label:'Teleport',elapsed:b.goldenTimer,duration:4}];return[];}
function updateCooldownPanel(b,accent){const panel=el('cooldown-list-'+b.id),meters=cooldownMeters(b),mode=battleMode+':'+b.key+':'+(b.limitBreak?'limit':'base');panel.style.setProperty('--meter-color',accent);if(panel.dataset.mode!==mode){panel.dataset.mode=mode;panel.innerHTML=(battleMode!=='duel'?'<span class="fighter-name">'+b.name+'</span>':'')+meters.map(m=>'<div class="cooldown-meter"><span class="cooldown-label">'+m.label+'</span><div class="cooldown-track" id="cooldown-track-'+b.id+'-'+m.id+'" role="progressbar" aria-label="'+m.label+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="cooldown-fill" id="cooldown-fill-'+b.id+'-'+m.id+'"></i></div></div>').join('');}for(const m of meters){const track=el('cooldown-track-'+b.id+'-'+m.id),fill=el('cooldown-fill-'+b.id+'-'+m.id);if(!track||!fill)continue;const progress=Math.max(0,Math.min(1,m.elapsed/m.duration)),percent=Math.round(progress*100);track.setAttribute('aria-valuenow',String(percent));track.setAttribute('aria-valuetext',m.status??(m.slices?String(m.elapsed)+' of 10 pizza slices':m.elapsed.toFixed(1)+' of '+m.duration.toFixed(1)+' seconds'));track.title=m.status??(m.slices?String(m.elapsed)+' / 10 pizza slices':m.elapsed.toFixed(1)+' / '+m.duration.toFixed(1)+' seconds');fill.style.width=percent+'%';fill.style.background=accent;}}
function buildTeamHud(){const roster=battleMode+':'+balls.map(b=>b.id+':'+b.key+':'+b.team).join('|')+'|'+teamProgress.left+':'+teamProgress.right;for(const side of ['left','right']){const host=el('team-hud-'+side);host.classList.toggle('team-active',battleMode!=='duel');if(host.dataset.roster===roster)continue;host.dataset.roster=roster;const fighters=balls.filter(b=>b.team===side).map(b=>'<div class="fighter-hud" id="fighter-hud-'+b.id+'"><div class="health-rail" id="player-'+b.id+'" role="progressbar" aria-valuemin="0"><div class="health-fill" id="bar-'+b.id+'"></div><span class="health-value" id="hp-'+b.id+'"></span></div><div class="cooldown-panel" id="cooldowns-'+b.id+'" role="group"><div class="limit-meter" id="limit-'+b.id+'"><span class="cooldown-label">Limit Break</span><progress id="limit-charge-'+b.id+'" aria-label="Limit Break damage charge"></progress><span class="limit-value" id="limit-value-'+b.id+'"></span></div><div class="cooldown-list" id="cooldown-list-'+b.id+'"></div></div></div>').join('');const queue=battleMode!=='duel'?'<div class="team-queue" aria-label="Team lineup">'+activeTeams[side].map((key,index)=>'<span class="team-queue-fighter'+(index===teamProgress[side]?' active':index<teamProgress[side]?' defeated':'')+'">'+CHARACTERS[key].name+'</span>').join('')+'</div>':'';host.innerHTML=fighters+queue;}}
function formatMatchTime(seconds){const ticks=Math.floor((Math.max(0,seconds)+1e-8)*100);return String(Math.floor(ticks/6000)).padStart(2,'0')+':'+String(Math.floor(ticks/100)%60).padStart(2,'0')+'.'+String(ticks%100).padStart(2,'0');}
function updateLimitBreakMeter(fighter) {
  const meter = el('limit-' + fighter.id);
  meter.hidden = !limitBreaksEnabled || !fighter.limitDamage;
  if (meter.hidden) return;
  const progress = el('limit-charge-' + fighter.id);
  progress.max = fighter.limitDamage;
  progress.value = limitBreakCharge(fighter);
  progress.title = limitBreakLabel(fighter);
  el('limit-value-' + fighter.id).textContent = progress.title;
}

function updateUI(){el('match-time').textContent=formatMatchTime(matchElapsed);const suddenStatus=el('sudden-death-status');suddenStatus.hidden=!suddenDeath;const suddenLabel=suddenDeath?'Sudden Death · '+suddenDeathDamage()+' damage/s':'';if(suddenStatus.textContent!==suddenLabel)suddenStatus.textContent=suddenLabel;buildTeamHud();const mirror=balls.some(b=>balls.some(other=>other.key===b.key&&other.team!==b.team));for(const b of balls){const accent=battleMode!=='duel'||mirror?teamColor(b.team):b.color,rail=el('player-'+b.id);rail.style.borderColor=accent;rail.setAttribute('aria-label',label(b)+' health');rail.setAttribute('aria-valuenow',String(b.hp));rail.setAttribute('aria-valuemax',String(b.maxHp));el('hp-'+b.id).textContent=b.hp+' HP';el('bar-'+b.id).style.height=(b.hp/b.maxHp*100)+'%';el('bar-'+b.id).style.background=accent;updateLimitBreakMeter(b);updateCooldownPanel(b,accent);}el('pause').textContent=paused?'Resume':'Pause';el('pause').disabled=!started||finished||!el('custom-panel').hidden;}
function capSpeed(b){const speed=Math.hypot(b.vx,b.vy),limit=b.maxSpeed*(b.key==='nightguard'&&b.powerless?2:1);if(speed>limit){b.vx*=limit/speed;b.vy*=limit/speed;}}
function boost(b){b.vx*=BOUNCE;b.vy*=BOUNCE;capSpeed(b);}function wallBoost(b){b.vx*=1.05;b.vy*=1.05;capSpeed(b);}
function weaponPosition(b, weapon = b.weapon) {
  if (b.key === 'nightguard' && !b.powerless) {
    const target = opponent(b);
    weapon.angle = Math.atan2(target.y-b.y,target.x-b.x);
  }
  return {x:b.x+Math.cos(weapon.angle)*weapon.orbit,y:b.y+Math.sin(weapon.angle)*weapon.orbit};
}
function loseHp(fighter, amount) {
  const lost = Math.min(fighter.hp, amount);
  fighter.hp -= lost;
  fighter.hpLost += lost;
}

function limitBreakCharge(fighter) {
  return fighter.limitBreak ? fighter.limitDamage : Math.min(fighter.hpLost, fighter.limitDamage);
}

function limitBreakLabel(fighter) {
  return fighter.limitBreak ? 'Active' : Math.floor(limitBreakCharge(fighter)) + '/' + fighter.limitDamage + ' HP';
}

function hurt(target,amount,source,attacker,critEligible=false){if(target.hp<=0||amount<=0||((target.key==='foxy'||target.bossPower)&&target.invincibleLeft>1e-9))return false;if(target.key==='nightguard'&&target.limitBreak&&target.shieldHits>0){target.shieldHits--;if(source==='foxy hook')target.pinTimer=5;if(source==='grapple'||source==='lunge grapple'){target.grappled=true;target.grappleOwner=attacker.id;target.grappleTimer=.32;target.grappleWallFixedDamage=source==='lunge grapple';}particles.push({x:target.x,y:target.y,text:'BLOCK! '+target.shieldHits,color:'#f4ca42',life:1});announce('Nightguard blocks the hit! '+target.shieldHits+' shield hits remain.');return true;}const critical=critEligible&&Math.random()<.1;if(critical)amount*=3;if(attacker.key==='roxy'&&attacker.limitBreak)amount*=2;if(target.key==='roxy'&&target.limitBreak)amount*=2;if(target.key==='goldenfreddy')amount=1;if(target.springBonnieLeft>0)amount=Math.ceil(amount/2);loseHp(target,amount);weaponHits++;particles.push({x:target.x,y:target.y,text:(critical?'CRIT! ':'')+'−'+amount,color:attacker.color,life:1});announce((critical?'CRITICAL! ':'')+label(attacker)+'’s '+source+' hits '+label(target)+' for '+amount+' damage.');trySpringBonnie(target);return true;}
function heal(b,amount){if(b.hp<=0)return;const gained=Math.min(amount,b.maxHp-b.hp);if(gained>0){b.hp+=gained;particles.push({x:b.x,y:b.y,text:'+'+gained,color:b.color,life:1});playSound('heal');}}
function step(dt){if(!started||paused||finished)return;let remaining=dt,substeps=0;while(remaining>1e-9&&!finished&&substeps++<256){const speed=Math.max(...balls.map(b=>Math.hypot(b.vx,b.vy)+(Math.max(0,...orbitingWeapons(b).map(w=>TAU*weaponRotationRate(b,w)*w.orbit)))))+GRAVITY*remaining;const slice=Math.min(remaining,3/Math.max(speed,1));advance(slice);remaining-=slice;}}
function activateLimitBreak(b){if(b.limitBreak)return;b.limitBreak=true;if(b.key==='toychica')spawnNextRainbow();if(b.key==='mangle'){for(let i=0;i<10;i++)spawnHotCheese(b);}if(b.key==='endo'){b.endoCooldown=.25;b.endoTimer=0;}if(b.key==='nightguard'){b.shieldHits=10;b.lightTimer=0;}if(b.key==='roxy'&&b.weapon){b.weapon.rate=2;b.roxyDashTimer=0;}playSound('limit-'+b.key);announce(label(b)+' activates a limit break!');if(b.key==='goldenfreddy'&&opponent(b).key==='purpleguy'){activateGoldenBossPower(b);}else if(b.key==='goldenfreddy'){b.x=W/2;b.y=H/2;b.vx=0;b.vy=0;b.goldenTimer=0;b.goldenDrainInsideTargets=new Map();}if(b.key==='foxy'){b.critChance=.1;b.dashTimer=0;b.dashHit=false;const crowbar=b.weapon?.name==='Crowbar';b.weapon=null;const target=opponent(b),dx=target.x-b.x,dy=target.y-b.y,distance=Math.hypot(dx,dy)||1,speed=BASE_SPEED*6;hooks.push({owner:b.id,target:target.id,x:b.x,y:b.y,vx:dx/distance*speed,vy:dy/distance*speed,speed,life:2,state:'flying',crowbar});}if(b.key==='chica'&&b.weapon)b.weapon.damage=12;}
function pinTarget(target,x,y,nx,ny){target.towed=false;target.pinTimer=5;target.pinX=x;target.pinY=y;target.pinNX=nx;target.pinNY=ny;target.x=x;target.y=y;target.vx=0;target.vy=0;}
function updateHooks(dt){hooks=hooks.filter(h=>{const target=balls[h.target];if(!target||target.hp<=0)return false;if(h.state==='flying'){const x=h.x,y=h.y;h.x+=h.vx*dt;h.y+=h.vy*dt;h.life-=dt;if(segmentDistance(target.x,target.y,x,y,h.x,h.y)<=target.radius+12){playSound('weapon');h.state='dragging';h.nx=h.vx/(h.speed||1);h.ny=h.vy/(h.speed||1);const tx=h.nx>0?(W-target.radius-target.x)/h.nx:h.nx<0?(target.radius-target.x)/h.nx:Infinity,ty=h.ny>0?(H-target.radius-target.y)/h.ny:h.ny<0?(target.radius-target.y)/h.ny:Infinity,travel=Math.max(0,Math.min(tx,ty));h.pinX=Math.max(target.radius,Math.min(W-target.radius,target.x+h.nx*travel));h.pinY=Math.max(target.radius,Math.min(H-target.radius,target.y+h.ny*travel));target.towed=true;}return h.life>0&&h.x>=-30&&h.x<=W+30&&h.y>=-30&&h.y<=H+30;}if(h.state==='dragging'){const dx=h.pinX-target.x,dy=h.pinY-target.y,distance=Math.hypot(dx,dy),travel=Math.min(distance,h.speed*dt);if(distance>0){target.x+=dx/distance*travel;target.y+=dy/distance*travel;h.nx=dx/distance;h.ny=dy/distance;}h.x=target.x+h.nx*(target.radius+12);h.y=target.y+h.ny*(target.radius+12);if(distance<=travel+1e-6){pinTarget(target,h.pinX,h.pinY,h.nx,h.ny);h.state='pinned';h.life=5;}return true;}if(target.pinTimer<=0)return false;target.x=h.pinX;target.y=h.pinY;h.x=target.x+h.nx*target.radius;h.y=target.y+h.ny*target.radius;h.life=target.pinTimer;return true;});}
function startDash(foxy){playSound('dash');foxy.dashHit=false;const target=opponent(foxy),angle=Math.atan2(target.y-foxy.y,target.x-foxy.x),speed=Math.hypot(foxy.vx,foxy.vy),dashSpeed=Math.min(foxy.maxSpeed,Math.max(900,speed*1.8));foxy.dashScale=dashSpeed/Math.max(speed,1);foxy.vx=Math.cos(angle)*dashSpeed;foxy.vy=Math.sin(angle)*dashSpeed;foxy.dashLeft=.45;foxy.invincibleLeft=.05;announce(label(foxy)+' dashes toward '+label(target)+'!');}
function startRoxyDash(roxy){playSound('roxy-lunge');roxy.dashHit=false;const target=opponent(roxy),aim=roxy.limitBreak?(target.lastWall||{x:target.x<W/2?R:W-R,y:target.y}):target,angle=Math.atan2(aim.y-roxy.y,aim.x-roxy.x),speed=Math.hypot(roxy.vx,roxy.vy),dashSpeed=Math.min(roxy.maxSpeed,Math.max(900,speed*1.8));roxy.dashScale=dashSpeed/Math.max(speed,1);roxy.vx=Math.cos(angle)*dashSpeed;roxy.vy=Math.sin(angle)*dashSpeed;roxy.dashLeft=.45;if(roxy.weapon)roxy.weapon.angle=angle;announce(label(roxy)+' lunges toward '+label(target)+'!');}
function updateGrapples(dt){for(const target of balls){if(!target.grappled)continue;const owner=balls[target.grappleOwner];if(!owner||owner.hp<=0||target.hp<=0){target.grappled=false;continue;}target.grappleTimer-=dt;if(target.grappleTimer<=0){const dx=target.x-owner.x,dy=target.y-owner.y,distance=Math.hypot(dx,dy)||1;target.grappled=false;target.grappleOwner=-1;if(target.key==='goldenfreddy'){target.vx=0;target.vy=0;target.grappleWallPending=false;target.grappleWallOwner=-1;continue;}target.grappleWallPending=true;target.grappleWallOwner=owner.id;target.grappleThrowDistance=0;target.vx=dx/distance*target.maxSpeed;target.vy=dy/distance*target.maxSpeed-BASE_SPEED*.35;capSpeed(target);continue;}const angle=owner.weapon?.angle??Math.atan2(target.y-owner.y,target.x-owner.x);target.x=owner.x+Math.cos(angle)*(owner.radius+target.radius-R*.45);target.y=owner.y+Math.sin(angle)*(owner.radius+target.radius-R*.45);target.vx=owner.vx;target.vy=owner.vy;}}
function resolveGrappleWallHit(target){if(!target.grappleWallPending)return;target.grappleWallPending=false;const roxy=balls[target.grappleWallOwner];if(roxy&&roxy.hp>0){playSound('roxy-wall-slam');const maxThrowDistance=Math.max(W,H)-2*R,damage=target.grappleWallFixedDamage?10:3+Math.round(Math.min(1,target.grappleThrowDistance/maxThrowDistance)*5);hurt(target,damage,'wall slam',roxy);}target.grappleWallOwner=-1;target.grappleWallFixedDamage=false;target.grappleThrowDistance=0;}
function beginDeathSequence(){finished=true;deathSequence=true;deathTimer=.85;const leftAlive=balls.some(ball=>ball.team==='left'&&ball.hp>0),rightAlive=balls.some(ball=>ball.team==='right'&&ball.hp>0);deathResult=!leftAlive&&!rightAlive?'Double knockout':battleMode!=='duel'?(leftAlive?'Left team wins':'Right team wins'):label(balls.find(ball=>ball.hp>0)||balls[0])+' wins';globalThis.BattleSounds?.stopAll();playSound('death');for(const ball of balls){if(ball.hp>0)continue;for(let i=0;i<18;i++){const angle=TAU*i/18+(Math.random()-.5)*.22,speed=130+Math.random()*260,size=5+Math.random()*10;shards.push({x:ball.x+Math.cos(angle)*R*.35,y:ball.y+Math.sin(angle)*R*.35,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-70,angle:Math.random()*TAU,spin:(Math.random()-.5)*12,size,color:ball.color,life:.85,maxLife:.85});}}announce('A fighter shatters!');}
function advanceTeamRoster(){for(const fallen of balls.filter(ball=>ball.hp<=0))teamProgress[fallen.team]++;const leftOut=teamProgress.left>=activeTeams.left.length,rightOut=teamProgress.right>=activeTeams.right.length;if(leftOut||rightOut){deathResult=leftOut&&rightOut?'Double knockout':leftOut?'Right team wins':'Left team wins';return false;}balls=balls.map(ball=>ball.hp<=0?makeBall(activeTeams[ball.team][teamProgress[ball.team]],ball.id,ball.team,teamProgress[ball.team],activeTeams[ball.team].length):ball);for(const ball of balls){const centerAnchor=ball.key==='goldenfreddy'&&ball.limitBreak;ball.x=centerAnchor?W/2:ball.team==='left'?75:Math.min(405,W-ball.radius);ball.y=H/2;ball.vx=centerAnchor||ball.key==='goldenfreddy'?0:(ball.team==='left'?450:-450)*ball.startingSpeedScale;ball.vy=0;ball.grappled=false;ball.grappleOwner=-1;ball.grappleTimer=0;ball.grappleWallPending=false;ball.grappleWallOwner=-1;ball.grappleWallFixedDamage=false;ball.grappleThrowDistance=0;ball.towed=false;ball.pinTimer=0;ball.dashLeft=0;ball.invincibleLeft=0;ball.dashScale=1;ball.dashHit=false;ball.lastWall=null;if(ball.minions)ball.minions=[];if(ball.weapon){ball.weapon.detached=false;ball.weapon.angle=ball.id?Math.PI:0;ball.weapon.dir=1;ball.weapon.touchingTargets=new Set();}}particles=[];trails=[];waves=[];pizzas=[];pizzaWheels=[];pizzaSlices=[];cupcakes=[];projectiles=[];hooks=[];lasers=[];mangleHeads=[];prizeBalls=[];hotCheese=[];rainbow=null;lastRainbowOwner=-1;lastRainbowSpawn=null;shards=[];contactPairs.clear();weaponClashPairs.clear();finished=false;deathSequence=false;deathTimer=0;paused=false;acc=0;syncFoxyWeapon();maybeFoxyNightguardLimitBreak();announce('Next team round: '+label(balls[0])+' vs. '+label(balls[1]));updateUI();return true;}
function updateDeathSequence(dt) {
  if (!deathSequence) return;
  deathTimer -= dt;
  for (const p of shards) {
    p.life -= dt;
    p.vy += 360 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.angle += p.spin * dt;
  }
  shards = shards.filter(p => p.life > 0);
  if (deathTimer > 0) return;

  deathSequence = false;
  const nextFighter = activeTeams.left[teamProgress.left + 1];
  const bossSurvived = balls.some(ball => ball.team === 'right' && ball.hp > 0);
  const teammateFell = balls.some(ball => ball.team === 'left' && ball.hp <= 0);
  if (battleMode === 'boss' && teammateFell && bossSurvived && nextFighter) {
    showRoundButton('Send Next Fighter · ' + CHARACTERS[nextFighter].name, () => {
      el('result').style.display = 'none';
      advanceTeamRoster();
    });
    announce('Ready to send in ' + CHARACTERS[nextFighter].name + '.');
    return;
  }

  if (battleMode !== 'duel' && advanceTeamRoster()) return;
  showRoundButton(deathResult + ' · Rematch', () => reset(activeTeams, true, battleMode));
}

function showRoundButton(text, onPress) {
  const result = el('result');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.addEventListener('click', onPress, {once: true});
  result.replaceChildren(button);
  result.style.display = 'flex';
  updateUI();
}
function drawShards(){for(const p of shards){ctx.save();ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.beginPath();ctx.moveTo(-p.size,-p.size*.55);ctx.lineTo(p.size*1.2,0);ctx.lineTo(-p.size*.2,p.size);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff99';ctx.lineWidth=1;ctx.stroke();ctx.restore();}ctx.globalAlpha=1;}function advance(dt){matchElapsed+=dt;updateSuddenDeath();if(balls.some(b=>b.hp<=0)){beginDeathSequence();return;}for(const b of balls)b.invincibleLeft=Math.max(0,(b.invincibleLeft||0)-dt);updateGrapples(dt);for(const b of balls){updateSpringBonnie(b, dt);b.trailTimer+=dt;if(b.trailTimer>=.025){b.trailTimer%=.025;trails.push({x:b.x,y:b.y,color:b.color,life:.28,maxLife:.28});}if(b.grappled){if(b.weapon&&!b.weapon.detached)spinWeapons(b,dt);continue;}if(isStationaryGolden(b)){b.vx=0;b.vy=0;continue;}if(b.stunTimer>0){b.stunTimer=Math.max(0,b.stunTimer-dt);if(b.stunTimer>0){b.vx=0;b.vy=0;continue;}b.vx=b.stunnedVx;b.vy=b.stunnedVy;capSpeed(b);}if(b.pinTimer>0){b.pinTimer=Math.max(0,b.pinTimer-dt);if(b.pinTimer>0){b.x=b.pinX;b.y=b.pinY;b.vx=0;b.vy=0;if(b.weapon&&!b.weapon.detached)spinWeapons(b,dt);continue;}b.vx=-b.pinNX*BASE_SPEED*.5;b.vy=-b.pinNY*BASE_SPEED*.5;}if(b.towed){b.vx=0;b.vy=0;if(b.weapon&&!b.weapon.detached)spinWeapons(b,dt);continue;}if(b.key==='foxy'||b.bossPower){b.dashTimer+=dt;const cooldown=b.key==='foxy'&&b.limitBreak?.25:2.5;if(b.dashTimer>=cooldown){b.dashTimer-=cooldown;startDash(b);}if(b.dashLeft>0){b.dashLeft-=dt;if(b.dashLeft<=0){b.dashLeft=0;b.vx/=b.dashScale;b.vy/=b.dashScale;b.dashScale=1;}}}if(b.key==='roxy'){b.roxyDashTimer+=dt;const roxyCooldown=b.limitBreak?.2:3;if(b.roxyDashTimer>=roxyCooldown){b.roxyDashTimer-=roxyCooldown;startRoxyDash(b);}if(b.dashLeft>0){b.dashLeft-=dt;if(b.dashLeft<=0){b.dashLeft=0;b.vx/=b.dashScale;b.vy/=b.dashScale;b.dashScale=1;}}}if(b.weapon&&!b.weapon.detached&&!(b.key==='roxy'&&b.dashLeft>0))spinWeapons(b,dt);const gravityAnchor=balls.find(other=>isStationaryGolden(other)&&other.limitBreak&&other.hp>0&&other.team!==b.team);if(gravityAnchor){const gx=gravityAnchor.x-b.x,gy=gravityAnchor.y-b.y,gd=Math.hypot(gx,gy)||1;b.vx+=gx/gd*(2*GRAVITY)*dt;b.vy+=gy/gd*(2*GRAVITY)*dt;}else b.vy+=GRAVITY*dt;capSpeed(b);if(b.key==='roxy'&&b.dashLeft>0&&b.weapon)b.weapon.angle=Math.atan2(b.vy,b.vx);const oldX=b.x,oldY=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.grappleWallPending)b.grappleThrowDistance+=Math.hypot(b.x-oldX,b.y-oldY);const r=b.radius;if(b.x<r||b.x>W-r){b.x=Math.max(r,Math.min(W-r,b.x));if((b.x===r&&b.vx<0)||(b.x===W-r&&b.vx>0)){b.vx*=-1;wallBoost(b);b.lastWall={x:b.x,y:b.y};resolveGrappleWallHit(b);}}if(b.y<r||b.y>H-r){b.y=Math.max(r,Math.min(H-r,b.y));if((b.y===r&&b.vy<0)||(b.y===H-r&&b.vy>0)){b.vy*=-1;wallBoost(b);b.lastWall={x:b.x,y:b.y};resolveGrappleWallHit(b);}}if(b.key==='nightguard'&&b.powerless&&Math.hypot(b.x-b.batteryX,b.y-b.batteryY)<=R+11){b.powerless=false;playSound('nightguard-battery');b.lightHitCount=0;b.lightStunCount=0;b.batteryX=null;b.batteryY=null;if(b.weapon){b.weapon.rate=0;b.weapon.angle=0;}b.vx*=.5;b.vy*=.5;announce('Nightguard found a battery! Flashlight restored.');}}
for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j];if(a.hp<=0||b.hp<=0)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),pair=a.id+':'+b.id,reach=a.radius+b.radius;if(d<=reach&&!a.grappled&&!b.grappled){const nx=d?dx/d:1,ny=d?dy/d:0,overlap=reach-d+.05,aHeld=a.pinTimer>0||a.towed,bHeld=b.pinTimer>0||b.towed,sameTeam=a.team===b.team;if(isStationaryGolden(a)){b.x+=nx*overlap;b.y+=ny*overlap;}else if(isStationaryGolden(b)){a.x-=nx*overlap;a.y-=ny*overlap;}else if(aHeld&&!bHeld){b.x+=nx*overlap;b.y+=ny*overlap;}else if(bHeld&&!aHeld){a.x-=nx*overlap;a.y-=ny*overlap;}else if(!aHeld&&!bHeld){a.x-=nx*overlap/2;a.y-=ny*overlap/2;b.x+=nx*overlap/2;b.y+=ny*overlap/2;}const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){if(isStationaryGolden(a)){b.vx-=2*rel*nx;b.vy-=2*rel*ny;boost(b);}else if(isStationaryGolden(b)){a.vx+=2*rel*nx;a.vy+=2*rel*ny;boost(a);}else if(aHeld&&!bHeld){b.vx-=2*rel*nx;b.vy-=2*rel*ny;boost(b);}else if(bHeld&&!aHeld){a.vx+=2*rel*nx;a.vy+=2*rel*ny;boost(a);}else if(!aHeld&&!bHeld){a.vx+=rel*nx;a.vy+=rel*ny;b.vx-=rel*nx;b.vy-=rel*ny;boost(a);boost(b);}}if(!contactPairs.has(pair)){contactPairs.add(pair);playSound('body');if(!sameTeam){if(isStationaryGolden(a)){hurt(a,1,'body impact',b);hurt(b,a.limitBreak?10:5,'bumper impact',a);}else if(isStationaryGolden(b)){hurt(b,1,'body impact',a);hurt(a,b.limitBreak?10:5,'bumper impact',b);}else{const damageA=dashBodyDamage(a),damageB=dashBodyDamage(b);hurt(b,damageA,'body impact',a,a.key==='foxy'||a.bossPower);hurt(a,damageB,'body impact',b,b.key==='foxy'||b.bossPower);}}}if(!sameTeam){if(a.key==='foxy'&&a.limitBreak&&a.dashLeft>0&&!a.dashHit){a.dashHit=true;hurt(b,10,'dash',a,true);}if(b.key==='foxy'&&b.limitBreak&&b.dashLeft>0&&!b.dashHit){b.dashHit=true;hurt(a,10,'dash',b,true);}}}else if(d>reach+2)contactPairs.delete(pair);}
for(const ball of balls){capSpeed(ball);ball.x=Math.max(ball.radius,Math.min(W-ball.radius,ball.x));ball.y=Math.max(ball.radius,Math.min(H-ball.radius,ball.y));}checkWeapons();updateAbilities(dt);if(['left','right'].some(side=>!balls.some(ball=>ball.team===side&&ball.hp>0)))beginDeathSequence();}
function checkWeapons() {
  const reverse = new Set();
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    for (const b of balls.slice(i + 1)) {
      if (a.team === b.team) continue;
      for (const [ai, aw] of orbitingWeapons(a).entries()) {
        for (const [bi, bw] of orbitingWeapons(b).entries()) {
          if (aw.detached || bw.detached) continue;
          const p = weaponPosition(a,aw), q = weaponPosition(b,bw);
          const gap = Math.hypot(p.x-q.x,p.y-q.y), reach = aw.r+bw.r;
          const pair = a.id+':'+ai+':'+b.id+':'+bi;
          if (gap <= reach && !weaponClashPairs.has(pair)) {
            weaponClashPairs.add(pair);
            playSound('clash');
            reverse.add(aw);
            reverse.add(bw);
            announce('Weapon clash — both weapons reverse!');
          } else if (gap > reach + 2) weaponClashPairs.delete(pair);
        }
      }
    }
  }

  for (const owner of balls) {
    if (owner.hp <= 0) continue;
    for (const weapon of orbitingWeapons(owner)) {
      if (weapon.detached) continue;
      const pos = weaponPosition(owner,weapon);
      for (const target of opponents(owner)) {
        if (target.grappled) continue;
        const gap = Math.hypot(pos.x-target.x,pos.y-target.y), reach = target.radius+weapon.r;
        const lunge = owner.key === 'roxy' && owner.dashLeft > 0 && !owner.dashHit;
        if (gap > reach) {
          if (gap > reach + 2) weapon.touchingTargets.delete(target.id);
          continue;
        }
        if (weapon.touchingTargets.has(target.id) && !lunge) continue;

        weapon.touchingTargets.add(target.id);
        playSound('weapon');
        if (owner.key === 'roxy') {
          playSound('roxy-grab');
          if (hurt(target,lunge?10:5,lunge?'lunge grapple':'grapple',owner)) {
            target.grappled = true;
            target.grappleOwner = owner.id;
            target.grappleTimer = .32;
            target.grappleWallFixedDamage = lunge;
          }
          if (lunge) owner.dashHit = true;
        } else {
          const previousHp = target.hp;
          const canCrit = owner.key === 'foxy' || weapon === owner.hookWeapon;
          hurt(target,weapon.damage,weapon.name.toLowerCase(),owner,canCrit);
          if (owner.key === 'purpleguy' && target.hp < previousHp) weapon.rate += .01;
        }
        reverse.add(weapon);
      }
    }
  }
  for (const weapon of reverse) weapon.dir *= -1;
}
function emitShockwave(freddy){const radius=freddy.key==='freddy'&&freddy.limitBreak?R*2.5:R*2;playSound(freddy.key==='toyfreddy'?'toyfreddy-shock':'shock');waves.push({x:freddy.x,y:freddy.y,radius,life:.6,color:freddy.color});announce(label(freddy)+' releases a shockwave!');for(const target of opponents(freddy))if(Math.hypot(target.x-freddy.x,target.y-freddy.y)<=radius+target.radius)hurt(target,15,'shockwave',freddy);}
function emitPizzaWheel(owner, randomDirection = false) {
  let angle;
  if (randomDirection) {
    angle = Math.random() * TAU;
  } else {
    const target = opponent(owner);
    angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  }
  const damage = (randomDirection ? 15 : 10) + Math.floor(Math.random() * 6);
  pizzaWheels.push({
    owner: owner.id, x: owner.x, y: owner.y,
    vx: Math.cos(angle) * 720, vy: Math.sin(angle) * 720,
    radius: 40, damage, angle: 0, spin: TAU * 2, life: 3
  });
  playSound(randomDirection ? 'toyfreddy-wheel' : 'freddy-wheel');
}
function updatePizzaWheels(dt){pizzaWheels=pizzaWheels.filter(p=>{const oldX=p.x,oldY=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;p.life-=dt;const target=opponent(balls[p.owner]);if(target.hp>0&&segmentDistance(target.x,target.y,oldX,oldY,p.x,p.y)<=target.radius+p.radius){hurt(target,p.damage,'pizza wheel',balls[p.owner]);playSound('weapon');return false;}if(p.x<=p.radius||p.x>=W-p.radius||p.y<=p.radius||p.y>=H-p.radius){p.x=Math.max(p.radius,Math.min(W-p.radius,p.x));p.y=Math.max(p.radius,Math.min(H-p.radius,p.y));const sliceDamage=Math.ceil(p.damage/5);for(let i=0;i<8;i++){const angle=i*TAU/8;pizzaSlices.push({owner:p.owner,x:p.x,y:p.y,vx:Math.cos(angle)*560,vy:Math.sin(angle)*560,angle,radius:8,damage:sliceDamage,life:1.5});}playSound('weapon');return false;}return p.life>0;});}
function updatePizzaSlices(dt){pizzaSlices=pizzaSlices.filter(p=>{const oldX=p.x,oldY=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;const owner=balls[p.owner],target=opponents(owner).find(enemy=>segmentDistance(enemy.x,enemy.y,oldX,oldY,p.x,p.y)<=enemy.radius+p.radius);if(target){hurt(target,p.damage,'pizza slice',owner);return false;}return p.life>0&&p.x>=-p.radius&&p.x<=W+p.radius&&p.y>=-p.radius&&p.y<=H+p.radius;});}
function drawPizzaSlice(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle='#f5d778';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(17,-7);ctx.lineTo(17,7);ctx.closePath();ctx.fill();ctx.strokeStyle='#a74936';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(14,-5);ctx.lineTo(14,5);ctx.stroke();circle(7,0,1.7,'#c54d3e');ctx.restore();}
function drawPizzaWheel(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(p.radius/16,p.radius/16);circle(0,0,16,'#c88837');circle(0,0,13,'#f5d778');circle(0,0,3,'#b54b37');ctx.strokeStyle='#a74936';ctx.lineWidth=2;for(let i=0;i<8;i++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(12,0);ctx.stroke();circle(9.28,3,2.2,'#c54d3e');}ctx.restore();}
function spawnAroundFighter(owner,radius){const inner=R+radius+6,outer=R*2+radius,angle=Math.atan2(H/2-owner.y,W/2-owner.x);let best={x:owner.x+Math.cos(angle)*inner,y:owner.y+Math.sin(angle)*inner},bestGap=-Infinity;for(let i=0;i<64;i++){const a=Math.random()*TAU,d=Math.sqrt(inner*inner+Math.random()*(outer*outer-inner*inner)),p={x:owner.x+Math.cos(a)*d,y:owner.y+Math.sin(a)*d};if(p.x<radius||p.x>W-radius||p.y<radius||p.y>H-radius)continue;const gap=Math.min(Infinity,...pizzas.map(q=>Math.hypot(p.x-q.x,p.y-q.y)-radius-PIZZA_R-4),...hotCheese.map(q=>Math.hypot(p.x-q.x,p.y-q.y)-radius-22-4));if(gap>=0)return p;if(gap>bestGap){best=p;bestGap=gap;}}return best;}
function spawnHotCheese(owner){hotCheese.push({owner:owner.id,...spawnAroundFighter(owner,22),life:4.5,tick:0});}
function dropPizza(chica){playSound('chica-pizza');pizzas.push({...spawnAroundFighter(chica,PIZZA_R),owner:chica.id,armed:false});}
function updatePizzas(){pizzas=pizzas.filter(p=>{const owner=balls[p.owner];if(!p.armed){if(Math.hypot(owner.x-p.x,owner.y-p.y)<=owner.radius+PIZZA_R)return true;p.armed=true;}const collectors=balls.filter(b=>b.hp>0&&Math.hypot(b.x-p.x,b.y-p.y)<=b.radius+PIZZA_R).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));if(!collectors.length)return true;const collector=collectors[0];if(collector.key==='chica'){collector.pizzaSlicesEaten++;if(collector.pizzaSlicesEaten%10===0)collector.cupcakeCooldown=Math.max(1,collector.cupcakeCooldown-.25);}heal(collector,1);announce(label(collector)+' collects pizza (+1 HP, up to maximum).');return false;});}
function isChicaVariant(b){return b.key==='chica'||b.key==='toychica';}
function dropCupcake(chica){playSound(chica.key==='toychica'?'toychica-cupcake':'chica-cupcake');cupcakes.push({x:chica.x,y:chica.y,owner:chica.id,armed:false});}
function updateCupcakes(){cupcakes=cupcakes.filter(c=>{const owner=balls[c.owner];if(!owner)return false;if(!c.armed){if(Math.hypot(owner.x-c.x,owner.y-c.y)<=owner.radius+14)return true;c.armed=true;}const collectors=balls.filter(b=>b.hp>0&&(b.team!==owner.team||isChicaVariant(b))&&Math.hypot(b.x-c.x,b.y-c.y)<=b.radius+14).sort((a,b)=>Math.hypot(a.x-c.x,a.y-c.y)-Math.hypot(b.x-c.x,b.y-c.y));if(!collectors.length)return true;const collector=collectors[0],amount=owner.key==='toychica'?8:owner.limitBreak?12:6;if(isChicaVariant(collector)){heal(collector,amount);announce(label(collector)+' collects a '+(owner.limitBreak?'birthday cake':'cupcake')+' (+'+amount+' HP, up to maximum).');}else{hurt(collector,amount,owner.limitBreak?'birthday cake':'dropped cupcake',owner);playSound('weapon');}return false;});}
function drawBirthdayCake(){ctx.fillStyle='#df79ab';ctx.fillRect(-12,0,24,12);ctx.fillStyle='#fff0f5';ctx.fillRect(-13,-3,26,5);ctx.fillStyle='#ffd45f';ctx.fillRect(-6,-13,2,11);ctx.fillRect(4,-13,2,11);circle(-5,-15,2,'#fff5a1');circle(5,-15,2,'#fff5a1');}
function drawDroppedCupcake(c){ctx.save();ctx.translate(c.x,c.y);ctx.globalAlpha=c.armed?1:.45;if(balls[c.owner]?.limitBreak)drawBirthdayCake();else{ctx.fillStyle='#a65b31';ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.lineTo(9,14);ctx.lineTo(-9,14);ctx.closePath();ctx.fill();circle(-7,-3,7,'#f890c1');circle(7,-3,7,'#f890c1');circle(0,-7,9,'#ffb1d8');ctx.fillStyle='#ffe8a7';ctx.fillRect(-1,-20,3,9);circle(1,-22,3,'#ffb63d');}if(battleMode!=='duel'||balls.some(other=>other.key===balls[c.owner]?.key&&other.team!==balls[c.owner]?.team)){ctx.strokeStyle=teamColor(balls[c.owner]?.team);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-3,20,0,TAU);ctx.stroke();}ctx.restore();}
function emitSoundwave(bonnie,power=false){if(!power){emitSoundProjectile(bonnie,Math.max(0,Math.min(2,3-bonnie.burstRemaining)));return;}playSound('bonnie-power');const maxRadius=R*2.5;waves.push({type:'sound',owner:bonnie.id,x:bonnie.x,y:bonnie.y,radius:0,maxRadius,speed:maxRadius/.4,damage:10,hit:false,life:.65,color:bonnie.color,power:true});}
function emitLaser(bonnie){playSound('bonnie-laser');const target=opponent(bonnie),angle=Math.atan2(target.y-bonnie.y,target.x-bonnie.x),speed=BASE_SPEED*6;lasers.push({owner:bonnie.id,x:bonnie.x,y:bonnie.y,angle,speed,life:1.5,color:'#ff263f'});announce(label(bonnie)+' fires a homing laser!');}
function emitSoundProjectile(bonnie,index){playSound('bonnie-burst');const target=opponent(bonnie),angle=Math.atan2(target.y-bonnie.y,target.x-bonnie.x);projectiles.push({owner:bonnie.id,x:bonnie.x,y:bonnie.y,vx:Math.cos(angle)*1260,vy:Math.sin(angle)*1260,radius:R*[1.5,1,.5][index],damage:bonnie.key==='bonnie'&&bonnie.limitBreak?5:3,life:2.5,color:bonnie.color});}
function segmentDistance(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;return Math.hypot(x-(ax+t*dx),y-(ay+t*dy));}
function updateProjectiles(dt){projectiles=projectiles.filter(p=>{if(p.micToss)return updateMicToss(p,dt);const oldX=p.x,oldY=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;const owner=balls[p.owner],target=opponents(owner).filter(enemy=>segmentDistance(enemy.x,enemy.y,oldX,oldY,p.x,p.y)<=enemy.radius+p.radius).sort((a,b)=>segmentDistance(a.x,a.y,oldX,oldY,p.x,p.y)-segmentDistance(b.x,b.y,oldX,oldY,p.x,p.y))[0];if(target){hurt(target,p.damage,p.attackName||'soundwave projectile',owner,!!p.critEligible);return false;}return p.life>0&&p.x>=-p.radius&&p.x<=W+p.radius&&p.y>=-p.radius&&p.y<=H+p.radius;});}
function updateLasers(dt){lasers=lasers.filter(laser=>{const owner=balls[laser.owner],target=opponent(owner);if(!target||target.team===owner.team||target.hp<=0)return false;const desired=Math.atan2(target.y-laser.y,target.x-laser.x),turn=Math.atan2(Math.sin(desired-laser.angle),Math.cos(desired-laser.angle));laser.angle+=Math.max(-20*dt,Math.min(20*dt,turn));const oldX=laser.x,oldY=laser.y;laser.x+=Math.cos(laser.angle)*laser.speed*dt;laser.y+=Math.sin(laser.angle)*laser.speed*dt;laser.life-=dt;const hit=opponents(owner).find(enemy=>segmentDistance(enemy.x,enemy.y,oldX,oldY,laser.x,laser.y)<=enemy.radius+12);if(hit){if(hurt(hit,20,'homing laser',owner)&&hit.key!=='goldenfreddy'){const dx=hit.x-owner.x,dy=hit.y-owner.y,distance=Math.hypot(dx,dy)||1,force=2*Math.hypot(owner.vx,owner.vy);hit.vx+=dx/distance*force;hit.vy+=dy/distance*force;}return false;}return laser.life>0&&laser.x>=-30&&laser.x<=W+30&&laser.y>=-30&&laser.y<=H+30;});}
function drawSoundProjectile(p){ctx.save();ctx.translate(p.x,p.y);if(p.micToss){ctx.rotate(Math.atan2(p.vy,p.vx)+Math.PI/2);drawMicrophone();ctx.restore();return;}ctx.rotate(Math.atan2(p.vy,p.vx));ctx.strokeStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=5;ctx.lineWidth=5;ctx.lineCap='round';for(const scale of [1,.66,.33]){ctx.beginPath();ctx.arc(0,0,p.radius*scale,-Math.PI*.45,Math.PI*.45);ctx.stroke();}ctx.restore();}
function drawLaser(laser){ctx.save();ctx.translate(laser.x,laser.y);ctx.rotate(laser.angle);ctx.strokeStyle=laser.color;ctx.shadowColor=laser.color;ctx.shadowBlur=16;ctx.lineCap='round';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(24,0);ctx.stroke();ctx.strokeStyle='#ffd1d7';ctx.shadowBlur=5;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(22,0);ctx.stroke();ctx.restore();}
function drawThrownHook(h){const target=balls[h.target];ctx.save();if(target&&(h.state==='dragging'||h.state==='pinned')){ctx.strokeStyle='#cbd2dd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(target.x,target.y);ctx.lineTo(h.x,h.y);ctx.stroke();}ctx.translate(h.x,h.y);ctx.rotate(Math.atan2(h.vy,h.vx));if(h.crowbar){ctx.fillStyle='#694633';ctx.fillRect(-4,-2,8,26);ctx.fillStyle='#b9c0c9';ctx.fillRect(-14,-8,28,7);ctx.fillRect(8,-8,7,12);ctx.strokeStyle='#e2e9f2';ctx.lineWidth=1;ctx.strokeRect(-14,-8,28,7);ctx.restore();return;}ctx.strokeStyle='#e2e9f2';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,11);ctx.lineTo(-8,-4);ctx.arc(0,-4,8,Math.PI,TAU+.3);ctx.stroke();ctx.fillStyle='#6d4535';ctx.fillRect(-12,8,8,9);ctx.restore();}
function updateWaves(dt){for(const wave of waves){wave.life-=dt;if(wave.type!=='sound')continue;const previous=wave.radius;wave.radius=Math.min(wave.maxRadius,wave.radius+wave.speed*dt);const owner=balls[wave.owner];if(!wave.hits)wave.hits=new Set();for(const target of opponents(owner)){const dx=target.x-wave.x,dy=target.y-wave.y,distance=Math.hypot(dx,dy);if(!wave.hits.has(target.id)&&previous<wave.maxRadius&&distance<=wave.radius+target.radius&&distance>=previous-target.radius){if(hurt(target,wave.damage,wave.power?'power soundwave':'burst soundwave',owner)){wave.hits.add(target.id);if(wave.power&&target.key!=='goldenfreddy'){const force=2*Math.hypot(owner.vx,owner.vy),nx=distance?dx/distance:1,ny=distance?dy/distance:0;target.vx+=nx*force;target.vy+=ny*force;}}}}}}
function updateAbilities(dt){for(const b of balls){if(!['endo','mangle'].includes(b.key)||b.hp<=0)continue;if(b.key==='endo'){b.endoTimer+=dt;if(b.endoTimer>=b.endoCooldown){b.endoTimer-=b.endoCooldown;const t=opponent(b),a=Math.atan2(t.y-b.y,t.x-b.x);b.minions.push({x:b.x+Math.cos(a)*(R+15),y:b.y+Math.sin(a)*(R+15)});playSound('endo-minion-spawn');}}b.minions=b.minions.filter(m=>{const t=opponent(b);if(!t||t.hp<=0)return false;const dx=t.x-m.x,dy=t.y-m.y,d=Math.hypot(dx,dy)||1;m.x+=dx/d*260*dt;m.y+=dy/d*260*dt;if(Math.hypot(t.x-m.x,t.y-m.y)<=t.radius+12){const hp=t.hp;hurt(t,b.endoDamage,'minion',b);if(t.hp<hp){playSound('endo-minion-hit');if(!b.limitBreak)b.endoCooldown=Math.max(1,b.endoCooldown-.25);b.endoDamage=Math.min(10,b.endoDamage+1);}return false;}for(const e of opponents(b)){if(e.weapon){const p=weaponPosition(e);if(Math.hypot(p.x-m.x,p.y-m.y)<=e.weapon.r+12)return false;}}for(const p of [...projectiles,...lasers,...pizzaWheels,...pizzaSlices]){if(balls[p.owner]?.team!==b.team&&Math.hypot(p.x-m.x,p.y-m.y)<=12+(p.radius||p.r||12))return false;}for(const w of waves){if(balls[w.owner]?.team!==b.team&&Math.hypot(w.x-m.x,w.y-m.y)<=w.radius+12)return false;}for(const e of opponents(b)){if(e.key==='nightguard'&&!e.powerless){const p=weaponPosition(e),dx=m.x-p.x,dy=m.y-p.y,a=e.weapon.angle,along=dx*Math.cos(a)+dy*Math.sin(a),across=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(along>=0&&along<=(e.limitBreak?360:230)&&across<=along*(e.limitBreak?.42:.28)+12)return false;}}return true;});}for(const b of balls){if(b.key!=='nightguard'||b.hp<=0)continue;if(b.powerless)continue;const p=weaponPosition(b),a=b.weapon.angle;const lit=opponents(b).filter(t=>{const dx=t.x-p.x,dy=t.y-p.y,along=dx*Math.cos(a)+dy*Math.sin(a),across=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));return !b.powerless&&along>=-t.radius&&along<=(b.limitBreak?360:230)+t.radius&&across<=Math.max(0,along)*(b.limitBreak?.42:.28)+t.radius;});if(lit.length){b.lightTimer+=dt;while(b.lightTimer>=.5){b.lightTimer-=.5;for(const t of lit){hurt(t,3,'flashlight beam',b);playSound('nightguard-beam');b.lightHitCount++;if(b.lightHitCount%5===0){b.lightStunCount++;if(t.stunTimer<=0){t.stunnedVx=t.vx;t.stunnedVy=t.vy;}t.stunTimer=Math.max(t.stunTimer,1);playSound('nightguard-stun');t.vx=0;t.vy=0;particles.push({x:t.x,y:t.y,text:'STUN!',color:'#fff3a0',life:1});if(b.lightStunCount>=5&&!b.powerless){b.powerless=true;playSound('nightguard-powerless');b.batteryX=R+Math.random()*(W-2*R);b.batteryY=R+Math.random()*(H-2*R);if(b.weapon)b.weapon.rate=2;b.vx*=2;b.vy*=2;announce('Nightguard is powerless! Find the battery!');}}}}}else b.lightTimer=0;}updateWaves(dt);waves=waves.filter(w=>w.life>0);updateHooks(dt);for(const b of balls){if(b.hp<=0)continue;if(limitBreaksEnabled&&b.limitDamage&&!b.limitBreak&&b.hpLost>=b.limitDamage)activateLimitBreak(b);if(isStationaryGolden(b)){if(b.limitBreak){const inside=new Map();for(const target of opponents(b)){if(Math.hypot(target.x-b.x,target.y-b.y)<=R*3){let timer=0;if(b.goldenDrainInsideTargets.has(target))timer=b.goldenDrainInsideTargets.get(target)+dt;else{playSound('golden-drain');hurt(target,1,'life drain',b);}while(timer>=1){timer-=1;playSound('golden-drain');hurt(target,1,'life drain',b);}inside.set(target,timer);}}b.goldenDrainInsideTargets=inside;b.goldenDrainTimer=inside.size?Math.max(...inside.values()):0;}else{b.goldenTimer+=dt;if(b.goldenTimer>=4){b.goldenTimer-=4;const target=opponent(b),dx=target.x-b.x,dy=target.y-b.y,distance=Math.hypot(dx,dy)||1,nx=dx/distance,ny=dy/distance;b.x=target.x-nx*(b.radius+target.radius+.1);b.y=target.y-ny*(b.radius+target.radius+.1);const speed=Math.max(BASE_SPEED,Math.hypot(target.vx,target.vy));target.vx=nx*speed;target.vy=ny*speed;capSpeed(target);playSound('golden-teleport');hurt(target,5,'teleport impact',b);}}}if(isFreddyVariant(b)){updateFreddySecondary(b,dt);b.shockTimer+=dt;if(b.shockTimer>=6.5){b.shockTimer-=6.5;emitShockwave(b);}if(b.key==='freddy'&&b.limitBreak){b.powerDrainTimer+=dt;while(b.powerDrainTimer>=1){b.powerDrainTimer-=1;for(const target of opponents(b))hurt(target,6,'power drain',b);}}}if(b.key==='bonnie'||b.bossPower)updateSoundwaveAttacks(b,dt);if(b.bossPower)updateBossRegen(b,dt);if(b.key==='toychica'){b.cupcakeTimer+=dt;if(b.cupcakeTimer+1e-9>=b.cupcakeCooldown){b.cupcakeTimer=Math.max(0,b.cupcakeTimer-b.cupcakeCooldown);dropCupcake(b);}}if(b.key==='chica'){if(b.limitBreak){b.regenTimer+=dt;while(b.regenTimer>=1){b.regenTimer-=1;heal(b,1);}}b.pizzaTimer+=dt;if(b.pizzaTimer>=1.5){b.pizzaTimer-=1.5;dropPizza(b);}b.cupcakeTimer+=dt;if(b.cupcakeTimer>=b.cupcakeCooldown){b.cupcakeTimer-=b.cupcakeCooldown;dropCupcake(b);}}}updateProjectiles(dt);updateLasers(dt);updatePizzaWheels(dt);updatePizzaSlices(dt);updatePizzas();updateCupcakes();updateMangle(dt);updateRainbow(dt);}
function circle(x,y,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
function drawCharacter(b){ctx.save();ctx.translate(b.x,b.y);const displayColor=b.springBonnieLeft>0?SPRING_BONNIE.color:b.key==='goldenfreddy'?'#d8a827':b.key==='roxy'&&b.limitBreak?'#55585b':b.key==='bonnie'&&b.limitBreak?'#292c68':b.color;ctx.shadowColor=displayColor;ctx.shadowBlur=b.dashLeft>0?32:16;circle(0,0,b.radius,displayColor);ctx.shadowBlur=0;if(b.key==='mangle'){ctx.strokeStyle='#a97480';ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,R-2,0,TAU);ctx.stroke();}
 if(battleMode!=='duel'||balls.some(other=>other.key===b.key&&other.team!==b.team)){ctx.strokeStyle=teamColor(b.team);ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,b.radius+3,0,TAU);ctx.stroke();}
 if(b.key==='purpleguy') {
  if (b.springBonnieLeft > 0) drawSpringBonnie(b.radius);
  else drawPurpleGuyFace(b.radius / (R * 2));
 }
 if(b.key==='endo'){ctx.fillStyle='#17191c';ctx.fillRect(-17,5,34,13);ctx.fillStyle='#f1f0ed';ctx.fillRect(-15,6,30,10);ctx.fillStyle='#737b83';for(let x=-9;x<=9;x+=6){ctx.fillRect(x,6,2,10);}} if(b.key==='nightguard'&&b.powerless){ctx.fillStyle='#ffec73';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('POWERLESS',0,-R-26);}if(b.key==='nightguard'){ctx.fillStyle='#171525';ctx.fillRect(-31,-R-13,62,23);ctx.beginPath();ctx.ellipse(0,-R+10,38,9,0,0,TAU);ctx.fill();ctx.fillStyle='#f4ca42';ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?6:11;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r- R-2);}ctx.closePath();ctx.fill();circle(17,18,10,'#f4ca42');} if(b.stunTimer>0){ctx.strokeStyle='#fff3a0';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,b.radius+8,0,TAU);ctx.stroke();} if(b.key==='foxy'){if(b.dashLeft>0){ctx.strokeStyle='#ffda87';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,R+7,0,TAU);ctx.stroke();}ctx.strokeStyle='#181b23';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-34,-23);ctx.lineTo(34,0);ctx.stroke();ctx.fillStyle='#151922';ctx.fillRect(-25,-19,22,20);}
 if(b.key==='roxy'){if(b.dashLeft>0){ctx.strokeStyle='#39e66a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,R+7,0,TAU);ctx.stroke();}ctx.fillStyle=b.limitBreak?'#15552f':'#30d169';ctx.beginPath();ctx.moveTo(-34,-25);ctx.quadraticCurveTo(-43,-50,-23,-59);ctx.quadraticCurveTo(-8,-65,4,-47);ctx.lineTo(2,-34);ctx.quadraticCurveTo(-11,-43,-18,-35);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-20,-32);ctx.quadraticCurveTo(-24,-53,-2,-61);ctx.quadraticCurveTo(17,-67,27,-45);ctx.lineTo(24,-33);ctx.quadraticCurveTo(12,-43,5,-38);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(-3,-34);ctx.quadraticCurveTo(1,-51,21,-55);ctx.quadraticCurveTo(38,-58,39,-38);ctx.lineTo(30,-30);ctx.quadraticCurveTo(24,-42,14,-39);ctx.closePath();ctx.fill();ctx.strokeStyle=b.limitBreak?'#082c17':'#126b32';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1,-48);ctx.quadraticCurveTo(5,-42,2,-35);ctx.moveTo(23,-47);ctx.quadraticCurveTo(29,-40,24,-34);ctx.moveTo(35,-41);ctx.quadraticCurveTo(36,-35,30,-31);ctx.stroke();ctx.strokeStyle=b.limitBreak?'#493e50':'#8f77a8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-30,-13);ctx.quadraticCurveTo(-21,-19,-12,-13);ctx.moveTo(30,-13);ctx.quadraticCurveTo(21,-19,12,-13);ctx.stroke();if(b.limitBreak){ctx.fillStyle='#292b2d';ctx.beginPath();ctx.moveTo(-31,-12);ctx.lineTo(-25,-18);ctx.lineTo(-19,-15);ctx.lineTo(-13,-18);ctx.lineTo(-10,-11);ctx.lineTo(-16,-5);ctx.lineTo(-22,-7);ctx.lineTo(-28,-4);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(31,-12);ctx.lineTo(25,-18);ctx.lineTo(19,-15);ctx.lineTo(13,-18);ctx.lineTo(10,-11);ctx.lineTo(16,-5);ctx.lineTo(22,-7);ctx.lineTo(28,-4);ctx.closePath();ctx.fill();ctx.strokeStyle='#a5a8aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-30,-15);ctx.lineTo(-23,-11);ctx.lineTo(-25,-5);ctx.moveTo(-19,-16);ctx.lineTo(-21,-10);ctx.lineTo(-14,-8);ctx.moveTo(30,-15);ctx.lineTo(23,-11);ctx.lineTo(25,-5);ctx.moveTo(19,-16);ctx.lineTo(21,-10);ctx.lineTo(14,-8);ctx.stroke();ctx.fillStyle='#3c3e40';ctx.beginPath();ctx.moveTo(-24,-2);ctx.lineTo(-18,-5);ctx.lineTo(-16,1);ctx.closePath();ctx.moveTo(24,-2);ctx.lineTo(18,-5);ctx.lineTo(16,1);ctx.closePath();ctx.fill();}ctx.strokeStyle='#17191b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-31,8);ctx.quadraticCurveTo(-26,3,-22,8);ctx.quadraticCurveTo(-18,13,-13,7);ctx.moveTo(31,8);ctx.quadraticCurveTo(26,3,22,8);ctx.quadraticCurveTo(18,13,13,7);ctx.stroke();}
 if(isFreddyVariant(b)||b.key==='goldenfreddy'){ctx.fillStyle=b.key==='goldenfreddy'?'#7042a8':'#10141c';ctx.fillRect(-9.5*HAT_SCALE,-R-14*HAT_SCALE,19*HAT_SCALE,12.5*HAT_SCALE);ctx.fillRect(-13.5*HAT_SCALE,-R-2.5*HAT_SCALE,27*HAT_SCALE,4*HAT_SCALE);ctx.fillStyle=b.key==='goldenfreddy'?'#7042a8':'#965351';ctx.fillRect(-9.5*HAT_SCALE,-R-5.5*HAT_SCALE,19*HAT_SCALE,3*HAT_SCALE);ctx.fillStyle=b.key==='goldenfreddy'?'#7042a8':'#171820';ctx.beginPath();ctx.moveTo(0,22);ctx.lineTo(-16,12);ctx.lineTo(-16,32);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,22);ctx.lineTo(16,12);ctx.lineTo(16,32);ctx.closePath();ctx.fill();circle(0,22,4,b.key==='goldenfreddy'?'#7042a8':'#252631');}
 if(b.key==='bonnie'){ctx.save();ctx.fillStyle=displayColor;ctx.beginPath();ctx.ellipse(-17,-R-15,9,26,-.18,0,TAU);ctx.ellipse(17,-R-15,9,26,.18,0,TAU);ctx.fill();ctx.fillStyle='#bca4e6';ctx.beginPath();ctx.ellipse(-17,-R-15,4,19,-.18,0,TAU);ctx.ellipse(17,-R-15,4,19,.18,0,TAU);ctx.fill();ctx.fillStyle='#df3e4d';ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-16,-14);ctx.lineTo(-16,5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(16,-14);ctx.lineTo(16,5);ctx.closePath();ctx.fill();circle(0,-4,4,'#bd2939');ctx.translate(0,17);ctx.rotate(-.65);ctx.fillStyle='#dd3947';ctx.beginPath();ctx.moveTo(-9,-8);ctx.lineTo(-17,-13);ctx.lineTo(-12,3);ctx.quadraticCurveTo(-20,18,0,18);ctx.quadraticCurveTo(20,18,12,3);ctx.lineTo(17,-13);ctx.lineTo(9,-8);ctx.closePath();ctx.fill();ctx.fillStyle='#fff8ed';ctx.beginPath();ctx.moveTo(-8,-4);ctx.lineTo(8,-4);ctx.lineTo(9,10);ctx.lineTo(-9,10);ctx.closePath();ctx.fill();ctx.fillStyle='#754b42';ctx.fillRect(-3,-30,6,30);ctx.fillStyle='#e7ded9';ctx.fillRect(-5,-37,10,10);ctx.strokeStyle='#c9c4bf';ctx.lineWidth=.6;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*1.5,-34);ctx.lineTo(i*1.5,12);ctx.stroke();}ctx.restore();}
 if(b.key==='bonnie'&&b.limitBreak){circle(-12,-7,3,'#ff263f');circle(12,-7,3,'#ff263f');}
 if(b.key==='toyfreddy'){circle(-27,6,7,'#d24b46');circle(27,6,7,'#d24b46');}
 if(isChicaVariant(b)){ctx.fillStyle='#fff9ed';ctx.beginPath();ctx.moveTo(-24,-8);ctx.lineTo(24,-8);ctx.lineTo(20,27);ctx.quadraticCurveTo(0,39,-20,27);ctx.closePath();ctx.fill();if(b.key==='toychica'){ctx.fillStyle='#ed6faa';ctx.beginPath();ctx.moveTo(-31,24);ctx.lineTo(31,24);ctx.quadraticCurveTo(24,35,12,41);ctx.lineTo(-12,41);ctx.quadraticCurveTo(-24,35,-31,24);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffb4d5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-29,25);ctx.lineTo(29,25);ctx.stroke();}ctx.save();ctx.translate(0,-R+2);ctx.fillStyle='#ffe476';for(let i=-1;i<=1;i++){ctx.save();ctx.rotate(i*.5);ctx.beginPath();ctx.ellipse(0,-11,5,15,0,0,TAU);ctx.fill();ctx.restore();}ctx.restore();}
 ctx.restore();}
function drawWeapon(b){if(b.bossPower){drawBorrowedWeapons(b);return;}if(!b.weapon||b.weapon.detached)return;if(b.key==='mangle'){const p=weaponPosition(b);ctx.save();ctx.strokeStyle='#8e7a80';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.translate(p.x,p.y);ctx.rotate(b.weapon.angle+Math.PI/2);drawMangleRobotHead(ctx,1);ctx.restore();return;}if(b.key==='nightguard'){const p=weaponPosition(b);ctx.save();if(b.limitBreak){ctx.strokeStyle='#f4ca42';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x,b.y,R+9,0,TAU);ctx.stroke();ctx.fillStyle='#f4ca42';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.fillText('SHIELD '+b.shieldHits,b.x,b.y-R-22);}ctx.translate(p.x,p.y);ctx.rotate(b.weapon.angle);if(b.powerless){ctx.save();ctx.rotate(Math.PI/2);ctx.fillStyle='#252b36';ctx.fillRect(-18,-8,28,16);ctx.fillStyle='#747f90';ctx.fillRect(6,-12,12,24);ctx.fillStyle='#fff5a9';ctx.fillRect(16,-10,4,20);ctx.restore();ctx.restore();return;}const g=ctx.createLinearGradient(0,0,b.limitBreak?360:230,0);g.addColorStop(0,'rgba(255,244,155,.55)');g.addColorStop(1,'rgba(255,244,155,.05)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(b.limitBreak?360:230,b.limitBreak?-120:-65);ctx.lineTo(b.limitBreak?360:230,b.limitBreak?120:65);ctx.lineTo(0,9);ctx.closePath();ctx.fill();ctx.fillStyle='#252b36';ctx.fillRect(-18,-8,28,16);ctx.fillStyle='#747f90';ctx.fillRect(6,-12,12,24);ctx.fillStyle='#fff5a9';ctx.fillRect(16,-10,4,20);ctx.restore();return;}const w=b.weapon,p=weaponPosition(b);ctx.save();ctx.strokeStyle=b.color+'55';ctx.setLineDash([3,7]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y,w.orbit,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.translate(p.x,p.y);ctx.rotate(w.angle+Math.PI/2);ctx.shadowColor=b.color;ctx.shadowBlur=9;
if(b.key==='roxy'){ctx.fillStyle=b.limitBreak?'#55585b':'#9ea4aa';ctx.strokeStyle=b.limitBreak?'#777a7c':'#e7ebed';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,2,13,16,-.2,0,TAU);ctx.fill();ctx.stroke();for(const x of [-9,0,9]){ctx.beginPath();ctx.ellipse(x,-11,4.5,6,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=b.limitBreak?'#17602f':'#39e66a';ctx.beginPath();ctx.moveTo(x-2,-15);ctx.lineTo(x,-22);ctx.lineTo(x+2,-15);ctx.closePath();ctx.fill();ctx.fillStyle='#9ea4aa';}ctx.fillStyle=b.limitBreak?'#17602f':'#39e66a';ctx.beginPath();ctx.ellipse(15,5,6,3,-.45,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(-15,5,6,3,.45,0,TAU);ctx.fill();}
 if(b.key==='foxy'&&b.weapon?.name==='Crowbar'){ctx.fillStyle='#593d2f';ctx.fillRect(-7,-4,14,34);ctx.fillStyle='#aeb5bf';ctx.fillRect(-17,-9,34,8);ctx.fillRect(9,-9,8,15);ctx.strokeStyle='#e2e9f2';ctx.lineWidth=1;ctx.strokeRect(-17,-9,34,8);}else if(b.key==='foxy'){ctx.strokeStyle='#e2e9f2';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,11);ctx.lineTo(-8,-4);ctx.arc(0,-4,8,Math.PI,TAU+.3);ctx.stroke();ctx.fillStyle='#6d4535';ctx.fillRect(-12,8,8,9);}
 if(isFreddyVariant(b))drawMicrophone();
 if(b.key==='purpleguy')drawBossKnife(w.spriteScale);
  if(isChicaVariant(b)){if(b.limitBreak)drawBirthdayCake();else{ctx.fillStyle='#a65b31';ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.lineTo(9,14);ctx.lineTo(-9,14);ctx.closePath();ctx.fill();circle(-7,-3,7,'#f890c1');circle(7,-3,7,'#f890c1');circle(0,-7,9,'#ffb1d8');ctx.fillStyle='#ffe8a7';ctx.fillRect(-1,-20,3,9);circle(1,-22,3,'#ffb63d');}}ctx.restore();}
function drawMangleRobotHead(c,scale=1){c.save();c.scale(scale,scale);c.fillStyle='#c3c6c9';c.strokeStyle='#858b91';c.lineWidth=2;c.beginPath();c.roundRect(-12,-10,24,20,5);c.fill();c.stroke();c.fillStyle='#252a30';c.fillRect(-8,-4,5,5);c.fillRect(3,-4,5,5);c.fillStyle='#b97583';c.fillRect(-7,5,14,3);c.fillStyle='#737981';c.fillRect(-16,-4,4,8);c.fillRect(12,-4,4,8);c.restore();}
function launchMangleHead(owner){if(!owner.weapon||owner.weapon.detached)return;owner.weapon.detached=true;owner.weapon.touchingTargets.clear();const start=weaponPosition(owner),target=opponent(owner),angle=Math.atan2(target.y-start.y,target.x-start.x);mangleHeads.push({owner:owner.id,x:start.x,y:start.y,vx:Math.cos(angle)*600,vy:Math.sin(angle)*600,state:'out',radius:15,angle:0,life:5,hitOut:new Set(),hitBack:new Set()});playSound('weapon');}
function drawMangleHead(h){ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.angle);drawMangleRobotHead(ctx,1);ctx.restore();}
function drawPrizeBall(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle='#f4ca4b';ctx.strokeStyle='#f7efda';ctx.lineWidth=2;circle(0,0,13,'#f0c747');ctx.strokeStyle='#cf414a';ctx.lineWidth=4;for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(0,0,10,i*Math.PI/2+.2,i*Math.PI/2+1.0);ctx.stroke();}ctx.fillStyle='#fff7d8';ctx.fillRect(-7,-3,4,4);ctx.fillRect(3,-3,4,4);ctx.fillStyle='#323039';ctx.fillRect(-6,-2,2,2);ctx.fillRect(4,-2,2,2);ctx.restore();}
function drawHotCheese(p){ctx.save();ctx.globalAlpha=Math.min(1,p.life/.35);ctx.translate(p.x,p.y);ctx.fillStyle='#f6a72f';ctx.strokeStyle='#ffe773';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,22,11,0,0,TAU);ctx.fill();ctx.stroke();for(const [x,y,r] of [[-10,-2,2],[1,2,2.5],[10,-3,1.8]])circle(x,y,r,'#fff4a4');ctx.restore();}
function updateMangle(dt){for(const b of balls){if(b.key!=='mangle'||b.hp<=0)continue;const cooldown=mangleCooldowns(b);b.headThrowTimer+=dt;b.prizeTimer+=dt;b.cheeseTimer+=dt;if(b.headThrowTimer>=cooldown.head){b.headThrowTimer-=cooldown.head;launchMangleHead(b);}if(b.prizeTimer>=cooldown.prize){b.prizeTimer-=cooldown.prize;const pool=prizeAttackPool();if(pool.length){const attack=pool[Math.floor(Math.random()*pool.length)],target=opponent(b);prizeBalls.push({owner:b.id,x:b.x,y:b.y,angle:0,fuse:.45,attack:attack.id,target:target.id});playSound('weapon');}}if(b.cheeseTimer>=cooldown.cheese){b.cheeseTimer-=cooldown.cheese;spawnHotCheese(b);playSound('weapon');}}
mangleHeads=mangleHeads.filter(h=>{const owner=balls[h.owner];if(!owner||owner.hp<=0)return false;h.life-=dt;h.angle+=TAU*1.5*dt;if(h.state==='out'){h.x+=h.vx*dt;h.y+=h.vy*dt;for(const target of opponents(owner)){if(!h.hitOut.has(target.id)&&Math.hypot(target.x-h.x,target.y-h.y)<=target.radius+h.radius){h.hitOut.add(target.id);hurt(target,5,'Mangle boomerang',owner);playSound('weapon');}}const wall=h.x<=h.radius||h.x>=W-h.radius||h.y<=h.radius||h.y>=H-h.radius;if(wall){h.x=Math.max(h.radius,Math.min(W-h.radius,h.x));h.y=Math.max(h.radius,Math.min(H-h.radius,h.y));h.state='back';}}
else{const dx=owner.x-h.x,dy=owner.y-h.y,d=Math.hypot(dx,dy)||1,returnSpeed=Math.max(660,Math.hypot(owner.vx,owner.vy)+300);h.vx=dx/d*returnSpeed;h.vy=dy/d*returnSpeed;const ox=h.x,oy=h.y;h.x+=h.vx*dt;h.y+=h.vy*dt;for(const target of opponents(owner)){if(!h.hitBack.has(target.id)&&segmentDistance(target.x,target.y,ox,oy,h.x,h.y)<=target.radius+h.radius){h.hitBack.add(target.id);hurt(target,5,'Mangle boomerang return',owner);playSound('weapon');}}if(d<=owner.weapon.orbit+returnSpeed*dt){owner.weapon.angle=Math.atan2(h.y-owner.y,h.x-owner.x);owner.weapon.detached=false;owner.weapon.touchingTargets.clear();return false;}}return true;});
prizeBalls=prizeBalls.filter(p=>{p.fuse-=dt;p.angle+=TAU*dt;if(p.fuse<=0){const owner=balls[p.owner],target=balls[p.target]||opponent(owner);if(owner&&target&&owner.hp>0&&target.hp>0)firePrizeAttack(owner,target,p.attack);return false;}return true;});
updateHotCheese(dt);}
function updateHotCheese(dt){hotCheese=hotCheese.filter(p=>{const owner=balls[p.owner];if(!owner||owner.hp<=0||p.life<=0)return false;const activeTime=Math.min(dt,p.life);p.life-=dt;if(owner.limitBreak&&!p.target){const target=opponents(owner).find(t=>Math.hypot(t.x-p.x,t.y-p.y)<=t.radius+22);if(target){p.target=target;const a=Math.atan2(p.y-target.y,p.x-target.x);p.offsetX=Math.cos(a)*R*.75;p.offsetY=Math.sin(a)*R*.75;p.tick=0;p.life=Math.max(0,2-activeTime);}}if(p.target){if(p.target.hp<=0||!balls.includes(p.target))return false;p.x=p.target.x+p.offsetX;p.y=p.target.y+p.offsetY;}if(owner.limitBreak&&!p.target)return p.life>0;p.tick+=activeTime;const interval=.5;while(p.tick+1e-9>=interval){p.tick=Math.max(0,p.tick-interval);const targets=p.target?[p.target]:opponents(owner).filter(t=>Math.hypot(t.x-p.x,t.y-p.y)<=t.radius+22);for(const target of targets){if(target.hp>0){hurt(target,1,'hot cheese',owner);playSound('weapon');}}}return p.life>0;});}
function prizeAttackPool(){return Object.entries(CHARACTERS).flatMap(([character,spec])=>(spec.attacks||[]).map(id=>({id,character})));}
function firePrizeAttack(owner,target,id){const dx=target.x-owner.x,dy=target.y-owner.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d;switch(id){case'toyfreddy-mic-toss':launchMicToss(owner,target,false);break;case'freddy-pizza-wheel':emitPizzaWheel(owner);break;case'freddy-shockwave':emitShockwave(owner);break;case'toychica-cupcake':case'chica-cupcake':dropCupcake(owner);break;case'chica-pizza':dropPizza(owner);break;case'foxy-dash':firePrizeProjectile(owner,target,5,'#d9473f','Prize Ball Foxy dash',true);break;case'foxy-hook':firePrizeProjectile(owner,target,3,'#d9473f','Prize Ball Foxy hook',true);break;case'bonnie-burst':projectiles.push({owner:owner.id,x:owner.x,y:owner.y,vx:nx*900,vy:ny*900,radius:R*1.5,damage:3,life:2.5,color:'#7771ce',attackName:'Prize Ball soundwave'});playSound('bonnie-burst');break;case'bonnie-soundwave':waves.push({type:'sound',owner:owner.id,x:owner.x,y:owner.y,radius:0,maxRadius:R*2.5,speed:R*2.5/.4,damage:10,life:.65,color:'#7771ce',power:true});playSound('bonnie-power');break;case'endo-minion':owner.minions.push({x:owner.x+nx*(R+15),y:owner.y+ny*(R+15)});playSound('endo-minion-spawn');break;case'roxy-paw':hurt(target,5,'Prize Ball paw',owner);target.grappled=true;target.grappleOwner=owner.id;target.grappleTimer=.32;break;case'golden-teleport':hurt(target,5,'Prize Ball teleport',owner);target.vx+=nx*BASE_SPEED;target.vy+=ny*BASE_SPEED;capSpeed(target);break;case'nightguard-light':hurt(target,3,'Prize Ball flashlight beam',owner);break;case'mangle-head':firePrizeProjectile(owner,target,5,'#aeb3b7','Prize Ball robot head');break;case'mangle-boomerang':launchMangleHead(owner);break;case'mangle-cheese':spawnHotCheese(owner);break;default:{const meta=CHARACTERS[id.split('-')[0]];const damage=meta?.weapon?.damage||5;firePrizeProjectile(owner,target,damage,meta?.color||owner.color,'Prize Ball '+id);}}}
function firePrizeProjectile(owner,target,damage,color,name,critEligible=false){const dx=target.x-owner.x,dy=target.y-owner.y,d=Math.hypot(dx,dy)||1;projectiles.push({owner:owner.id,x:owner.x,y:owner.y,vx:dx/d*900,vy:dy/d*900,radius:14,damage,life:2.5,color,attackName:name,critEligible});playSound('weapon');}
function drawPizza(p){ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=p.armed?1:.45;ctx.fillStyle='#f5ce68';ctx.beginPath();ctx.moveTo(-10,-7);ctx.lineTo(10,-7);ctx.lineTo(0,12);ctx.closePath();ctx.fill();ctx.strokeStyle='#b87038';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-10,-7);ctx.lineTo(10,-7);ctx.stroke();circle(-3,-1,2.5,'#ca4b3c');circle(3,3,2,'#ca4b3c');if(battleMode!=='duel'||balls.some(other=>other.key===balls[p.owner]?.key&&other.team!==balls[p.owner]?.team)){ctx.strokeStyle=teamColor(balls[p.owner]?.team);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,14,0,TAU);ctx.stroke();}ctx.restore();}
function drawGoldenDrainZones(){for(const b of balls){if(!isStationaryGolden(b)||!b.limitBreak||b.hp<=0)continue;ctx.save();ctx.beginPath();ctx.arc(b.x,b.y,R*3,0,TAU);ctx.fillStyle='rgba(0,0,0,.22)';ctx.fill();ctx.strokeStyle='rgba(0,0,0,.85)';ctx.lineWidth=3;ctx.stroke();ctx.restore();}}
function draw(dt){ctx.clearRect(0,0,W,H);for(let y=0;y<H;y+=40){for(let x=0;x<W;x+=40){ctx.fillStyle=(x/40+y/40)%2===0?'#ffffff':'#000000';ctx.fillRect(x,y,40,40);}}trails=trails.filter(p=>{if(!paused&&started)p.life=Math.max(0,p.life-dt);return p.life>0;});for(const b of balls){if(b.key==='nightguard'&&b.powerless){ctx.save();ctx.translate(b.batteryX,b.batteryY);ctx.fillStyle='#f4ca42';ctx.fillRect(-8,-14,16,28);ctx.fillStyle='#363b45';ctx.fillRect(-4,-18,8,4);ctx.fillStyle='#5dd6c4';ctx.fillRect(-3,-9,6,18);ctx.restore();}}for(const p of trails){const progress=p.maxLife>0?Math.max(0,Math.min(1,p.life/p.maxLife)):0;ctx.globalAlpha=progress*.62;circle(p.x,p.y,5+7*progress,p.color);}ctx.globalAlpha=1;for(const wave of waves){ctx.save();ctx.globalAlpha=Math.max(0,wave.life/.6);ctx.fillStyle=wave.color+'28';ctx.strokeStyle=wave.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(wave.x,wave.y,wave.radius,0,TAU);if(wave.type!=='sound')ctx.fill();ctx.stroke();if(wave.type==='sound'&&wave.power&&wave.radius>8){ctx.beginPath();ctx.arc(wave.x,wave.y,wave.radius-8,0,TAU);ctx.stroke();}ctx.restore();}drawGoldenDrainZones();for(const b of balls){if((b.key==='endo'||b.key==='mangle')&&b.hp>0)for(const m of b.minions){ctx.save();ctx.translate(m.x,m.y);circle(0,0,12,'#8c959e');ctx.strokeStyle='#555d66';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,-20);ctx.stroke();circle(0,-22,4,'#df3942');ctx.restore();}}if(rainbow)drawRainbow(rainbow);projectiles.forEach(drawSoundProjectile);lasers.forEach(drawLaser);hooks.forEach(drawThrownHook);mangleHeads.forEach(drawMangleHead);prizeBalls.forEach(drawPrizeBall);hotCheese.filter(p=>!p.target).forEach(drawHotCheese);pizzas.forEach(drawPizza);pizzaWheels.forEach(drawPizzaWheel);pizzaSlices.forEach(drawPizzaSlice);cupcakes.forEach(drawDroppedCupcake);balls.filter(ball=>ball.hp>0).forEach(drawCharacter);hotCheese.filter(p=>p.target).forEach(drawHotCheese);drawShards();balls.filter(ball=>ball.hp>0).forEach(drawWeapon);particles=particles.filter(p=>p.life>0);for(const p of particles){if(!paused&&started){p.life-=dt;p.y-=45*dt;}ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.font='bold 23px system-ui';ctx.textAlign='center';ctx.fillText(p.text,p.x,p.y-50);}ctx.globalAlpha=1;}
function setSimulationSpeed(rate){if(![1,2,3,5,10].includes(rate))return;simulationSpeed=rate;acc=0;for(const value of [1,2,3,5,10])el('speed-'+value).setAttribute('aria-pressed',String(value===rate));announce(rate+' times battle speed');}
function drawRecordedHealthBox(c, ball, x, y, width, height) {
  const fraction = Math.max(0, Math.min(1, ball.hp / ball.maxHp));
  c.fillStyle = '#172234';
  c.fillRect(x, y, width, height);
  c.fillStyle = ball.color;
  c.fillRect(x, y, width * fraction, height);
  c.strokeStyle = '#64748b';
  c.lineWidth = 2;
  c.strokeRect(x + 1, y + 1, width - 2, height - 2);

  c.save();
  c.textAlign = 'center';
  c.fillStyle = '#f1f5ff';
  c.shadowColor = '#0b1019';
  c.shadowBlur = 6;
  c.font = 'bold 26px system-ui';
  c.fillText(ball.name, x + width / 2, y + 40, width - 24);
  c.font = 'bold 32px system-ui';
  c.fillText(Math.max(0, ball.hp) + ' HP', x + width / 2, y + 82);
  c.restore();
}

function drawRecordedLimitBreak(c, fighter, x, y, width) {
  const height = 20;
  const charge = limitBreakCharge(fighter) / fighter.limitDamage;
  c.save();
  c.fillStyle = '#253247';
  c.fillRect(x, y, width, height);
  c.fillStyle = '#e7f85c';
  c.fillRect(x, y, width * charge, height);
  c.strokeStyle = '#64748b';
  c.lineWidth = 2;
  c.strokeRect(x + 1, y + 1, width - 2, height - 2);
  c.font = 'bold 17px system-ui';
  c.fillStyle = '#f1f5ff';
  c.textAlign = 'left';
  c.fillText('Limit Break', x, y - 7);
  c.textAlign = 'right';
  c.fillText(limitBreakLabel(fighter), x + width, y - 7);
  c.restore();
}

function drawRecordedCooldowns(c, ball, x, y, width, accent) {
  const meters = cooldownMeters(ball);
  c.save();
  c.textAlign = 'left';
  const gap = 8;
  const barWidth = Math.min(180, (width - gap * (meters.length - 1)) / Math.max(1, meters.length));
  const barHeight = 32;
  meters.forEach((meter, i) => {
    const barX = x + i * (barWidth + gap);
    const barY = y + 8;
    const elapsed = Math.max(0, Math.min(meter.duration, meter.elapsed));
    const remaining = meter.duration - elapsed;
    const shield = meter.id === 'shield';
    const progress = (shield ? remaining : elapsed) / meter.duration;
    const value = meter.status ?? (meter.slices
      ? (shield ? remaining : elapsed) + '/' + meter.duration
      : (Math.max(0, Math.ceil(remaining * 100 - 1e-8)) / 100).toFixed(2) + 's');

    c.textAlign = 'left';
    c.fillStyle = '#e1e9f5';
    c.font = 'bold 18px system-ui';
    c.fillText(meter.label, barX, y, barWidth);

    c.fillStyle = '#253247';
    c.fillRect(barX, barY, barWidth, barHeight);
    c.fillStyle = accent;
    c.fillRect(barX, barY, barWidth * progress, barHeight);
    c.strokeStyle = '#64748b';
    c.lineWidth = 2;
    c.strokeRect(barX + 1, barY + 1, barWidth - 2, barHeight - 2);

    c.textAlign = 'center';
    c.fillStyle = '#fff';
    c.shadowColor = '#0b1019';
    c.shadowBlur = 6;
    c.font = 'bold 21px system-ui';
    c.fillText(value, barX + barWidth / 2, barY + 23);
    c.shadowBlur = 0;
  });
  c.restore();
}

function drawRecordedFrame() {
  const c = recordCtx;
  const arenaX = 160, arenaY = 580, arenaSize = 760;
  const boxGap = 24, boxHeight = 104, bottomMargin = 72;
  const boxWidth = (arenaSize - boxGap) / 2;
  const boxY = recordCanvas.height - bottomMargin - boxHeight;
  c.fillStyle = '#0b1019';
  c.fillRect(0, 0, recordCanvas.width, recordCanvas.height);
  c.drawImage(canvas, arenaX, arenaY, arenaSize, arenaSize);

  for (const side of ['left', 'right']) {
    const ball = balls.find(b => b.team === side);
    if (!ball) continue;
    const left = side === 'left';
    const boxX = left ? arenaX : arenaX + boxWidth + boxGap;
    drawRecordedHealthBox(c, ball, boxX, boxY, boxWidth, boxHeight);
    if (limitBreaksEnabled && ball.limitDamage) drawRecordedLimitBreak(c, ball, boxX, boxY - 112, boxWidth);
    if (ball.hp <= 0) continue;

    const mirror = balls.some(o => o.key === ball.key && o.team !== ball.team);
    const accent = battleMode === 'teams' || mirror ? teamColor(side) : ball.color;
    drawRecordedCooldowns(c, ball, boxX, boxY - 66, boxWidth, accent);
  }
  if (recorder && recorder.state === 'recording') requestAnimationFrame(drawRecordedFrame);
}

function startArenaRecording(){if(!recordCanvas.captureStream||!globalThis.MediaRecorder){announce('MP4 recording is not supported in this browser.');return;}let stream=null;try{const mime=['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4;codecs=avc1.42E01E','video/mp4'].find(type=>MediaRecorder.isTypeSupported(type));if(!mime){announce('This browser does not support MP4 recording.');return;}recordChunks=[];stream=recordCanvas.captureStream(30);const audioTrack=globalThis.BattleSounds?.getRecordingAudioTrack?.();if(!audioTrack)throw Error('audio capture unavailable');stream.addTrack(audioTrack);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000,audioBitsPerSecond:128000});recorder.ondataavailable=e=>{if(e.data&&e.data.size>0)recordChunks.push(e.data);};recorder.onstop=()=>{const type=recorder.mimeType||mime,blob=new Blob(recordChunks,{type});stream.getVideoTracks().forEach(track=>track.stop());el('record-start').hidden=false;el('record-stop').hidden=true;if(!blob.size){announce('No video frames were captured. Please record for a moment and stop again.');return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='bounce-battle-arena.mp4';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);announce('MP4 recording saved ('+Math.ceil(blob.size/1024)+' KB).');};recorder.onerror=()=>announce('MP4 recording failed in this browser.');recorder.start(1000);el('record-start').hidden=true;el('record-stop').hidden=false;drawRecordedFrame();announce('Recording arena and meters with sound to MP4.');}catch{if(stream)stream.getVideoTracks().forEach(track=>track.stop());el('record-start').hidden=false;el('record-stop').hidden=true;announce('Could not start audio MP4 recording in this browser.');}}
function stopArenaRecording(){if(recorder&&recorder.state!=='inactive')recorder.stop();}
function frame(t){const dt=Math.min((t-lastTime)/1000||0,.05);lastTime=t;updateDeathSequence(dt*simulationSpeed);if(started&&!paused&&!finished){acc+=dt*simulationSpeed;while(acc+1e-12>=1/120&&!finished){step(1/120);acc=Math.max(0,acc-1/120);}if(finished)acc=0;updateUI();}else acc=0;draw(dt*simulationSpeed);requestAnimationFrame(frame);}
function updateSelection(){const keys=[el('select-0').value,el('select-1').value];for(let i=0;i<2;i++){const spec=CHARACTERS[keys[i]];el('select-'+i).style.borderColor=keys[0]===keys[1]?(i?'#61a9ff':'#ff6565'):spec.color;}}
function selectTab(custom){el('battle-panel').hidden=custom;el('custom-panel').hidden=!custom;el('battle-tab').setAttribute('aria-selected',String(!custom));el('custom-tab').setAttribute('aria-selected',String(custom));el('restart').disabled=custom;if(custom){pausedBeforeCustomization=paused;paused=true;globalThis.BattleSounds?.stopAll();}else paused=pausedBeforeCustomization;updateUI();}
function setSetupMode(mode) {
  setupMode = mode;
  const boss = mode === 'boss';
  el('duel-selectors').hidden = mode !== 'duel';
  el('team-selectors').hidden = mode === 'duel';
  el('team-actions').hidden = mode === 'duel';
  el('right-team-picker').hidden = boss;
  el('boss-picker').hidden = !boss;
  el('start-team').hidden = boss;
  el('start-boss').hidden = !boss;
  for (const entry of ['duel', 'teams', 'boss']) {
    const button = el(entry + '-mode');
    button.setAttribute('aria-pressed', String(entry === mode));
    button.classList.toggle('secondary', entry !== mode);
  }
}
function renderTeamSetup(){for(const side of ['left','right']){const host=el(side+'-picks'),selected=setupTeams[side];host.innerHTML=selected.map((key,index)=>'<div class="team-pick-row"><select class="team-pick" data-side="'+side+'" data-index="'+index+'" aria-label="'+(side==='left'?'Left':'Right')+' team fighter '+(index+1)+'"></select><button type="button" class="secondary remove-fighter" data-side="'+side+'" data-index="'+index+'" aria-label="Remove fighter">−</button></div>').join('');for (const pick of host.querySelectorAll('.team-pick')) {
  const index = Number(pick.dataset.index);
  populateFighterPicker(pick, selected[index], selected);
  pick.onchange = () => {
    setupTeams[side][index] = pick.value;
    renderTeamSetup();
  };
}for(const remove of host.querySelectorAll('.remove-fighter'))remove.onclick=()=>{if(setupTeams[side].length<=1)return;setupTeams[side].splice(Number(remove.dataset.index),1);renderTeamSetup();};el('add-'+(side==='left'?'left':'right')).disabled=selected.length>=Object.keys(CHARACTERS).length-BOSSES.length;for(const remove of host.querySelectorAll('.remove-fighter'))remove.disabled=selected.length<=1;}}
function readSetupTeams(){return {left:[...setupTeams.left],right:[...setupTeams.right]};}
function addTeamFighter(side){const available=Object.keys(CHARACTERS).find(key=>!CHARACTERS[key].boss&&!setupTeams[side].includes(key));if(!available)return;setupTeams[side].push(available);renderTeamSetup();}
populateFighterPicker(el('select-0'), 'freddy');
populateFighterPicker(el('select-1'), 'foxy');
el('select-0').onchange=updateSelection;el('select-1').onchange=updateSelection;
for (const key of BOSSES) {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = CHARACTERS[key].name;
  el('select-boss').append(option);
}
el('boss-mode').onclick = () => setSetupMode('boss');
el('start-boss').onclick = () => reset({left: setupTeams.left, right: [el('select-boss').value]}, true, 'boss');
el('duel-mode').onclick=()=>setSetupMode('duel');el('teams-mode').onclick=()=>setSetupMode('teams');el('add-left').onclick=()=>addTeamFighter('left');el('add-right').onclick=()=>addTeamFighter('right');renderTeamSetup();setSetupMode('duel');
el('start-duel').onclick=()=>reset({left:[el('select-0').value],right:[el('select-1').value]},true,'duel');el('start-team').onclick=()=>reset(readSetupTeams(),true,'teams');el('restart').onclick=()=>reset(activeTeams,true,battleMode);el('pause').onclick=()=>{if(!started||finished)return;paused=!paused;if(paused)globalThis.BattleSounds?.stopAll();updateUI();};el('battle-tab').onclick=()=>{if(el('battle-panel').hidden)selectTab(false);};el('custom-tab').onclick=()=>{if(el('custom-panel').hidden)selectTab(true);};
for(const rate of [1,2,3,5,10])el('speed-'+rate).onclick=()=>setSimulationSpeed(rate);
el('record-start').onclick=startArenaRecording;el('record-stop').onclick=stopArenaRecording;el('limit-break-toggle').checked=limitBreaksEnabled;el('limit-break-toggle').onchange=()=>{limitBreaksEnabled=el('limit-break-toggle').checked;localStorage.setItem('bounceBattleLimitBreaks',String(limitBreaksEnabled));updateUI();};setSimulationSpeed(1);updateSelection();reset(activeTeams,false,'duel');requestAnimationFrame(frame);

function rainbowSpeed(age){return Math.min(Number.MAX_VALUE,700*Math.exp(Math.min(Math.log(Number.MAX_VALUE/700),Math.log(1.3)*Math.max(0,age))));}
function spawnNextRainbow(){
 if(rainbow)return;
 const eligible=balls.filter(b=>b.key==='toychica'&&b.limitBreak&&b.hp>0).sort((a,b)=>a.id-b.id);
 if(!eligible.length)return;
 const owner=eligible.find(b=>b.id>lastRainbowOwner)||eligible[0],target=opponent(owner);
 if(!target||target.team===owner.team||target.hp<=0)return;
 let point;
 for(let attempt=0;attempt<64;attempt++){
  const edge=Math.floor(Math.random()*4),along=22+Math.random()*(W-44);
  point=edge===0?{x:22,y:along}:edge===1?{x:W-22,y:along}:edge===2?{x:along,y:22}:{x:along,y:H-22};
  if((!lastRainbowSpawn||Math.hypot(point.x-lastRainbowSpawn.x,point.y-lastRainbowSpawn.y)>48)&&Math.hypot(point.x-target.x,point.y-target.y)>R+32)break;
 }
 if(lastRainbowSpawn&&Math.hypot(point.x-lastRainbowSpawn.x,point.y-lastRainbowSpawn.y)<=48){
  point={x:W-lastRainbowSpawn.x,y:H-lastRainbowSpawn.y};
 }
 rainbow={owner:owner.id,target:target.id,x:point.x,y:point.y,age:0,speed:700,radius:22};
 lastRainbowOwner=owner.id;lastRainbowSpawn=point;
 playSound('toychica-rainbow');
}
function updateRainbow(dt){
 if(!rainbow){spawnNextRainbow();return;}
 const p=rainbow,owner=balls[p.owner],target=balls[p.target];
 if(!owner||owner.hp<=0||!owner.limitBreak||!target||target.hp<=0||target.team===owner.team){rainbow=null;spawnNextRainbow();return;}
 const dx=target.x-p.x,dy=target.y-p.y,distance=Math.hypot(dx,dy),oldX=p.x,oldY=p.y,k=Math.log(1.3);
 const travel=Math.min(distance,p.speed*Math.expm1(k*dt)/k);
 p.age+=dt;p.speed=rainbowSpeed(p.age);
 if(distance>0){p.x+=dx/distance*travel;p.y+=dy/distance*travel;}
 if(segmentDistance(target.x,target.y,oldX,oldY,p.x,p.y)<=target.radius+p.radius){
  hurt(target,15,'homing rainbow',owner);playSound('weapon');rainbow=null;spawnNextRainbow();
 }
}
function drawRainbow(p){
 ctx.save();ctx.translate(p.x,p.y);ctx.scale(.2,.2);
 ctx.lineCap='butt';ctx.lineWidth=22;
 for(const [radius,color]of [[139,'#ff1679'],[119,'#ff972c'],[99,'#ffe53c'],[79,'#1d70ff']]){
  ctx.strokeStyle=color;ctx.beginPath();ctx.arc(0,34,radius,Math.PI,TAU);ctx.stroke();
 }
 for(const x of [-139,139]){
  for(const [dx,dy,r]of [[-22,7,24],[20,10,25],[-15,32,25],[15,32,25],[0,-17,26],[0,12,27]]){
   ctx.fillStyle='#fff';ctx.strokeStyle='#d7d7dc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+dx,34+dy,r,0,TAU);ctx.fill();ctx.stroke();
  }
 }
 for(const x of [-50,50]){circle(x,-65,24,'#fff');circle(x+5,-58,15,'#080909');circle(x+10,-51,8,'#fff');}
 ctx.fillStyle='#370002';ctx.beginPath();ctx.moveTo(-61,-26);ctx.lineTo(61,-26);ctx.quadraticCurveTo(55,38,0,38);ctx.quadraticCurveTo(-55,38,-61,-26);ctx.fill();
 ctx.fillStyle='#fff';ctx.fillRect(-28,-25,18,14);ctx.fillRect(8,-25,18,14);ctx.restore();
}

function suddenDeathDamage(at=matchElapsed){return 1+Math.floor(Math.max(0,at-240+1e-8)/5);}
function updateSuddenDeath(){
 if(battleMode==='boss'||!started||paused||finished||matchElapsed+1e-8<240)return;
 if(!suddenDeath){suddenDeath=true;announce('Sudden Death! All fighters take increasing damage every second.');}
 while(matchElapsed+1e-8>=nextSuddenDeathTick){
  const damage=suddenDeathDamage(nextSuddenDeathTick);
  for(const b of balls){if(b.hp<=0)continue;loseHp(b,damage);particles.push({x:b.x,y:b.y,text:'−'+damage,color:'#ff6b79',life:1});}
  nextSuddenDeathTick++;
  if(balls.some(b=>b.hp<=0))break;
 }
}

function isFreddyVariant(fighter) {
  return fighter.key === 'freddy' || fighter.key === 'toyfreddy';
}

function updateFreddySecondary(fighter, dt) {
  if (fighter.key === 'freddy') {
    fighter.pizzaWheelTimer += dt;
    if (fighter.pizzaWheelTimer >= 6) {
      fighter.pizzaWheelTimer -= 6;
      emitPizzaWheel(fighter);
    }
    return;
  }

  if (fighter.limitBreak) {
    fighter.pizzaWheelTimer += dt;
    while (fighter.pizzaWheelTimer >= 1 - 1e-9) {
      fighter.pizzaWheelTimer = Math.max(0, fighter.pizzaWheelTimer - 1);
      emitPizzaWheel(fighter, true);
    }
  }

  if (fighter.weapon.detached) return;
  fighter.micTossTimer = Math.min(2, fighter.micTossTimer + dt);
  if (fighter.micTossTimer < 2 - 1e-9) return;
  const target = opponent(fighter);
  if (target?.hp > 0) launchMicToss(fighter, target, true);
}

function launchMicToss(owner, target, replaceWeapon) {
  const angle = Math.atan2(target.y - owner.y, target.x - owner.x);
  const speed = 1440;
  if (replaceWeapon) {
    owner.weapon.detached = true;
    owner.weapon.touchingTargets.clear();
    owner.micTossTimer = 0;
  }
  projectiles.push({
    micToss: true, replaceWeapon, owner: owner.id,
    x: owner.x, y: owner.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    radius: CHARACTERS.freddy.weapon.r
  });
  playSound('toyfreddy-mic-toss');
}

function updateMicToss(projectile, dt) {
  const owner = balls[projectile.owner];
  if (!owner) return false;
  const {x, y, vx, vy, radius} = projectile;
  const wallX = vx > 0 ? (W - radius - x) / vx : vx < 0 ? (radius - x) / vx : Infinity;
  const wallY = vy > 0 ? (H - radius - y) / vy : vy < 0 ? (radius - y) / vy : Infinity;
  const travel = Math.min(dt, wallX, wallY);
  projectile.x += vx * travel;
  projectile.y += vy * travel;

  const hit = opponents(owner).find(target =>
    segmentDistance(target.x, target.y, x, y, projectile.x, projectile.y) <= target.radius + radius
  );
  if (hit) {
    hurt(hit, 10, 'mic toss', owner);
    playSound('weapon');
  }
  if (!hit && wallX > dt && wallY > dt) return true;

  if (projectile.replaceWeapon && owner.weapon) {
    owner.weapon.detached = false;
    owner.weapon.touchingTargets.clear();
    owner.micTossTimer = 0;
  }
  return false;
}

function drawMicrophone() {
  ctx.scale(MIC_SCALE, MIC_SCALE);
  ctx.fillStyle = '#373c4e';
  ctx.fillRect(-4, -2, 8, 20);
  circle(0, -6, 10, '#cbd2dd');
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#646c7f';
  ctx.lineWidth = 1;
  for (let y = -12; y <= 0; y += 4) {
    ctx.beginPath();
    ctx.moveTo(-7, y);
    ctx.lineTo(7, y);
    ctx.stroke();
  }
}

function drawPurpleGuyFace(scale) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = '#241932';
  ctx.fillRect(-50, -40, 34, 23);
  ctx.fillRect(3, -40, 34, 23);
  ctx.fillStyle = '#eee9f2';
  ctx.fillRect(-46, -37, 10, 17);
  ctx.fillRect(7, -37, 10, 17);

  ctx.fillStyle = '#261b30';
  ctx.beginPath();
  ctx.moveTo(-53, -7);
  for (const [x, y] of [[-42,-7],[-42,0],[35,0],[35,-7],[46,-7],[46,19],[36,19],[36,27],[-40,27],[-40,19],[-53,19]]) {
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b69242';
  ctx.fillRect(28, 39, 25, 7);
  ctx.fillRect(32, 46, 17, 16);
  ctx.fillRect(36, 62, 9, 5);
  ctx.restore();
}

function drawBossKnife(scale) {
  ctx.scale(scale, scale);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#cfd5df';
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-5, -16);
  ctx.lineTo(5, -24);
  ctx.lineTo(6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#737887';
  ctx.fillRect(-8, 0, 16, 4);
  ctx.fillStyle = '#292331';
  ctx.fillRect(-4, 4, 8, 13);
}

function weaponRotationRate(fighter, weapon = fighter.weapon) {
  const multiplier = fighter.springBonnieLeft > 0 ? SPRING_BONNIE.rotationMultiplier : 1;
  return weapon.rate * multiplier;
}

function trySpringBonnie(fighter) {
  if (fighter.hp <= 0 || fighter.springBonnieLeft > 0 || fighter.hpLost < fighter.nextSuitAt) return;
  fighter.nextSuitAt += SPRING_BONNIE.damageGoal;
  fighter.springBonnieLeft = SPRING_BONNIE.duration;
  heal(fighter, SPRING_BONNIE.healing);
  playSound('purpleguy-suit');
  announce('Purple Guy puts on the Spring Bonnie suit!');
}

function updateSpringBonnie(fighter, dt) {
  if (fighter.springBonnieLeft <= 0) return;
  fighter.springBonnieLeft = Math.max(0, fighter.springBonnieLeft - dt);
  if (fighter.springBonnieLeft === 0) trySpringBonnie(fighter);
}

function springBonnieMeter(fighter) {
  const {duration, damageGoal} = SPRING_BONNIE;
  if (fighter.springBonnieLeft > 0) {
    return {id:'costume', label:'Spring Bonnie', elapsed:fighter.springBonnieLeft,
      duration, status:Math.ceil(fighter.springBonnieLeft) + 's left'};
  }
  const charge = Math.min(damageGoal, fighter.hpLost - (fighter.nextSuitAt - damageGoal));
  return {id:'costume', label:'Spring Bonnie', elapsed:charge,
    duration:damageGoal, status:Math.floor(charge) + '/' + damageGoal + ' HP'};
}

function drawSpringBonnie(radius) {
  ctx.save();
  ctx.scale(radius / 65.25, radius / 65.25);

  function piece(x, y, width, height, angle, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, angle, 0, TAU);
    ctx.fill();
  }

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 31, -48);
    ctx.rotate(side * .62);
    piece(0, -13, 10, 25, 0, '#654b24');
    piece(0, -16, 7, 18, 0, '#b48e42');
    piece(0, -38, 9, 15, side * .42, '#9e7936');
    ctx.restore();
    piece(side * 21, -15, 15, 17, 0, '#473421');
    classicSuitEye(side * 21, -15);
    piece(side * 12, 20, 15, 10, 0, '#c5a35a');
  }
  piece(0, 32, 24, 10, 0, '#503921');
  piece(0, 41, 21, 6, 0, '#d1af63');
  piece(0, 15, 6, 4, 0, '#251e1b');
  ctx.fillStyle = '#f4e7ba';
  for (const x of [-9, -3, 3]) ctx.fillRect(x, 27, 5, 5);
  ctx.fillStyle = '#6e315c';
  for (const side of [-1, 1]) {
    ctx.beginPath();ctx.moveTo(0,52);ctx.lineTo(side*15,46);ctx.lineTo(side*15,57);ctx.closePath();ctx.fill();
  }
  circle(0,52,4,'#a45d89');
  ctx.restore();
}

function classicSuitEye(x, y) {
  circle(x,y,8,'#d8cda8');
  circle(x,y,4,'#342b23');
  circle(x-1.5,y-2,1.5,'#fff8dc');
}

function orbitingWeapons(fighter) {
  if (fighter.bossPower) return [fighter.weapon, fighter.extraWeapon, fighter.hookWeapon];
  return fighter.weapon ? [fighter.weapon] : [];
}

function spinWeapons(fighter, dt) {
  for (const weapon of orbitingWeapons(fighter)) {
    if (!weapon.detached) weapon.angle = (weapon.angle + weapon.dir * TAU * weaponRotationRate(fighter,weapon) * dt) % TAU;
  }
}

function isStationaryGolden(fighter) {
  return fighter.key === 'goldenfreddy' && !fighter.bossPower;
}

function dashBodyDamage(fighter) {
  return (fighter.key === 'foxy' || fighter.bossPower) && fighter.dashLeft > 0 ? 5 : 1;
}

function activateGoldenBossPower(fighter) {
  fighter.bossPower = true;
  fighter.maxSpeed = BASE_SPEED * 2;
  fighter.weapon = {...CHARACTERS.freddy.weapon, angle:0, dir:1, rate:2, touchingTargets:new Set()};
  fighter.extraWeapon = {...CHARACTERS.chica.weapon, angle:TAU/3, dir:1, rate:2, touchingTargets:new Set()};
  fighter.hookWeapon = {...CHARACTERS.foxy.weapon, angle:2*TAU/3, dir:1, touchingTargets:new Set()};
  heal(fighter, fighter.maxHp - fighter.hp);
}

function updateBossRegen(fighter, dt) {
  fighter.regenTimer += dt;
  while (fighter.regenTimer >= 1 - 1e-9) {
    fighter.regenTimer = Math.max(0, fighter.regenTimer - 1);
    heal(fighter,1);
  }
}

function updateSoundwaveAttacks(fighter, dt) {
  const poweredBonnie = fighter.key === 'bonnie' && fighter.limitBreak;
  fighter.burstTimer += dt;
  fighter.powerTimer += dt;
  if (fighter.burstTimer >= 2) {
    fighter.burstTimer -= 2;
    fighter.burstRemaining = 3;
    fighter.burstWait = 0;
  }
  if (fighter.burstRemaining > 0) {
    fighter.burstWait -= dt;
    while (fighter.burstWait <= 0 && fighter.burstRemaining > 0) {
      emitSoundwave(fighter);
      fighter.burstRemaining--;
      fighter.burstWait += .22;
    }
  }
  const powerCooldown = poweredBonnie ? 3 : 6;
  if (fighter.powerTimer >= powerCooldown) {
    fighter.powerTimer -= powerCooldown;
    if (poweredBonnie) emitLaser(fighter);
    else emitSoundwave(fighter,true);
  }
}

function drawBorrowedWeapons(fighter) {
  const mic = fighter.weapon, cupcake = fighter.extraWeapon;
  // Reuse the existing weapon art without activating either fighter's Limit Break art.
  drawWeapon({...fighter,key:'freddy',bossPower:false,weapon:mic,limitBreak:false});
  drawWeapon({...fighter,key:'chica',bossPower:false,weapon:cupcake,limitBreak:false});
  drawWeapon({...fighter,key:'foxy',bossPower:false,weapon:fighter.hookWeapon,limitBreak:false});
}
