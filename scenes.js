(function (root) {
  'use strict';
  let serial = 0;
  const themes = {
    city: ['#293b85', '#657daf', '#b8b8d5', '#c2cee0', 'Набережная искусства'],
    stage: ['#39276e', '#aa75a2', '#a995c2', '#ccc0da', 'Площадь Науки у памятника Курчатову'],
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
    const sign=(x,y)=>at(x,y,'<path d="M0 0v-63" stroke="#776d86" stroke-width="4"/><path d="M-27-61h49l12 11-12 11h-49Z" fill="#bcd9de"/><path d="M-18-50h32" stroke="#49647b" stroke-width="3"/><path d="M-20-31h40l-9 10h-31Z" fill="#ceb9e9"/>');
    const board=(x,y)=>box(x,y,55,7,62,'#a3a7c2','#e6d9ef')+poly([[x+4,y+8,7],[x+51,y+8,7],[x+51,y+8,56],[x+4,y+8,56]],'#eaf0e8')+path([[x+10,y+9,46],[x+38,y+9,33],[x+17,y+9,19],[x+44,y+9,14]],'#70a89b',4);
    const bins=(x,y)=>[0,1,2].map((i)=>box(x+i*18,y,14,15,28,['#65aaa8','#b3a4ce','#d3ac72'][i],'#e0d7cf')+at(x+i*18+7,y+16,'<path d="M-3-18h6" stroke="#f8efdf" stroke-width="2"/>')).join('');
    const canopy=(x,y,w=85,d=50,color='#b8cbd3')=>box(x,y,4,4,63,'#b8a99f')+box(x+w,y,4,4,63,'#b8a99f')+box(x,y+d,4,4,63,'#b8a99f')+box(x+w,y+d,4,4,63,'#b8a99f')+poly([[x-5,y-5,64],[x+w+8,y-5,64],[x+w+8,y+d+8,64],[x-5,y+d+8,64]],color);
    const house=(x,y,c='#d4c5b6')=>building(x,y,65,42,31,c,'#718a8f')+poly([[x-5,y,32],[x+70,y,32],[x+70,y+21,58],[x-5,y+21,58]],'#7e9294')+poly([[x-5,y+21,58],[x+70,y+21,58],[x+70,y+48,32],[x-5,y+48,32]],'#5d7b86');
    const pyramid=(x,y,w,d,h)=>poly([[x,y,h],[x+w,y,h],[x+w/2,y+d/2,h+32]],'#4c7f7d')+poly([[x+w,y,h],[x+w,y+d,h],[x+w/2,y+d/2,h+32]],'#315d67')+poly([[x,y+d,h],[x+w,y+d,h],[x+w/2,y+d/2,h+32]],'#6b9690');
    let back='',base='',layers=['','',''];
    const road=poly([[0,242],[500,242],[500,284],[0,284]],'#f1e1dc88')+path([[10,261],[490,261]],'#ffffff50',2,'stroke-dasharray="8 10"');
    if(type==='city') {
      // Museum's stepped tan masses and pyramid roofs, observed in the photograph.
      back=house(0,2)+house(86,3,'#d8bdab')+building(178,4,65,32,65,'#b4c3cc','#8b9eb5');
      base=poly([[0,54],[500,54],[500,137],[0,137]],`url(#${id}-water)`)+path([[0,147],[500,147]],'#f6e7d8',8);
      base+=at(109,82,'<path d="M-95 0h184v19h-13q-10-27-20 0h-15q-10-27-20 0H7q-10-27-20 0h-16q-10-27-20 0h-16q-10-27-20 0H-95Z" fill="#dfc6b3"/><path d="M-95-3h184" stroke="#eee7da" stroke-width="5"/>');
      base+=building(313,122,130,54,52,'#d5b58e','#ad9d83')+box(338,127,65,46,88,'#c9aa82','#c8b394')+pyramid(338,127,65,46,88)+box(410,133,34,35,63,'#d5b58e','#b8a68b')+pyramid(410,133,34,35,63);
      for(let i=0;i<6;i++)base+=path([[22+i*73,101],[56+i*73,101]],'#d3f4ef70',2);
      base+=road+tree(466,204,1.1)+tree(25,200,.8)+bench(328,218)+bench(391,218);
      layers[0]=canopy(28,285,69,37,'#b5d8dc')+board(39,315)+sign(121,305)+human(101,335,'#9ce3dd');
      for(let i=0;i<3;i++)layers[1]+=at(158+i*55,205,'<path d="m-14 5 14-60 16 60M-11-8h24" fill="none" stroke="#a97c9f" stroke-width="4"/><rect x="-19" y="-54" width="38" height="38" rx="3" fill="#fff0df"/><path d="m-15-22 9-18 11 10 10-17v26Z" fill="'+['#b396ea','#5bbccc','#f49ebf'][i]+'"/><circle cx="-7" cy="-44" r="5" fill="#ffd18a"/>')+human(150+i*55,232,['#bca2e8','#f7b180','#8ed3cf'][i]);
      layers[2]=stall(332,296)+stall(417,296,'#80cacc')+table(357,371)+bins(443,355)+human(406,365)+stringLights(325,310,145);
    } else if(type==='stage') {
      // Twin pylons and split atom: the distinctive Kurchatov monument, forest behind.
      for(let i=0;i<9;i++)back+=pine(18+i*51,20+i%2*25,.8+i%3*.16);
      base=road+box(165,72,162,63,7,'#8f8599','#c1bdc3')+box(171,85,24,14,166,'#b2a492','#d3c6b4')+box(299,85,24,14,166,'#b2a492','#d3c6b4');
      base+=at(247,106,'<circle cy="-112" r="35" fill="#6a737f"/><path d="M-4-147v70" stroke="#e5d7be" stroke-width="8"/><path d="M-24-136q-18 25 0 49M24-136q18 25 0 49" fill="none" stroke="#c3b39b" stroke-width="4"/><path d="M-7-12v-33h14v33M-8-38v-21q8-11 16 0v21" fill="#7a7e87"/><circle cy="-67" r="7" fill="#7a7e87"/>');
      base+=tree(42,175,.85)+tree(465,166,1.0)+path([[445,28],[445,225]],'#e9dfd2',10);
      layers[0]=stage(127,185)+canopy(125,180,143,72,'#bfb0db')+human(197,225,'#f5ce8c')+path([[140,268],[270,268]],'#5c5870',4);
      layers[1]=light(85,231,112)+light(334,222,112)+box(87,226,18,17,50,'#515675','#67708e')+box(327,226,18,17,50,'#515675','#67708e')+at(85,231,'<path class="scene-beam" d="M16-112 100-22 210-30Z" fill="#c4c3ff25"/>');
      for(let r=0;r<3;r++)for(let c=0;c<6;c++)layers[2]+=box(108+c*29+(c>2?23:0),301+r*23,17,14,17,'#8b80a8','#d6acd1');
      layers[2]+=human(340,340,'#8bd5db')+sign(382,322)+path([[209,297],[209,376]],'#fff0d6',3);
    } else if(type==='lake') {
      back=poly([[-30,30],[70,0,108],[170,20]],'#648da8')+poly([[60,0],[220,-5,136],[360,20]],'#86a7b8')+poly([[250,0],[380,-5,112],[540,30]],'#6d99af');
      base=poly([[0,45],[500,40],[500,186],[360,212],[190,190],[0,220]],`url(#${id}-water)`)+path([[0,230],[190,201],[360,223],[500,198]],'#e9d9ad',12);
      for(let i=0;i<6;i++)base+=path([[70+i*51,100+i%2*24],[110+i*51,100+i%2*24]],'#c7ffff65',2);
      base+=poly([[0,278],[500,245],[500,292],[0,322]],'#dbccb3')+pine(20,244,.9)+pine(76,220,.7)+pine(460,232,1.1)+pine(417,225,.8);
      layers[0]=board(63,274)+sign(138,294)+human(112,323,'#97dfd3')+flag(41,285,'#b6a4ed',60);
      layers[1]=canopy(209,272,97,49,'#c3d8c0')+bench(218,288)+bench(269,288)+human(278,328);
      layers[2]=stall(365,314,'#83bbae')+bins(375,374)+table(436,369)+human(425,355,'#bba2e7');
    } else if(type==='craft') {
      base=road+pine(30,110,1.0)+pine(80,115,.8)+pine(430,110,1.1)+pine(475,160,.85);
      base+=at(245,135,'<ellipse cy="2" rx="65" ry="24" fill="#41415730"/><path d="M-46 0v-87l8-9v-71l8-12v-46h60v46l8 12v71l8 9V0Z" fill="#d0c6b8"/><path d="M0 0v-225h30v46l8 12v71l8 9V0Z" fill="#b1afa8"/><path d="M-46-87H46M-38-96h76M-38-167h76M-30-179h60" stroke="#e7dccb" stroke-width="5"/><path d="M-30-225 0-281 30-225Z" fill="#5c8580"/><path d="M0-281v-27" stroke="#b6b9ad" stroke-width="3"/><path d="M-17-225v-29h34v29" fill="#495d64"/><path d="M-18-219v-31m36 31v-31M0-221v-40" stroke="#d4d2bb" stroke-width="3"/><path d="M-9 0v-28q9-13 18 0V0M-8-112v-20q8-12 16 0v20M-8-185v-15q8-12 16 0v15" fill="#68737b"/><circle cy="-59" r="12" fill="#e5dec8" stroke="#7d8480" stroke-width="3"/><path d="M0-67v8l6 3" fill="none" stroke="#696975" stroke-width="2"/>');
      layers[0]=stall(54,217,'#b9b3d5')+table(120,275)+poly([[68,257,28],[100,257,28],[100,257,55],[68,257,55]],'#c9f2ec88')+human(105,280,'#ffe1a6');
      layers[1]=box(302,214,61,26,40,'#a89ab4','#d8f5ef')+box(386,220,50,25,40,'#a89ab4','#d8f5ef')+at(332,240,'<path d="m0-64 12 18-12 18-12-18Z" fill="#e7cb89"/><path d="M0-64v36" stroke="#fff2c2"/>')+human(351,278,'#ccaaec');
      layers[2]=light(70,320,55)+light(270,308,55)+light(435,325,55)+sign(228,348)+path([[45,340],[440,340]],'#e9d5af',3);
    } else if(type==='heritage') {
      back=poly([[-20,-10],[120,20,56],[260,-10]],'#b7aa87')+poly([[180,-20],[340,0,70],[540,10]],'#c4b894');
      base=poly([[25,30],[67,30],[96,93],[70,162],[99,206],[53,211],[25,165],[50,94]],'#7ca7a3')+path([[112,30],[129,98],[111,161],[138,220]],'#c4c790',12);
      base+=house(185,60,'#d7c9a7')+house(276,63,'#d3b8a2')+house(370,77,'#dfc7a9')+poly([[130,240],[500,240],[500,280],[130,280]],'#e8d7b0');
      for(let i=0;i<7;i++)base+=at(65+i*65,195,'<path d="m-3 0 3-17 5 17" stroke="#a4aa72" stroke-width="3" fill="none"/>');
      layers[0]=canopy(50,290,72,38,'#d4b8a0')+board(57,323)+sign(141,306)+human(127,337,'#d2a0b3');
      layers[1]=canopy(250,208,83,51,'#d5ba93')+canopy(362,220,83,51,'#c8a1b2')+table(285,261)+table(398,270)+human(323,284,'#bcacdf');
      layers[2]=stall(214,327,'#c7a582')+table(311,356)+table(369,354)+bins(405,344)+human(333,377,'#a3c2b7');
    } else {
      // Small village houses around a lattice communications tower, from photo and satellite.
      base=road+house(28,30,'#d3c7b0')+house(381,24,'#b8c6b2')+house(383,93,'#c8bcae');
      base+=at(248,158,'<ellipse cy="2" rx="76" ry="24" fill="#41415730"/><path d="M-64 0-30-92-10-191 0-218 10-191 30-92 64 0H44L17-63h-34L-44 0Z" fill="#8598a8"/><path d="M-30-93h60M-19-135h38M-10-173h20M-50-19l80-74M50-19l-80-74M-19-135l29-38m9 38-29-38M-27-93 19-135M27-93-19-135M-7-183 6-207m1 24-13-24" stroke="#dbe4e4" stroke-width="3"/><path d="M-44 0q44-63 88 0" fill="#bcc8cb"/><path d="M-10-196h20v-10h-20" fill="none" stroke="#aebdc6" stroke-width="3"/>')+tree(35,183,.75)+tree(464,191,.9);
      layers[0]=podium(154,240,204,45)+poly([[158,244,13],[354,244,13],[354,279,13],[158,279,13]],'#f3d3e6')+human(228,257,'#e18fbd')+human(298,265,'#968ee0');
      layers[1]=stall(45,299,'#c5afd7')+box(103,307,33,18,45,'#d5c3de','#f4d9ed')+at(119,326,'<ellipse cy="-55" rx="12" ry="17" fill="#b6dfe0" stroke="#e7e2d8" stroke-width="3"/>')+human(110,351,'#b3cbdc');
      layers[2]=light(120,252,90)+light(386,262,90)+human(391,317)+human(350,331,'#96d6d4');
      for(let i=0;i<4;i++)layers[2]+=box(169+i*43,323,19,15,17,'#9d8ba9','#deb8d1');
    }
    const slab=poly([[0,0,-17],[500,0,-17],[500,385,-17],[0,385,-17]],'#524e91')+poly([[0,385,0],[500,385,0],[500,385,-17],[0,385,-17]],'#8b7fa8')+poly([[500,0,0],[500,385,0],[500,385,-17],[500,0,-17]],'#76699a')+poly([[0,0],[500,0],[500,385],[0,385]],theme[3]);
    const decoration=type==='heritage'?'':tree(475,360,.7,type==='lake'?'#65b3a7':'#a293c4')+flowers(15,360,42);
    return `<svg class="city-art ${mini?'mini':''}" viewBox="0 0 900 590" role="img" aria-label="${theme[4]}: куплено ${count} из 3 улучшений" data-scene="${type}"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${theme[0]}"/><stop offset="1" stop-color="${theme[1]}"/></linearGradient><linearGradient id="${id}-water" x2=".4" y2="1"><stop stop-color="#62aaca"/><stop offset="1" stop-color="#88cbd0"/></linearGradient><radialGradient id="${id}-glow"><stop stop-color="#fff1b2" stop-opacity=".5"/><stop offset="1" stop-color="#ffe3a2" stop-opacity="0"/></radialGradient></defs><rect width="900" height="590" fill="url(#${id}-sky)"/><circle cx="745" cy="100" r="46" fill="#f4d7d43b"/><circle cx="745" cy="100" r="29" fill="#ffe5d7b8"/><path d="M0 220Q160 130 300 212T610 180T900 192V590H0Z" fill="${theme[2]}" opacity=".17"/><path d="M0 290Q170 200 340 278T660 245T900 260V590H0Z" fill="${theme[2]}" opacity=".14"/><g opacity=".55" fill="#e3e9ff">${[90,180,290,530,620,810].map((x,i)=>`<circle cx="${x}" cy="${45+i%3*32}" r="${i%2?1.5:2}"/>`).join('')}</g><ellipse cx="450" cy="519" rx="337" ry="37" fill="#11123a30"/><g class="island" transform="translate(130 62)">${slab}${back}${base}${decoration}<g class="scene-additions">${layers.map((layer,i)=>own[i]?`<g data-upgrade="${i}" class="scene-upgrade ${i===highlight?'new-upgrade':''}">${layer}</g>`:'').join('')}</g></g></svg>`;
  }
  root.CultureArt.scene = scene;
})(window);
