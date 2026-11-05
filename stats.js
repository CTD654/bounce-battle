const FIGHTER_DETAILS = {
  "freddy": {
    "look": "Brown ball with a black top hat and bowtie.",
    "abilities": [
      [
        "Microphone",
        "5 damage per hit",
        "Orbits at 1 revolution per second. Reverses direction after striking an opponent or clashing with a weapon."
      ],
      [
        "Laugh / shockwave",
        "15 damage • 6.5s cooldown • 2× body radius",
        "Hits opponents inside the shockwave area when released."
      ],
      [
        "Pizza wheel",
        "10–15 damage • 6s cooldown",
        "Aims at the opponent. Radius: 40px; speed: 720px/s; spin: 2 rev/s; lifetime: 3s. Disappears on an opponent hit."
      ],
      [
        "Pizza wheel explosion",
        "8 slices • 1 damage each",
        "On a wall hit, the wheel bursts in eight equally spaced directions (45° apart). Slice radius: 8px; speed: 560px/s; lifetime: 1.5s."
      ]
    ],
    "limit": [
      "150 HP or less",
      "Power Drain deals 6 damage every second to the opponent. Laugh radius increases to 2.5× body radius."
    ]
  },
  "foxy": {
    "look": "Red ball with a cosmetic eyepatch.",
    "abilities": [
      [
        "Hook",
        "3 damage • 9 on a critical hit • 3 rev/s",
        "Orbits Foxy and reverses direction on weapon clashes and body hits."
      ],
      [
        "Critical hits",
        "10% chance • 3× damage",
        "Applies to hook and body attacks, including dash contact."
      ],
      [
        "Dash",
        "2.5s cooldown • 0.45s duration",
        "Aims toward the opponent. Foxy is invincible for the first 0.05s of every dash, including during Limit Break. Speed is the greater of 900px/s or 1.8× current speed, capped at Foxy’s maximum. Body contact deals 5 damage (15 on a critical), instead of the usual 1."
      ],
      [
        "Nightguard matchup",
        "Crowbar: 5 damage • 15 on a critical",
        "Uses the crowbar only while fighting Nightguard. Each new Nightguard matchup has a 5% chance to trigger Foxy’s Limit Break immediately, including in team battles."
      ]
    ],
    "limit": [
      "100 HP or less",
      "Throws the hook or crowbar at the opponent (speed: 6× base speed; flight timeout: 2s). A successful hit drags the opponent to the wall and pins them for 5s. The orbiting weapon is removed. Dash cooldown becomes 0.25s; a dash can deal an additional 10 damage on contact. Critical chance stays at a flat 10% for every eligible hit. Critical damage remains 3×."
    ]
  },
  "chica": {
    "look": "Yellow ball with a white cosmetic bib and three feathers.",
    "abilities": [
      [
        "Orbiting cupcake",
        "4 damage • 1 rev/s",
        "Pink-frosted cupcake reverses rotation on body hits and weapon clashes. Weapon hits do not heal Chica."
      ],
      [
        "Pizza drop",
        "1.5s cooldown • heals 1 HP",
        "Spawns randomly just outside Chica, within a radius around her. Anyone can eat the slice once it is clear of Chica. Healing cannot exceed maximum HP."
      ],
      [
        "Dropped cupcake",
        "4s starting cooldown • 6 damage or 6 healing",
        "Arms after Chica moves away. Heals Chica for 6 HP; hurts other opponents for 6 damage."
      ],
      [
        "Pizza progression",
        "Every 10 slices Chica eats: −0.25s cupcake cooldown",
        "Only slices eaten by Chica count. The dropped-cupcake cooldown stops decreasing at 1s."
      ]
    ],
    "limit": [
      "100 HP or less",
      "Stays active even if Chica heals above 100 HP. Orbiting cupcake damage becomes 12. Dropped cupcakes become birthday cakes that deal 12 damage or heal Chica for 12 HP. Chica also regenerates 1 HP per second, up to maximum HP."
    ]
  },
  "bonnie": {
    "look": "Purple-blue ball with cosmetic bunny ears, a red bowtie, and a red-and-white guitar.",
    "abilities": [
      [
        "Soundwave burst",
        "3 projectiles • 3 damage each • 2s cooldown",
        "Aimed projectiles fire 0.22s apart. Radii, in order: 1.5×, 1×, and 0.5× body radius. Speed: 1,260px/s; lifetime: 2.5s."
      ],
      [
        "Circular soundwave",
        "10 damage • 6s cooldown • 2.5× body radius",
        "Expands to full size over 0.4s and lasts 0.65s. Each opponent can be hit once. Adds knockback equal to 2× Bonnie’s current bounce speed."
      ]
    ],
    "limit": [
      "150 HP or less",
      "Turns dark purple-blue and gains two small red eyes. The circular soundwave is replaced by a red homing laser: 20 damage, 3s cooldown, speed of 6× base speed, and a 1.5s lifetime. Homes at up to 20 radians/s and retains the soundwave’s knockback. Burst projectile damage increases to 5 each (15 total if all three hit)."
    ]
  },
  "roxy": {
    "look": "Light grey ball with three right-swept green hair strands, dark green shadows, cheek squiggles, and eye makeup.",
    "abilities": [
      [
        "Paw grab",
        "5 damage • 1 rev/s",
        "Grey paw with green nails grapples the opponent for 0.32s, then throws them."
      ],
      [
        "Throw wall impact",
        "3–8 damage, based on distance thrown",
        "Longer throws deal more damage, reaching the maximum over a distance equal to the arena width minus two body radii (393px). Golden Freddy can be grabbed but does not bounce after a throw."
      ],
      [
        "Dash grab",
        "3s cooldown • 0.45s dash duration",
        "Lunges toward the opponent with the paw pointing forward. Deals 10 grab damage, then 10 more on the wall slam. Uses the greater of 900px/s or 1.8× current speed, capped at maximum speed."
      ]
    ],
    "limit": [
      "200 HP or less",
      "Appearance becomes darker, cracked, and disheveled. Deals double damage and takes double damage. Paw rotation becomes 2 rev/s. Lunge cooldown becomes 0.2s and targets where the opponent last hit a wall. Dash grab and slam each deal 20 damage after the multiplier."
    ]
  },
  "goldenfreddy": {
    "look": "Golden version of Freddy with a purple hat and bowtie.",
    "abilities": [
      [
        "Stationary bumper",
        "5 contact damage",
        "Does not bounce or move normally. Acts as a solid bumper that redirects the opponent."
      ],
      [
        "Teleport",
        "4s cooldown • 5 impact damage",
        "Teleports next to the opponent, deals impact damage, and pushes them away."
      ],
      [
        "Damage resistance",
        "1 damage per received hit",
        "Every damaging hit is reduced to 1 damage. Immune to knockback. Roxy can grab him, but he stays still after being released."
      ]
    ],
    "limit": [
      "50 HP or less",
      "Teleports to the center and stays there. Pulls the opponent inward with gravity equal to 2× normal gravity (1,440px/s²). Contact damage rises to 10. A persistent black zone extends to 3× body radius, dealing 1 damage on entry and another 1 each second while inside. Damage resistance stays at 1 damage per hit."
    ]
  },
  "nightguard": {
    "look": "Dark purple ball with a security hat and yellow badge.",
    "abilities": [
      [
        "Flashlight",
        "2 contact damage • tracks the opponent",
        "The flashlight points toward the opponent. It orbits only in powerless mode."
      ],
      [
        "Flashlight beam",
        "3 damage every 0.5s",
        "Base reach: 230px from the flashlight. The hit cone has a half-angle of about 15.6°. Damage ticks only while the opponent is lit; leaving the light resets its tick timer."
      ],
      [
        "Stun",
        "Every 5 beam hits • 1s duration",
        "Freezes the opponent, then restores their momentum when the stun ends."
      ],
      [
        "Battery / powerless mode",
        "After 5 stuns (25 beam hits)",
        "The light turns off and a battery appears at a random arena position. The flashlight rotates at 2 rev/s; current velocity doubles and maximum speed becomes 4× normal base speed. Collecting the battery restores the light and resets the hit/stun counters."
      ]
    ],
    "limit": [
      "150 HP or less",
      "Beam reach increases to 360px and the hit cone widens to about a 22.8° half-angle. Gains a shield that blocks 10 hits, one shield charge per hit. The shield prevents damage but allows Foxy’s pin and Roxy’s grab effects."
    ]
  },
  "endo": {
    "look": "Dark grey ball with rectangular teeth. Minions have antennae topped with red balls.",
    "abilities": [
      [
        "Minion summon",
        "5s starting cooldown • 5 starting damage",
        "Spawns a small grey minion that homes toward the opponent at 260px/s. Minion radius: 12px. A successful opponent hit consumes the minion; an enemy weapon or damaging effect can destroy it in one hit."
      ],
      [
        "Minion progression",
        "Successful hit: −0.25s cooldown and +1 damage",
        "Cooldown stops decreasing at 1s. Minion damage stops increasing at 10."
      ]
    ],
    "limit": [
      "150 HP or less",
      "Minion summon cooldown becomes 0.25s. Minion damage continues to scale up to 10."
    ]
  },
  "mangle": {
    "look": "Light grey ball with a dirty pink outline and a robot head connected by a metal neck.",
    "abilities": [
      [
        "Orbiting robot head",
        "5 damage • 1.5 rev/s",
        "The head reverses rotation on body hits and weapon clashes. It leaves its orbit completely while thrown."
      ],
      [
        "Head boomerang",
        "3s cooldown • 5 damage per leg",
        "Outbound speed: 600px/s. Hits each opponent at most once outbound and once returning. Only returns after reaching an arena wall. Return speed is the greater of 660px/s or Mangle’s current speed + 300px/s. Reconnects at the arrival angle and resumes orbiting. Only one head can be thrown at a time."
      ],
      [
        "Prize Ball",
        "5s cooldown • 0.45s activation delay",
        "Summons a Prize Ball that randomly copies an attack from the shared character attack list, excluding Limit Break attacks. The pool is built from each fighter’s registered attacks. Damage and effects depend on the chosen attack."
      ],
      [
        "Hot cheese",
        "1.5s cooldown • lasts 4.5s",
        "Spawns randomly just outside Mangle, within a radius around them, as a stationary puddle with a 22px radius. Deals 1 damage per 0.5s tick while the opponent overlaps it. Does not hurt Mangle."
      ]
    ],
    "limit": ["150 HP or less", "All Mangle ability cooldowns are halved: head boomerang 1.5s, Prize Ball 2.5s, and hot cheese 0.75s. Instantly scatters 10 hot cheese puddles around Mangle inside the arena. Hot cheese sticks to an opponent on contact, follows them for 2 seconds, then disappears. Uncollected puddles last 4.5s. Each attached cheese independently deals 1 damage every 0.5s, so multiple cheeses stack their damage ticks. Existing cheese also gains the sticky effect."]
  }
};
const picker=document.getElementById('fighter-select'),details=document.getElementById('fighter-details');
function node(tag,text,className){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;}
const number=v=>Number(v.toFixed(2)).toLocaleString('en-US');
function renderFighterStats(key){const spec=CHARACTERS[key],info=FIGHTER_DETAILS[key];details.replaceChildren();details.style.setProperty('--fighter',spec.color);
const heading=node('div',undefined,'fighter-heading'),swatch=node('span',undefined,'swatch'),title=node('div');swatch.setAttribute('aria-hidden','true');title.append(node('h2',spec.name),node('p',info.look,'description'));heading.append(swatch,title);details.append(heading);
const grid=node('dl',undefined,'stat-grid');const stats=[['Maximum HP',spec.hp],['Body contact',key==='goldenfreddy'?'5 damage':'1 damage'],['Starting speed',key==='goldenfreddy'?'Stationary':number(BASE_SPEED)+' px/s'],['Maximum speed',key==='goldenfreddy'?'Stationary':number(BASE_SPEED*spec.speedCap)+' px/s ('+spec.speedCap+'×)'],['Body radius',number(R)+' px'],['Gravity',key==='goldenfreddy'?'Unaffected':number(GRAVITY)+' px/s²']];
if(spec.weapon)stats.push(['Weapon',spec.weapon.name],['Weapon hit radius',number(spec.weapon.r)+' px'],['Weapon orbit radius',number(spec.weapon.orbit)+' px'],['Rotation',spec.weapon.rate?number(spec.weapon.rate)+' rev/s':'Tracks opponent']);
for(const [label,value]of stats){const item=node('div',undefined,'stat');item.append(node('dt',label),node('dd',String(value)));grid.append(item);}details.append(grid,node('h3','Attacks & abilities','section-title'));
const cards=node('div',undefined,'ability-grid');for(const [title,stats,description] of info.abilities){const card=node('section',undefined,'ability');card.append(node('h3',title),node('p',stats,'ability-stats'),node('p',description,'description'));cards.append(card);}details.append(cards,node('h3','Limit Break','section-title'));const limit=node('section',undefined,'ability limit');limit.append(node('h3',info.limit?'Activates at '+info.limit[0]:'No Limit Break'),node('p',info.limit?info.limit[1]:'Mangle currently uses its regular abilities throughout the battle.','description'));details.append(limit);
const rules=node('section',undefined,'rules');rules.append(node('h3','Shared battle rules'),node('p','Arena: '+W+' × '+H+' px. Wall rebounds multiply velocity by 1.05, up to the fighter’s speed cap. Body bounces multiply velocity by '+BOUNCE+' (a 0.1% increase), also capped. Orbiting weapons reverse direction when they hit an enemy body or clash with another weapon. Healing is capped at maximum HP. All damage can be modified by the defender’s damage resistance, shield, or Limit Break.'));details.append(rules);}
for(const [key,spec]of Object.entries(CHARACTERS)){const option=node('option',spec.name);option.value=key;picker.append(option);}picker.value='freddy';picker.addEventListener('change',()=>renderFighterStats(picker.value));renderFighterStats('freddy');
