let topZ = 10;

function uiClick() {
  const click = document.getElementById("click-snd");
  if (!click) return;
  try {
    click.currentTime = 0;
    click.play();
  } catch (e) {
    /* ignore */
  }
}

function openWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("open");
  focusWindow(id);
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // pause any media inside the window
  el.querySelectorAll("audio,video").forEach((m) => { try { m.pause(); } catch (e) {} });
  el.classList.remove("open");
}

function focusWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  topZ += 1;
  el.style.zIndex = String(topZ);
}

/* Make windows draggable via their title bars */
function makeDraggable(winEl) {
  const header = winEl.querySelector("[data-drag-handle]");
  if (!header) return;
  let startX = 0, startY = 0;

  function onDown(e) {
    e.preventDefault();
    focusWindow(winEl.id);
    startX = e.clientX;
    startY = e.clientY;
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function onMove(e) {
    e.preventDefault();
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    const rect = winEl.getBoundingClientRect();
    winEl.style.left = rect.left + dx + "px";
    winEl.style.top = rect.top + dy + "px";
  }

  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }

  header.addEventListener("mousedown", onDown);
}

function initDraggables() {
  document.querySelectorAll(".window").forEach(makeDraggable);
}

/* Update the taskbar clock every second */
function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function tryPlayBackground() {
  if (!bg) return;
  bg.volume = 0.6;
  bg.play().catch(() => {
    // if autoplay with sound fails, mute the audio and try again
    bg.muted = true;
    bg.play().then(() => {
      // add event listeners to unmute after a user click/keypress
      const enable = () => { 
        bg.muted = false; 
        document.removeEventListener('click', enable); 
        document.removeEventListener('keydown', enable); 
      };
      document.addEventListener('click', enable, { once: true });
      document.addEventListener('keydown', enable, { once: true });
    }).catch(() => {});
  });
}


/* Mute/unmute buttons */
function initAudioControls() {
  const bg = document.getElementById("bg‑music");
  const btnMute = document.getElementById("btn-mute");
  const btnUnmute = document.getElementById("btn-unmute");
  if (btnMute) {
    btnMute.addEventListener("click", () => {
      uiClick();
      if (bg) bg.muted = true;
    });
  }
  if (btnUnmute) {
    btnUnmute.addEventListener("click", () => {
      uiClick();
      if (bg) {
        bg.muted = false;
        bg.play().catch(() => {});
      }
    });
  }
}

/* Event delegation to play the click sound on icon and button interactions */
document.addEventListener("click", (e) => {
  const trg = e.target;
  if (trg.closest(".desktop-icon") || trg.closest(".title-bar-controls button") || trg.matches("button")) {
    uiClick();
  }
}, { capture: true });

/* Initialize when the DOM is ready */
window.addEventListener("DOMContentLoaded", () => {
  initDraggables();
  updateClock();
  setInterval(updateClock, 1000);
  initAudioControls();
  tryPlayBackground();
  // Remove call to undefined initIntroVideo();
});
