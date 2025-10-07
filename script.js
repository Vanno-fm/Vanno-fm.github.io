let topZ = 10;

function initIntroVideo() {
  // placeholder: load or hide the intro video
}

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
