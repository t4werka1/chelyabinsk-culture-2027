(function (root) {
  'use strict';
  let serial = 0;
  const themes = {
    city: ['#293b85', '#657daf', '#b8b8d5', '#c2cee0', 'Набережная искусства'],
    stage: ['#39276e', '#aa75a2', '#a995c2', '#ccc0da', 'Театральная площадь'],
    lake: ['#193f69', '#5a9eaf', '#76afa7', '#aed1b7', 'Фестиваль у Тургояка'],
    craft: ['#392f6d', '#b28891', '#aaa1ad', '#d9c4b2', 'Улица уральских мастеров'],
    heritage: ['#553871', '#dfa080', '#c2a185', '#dfc69e', 'Фестивальная поляна Аркаима'],
    paris: ['#342b7a', '#b37ea9', '#baadd1', '#dfc7df', 'Парижская неделя моды']
  };
  function scene(type, purchased, mini = false, highlight = -1) {
    const own = Array.isArray(purchased) ? purchased : [0, 1, 2].map(i => i < purchased);
    const count = own.filter(Boolean).length, id = `land-${serial++}`, theme = themes[type];
    const P = (x, y, z = 0) => [290 + (x - y) * .9, 98 + (x + y) * .43 - z];
    const point = list => list.map(p => P(...p).join(',')).join(' ');
    const poly = (list, fill, extra = '') => `<polygon points="${point(list)}" fill="${fill}" ${extra}/>`;
    const path = (list, color, width = 2, extra = '') => `<polyline points="${point(list)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" ${extra}/>`;
    const box = (x, y, w, d, h, front = '#ddccd3', top = '#eee0e2', side = '#9e93b9') =>
      poly([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],top)+poly([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],front)+poly([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],side);
    const at = (x, y, content, z = 0) => { const [px,py] = P(x,y,z); return `<g transform="translate(${px} ${py})">${content}</g>`; };
    const tree = (x,y,s=1,tint='#54aeb0') => at(x,y,`<g transform="scale(${s})"><ellipse cy="3" rx="20" ry="7" fill="#171d4930"/><path d="M0 0v-44" stroke="#87748a" stroke-width="5"/><path d="M0-28-11-43M0-30l12-18" fill="none" stroke="#87748a" stroke-width="3"/><path d="M0-83C-31-76-33-29 0-26c33-3 31-50 0-57" fill="${tint}"/><path d="M0-83C-25-73-26-37 0-26Z" fill="#ffffff20"/><path d="M0-63v30" stroke="#ffffff18" stroke-width="2"/></g>`);
    const pine = (x,y,s=1) => at(x,y,`<g transform="scale(${s})"><ellipse rx="18" ry="6" fill="#14283a26"/><path d="M0 0v-42" stroke="#756373" stroke-width="5"/><path d="m0-90-18 32h9l-18 33h12l-15 20h60L15-25h12L9-58h9Z" fill="#398c92"/><path d="M0-90v85h30L15-25h12L9-58h9Z" fill="#257482"/></g>`);
    const human = (x,y,color='#f4b77c',s=1) => at(x,y,`<g transform="scale(${s})"><ellipse cy="2" rx="6" ry="2.6" fill="#24225130"/><path d="M-3 0v-11m6 11v-11" stroke="#414268" stroke-width="3"/><rect x="-5" y="-23" width="10" height="14" rx="4" fill="${color}"/><circle cy="-28" r="4.5" fill="#f2c6ab"/><path d="m-6-19-2 7m14-7 2 7" stroke="${color}" stroke-width="3"/></g>`);
    const light = (x,y,h=72) => at(x,y,`<path d="M0 0v-${h}h16" fill="none" stroke="#777395" stroke-width="3"/><ellipse cx="16" cy="-${h}" rx="8" ry="3.5" fill="#fff0bd"/><circle cx="16" cy="-${h}" r="30" fill="url(#${id}-glow)"/>`);
    const flag = (x,y,c='#b398ed',h=83) => at(x,y,`<path d="M0 0v-${h}" stroke="#8a7d9b" stroke-width="3"/><path class="scene-flag" d="M1-${h}q19-8 36 1l-5 40q-17-8-31-1Z" fill="${c}"/><path d="m12-${h-10} 12 10-12 9" stroke="#fff9" fill="none" stroke-width="3"/>`);
    const bench = (x,y) => box(x,y,40,15,12,'#ae8e90','#e6bfa6')+box(x,y,40,3,26,'#caa396','#f5d3b4');
    const flowers = (x,y,w=40) => box(x,y,w,13,9,'#9b91b3','#657a98')+Array.from({length:6},(_,i)=>at(x+5+i*(w-9)/6,y+6,`<circle cy="-14" r="5" fill="${['#f1a1cc','#b8a4f5','#ffce94'][i%3]}"/>`)).join('');
    const stall = (x,y,c='#da95c6') => box(x,y,56,38,38,'#e9c6bc','#b291b9')+poly([[x-4,y-4,43],[x+60,y-4,43],[x+60,y+43,43],[x-4,y+43,43]],c)+path([[x,y+38,22],[x+56,y+38,22]],'#ffedd8',4)+flag(x+62,y,c,62);
    const stringLights = (x,y,w=200) => { const [px,py]=P(x,y); return `<path d="M${px} ${py-100}q${w/2} 58 ${w} 0" fill="none" stroke="#b1a0bd" stroke-width="2"/>`+Array.from({length:9},(_,i)=>{const u=i/8,cy=py-100+116*u*(1-u);return `<circle cx="${px+u*w}" cy="${cy}" r="4" fill="#ffe8ac"/><circle cx="${px+u*w}" cy="${cy}" r="16" fill="url(#${id}-glow)"/>`;}).join(''); };
    const building = (x,y,w,d,h,front='#dccdd2',roof='#8e93b8') => {
      let s=box(x,y,w,d,h,front,roof,'#a59bb9');
      for(let row=0;row<2;row++)for(let j=0;j<Math.floor(w/22);j++)s+=poly([[x+10+j*22,y+d+.5,20+row*30],[x+20+j*22,y+d+.5,20+row*30],[x+20+j*22,y+d+.5,39+row*30],[x+10+j*22,y+d+.5,39+row*30]],'#f8d69b');
      return s+path([[x,y+d,h-5],[x+w,y+d,h-5]],'#fff1e5',3);
    };
    const podium=(x,y,w=110,d=65)=>box(x,y,w,d,12,'#8c7baf','#bfaad3','#7f70a3')+box(x+10,y+d, w-20,8,6,'#b7a1c4','#dfc6d9');
    const stage=(x,y)=>podium(x,y,140,70)+box(x,y,6,6,93,'#c2b6d4','#f4dded')+box(x+134,y,6,6,93,'#c2b6d4','#f4dded')+`<g transform="translate(0 -85)">${box(x,y,140,6,8,'#cfb2d8','#ecd7ee')}</g>`+poly([[x+6,y+7,15],[x+134,y+7,15],[x+134,y+7,85],[x+6,y+7,85]],'#5d4d93')+poly([[x+6,y+8,18],[x+35,y+8,18],[x+35,y+8,85],[x+6,y+8,85]],'#b386bd')+poly([[x+108,y+8,18],[x+134,y+8,18],[x+134,y+8,85],[x+108,y+8,85]],'#b386bd');
    const table=(x,y)=>at(x,y,'<path d="M0 0v-17m-8 19 8-5 8 5" stroke="#8e799c" stroke-width="3" fill="none"/><ellipse cy="-18" rx="19" ry="9" fill="#f5d6ba"/><circle cy="-22" r="4" fill="#bf99d4"/>');
    const arch=(x,y,c='#c3a8f0')=>box(x,y,9,12,80,c,'#e9d8ff')+box(x+90,y,9,12,80,c,'#e9d8ff')+`<g transform="translate(0 -70)">${box(x,y,99,12,10,c,'#f4d7ed')}</g>`+flowers(x-5,y+15,25)+flowers(x+80,y+15,25)+flag(x-17,y,'#f0a1c6');
    let back='', base='', layers=['','',''];
    const road=poly([[0,242],[500,242],[500,284],[0,284]],'#f1e1dc88')+path([[10,261],[490,261]],'#ffffff50',2,'stroke-dasharray="8 10"');
    if(type==='city') {
      back=building(140,8,65,40,60,'#beb8ce','#8b90b0')+building(230,4,105,45,82)+building(370,12,66,40,51,'#d6becb');
      base=poly([[0,60],[500,60],[500,137],[0,137]],`url(#${id}-water)`)+path([[0,142],[500,142]],'#f5e6e6',7)+road;
      for(let i=0;i<6;i++)base+=path([[25+i*77,82],[65+i*77,82]],'#caeaff55',2);
      base+=box(290,163,125,55,6,'#c3b6cb','#ddd0df')+tree(435,182,1.15)+tree(50,185,.9)+bench(330,218)+bench(388,218);
      layers[0]=arch(30,290)+flowers(150,305,85)+human(110,312)+human(150,295,'#9ce3dd');
      for(let i=0;i<3;i++)layers[1]+=at(160+i*53,195,'<path d="m-14 5 14-60 16 60M-11-8h24" fill="none" stroke="#a97c9f" stroke-width="4"/><rect x="-19" y="-54" width="38" height="38" rx="3" fill="#fff0df"/><path d="m-15-22 9-18 11 10 10-17v26Z" fill="'+['#b396ea','#5bbccc','#f49ebf'][i]+'"/><circle cx="-7" cy="-44" r="5" fill="#ffd18a"/>')+human(150+i*50,218,['#bca2e8','#f7b180','#8ed3cf'][i]);
      layers[2]=stall(330,300)+stall(410,300,'#80cacc')+table(355,370)+human(405,365)+light(310,335)+stringLights(320,310,150);
    } else if(type==='stage') {
      base=road+building(100,36,235,84,111,'#d4c0cf','#9588b6')+poly([[90,125,112],[345,125,112],[217,125,160]],'#f5d6df')+poly([[118,126,119],[318,126,119],[217,126,150]],'#a690bc');
      for(let i=0;i<8;i++)base+=box(110+i*29,121,12,13,88,'#efe0dc','#fff0e5');
      base+=box(93,134,250,17,8,'#b3a0b9','#ecdbda')+tree(40,160,1.2,'#b48bc2')+tree(435,160,1.25,'#b48bc2');
      layers[0]=stage(140,185)+human(211,218,'#f5ce8c');
      layers[1]=light(90,235,120)+light(335,220,120)+at(90,235,`<path class="scene-beam" d="M16-120 90-28 230-35Z" fill="#c4c3ff20"/>`)+at(335,220,`<path class="scene-beam" d="M16-120-180-15-60 20Z" fill="#ffd39b22"/>`)+flowers(365,279,70);
      for(let r=0;r<3;r++)for(let c=0;c<6;c++)layers[2]+=box(140+c*25,300+r*22,16,13,14,'#a387b7','#e0a5c6');
      layers[2]+=flag(100,308)+flag(330,353,'#eea1c3')+human(360,340,'#8bd5db')+human(390,320)+stringLights(120,290,220);
    } else if(type==='lake') {
      back=poly([[-30,30],[70,0,130],[170,20]],'#648da8')+poly([[60,0],[220,-5,160],[360,20]],'#86a7b8')+poly([[250,0],[380,-5,123],[540,30]],'#6d99af');
      base=poly([[20,75],[500,20],[500,270],[110,230]],`url(#${id}-water)`)+poly([[0,250],[210,240],[480,300],[500,385],[0,385]],'#d6caa999');
      for(let i=0;i<6;i++)base+=path([[100+i*45,100+i*17],[220+i*35,95+i*17]],'#c7ffff50',2);
      base+=box(290,208,150,25,9,'#ae9f99','#e5c7a9')+pine(30,120,1.2)+pine(70,170,1.0)+pine(455,60,1.25)+pine(420,85,.8);
      layers[0]=stall(55,270,'#7dc7bc')+bench(120,307)+flowers(40,327)+human(110,343,'#97dfd3')+flag(35,270,'#b6a4ed');
      layers[1]=box(205,262,100,42,7,'#aa9fa2','#ebd7b8')+bench(223,273)+at(320,235,'<path d="M0 0v-50" stroke="#a4878d" stroke-width="4"/><path d="M-25-49h45l12 9-12 9h-45Z" fill="#b5dad3"/><path d="M-20-22h35" stroke="#9abfbc" stroke-width="8"/>')+human(280,297)+flowers(220,320,65);
      layers[2]=stage(330,307)+stringLights(300,290,180)+human(320,377,'#bba2e7')+human(297,359)+light(470,335);
    } else if(type==='craft') {
      base=road+building(80,40,130,70,86,'#d7afa5','#9b849e')+building(305,50,130,62,75,'#bcb3c5','#818da7')+box(200,70,55,55,152,'#d6b6a9','#88779f')+poly([[200,70,152],[255,70,152],[228,100,191]],'#69708f');
      base+=at(228,126,'<circle r="15" fill="#ffe5b1"/><circle r="11" fill="none" stroke="#9c8195" stroke-width="1"/><path d="M0-9v9l6 3" fill="none" stroke="#7d6884" stroke-width="2.5"/>',119)+tree(30,185,1,'#c497ac')+tree(465,185,1.2,'#be91ae');
      layers[0]=stall(55,216,'#d69fa4')+stall(140,215,'#b0a3dc')+table(123,276)+human(97,277,'#ffe1a6')+human(167,280,'#9edbd2');
      layers[1]=box(302,214,58,25,40,'#a89ab4','#d8f5ef')+box(385,220,50,25,40,'#a89ab4','#d8f5ef')+at(330,240,'<path d="m0-64 12 18-12 18-12-18Z" fill="#f2cf8d"/><path d="M0-64v36" stroke="#fff2c2"/>')+human(345,270,'#ccaaec');
      layers[2]=light(70,320)+light(270,308)+light(435,325)+stringLights(65,320,320)+bench(165,330)+flowers(310,335,70)+human(230,355);
    } else if(type==='heritage') {
      back=poly([[-20,-10],[120,20,56],[260,-10]],'#b1989e')+poly([[180,-20],[340,0,70],[540,10]],'#c4a797');
      base=at(252,105,'<ellipse rx="130" ry="55" fill="#b29980"/><ellipse rx="112" ry="45" fill="none" stroke="#e6c9a3" stroke-width="13"/><ellipse rx="74" ry="29" fill="none" stroke="#e6c9a3" stroke-width="10"/><ellipse rx="33" ry="14" fill="#e0bf98"/>')+poly([[30,260],[480,260],[480,299],[30,299]],'#f0dbb377');
      for(let i=0;i<4;i++)base+=at(40+i*130,205,'<path d="m-3 0 3-17 5 17" stroke="#a9a06b" stroke-width="3" fill="none"/>');
      layers[0]=arch(40,290,'#d4aa92')+at(130,268,'<path d="M0 0v-58" stroke="#a08086" stroke-width="4"/><path d="M-25-54h48l10 12-10 12h-48Z" fill="#edc7a2"/>')+flag(30,330,'#dc9b98')+human(132,328,'#d2a0b3');
      layers[1]=stall(230,216,'#d3b090')+stall(318,220,'#c8a1b2')+table(285,290)+table(358,286)+human(246,280,'#bcacdf')+human(330,303);
      layers[2]=at(400,333,'<ellipse rx="49" ry="20" fill="#a99886"/><path d="M-47-3Q-39-28 0-74 40-28 47-3Z" fill="#f3d4ad"/><path d="M0-74v71h47Q40-28 0-74Z" fill="#d7ac91"/><path d="M-10-4v-25q10-10 20 0v25" fill="#8e7984"/>')+podium(185,342,100,38)+flag(178,347,'#e4ac96')+human(225,365,'#b5abd8')+human(312,365,'#a3c2b7')+stringLights(190,348,235);
    } else {
      base=road+building(40,32,100,60,65,'#e4bbcf','#ac95c1')+building(355,20,102,65,82,'#b7b1d1','#8e8db5');
      base+=at(256,154,'<ellipse cy="2" rx="76" ry="24" fill="#8576aa33"/><path d="M-66 0-32-92-10-191 0-218 10-191 32-92 66 0H42L18-63h-36L-42 0Z" fill="#b8a1c4"/><path d="M-30-93h60M-19-135h38M-10-173h20M-50-19l81-74M50-19l-81-74M-19-135l29-38m9 38-29-38" stroke="#f2cfdf" stroke-width="3"/><path d="M-42 0q42-63 84 0" fill="#c0afd2"/>')+tree(45,190,1,'#c39cc5')+tree(444,185,1.2,'#c99cc2');
      layers[0]=podium(150,240,210,50)+poly([[153,245,13],[357,245,13],[357,283,13],[153,283,13]],'#f3d3e6')+human(225,257,'#e18fbd')+human(290,265,'#968ee0');
      layers[1]=arch(50,285)+flag(145,334,'#a1b9ea')+flag(215,334,'#e2a3cf')+flag(285,334,'#99d1d5')+flowers(350,340,80);
      layers[2]=light(105,240,105)+light(376,249,105)+stringLights(140,285,260)+human(390,309)+human(350,324,'#96d6d4')+human(300,364,'#c2a0e7')+human(420,346,'#f3ba89');
    }
    const slab=poly([[0,0,-17],[500,0,-17],[500,385,-17],[0,385,-17]],'#524e91')+poly([[0,385,0],[500,385,0],[500,385,-17],[0,385,-17]],'#8b7fa8')+poly([[500,0,0],[500,385,0],[500,385,-17],[500,0,-17]],'#76699a')+poly([[0,0],[500,0],[500,385],[0,385]],theme[3]);
    const decoration=type==='heritage'?'':tree(475,360,.7,type==='lake'?'#65b3a7':'#a293c4')+flowers(15,360,42);
    return `<svg class="city-art ${mini?'mini':''}" viewBox="0 0 900 590" role="img" aria-label="${theme[4]}: куплено ${count} из 3 улучшений" data-scene="${type}"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${theme[0]}"/><stop offset="1" stop-color="${theme[1]}"/></linearGradient><linearGradient id="${id}-water" x2=".4" y2="1"><stop stop-color="#62aaca"/><stop offset="1" stop-color="#88cbd0"/></linearGradient><radialGradient id="${id}-glow"><stop stop-color="#fff1b2" stop-opacity=".5"/><stop offset="1" stop-color="#ffe3a2" stop-opacity="0"/></radialGradient></defs><rect width="900" height="590" fill="url(#${id}-sky)"/><circle cx="745" cy="100" r="46" fill="#f4d7d43b"/><circle cx="745" cy="100" r="29" fill="#ffe5d7b8"/><path d="M0 220Q160 130 300 212T610 180T900 192V590H0Z" fill="${theme[2]}" opacity=".17"/><path d="M0 290Q170 200 340 278T660 245T900 260V590H0Z" fill="${theme[2]}" opacity=".14"/><g opacity=".55" fill="#e3e9ff">${[90,180,290,530,620,810].map((x,i)=>`<circle cx="${x}" cy="${45+i%3*32}" r="${i%2?1.5:2}"/>`).join('')}</g><ellipse cx="450" cy="519" rx="337" ry="37" fill="#11123a30"/><g class="island" transform="translate(130 62)">${slab}${back}${base}${decoration}<g class="scene-additions">${layers.map((layer,i)=>own[i]?`<g data-upgrade="${i}" class="scene-upgrade ${i===highlight?'new-upgrade':''}">${layer}</g>`:'').join('')}</g></g></svg>`;
  }
  root.CultureArt.scene = scene;
})(window);
