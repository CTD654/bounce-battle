const W=480,H=480,R=43.5,GRAVITY=720,BOUNCE=1.001,MIC_SCALE=1.2,HAT_SCALE=1.15,TAU=Math.PI*2,BASE_SPEED=Math.hypot(450,186),PIZZA_R=9;
const CHARACTERS={
 endo:{name:'Endo',color:'#737b83',hp:500,limitDamage:350,speedCap:2,weapon:null,attacks:['endo-minion']},
 nightguard:{name:'Nightguard',color:'#39204f',hp:500,limitDamage:350,speedCap:2,weapon:{name:'Flashlight',damage:2,rate:0,orbit:59,r:12},attacks:['nightguard-light']},
 freddy:{name:'Freddy',color:'#a96b3b',hp:500,limitDamage:350,speedCap:2,weapon:{name:'Microphone',damage:5,rate:1,orbit:70,r:11*MIC_SCALE},attacks:['freddy-microphone','freddy-pizza-wheel','freddy-shockwave']},
 foxy:{name:'Foxy',color:'#d9473f',hp:400,limitDamage:300,speedCap:3,weapon:{name:'Hook',damage:3,rate:3,orbit:72,r:14},attacks:['foxy-hook','foxy-dash']},
 bonnie:{name:'Bonnie',color:'#7771ce',hp:500,limitDamage:350,speedCap:2,weapon:null,attacks:['bonnie-burst','bonnie-soundwave']},
 chica:{name:'Chica',color:'#f3cf42',hp:450,limitDamage:350,speedCap:2,weapon:{name:'Cupcake',damage:4,rate:1,orbit:70,r:14},attacks:['chica-cupcake','chica-pizza']},
 roxy:{name:'Roxy',color:'#c9cdd0',hp:550,limitDamage:350,speedCap:2,weapon:{name:'Paw',damage:0,rate:1,orbit:70,r:16},attacks:['roxy-paw']},
 goldenfreddy:{name:'Golden Freddy',color:'#d8a827',hp:125,limitDamage:75,speedCap:0,weapon:null,attacks:['golden-teleport']},
 mangle:{name:'Mangle',color:'#d6d9db',hp:500,limitDamage:350,speedCap:2,weapon:{name:'Robot Head',damage:5,rate:1.5,orbit:R*1.35,r:15},attacks:['mangle-head','mangle-boomerang','mangle-cheese']}
};

CHARACTERS.toychica={name:'Toy Chica',color:'#ffda58',hp:400,limitDamage:325,speedCap:2,weapon:{...CHARACTERS.chica.weapon},attacks:['toychica-cupcake']};

CHARACTERS.toyfreddy = {
  ...CHARACTERS.freddy,
  name: 'Toy Freddy',
  color: '#bf8050',
  attacks: ['freddy-microphone', 'toyfreddy-mic-toss', 'freddy-shockwave']
};

const SPRING_BONNIE = {damageGoal:450, duration:30, healing:30, rotationMultiplier:1.5, color:'#a88436'};
const BOSSES = ['purpleguy'];
CHARACTERS.purpleguy = {
  name: 'Purple Guy',
  boss: true,
  color: '#694788',
  hp: 2000,
  radius: R * 1.5,
  startingSpeedScale: .5,
  speedCap: 1,
  weapon: {name: 'Knife', damage: 10, rate: 1, orbit: R * 1.5 + 23, r: 15 * 1.75, spriteScale: 1.75}
};

const FIGHTER_GAME_GROUPS = [
  ['FNaF 1', ['freddy', 'bonnie', 'chica', 'foxy', 'goldenfreddy', 'nightguard', 'endo']],
  ['FNaF 2', ['toyfreddy', 'toychica', 'mangle']],
  ['FNaF: SB', ['roxy']]
];

function populateFighterPicker(select, selectedKey, unavailable = [], includeBosses = false) {
  const roster = includeBosses ? [...FIGHTER_GAME_GROUPS, ['Bosses', BOSSES]] : FIGHTER_GAME_GROUPS;
  const groups = roster.map(([label, keys]) => {
    const group = document.createElement('optgroup');
    group.label = label;
    for (const key of keys) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = CHARACTERS[key].name;
      option.disabled = key !== selectedKey && unavailable.includes(key);
      group.append(option);
    }
    return group;
  });
  select.replaceChildren(...groups);
  select.value = selectedKey;
}
