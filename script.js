let topZ = 10;

function initIntroVideo() {
  // placeholder: load or hide the intro video
}

function uiClick() {
  const click = document.getElementById('click-snd');
  if (!click) return;
  try { click.currentTime = 0; click.play(); } catch(e){}
}
<script>
(function () {
  const overlay   = document.getElementById('intro-overlay');
  const video     = document.getElementById('intro-video');
  const skipBtn   = document.getElementById('skip-intro');
  const tapPrompt = document.getElementById('tap-to-start');

  // Prevent page scroll while intro plays
  document.documentElement.classList.add('intro-active');
  document.body.classList.add('intro-active');

  // Some SPA/desktop code uses key/mouse listeners; keep focus off the video
  video.setAttribute('aria-hidden', 'true');

  // Attempt autoplay (muted)
  const tryAutoplay = () =>
    video.play().catch(() => {
      // Autoplay blocked: ask user to tap/click
      tapPrompt.hidden = false;
      overlay.addEventListener('click', resumeAfterGesture, { once: true });
      overlay.addEventListener('touchend', resumeAfterGesture, { once: true });
    });

  const resumeAfterGesture = () => {
    tapPrompt.hidden = true;
    video.play().catch(() => {
      // If this fails, just skip
      endIntro();
    });
  };

  const endIntro = () => {
    // Optional: fade out
    overlay.style.transition = 'opacity 300ms ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.documentElement.classList.remove('intro-active');
      document.body.classList.remove('intro-active');

      // If you have background music elsewhere, you can unmute and play it after user gesture
      // e.g., startBackgroundMusicSafely();

      // Initialize your Windows-98 desktop now
      if (typeof window.initDesktop === 'function') {
        window.initDesktop();
      }
    }, 300);
  };

  // End on natural video finish
  video.addEventListener('ended', endIntro);

  // Allow manual skip at any time
  skipBtn.addEventListener('click', endIntro);

  // Kick off autoplay attempt
  tryAutoplay();
})();
</script>

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
