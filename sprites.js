// Visual-only rendering layer. Classic renderers remain available for instant switching.
let detailedSprites = localStorage.getItem('bounceBattleSpriteStyle') !== 'classic';
const spritePicker = document.getElementById('sprite-style');
spritePicker.value = detailedSprites ? 'detailed' : 'classic';
spritePicker.addEventListener('change', () => {
  detailedSprites = spritePicker.value === 'detailed';
  localStorage.setItem('bounceBattleSpriteStyle', spritePicker.value);
});

const classicCircle = circle;
circle = function(x, y, radius, fill) {
  if (!detailedSprites || radius < 5 || typeof fill !== 'string' || !/^#[0-9a-f]{6}$/i.test(fill)) {
    return classicCircle(x, y, radius, fill);
  }
  const surface = ctx.createRadialGradient(x-radius*.35,y-radius*.4,0,x,y,radius);
  surface.addColorStop(0, fill);
  surface.addColorStop(.55, fill);
  surface.addColorStop(1, '#151923');
  classicCircle(x,y,radius,surface);
  ctx.save();
  ctx.strokeStyle = '#ffffff35';
  ctx.lineWidth = Math.max(.7,radius*.025);
  ctx.beginPath();ctx.arc(x,y,radius*.86,3.5,4.9);ctx.stroke();
  ctx.restore();
};

function spriteLine(points, color, width=1) {
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
  points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
}
function spriteRivet(x,y) {
  classicCircle(x,y,2.3,'#343b45');
  classicCircle(x-.5,y-.6,1.1,'#d9e0e5');
}
const classicCharacter = drawCharacter;
drawCharacter = function(ball) {
  classicCharacter(ball);
  if (!detailedSprites) return;
  ctx.save();ctx.translate(ball.x,ball.y);
  // Articulated shell edges stay clear of the established cosmetics.
  ctx.strokeStyle='#11192370';ctx.lineWidth=1.4;
  for(const side of [-1,1]) {
    ctx.beginPath();ctx.arc(0,0,R-7,side<0?2.55:-.6,side<0?3.7:.55);ctx.stroke();
    spriteRivet(side*34,13);
  }
  const gold=ball.key==='goldenfreddy';
  if(ball.key==='freddy'||gold) {
    for(const side of [-1,1]) {
      circle(side*29,-33,10,gold?'#d8a827':'#a96b3b');
      classicCircle(side*29,-33,5,gold?'#986d17':'#633d27');
      spriteLine([[side*5,22],[side*13,17],[side*13,27]],'#ffffff50');
    }
    spriteLine([[-9,-R-13],[7,-R-13]],gold?'#bb8de8':'#858b99',1.5);
    for(const y of [2,10])spriteRivet(0,y);
  } else if(ball.key==='foxy') {
    for(const side of [-1,1]) {
      ctx.fillStyle='#9b292c';ctx.beginPath();ctx.moveTo(side*23,-30);ctx.lineTo(side*36,-55);ctx.lineTo(side*41,-23);ctx.closePath();ctx.fill();
      spriteLine([[side*29,-33],[side*35,-46],[side*37,-29]],'#f48c7855',3);
    }
    spriteLine([[-22,-16],[-7,-16],[-7,-3]],'#88909b',1);
    for(let x=-20;x<20;x+=7)spriteLine([[x,22],[x+2,27]],'#331d24',1.5);
  } else if(ball.key==='chica'||ball.key==='toychica') {
    spriteLine([[-20,-4],[-17,24],[0,30],[17,24],[20,-4]],'#b8a890',1);
    ctx.fillStyle='#ae479b';ctx.textAlign='center';ctx.font='900 9px system-ui';
    ctx.fillText(ball.key==='chica'?"LET’S EAT!":"LET’S PARTY!",0,9);
    for(let i=0;i<7;i++) {
      ctx.fillStyle=['#e7b52c','#ef639f','#658bc3'][i%3];
      ctx.fillRect(-15+i*5,16+(i%2)*4,2,3);
    }
  } else if(ball.key==='bonnie') {
    for(const side of [-1,1])spriteLine([[side*18,-61],[side*17,-49]],'#ffffff70',1.5);
    ctx.save();ctx.translate(0,17);ctx.rotate(-.65);
    for(const y of [-24,-18,-12,-6])spriteLine([[-3,y],[3,y]],'#e5e0dc');
    for(const x of [-7,7])spriteRivet(x,12);
    ctx.restore();
  } else if(ball.key==='roxy') {
    for(let i=0;i<3;i++)spriteLine([[-23+i*17,-48],[-13+i*16,-46],[-6+i*15,-37]],ball.limitBreak?'#4e7254':'#92f3a4',1.4);
    for(const side of [-1,1])spriteLine([[side*21,23],[side*28,29],[side*20,28]],'#363940',2);
    if(ball.limitBreak) {
      spriteLine([[-30,19],[-22,25],[-26,32],[-15,36]],'#141a20',2);
      spriteLine([[19,18],[27,23],[24,34]],'#a5a9aa',1);
    }
  } else if(ball.key==='endo') {
    for(const side of [-1,1]) {
      spriteLine([[side*26,-23],[side*29,0],[side*25,24]],'#d1d6dc',3);
      for(const y of [-23,0,24])spriteRivet(side*26,y);
    }
    for(let y=-22;y<-5;y+=5)spriteLine([[-10,y],[10,y]],'#282f38',2);
    spriteLine([[-17,20],[0,25],[17,20]],'#b9c2ce',2);
  } else if(ball.key==='nightguard') {
    spriteLine([[-29,-R-7],[29,-R-7]],'#c0a74c',2);
    spriteLine([[-22,-15],[-12,-4],[0,-10],[12,-4],[22,-15]],'#9c85c1',1.5);
    for(const y of [4,16,28])spriteRivet(-5,y);
    spriteLine([[13,17],[17,13],[21,17],[17,23],[13,17]],'#fff2a5',1);
  } else if(ball.key==='mangle') {
    for(const side of [-1,1]) {
      ctx.fillStyle='#b57587';ctx.beginPath();ctx.moveTo(side*23,-30);ctx.lineTo(side*35,-52);ctx.lineTo(side*40,-22);ctx.closePath();ctx.fill();
      spriteLine([[side*28,-30],[side*34,-44]],'#ead3da',3);
      spriteLine([[side*19,23],[side*28,27],[side*23,34]],'#876d7c',2);
    }
    spriteLine([[-10,20],[0,26],[10,20]],'#b57587',3);
  }
  ctx.restore();
};

