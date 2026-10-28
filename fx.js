(function(root) {
  'use strict';
  const colors = ['#ffb29d','#96efff','#d6b7ff','#ffe5a1','#a3f5d0','#f9afe9'];
  function transient(holder, className, styles, duration = 650, content = '') {
    const el = document.createElement('span'); el.className = className; el.innerHTML = content;
    Object.assign(el.style, styles); holder.appendChild(el);
    setTimeout(() => el.remove(), duration);
    return el;
  }
  function wave(frame, scoreGain) {
    const holder = document.getElementById('board-fx'); if (!holder) return;
    const r = holder.getBoundingClientRect();
    let cx=0,cy=0,n=0;
    for (const index of frame.hits) {
      const cell = document.querySelector(`[data-cell="${index}"]`); if (!cell) continue;
      const cr=cell.getBoundingClientRect(),x=cr.x-r.x+cr.width/2,y=cr.y-r.y+cr.height/2,c=colors[Number(cell.dataset.color)];
      cx+=x;cy+=y;n++;
      if(n<29)for(let i=0;i<4;i++) {
        const angle=(i/4+Math.random()*.15)*Math.PI*2, distance=22+Math.random()*33;
        const el=transient(holder,'match-particle',{left:`${x}px`,top:`${y}px`,background:c},620);
        el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:`translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance+20}px) scale(.2)`,opacity:0}],{duration:500+Math.random()*100,easing:'cubic-bezier(.1,.5,.35,1)',fill:'forwards'});
      }
      const special=cell.dataset.special;
      if(special==='row'||special==='col')transient(holder,`power-beam ${special}`,{left:special==='row'?'0':`${x-3}px`,top:special==='col'?'0':`${y-3}px`,background:`linear-gradient(${special==='row'?'90':'0'}deg,transparent,${c},#fff,${c},transparent)`},550);
      if(special==='bomb'||special==='rainbow')transient(holder,`power-ring ${special}`,{left:`${x}px`,top:`${y}px`,borderColor:c},650);
    }
    if(n) {
      const combo=frame.combo||1;
      transient(holder,'floating-score',{left:`${cx/n}px`,top:`${cy/n}px`},850,`+${scoreGain}`);
      if(combo>1||frame.hits.length>15)transient(holder,'combo-burst',{},900,combo>2?'Невероятно!':frame.hits.length>15?'Суперкомбо!':`Каскад ×${combo}`);
    }
    if(frame.hits.length>12)document.querySelector('.board-shell')?.animate([{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],{duration:180});
  }
  function falling(drops,n) {
    const board=document.getElementById('board'); if(!board)return;
    const step=board.getBoundingClientRect().height/n;
    for(const {from,to} of drops) {
      if(from===to)continue;
      const el=board.querySelector(`[data-cell="${to}"] svg`);if(!el)continue;
      el.animate([{transform:`translateY(${(Math.floor(from/n)-Math.floor(to/n))*step}px)`,opacity:from<0?.15:1},{transform:'translateY(0)',opacity:1}],{duration:220+Math.min(4,Math.floor(to/n)-Math.floor(from/n))*22,easing:'cubic-bezier(.2,.75,.3,1)'});
    }
  }
  root.CultureFX = { wave, falling };
})(window);
