(() => {
  const $ = s => document.querySelector(s);

  // --- AUDIO SYNTHESIZER (Fixed bugs & working smoothly) ---
  let sfxEnabled = true;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playTone(freq, type = "sine", duration = 0.15, slideTo = null, vol = 0.08) {
    if (!sfxEnabled) return;
    try {
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function sfxMeow() {
    playTone(520, "triangle", 0.28, 680, 0.09);
    setTimeout(() => playTone(680, "triangle", 0.22, 460, 0.07), 140);
  }
  function sfxHeart() {
    playTone(587.33, "sine", 0.12, null, 0.08);
    setTimeout(() => playTone(880, "sine", 0.2, null, 0.08), 80);
  }
  function sfxJump() { playTone(260, "sine", 0.16, 540, 0.07); }
  function sfxHit() { playTone(180, "sawtooth", 0.25, 70, 0.09); }

  $("#sound-toggle").addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    $("#sound-toggle").innerHTML = sfxEnabled ? "🔊 <span>SFX On</span>" : "🔇 <span>SFX Off</span>";
    if (sfxEnabled) sfxHeart();
  });

  // --- FLOATING SAKURA & HEARTS BACKGROUND ---
  const pCanvas = $("#petals-canvas");
  const pCtx = pCanvas.getContext("2d");
  let petals = [];
  function resizePetals() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizePetals);
  resizePetals();

  for (let i = 0; i < 28; i++) {
    petals.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 4 + Math.random() * 6,
      vy: 0.4 + Math.random() * 0.8,
      vx: -0.3 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
      vrot: -0.02 + Math.random() * 0.04,
      isHeart: i % 4 === 0
    });
  }

  function animatePetals() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    petals.forEach(p => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.01) * 0.3;
      p.rot += p.vrot;
      if (p.y > pCanvas.height + 20) { p.y = -20; p.x = Math.random() * pCanvas.width; }
      pCtx.save();
      pCtx.translate(p.x, p.y);
      pCtx.rotate(p.rot);
      pCtx.fillStyle = p.isHeart ? "rgba(217, 108, 148, 0.28)" : "rgba(244, 178, 202, 0.38)";
      if (p.isHeart) {
        pCtx.font = `${p.r * 2.2}px serif`;
        pCtx.fillText("♥", -p.r, p.r);
      } else {
        pCtx.beginPath();
        pCtx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        pCtx.fill();
      }
      pCtx.restore();
    });
    requestAnimationFrame(animatePetals);
  }
  animatePetals();

  // --- ECG HEARTBEAT WIDGET LOGIC ---
  const ecgCanvas = $("#ecg-canvas");
  const ecgCtx = ecgCanvas.getContext("2d");
  let ecgPhase = 0;
  let ecgSpeed = 2.2;
  let ecgAcceleratedTimer = 0;

  $("#ecg-trigger").addEventListener("click", () => {
    sfxHeart();
    ecgSpeed = 6.5;
    ecgAcceleratedTimer = 140;
    $("#ecg-text.ecg-text-active") || $("#ecg-text").classList.add("ecg-text-active");
    $("#ecg-text").textContent = "“Somehow, you make my heart beat differently.” ♡";
  });

  function drawECG() {
    ecgCtx.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    ecgCtx.strokeStyle = "#a6466b";
    ecgCtx.lineWidth = 2.5;
    ecgCtx.lineJoin = "round";
    ecgCtx.beginPath();

    if (ecgAcceleratedTimer > 0) {
      ecgAcceleratedTimer--;
      if (ecgAcceleratedTimer === 0) ecgSpeed = 2.2;
    }

    ecgPhase += ecgSpeed;
    const w = ecgCanvas.width;
    const h = ecgCanvas.height;
    const midY = h / 2;

    for (let x = 0; x < w; x++) {
      const p = (x + ecgPhase) % 180;
      let y = midY;
      if (p > 75 && p < 90) y = midY - 30; // P wave
      else if (p >= 90 && p < 100) y = midY + 12; // Q
      else if (p >= 100 && p < 108) y = midY - 38; // R (spike)
      else if (p >= 108 && p < 118) y = midY + 22; // S
      else if (p >= 135 && p < 155) y = midY - 10; // T wave

      if (x === 0) ecgCtx.moveTo(x, y);
      else ecgCtx.lineTo(x, y);
    }
    ecgCtx.stroke();
    requestAnimationFrame(drawECG);
  }
  drawECG();

  // --- GATE & NAVIGATION ---
  const gate = $("#gate"), site = $("#site");
  function enter() {
    if ($("#secret-code").value.trim().toUpperCase() === "PATATINA") {
      sfxHeart();
      gate.classList.add("hidden");
      site.classList.remove("hidden");
      sessionStorage.setItem("cw-entered", "yes");
      window.scrollTo(0, 0);
    } else {
      sfxHit();
      $("#gate-error").textContent = "Not quite, my love. Try again ♡";
    }
  }
  $("#enter-btn").addEventListener("click", enter);
  $("#secret-code").addEventListener("keydown", e => { if (e.key === "Enter") enter(); });
  if (sessionStorage.getItem("cw-entered") === "yes") {
    gate.classList.add("hidden");
    site.classList.remove("hidden");
  }

  $("#menu-toggle").addEventListener("click", () => $("#main-nav").classList.toggle("open"));
  document.querySelectorAll(".nav-link").forEach(a => a.addEventListener("click", () => $("#main-nav").classList.remove("open")));

  // --- LIVE LOVE COUNTER ---
  const startDate = new Date(2025, 11, 18, 0, 0, 0);
  function updateCounter() {
    const diff = Math.max(0, Date.now() - startDate.getTime());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const mins = Math.floor((diff / 60000) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    $("#c-days").textContent = days;
    $("#c-hours").textContent = String(hours).padStart(2, "0");
    $("#c-mins").textContent = String(mins).padStart(2, "0");
    $("#c-secs").textContent = String(secs).padStart(2, "0");
  }
  setInterval(updateCounter, 1000);
  updateCounter();

  // --- LETTERS ---
  const letters = window.CHRIZZA_LETTERS || [];
  $("#letter-list").innerHTML = letters.map((l, i) => `
    <button class="envelope" data-letter="${i}">
      <div class="env-seal">♡</div>
      <strong>${l.month}</strong>
      <span>${l.date} · Read Letter ↗</span>
    </button>
  `).join("");

  $("#letter-list").addEventListener("click", e => {
    const btn = e.target.closest("[data-letter]");
    if (!btn) return;
    sfxHeart();
    const l = letters[Number(btn.dataset.letter)];
    $("#modal-title").textContent = l.month;
    $("#modal-letter-body").textContent = l.text;
    $("#letter-modal").classList.remove("hidden");
  });

  function closeModal() { $("#letter-modal").classList.add("hidden"); }
  $("#close-letter").addEventListener("click", closeModal);
  $("#letter-modal").addEventListener("click", e => { if (e.target.dataset.close) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  // --- HELPER: DRAW TORTORO ---
  function drawTortoro(ctx, x, y, scale = 1, state = "idle", frame = 0, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    const bounce = state === "run" ? Math.sin(frame * 0.35) * 4 : (state === "idle" ? Math.sin(frame * 0.08) * 1.5 : 0);
    const squashY = state === "duck" ? 0.65 : 1;
    ctx.scale(1, squashY);

    // Tail
    ctx.strokeStyle = "#7a7d85"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath();
    const tailWag = Math.sin(frame * 0.12) * 10;
    ctx.moveTo(-22, -8 + bounce); ctx.quadraticCurveTo(-42, -26 + tailWag, -34, -42 + tailWag);
    ctx.stroke();

    // Body
    ctx.fillStyle = "#9599a3";
    ctx.beginPath(); ctx.ellipse(0, -14 + bounce, 26, 20, 0, 0, Math.PI * 2); ctx.fill();

    // Paws
    ctx.fillStyle = "#e6e8ed";
    const legSwing = state === "run" ? Math.sin(frame * 0.4) * 8 : 0;
    ctx.beginPath(); ctx.arc(-12 + legSwing, 4, 6, 0, Math.PI * 2); ctx.arc(12 - legSwing, 4, 6, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.fillStyle = "#9fa3ad";
    ctx.beginPath(); ctx.arc(16, -30 + bounce, 19, 0, Math.PI * 2); ctx.fill();

    // Ears
    ctx.fillStyle = "#838791";
    ctx.beginPath();
    ctx.moveTo(4, -44 + bounce); ctx.lineTo(8, -60 + bounce); ctx.lineTo(18, -46 + bounce);
    ctx.moveTo(18, -46 + bounce); ctx.lineTo(28, -59 + bounce); ctx.lineTo(31, -41 + bounce);
    ctx.fill();

    // Inner pink ears
    ctx.fillStyle = "#eba8be";
    ctx.beginPath();
    ctx.moveTo(7, -45 + bounce); ctx.lineTo(9, -55 + bounce); ctx.lineTo(15, -46 + bounce);
    ctx.moveTo(20, -46 + bounce); ctx.lineTo(27, -55 + bounce); ctx.lineTo(29, -43 + bounce);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#8cb8de";
    ctx.beginPath(); ctx.arc(12, -31 + bounce, 4.2, 0, Math.PI * 2); ctx.arc(24, -31 + bounce, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#22252a";
    ctx.beginPath(); ctx.arc(12.5, -31 + bounce, 2, 0, Math.PI * 2); ctx.arc(24.5, -31 + bounce, 2, 0, Math.PI * 2); ctx.fill();

    // Nose
    ctx.fillStyle = "#e88ca8";
    ctx.beginPath(); ctx.arc(19, -25 + bounce, 2.5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // --- GAME 1: COZY ROOM SIMULATOR ---
  const cCanvas = $("#cozy-canvas");
  const cCtx = cCanvas.getContext("2d");
  let pet = {
    x: 280, y: 265, targetX: 280, facing: 1,
    hunger: 85, happy: 90, energy: 80, xp: 0, level: 1,
    state: "idle", stateTimer: 0, isSunset: false, particles: [],
    yarn: { x: 140, y: 275, vx: 0, vy: 0, active: false }, fishBowl: 2
  };

  function addCozyParticle(x, y, text) { pet.particles.push({ x, y, vy: -1.2, life: 60, text }); }

  cCanvas.addEventListener("pointerdown", e => {
    const rect = cCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (cCanvas.width / rect.width);
    const my = (e.clientY - rect.top) * (cCanvas.height / rect.height);
    if (Math.hypot(mx - pet.x, my - (pet.y - 25)) < 65) {
      pet.state = "happy"; pet.stateTimer = 70; pet.happy = Math.min(100, pet.happy + 6);
      sfxMeow(); addCozyParticle(pet.x, pet.y - 65, "Purrr ♡");
      $("#cozy-toast").textContent = "Purrrr... Tortoro loves head scratches! 🥰";
    } else if (my > 210) {
      pet.targetX = Math.max(80, Math.min(520, mx)); pet.state = "run"; pet.stateTimer = 90;
    }
  });

  $("#act-feed").addEventListener("click", () => {
    pet.fishBowl = 3; pet.targetX = 465; pet.state = "run"; pet.stateTimer = 110;
    pet.hunger = Math.min(100, pet.hunger + 18); pet.happy = Math.min(100, pet.happy + 6);
    sfxHeart(); addCozyParticle(465, 245, "🐟 Yummy!");
    $("#cozy-toast").textContent = "Fresh fish treat served in Bugo! 🐟";
  });
  $("#act-toy").addEventListener("click", () => {
    pet.yarn = { x: 120 + Math.random() * 200, y: 120, vx: (Math.random() - 0.5) * 8, vy: -4, active: true };
    pet.energy = Math.max(0, pet.energy - 10); pet.happy = Math.min(100, pet.happy + 14);
    sfxJump(); $("#cozy-toast").textContent = "Tortoro is chasing the pink yarn ball! 🧶";
  });
  $("#act-sleep").addEventListener("click", () => {
    if (pet.state === "sleep") { pet.state = "idle"; pet.stateTimer = 0; sfxMeow(); }
    else { pet.targetX = 115; pet.state = "sleep"; pet.stateTimer = 9999; sfxHeart(); $("#cozy-toast").textContent = "Tortoro curled up in his Bugo bed 💤"; }
  });
  $("#act-time").addEventListener("click", () => {
    pet.isSunset = !pet.isSunset; sfxHeart();
    $("#cozy-toast").textContent = pet.isSunset ? "Golden sunset over Bugo 🌅" : "Bright morning in Cagayan de Oro ☀️";
  });

  let cozyFrame = 0;
  function updateCozyRoom() {
    cozyFrame++;
    if (pet.yarn.active) {
      pet.yarn.x += pet.yarn.vx; pet.yarn.y += pet.yarn.vy; pet.yarn.vy += 0.35;
      if (pet.yarn.y > 278) { pet.yarn.y = 278; pet.yarn.vy *= -0.65; pet.yarn.vx *= 0.92; }
      pet.targetX = pet.yarn.x;
      if (Math.abs(pet.yarn.vx) < 0.2 && pet.yarn.y >= 277) pet.yarn.active = false;
    }

    const dx = pet.targetX - pet.x;
    if (Math.abs(dx) > 4) {
      pet.facing = dx > 0 ? 1 : -1; pet.x += pet.facing * 2.4;
      if (pet.state !== "sleep") pet.state = "run";
    } else if (pet.state === "run") { pet.state = "idle"; }

    cCtx.clearRect(0, 0, 600, 340);
    cCtx.fillStyle = pet.isSunset ? "#f5d5cb" : "#fdf1f5"; cCtx.fillRect(0, 0, 600, 245);
    cCtx.fillStyle = pet.isSunset ? "#c99679" : "#deb193"; cCtx.fillRect(0, 245, 600, 95);

    // Window
    cCtx.fillStyle = pet.isSunset ? "#f28c6b" : "#bce3fa"; cCtx.fillRect(210, 35, 180, 125);
    cCtx.fillStyle = pet.isSunset ? "#ffe184" : "#fff9d2"; cCtx.beginPath(); cCtx.arc(335, 70, 22, 0, Math.PI * 2); cCtx.fill();
    cCtx.font = "34px serif"; cCtx.fillText("🌴", 225, 152);
    cCtx.strokeStyle = "#fff"; cCtx.lineWidth = 6; cCtx.strokeRect(210, 35, 180, 125);

    // Bed & Bowl
    cCtx.fillStyle = "#e88cae"; cCtx.beginPath(); cCtx.ellipse(115, 278, 52, 18, 0, 0, Math.PI * 2); cCtx.fill();
    cCtx.fillStyle = "#d46a90"; cCtx.beginPath(); cCtx.roundRect(450, 265, 44, 18, 6); cCtx.fill();

    drawTortoro(cCtx, pet.x, pet.y, 1.35, pet.state, cozyFrame, pet.facing);
    requestAnimationFrame(updateCozyRoom);
  }
  updateCozyRoom();

  // --- GAME 2: ARCADE RUNNER ---
  const aCanvas = $("#arcade-canvas");
  const aCtx = aCanvas.getContext("2d");
  const overlay = $("#arcade-overlay");
  let bestScore = Number(localStorage.getItem("tortoro-best") || 0);
  $("#arc-best").textContent = bestScore;

  let arc = {
    running: false, score: 0, speed: 4.6, frame: 0, lives: 3, invuln: 0,
    cat: { x: 85, y: 275, vy: 0, jumps: 0, ducking: false },
    obstacles: [], collectibles: [], bgOffset: 0
  };

  function startArcade() {
    arc = {
      running: true, score: 0, speed: 4.6, frame: 0, lives: 3, invuln: 0,
      cat: { x: 85, y: 275, vy: 0, jumps: 0, ducking: false },
      obstacles: [], collectibles: [], bgOffset: 0
    };
    $("#arc-score").textContent = "0";
    overlay.classList.add("hidden");
    sfxJump();
  }

  function arcJump() {
    if (!arc.running) return;
    if (arc.cat.jumps < 2) {
      arc.cat.vy = arc.cat.jumps === 0 ? -11.5 : -10; arc.cat.jumps++; arc.cat.ducking = false; sfxJump();
    }
  }
  function arcDuck(isD) { if (arc.running) arc.cat.ducking = isD; }

  $("#arc-start-btn").addEventListener("click", startArcade);
  $("#pad-jump").addEventListener("pointerdown", e => { e.preventDefault(); arcJump(); });
  $("#pad-duck").addEventListener("pointerdown", e => { e.preventDefault(); arcDuck(true); });
  $("#pad-duck").addEventListener("pointerup", () => arcDuck(false));

  function gameOver() {
    arc.running = false; sfxHit();
    if (arc.score > bestScore) { bestScore = arc.score; localStorage.setItem("tortoro-best", bestScore); $("#arc-best").textContent = bestScore; }
    overlay.innerHTML = `<h4>Great Run, Tortoro! 🐾</h4><p>Score: <strong>${arc.score}</strong></p><button class="btn-romantic" id="arc-retry-btn">Play Again ↻</button>`;
    overlay.classList.remove("hidden");
    $("#arc-retry-btn").addEventListener("click", startArcade);
  }

  function updateArcade() {
    aCtx.clearRect(0, 0, 600, 340);
    aCtx.fillStyle = "#fce4ec"; aCtx.fillRect(0, 0, 600, 340);
    aCtx.fillStyle = "#d992ad"; aCtx.fillRect(0, 280, 600, 60);

    if (arc.running) {
      arc.frame++; arc.bgOffset += arc.speed;
      arc.cat.y += arc.cat.vy; arc.cat.vy += 0.62;
      if (arc.cat.y >= 275) { arc.cat.y = 275; arc.cat.vy = 0; arc.cat.jumps = 0; }

      if (arc.frame % 75 === 0) arc.obstacles.push({ x: 630, y: 262, type: "crab" });
      if (arc.frame % 55 === 0) arc.collectibles.push({ x: 630, y: 190, type: "heart" });

      arc.collectibles = arc.collectibles.filter(item => {
        item.x -= arc.speed;
        aCtx.font = "24px serif"; aCtx.fillText("💖", item.x, item.y);
        if (Math.hypot(item.x - arc.cat.x, item.y - (arc.cat.y - 20)) < 34) {
          sfxHeart(); arc.score++; $("#arc-score").textContent = arc.score; return false;
        }
        return item.x > -40;
      });

      arc.obstacles = arc.obstacles.filter(obs => {
        obs.x -= arc.speed;
        aCtx.font = "28px serif"; aCtx.fillText("🦀", obs.x, obs.y + 12);
        if (arc.invuln === 0 && Math.abs(obs.x - arc.cat.x) < 26 && Math.abs(obs.y - (arc.cat.y - 22)) < 24) {
          arc.lives--; arc.invuln = 75; sfxHit();
          if (arc.lives <= 0) gameOver();
        }
        return obs.x > -40;
      });
    }

    if (arc.invuln % 8 < 5) drawTortoro(aCtx, arc.cat.x, arc.cat.y, 1.05, arc.cat.ducking ? "duck" : (arc.running ? "run" : "idle"), arc.frame, 1);

    aCtx.font = "18px serif";
    for (let i = 0; i < 3; i++) aCtx.fillText(i < arc.lives ? "❤️" : "🤍", 16 + i * 24, 30);

    requestAnimationFrame(updateArcade);
  }
  updateArcade();
})();