const classicWeapon = drawWeapon;
drawWeapon = function(ball) {
  classicWeapon(ball);
  if(!detailedSprites||!ball.weapon||ball.weapon.detached)return;
  const p=weaponPosition(ball);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ball.weapon.angle+Math.PI/2);
  if(ball.key==='freddy') {
    for(let x=-6;x<=6;x+=3)spriteLine([[x,-12],[x,0]],'#697584',.6);
    spriteLine([[-2,2],[-2,15]],'#a4b0c2',1.5);
  } else if(ball.key==='foxy') {
    spriteLine([[-9,11],[-9,-4]],'#ffffff',1.4);
    for(let y=10;y<17;y+=3)spriteLine([[-11,y],[-5,y]],'#b99366');
  } else if(ball.key==='chica'||ball.key==='toychica') {
    for(let x=-8;x<=8;x+=4)spriteLine([[x,2],[x*.75,11]],'#f8cc83');
    for(const [x,y] of [[-7,-5],[3,-10],[7,-2]])spriteLine([[x,y],[x+2,y+1]],'#fff2b8',1.5);
  } else if(ball.key==='roxy') {
    classicCircle(0,5,5,ball.limitBreak?'#30333c':'#757b8b');
    for(const x of [-9,0,9])spriteLine([[x,-14],[x,-10]],'#ffffff80');
  } else if(ball.key==='nightguard') {
    ctx.rotate(-Math.PI/2);
    for(let x=-14;x<5;x+=4)spriteLine([[x,-6],[x,6]],'#657083',1);
  }
  ctx.restore();
};

const classicRobotHead = drawMangleRobotHead;
drawMangleRobotHead = function(c,scale=1) {
  classicRobotHead(c,scale);
  if(!detailedSprites)return;
  c.save();c.scale(scale,scale);c.strokeStyle='#e7eaec';c.lineWidth=.8;
  for(const x of [-10,10]){c.strokeRect(x-1,-8,2,2);c.strokeRect(x-1,6,2,2);}
  for(let x=-5;x<=5;x+=3){c.beginPath();c.moveTo(x,5);c.lineTo(x,8);c.stroke();}
  c.restore();
};
