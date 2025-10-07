let topZ = 10;

function uiClick() {
  const click = document.getElementById('click-snd');
  if (!click) return;
  try { click.currentTime = 0; click.play(); } catch(e){}
}

function openWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  focusWindow(id);
}
function closeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.querySelectorAll('audio,video').forEach(m=>{ try{ m.pause(); }catch(e){} });
  el.classList.remove('open');
}
function focusWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  topZ += 1; el.style.zIndex = String(topZ);
}

function makeDraggable(winEl) {
  const header = winEl.querySelector('[data-drag-handle]');
  if (!header) return;
  let startX=0, startY=0;
  function onDown(e){
    e.preventDefault();
    focusWindow(winEl.id);
    startX = e.clientX; startY = e.clientY;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  
  function makeResizable(winEl) {
  // Create handles once
  const dirs = ['n','e','s','w','ne','nw','se','sw'];
  dirs.forEach(d => {
    const h = document.createElement('div');
    h.className = 'resizer';
    h.dataset.dir = d;
    winEl.appendChild(h);
  });

  const minW = Math.max(220, parseInt(getComputedStyle(winEl).minWidth || '220', 10));
  const minH = Math.max(140, parseInt(getComputedStyle(winEl).minHeight || '140', 10));

  let startX=0, startY=0, startLeft=0, startTop=0, startW=0, startH=0, dir='', active=false;

  // Helpers
  const px = v => `${Math.round(v)}px`;
  const clamp = (val, lo, hi) => Math.max(lo, Math.min(hi, val));

  function onDown(e) {
    const target = e.target;
    if (!target.classList.contains('resizer')) return;

    dir = target.dataset.dir;
    active = true;
    bringToFront(winEl);
    winEl.classList.add('resizing');

    const rect = winEl.getBoundingClientRect();
    startLeft = rect.left;
    startTop  = rect.top;
    startW    = rect.width;
    startH    = rect.height;

    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX;
    startY = pt.clientY;

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp, { once: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp, { once: true });

    e.preventDefault();
  }

  function onMove(e) {
    if (!active) return;

    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - startX;
    const dy = pt.clientY - startY;

    let newLeft = startLeft;
    let newTop  = startTop;
    let newW    = startW;
    let newH    = startH;

    // Horizontal
    if (dir.includes('e')) {
      newW = startW + dx;
    }
    if (dir.includes('w')) {
      newLeft = startLeft + dx;
      newW    = startW - dx;
    }

    // Vertical
    if (dir.includes('s')) {
      newH = startH + dy;
    }
    if (dir.includes('n')) {
      newTop = startTop + dy;
      newH   = startH - dy;
    }

    // Enforce min size
    if (newW < minW) {
      if (dir.includes('w')) newLeft -= (minW - newW);
      newW = minW;
    }
    if (newH < minH) {
      if (dir.includes('n')) newTop -= (minH - newH);
      newH = minH;
    }

    // Keep within viewport (optional but nice)
    const maxLeft = vw - newW;
    const maxTop  = vh - newH;
    newLeft = clamp(newLeft, 0, Math.max(0, maxLeft));
    newTop  = clamp(newTop, 0, Math.max(0, maxTop));

    // Apply
    winEl.style.left = px(newLeft);
    winEl.style.top  = px(newTop);
    winEl.style.width  = px(newW);
    winEl.style.height = px(newH);

    e.preventDefault?.();
  }

  function onUp() {
    active = false;
    winEl.classList.remove('resizing');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchmove', onMove);
  }

  // Attach once per window
  winEl.addEventListener('mousedown', onDown);
  winEl.addEventListener('touchstart', onDown, { passive: false });
}

  function onMove(e){
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX; startY = e.clientY;
    const rect = winEl.getBoundingClientRect();
    winEl.style.left = (rect.left + dx) + 'px';
    winEl.style.top = (rect.top + dy) + 'px';
  }
  function onUp(){
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  header.addEventListener('mousedown', onDown);
}

function initDraggables(){ document.querySelectorAll('.window').forEach(makeDraggable); }

function updateClock(){
  const el = document.getElementById('clock'); if(!el) return;
  const now = new Date(); el.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
setInterval(updateClock,1000); updateClock();

const bg = document.getElementById('bg-music');
const btnMute = document.getElementById('btn-mute');
const btnUnmute = document.getElementById('btn-unmute');

function tryPlayBackground(){
  if(!bg) return;
  bg.volume = 0.6;
  bg.play().catch(()=>{
    bg.muted = true;
    bg.play().then(()=>{
      const enable = ()=>{ bg.muted=false; document.removeEventListener('click', enable); document.removeEventListener('keydown', enable); };
      document.addEventListener('click', enable, {once:true});
      document.addEventListener('keydown', enable, {once:true});
    }).catch(()=>{});
  });
}

if(btnMute) btnMute.addEventListener('click', ()=>{ uiClick(); if(bg){ bg.muted = true; }});
if(btnUnmute) btnUnmute.addEventListener('click', ()=>{ uiClick(); if(bg){ bg.muted = false; bg.play().catch(()=>{}); }});

if (btnMute) {
  btnMute.addEventListener('click', ()=>{
    uiClick();
    if (bg) { bg.muted = true; }
  });
}
if (btnUnmute) {
  btnUnmute.addEventListener('click', ()=>{
    uiClick();
    if (bg) {
      bg.muted = false;
      bg.play().catch(()=>{});
    }
  });
}
// removed extra closing brace

document.addEventListener('click', …);
window.addEventListener('DOMContentLoaded', …);

function tryPlayBackground() {
  if (!bg) return;
  bg.volume = 0.6;
  bg.play().catch(() => {
    // if autoplay with sound fails, mute the audio and try again
    bg.muted = true;
    bg.play().then(() => {
      // add event listeners to unmute after a user click/keypress
      const enable = () => { bg.muted = false; … };
      document.addEventListener('click', enable, { once: true });
      document.addEventListener('keydown', enable, { once: true });
    }).catch(() => {});
  });
}

document.addEventListener('click', (e)=>{
  const trg = e.target;
  if (trg.closest('.desktop-icon') || trg.closest('.title-bar-controls button') || trg.matches('button')) {
    uiClick();
  }
}, {capture:true});

window.addEventListener('DOMContentLoaded', ()=>{
  initDraggables();
  tryPlayBackground();
  initIntroVideo();
});
