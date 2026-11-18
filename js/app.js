(() => {
  const $ = s => document.querySelector(s);

  // --- WEB AUDIO SYNTHESIZER (No external audio files needed) ---
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

  // --- LIVE LOVE COUNTER (From 18 Dec 2025) ---
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

  // --- LETTERS & MILESTONES ---
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

  const monthNotes = [
    ["Month 2", "I CHOOSE U, always."],
    ["Month 3", "You became my favourite part of the day."],
    ["Months 4–5", "We found our way back to each other."],
    ["Month 6", "You are my safe place."],
    ["Month 7", "The celestial kiss of the Moon and Venus."],
    ["Month 8", "You became my comfort and my home."],
    ["Month 9", "You became my benzina ⛽."],
    ["Month 10", "Choosing each other even when distance feels heavy."],
    ["Month 11", "Still writing our story together."]
  ];
  $("#monthsary-list").innerHTML = monthNotes.map(([m, t]) => `
    <div class="month-card"><strong>${m}</strong><p>${t}</p></div>
  `).join("");

  // Interactive Bucket List
  $("#bucket-list").addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    li.classList.toggle("done");
    li.querySelector(".chk").textContent = li.classList.contains("done") ? "♥" : "♡";
    sfxHeart();
  });

  // --- HELPER: DRAW CUTE GREY TABBY TORTORO ON CANVAS ---
  function drawTortoro(ctx, x, y, scale = 1, state = "idle", frame = 0, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    const bounce = state === "run" ? Math.sin(frame * 0.35) * 4 : (state === "idle" ? Math.sin(frame * 0.08) * 1.5 : 0);
    const squashY = state === "duck" ? 0.65 : 1;
    ctx.scale(1, squashY);

    // Tail
    ctx.strokeStyle = "#7a7d85";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    const tailWag = Math.sin(frame * 0.12) * 10;
    ctx.moveTo(-22, -8 + bounce);
    ctx.quadraticCurveTo(-42, -26 + tailWag, -34, -42 + tailWag);
    ctx.stroke();

    // Body
    ctx.fillStyle = "#9599a3";
    ctx.beginPath();
    ctx.ellipse(0, -14 + bounce, 26, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tabby stripes on body
    ctx.strokeStyle = "#636770";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -32 + bounce); ctx.lineTo(-6, -22 + bounce);
    ctx.moveTo(0, -33 + bounce); ctx.lineTo(0, -22 + bounce);
    ctx.moveTo(8, -32 + bounce); ctx.lineTo(6, -22 + bounce);
    ctx.stroke();

    // Paws
    ctx.fillStyle = "#e6e8ed";
    const legSwing = state === "run" ? Math.sin(frame * 0.4) * 8 : 0;
    ctx.beginPath();
    ctx.arc(-12 + legSwing, 4, 6, 0, Math.PI * 2);
    ctx.arc(12 - legSwing, 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#9fa3ad";
    ctx.beginPath();
    ctx.arc(16, -30 + bounce, 19, 0, Math.PI * 2);
    ctx.fill();

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

    // Forehead Tabby 'M'
    ctx.strokeStyle = "#5c6069";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(13, -43 + bounce); ctx.lineTo(16, -39 + bounce); ctx.lineTo(19, -43 + bounce);
    ctx.stroke();

    // Eyes (Tortoro's sleepy blue eyes!)
    if (state === "sleep" || state === "happy") {
      ctx.strokeStyle = "#3a3d45";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      if (state === "happy") {
        ctx.arc(12, -30 + bounce, 4, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(24, -30 + bounce, 4, Math.PI, 0);
        ctx.stroke();
      } else {
        ctx.moveTo(8, -30 + bounce); ctx.lineTo(15, -30 + bounce);
        ctx.moveTo(21, -30 + bounce); ctx.lineTo(28, -30 + bounce);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#8cb8de";
      ctx.beginPath();
      ctx.arc(12, -31 + bounce, 4.2, 0, Math.PI * 2);
      ctx.arc(24, -31 + bounce, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#22252a";
      ctx.beginPath();
      ctx.arc(12.5, -31 + bounce, 2, 0, Math.PI * 2);
      ctx.arc(24.5, -31 + bounce, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pink Nose & Whiskers
    ctx.fillStyle = "#e88ca8";
    ctx.beginPath();
    ctx.arc(19, -25 + bounce, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(28, -25 + bounce); ctx.lineTo(39, -27 + bounce);
    ctx.moveTo(28, -22 + bounce); ctx.lineTo(39, -21 + bounce);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // GAME 1: TORTORO'S COZY HOUSE IN BUGO (Interactive Canvas Room Simulator)
  // =========================================================================
  const cCanvas = $("#cozy-canvas");
  const cCtx = cCanvas.getContext("2d");
  let pet = {
    x: 280, y: 265, targetX: 280, facing: 1,
    hunger: 85, happy: 90, energy: 80,
    xp: 0, level: 1,
    state: "idle", stateTimer: 0,
    isSunset: false,
    particles: [],
    yarn: { x: 140, y: 275, vx: 0, vy: 0, active: false },
    fishBowl: 2
  };

  function addCozyParticle(x, y, text) {
    pet.particles.push({ x, y, vy: -1.2, life: 60, text });
  }

  function gainPetXP(amount, msg) {
    pet.xp += amount;
    if (pet.xp >= pet.level * 50) {
      pet.xp = 0;
      pet.level++;
      $("#cozy-level").textContent = `Affection Lv. ${pet.level}`;
      $("#cozy-toast").textContent = `🎉 Level Up! Tortoro loves you even more (Lv.${pet.level})!`;
    } else if (msg) {
      $("#cozy-toast").textContent = msg;
    }
    $("#stat-hunger").textContent = `${Math.round(pet.hunger)}%`;
    $("#stat-happy").textContent = `${Math.round(pet.happy)}%`;
    $("#stat-energy").textContent = `${Math.round(pet.energy)}%`;
    $("#bar-hunger").style.width = `${pet.hunger}%`;
    $("#bar-happy").style.width = `${pet.happy}%`;
    $("#bar-energy").style.width = `${pet.energy}%`;
  }

  // Click/Tap directly on Tortoro in his room to pet him!
  cCanvas.addEventListener("pointerdown", e => {
    const rect = cCanvas.getBoundingClientRect();
    const scaleX = cCanvas.width / rect.width;
    const scaleY = cCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    if (Math.hypot(mx - pet.x, my - (pet.y - 25)) < 65) {
      pet.state = "happy";
      pet.stateTimer = 70;
      pet.happy = Math.min(100, pet.happy + 6);
      sfxMeow();
      addCozyParticle(pet.x, pet.y - 65, "Purrr ♡");
      gainPetXP(10, "Purrrr... Tortoro loves head scratches! 🥰");
    } else if (my > 210) {
      // Walk to clicked spot
      pet.targetX = Math.max(80, Math.min(520, mx));
      pet.state = "run";
      pet.stateTimer = 90;
    }
  });

  $("#act-feed").addEventListener("click", () => {
    pet.fishBowl = 3;
    pet.targetX = 465;
    pet.state = "run";
    pet.stateTimer = 110;
    pet.hunger = Math.min(100, pet.hunger + 18);
    pet.happy = Math.min(100, pet.happy + 6);
    sfxHeart();
    addCozyParticle(465, 245, "🐟 Yummy!");
    gainPetXP(15, "Fresh fish treat served in Bugo! 🐟");
  });

  $("#act-toy").addEventListener("click", () => {
    if (pet.energy < 15) {
      $("#cozy-toast").textContent = "Tortoro is too sleepy! Let him take a nap 💤";
      return;
    }
    pet.yarn = { x: 120 + Math.random() * 200, y: 120, vx: (Math.random() - 0.5) * 8, vy: -4, active: true };
    pet.energy = Math.max(0, pet.energy - 10);
    pet.happy = Math.min(100, pet.happy + 14);
    sfxJump();
    gainPetXP(15, "Tortoro is chasing the pink yarn ball! 🧶");
  });

  $("#act-sleep").addEventListener("click", () => {
    if (pet.state === "sleep") {
      pet.state = "idle";
      pet.stateTimer = 0;
      sfxMeow();
      $("#cozy-toast").textContent = "Good morning Tortoro! ☀️";
    } else {
      pet.targetX = 115;
      pet.state = "sleep";
      pet.stateTimer = 9999;
      sfxHeart();
      $("#cozy-toast").textContent = "Tortoro curled up in his cozy Bugo bed 💤";
    }
  });

  $("#act-time").addEventListener("click", () => {
    pet.isSunset = !pet.isSunset;
    sfxHeart();
    $("#cozy-toast").textContent = pet.isSunset ? "Golden sunset over Cagayan de Oro 🌅" : "Bright tropical morning in Bugo ☀️";
  });

  let cozyFrame = 0;
  function updateCozyRoom() {
    cozyFrame++;
    // Gradual stat decay
    if (cozyFrame % 300 === 0) {
      pet.hunger = Math.max(15, pet.hunger - 1);
      pet.happy = Math.max(20, pet.happy - 1);
      if (pet.state === "sleep") {
        pet.energy = Math.min(100, pet.energy + 8);
        if (cozyFrame % 600 === 0) addCozyParticle(pet.x, pet.y - 55, "Zzz");
      } else {
        pet.energy = Math.max(15, pet.energy - 1);
      }
      gainPetXP(0, null);
    }

    // Yarn physics
    if (pet.yarn.active) {
      pet.yarn.x += pet.yarn.vx;
      pet.yarn.y += pet.yarn.vy;
      pet.yarn.vy += 0.35;
      if (pet.yarn.y > 278) { pet.yarn.y = 278; pet.yarn.vy *= -0.65; pet.yarn.vx *= 0.92; }
      if (pet.yarn.x < 60 || pet.yarn.x > 540) pet.yarn.vx *= -0.8;
      pet.targetX = pet.yarn.x;
      if (Math.abs(pet.yarn.vx) < 0.2 && pet.yarn.y >= 277) pet.yarn.active = false;
    }

    // Pet movement
    const dx = pet.targetX - pet.x;
    if (Math.abs(dx) > 4) {
      pet.facing = dx > 0 ? 1 : -1;
      pet.x += pet.facing * 2.4;
      if (pet.state !== "sleep") pet.state = "run";
    } else if (pet.state === "run") {
      pet.state = "idle";
    }

    if (pet.stateTimer > 0 && pet.state !== "sleep") {
      pet.stateTimer--;
      if (pet.stateTimer === 0) pet.state = "idle";
    }

    // Draw Room
    cCtx.clearRect(0, 0, 600, 340);
    // Wall
    cCtx.fillStyle = pet.isSunset ? "#f5d5cb" : "#fdf1f5";
    cCtx.fillRect(0, 0, 600, 245);
    // Wooden Floor
    cCtx.fillStyle = pet.isSunset ? "#c99679" : "#deb193";
    cCtx.fillRect(0, 245, 600, 95);

    // Window showing Bugo Palm Trees
    cCtx.fillStyle = pet.isSunset ? "#f28c6b" : "#bce3fa";
    cCtx.fillRect(210, 35, 180, 125);
    // Sun / Sunset orb
    cCtx.fillStyle = pet.isSunset ? "#ffe184" : "#fff9d2";
    cCtx.beginPath();
    cCtx.arc(335, pet.isSunset ? 125 : 70, 22, 0, Math.PI * 2);
    cCtx.fill();
    // Distant hills & palm silhouette
    cCtx.fillStyle = pet.isSunset ? "#7d4f63" : "#7ec488";
    cCtx.beginPath();
    cCtx.arc(260, 160, 55, Math.PI, 0);
    cCtx.arc(350, 160, 65, Math.PI, 0);
    cCtx.fill();
    cCtx.font = "34px serif";
    cCtx.fillText("🌴", 225, 152);
    // Window frame
    cCtx.strokeStyle = "#ffffff";
    cCtx.lineWidth = 6;
    cCtx.strokeRect(210, 35, 180, 125);
    cCtx.beginPath();
    cCtx.moveTo(300, 35); cCtx.lineTo(300, 160);
    cCtx.moveTo(210, 98); cCtx.lineTo(390, 98);
    cCtx.stroke();

    // Wall Picture Frame ("C ♡ S")
    cCtx.fillStyle = "#fff";
    cCtx.fillRect(85, 55, 70, 55);
    cCtx.strokeStyle = "#d98ca8";
    cCtx.lineWidth = 3;
    cCtx.strokeRect(85, 55, 70, 55);
    cCtx.fillStyle = "#b54970";
    cCtx.font = "bold 15px Georgia";
    cCtx.fillText("C ♡ S", 99, 88);

    // Cozy Cat Bed (Left)
    cCtx.fillStyle = "#e88cae";
    cCtx.beginPath();
    cCtx.ellipse(115, 278, 52, 18, 0, 0, Math.PI * 2);
    cCtx.fill();
    cCtx.fillStyle = "#fce4ed";
    cCtx.beginPath();
    cCtx.ellipse(115, 276, 38, 12, 0, 0, Math.PI * 2);
    cCtx.fill();

    // Food Bowl (Right)
    cCtx.fillStyle = "#d46a90";
    cCtx.beginPath();
    cCtx.roundRect(450, 265, 44, 18, 6);
    cCtx.fill();
    if (pet.fishBowl > 0) {
      cCtx.fillStyle = "#f4a261";
      cCtx.beginPath();
      cCtx.arc(472, 265, 12, Math.PI, 0);
      cCtx.fill();
    }

    // Yarn Ball
    cCtx.fillStyle = "#e0578a";
    cCtx.beginPath();
    cCtx.arc(pet.yarn.x, pet.yarn.y, 12, 0, Math.PI * 2);
    cCtx.fill();
    cCtx.strokeStyle = "#ffc2d9";
    cCtx.lineWidth = 1.5;
    cCtx.beginPath();
    cCtx.arc(pet.yarn.x, pet.yarn.y, 8, 0.2, 2.5);
    cCtx.stroke();

    // Draw Tortoro
    drawTortoro(cCtx, pet.x, pet.y, 1.35, pet.state, cozyFrame, pet.facing);

    // Floating Particles
    pet.particles = pet.particles.filter(pt => {
      pt.y += pt.vy;
      pt.life--;
      cCtx.globalAlpha = Math.max(0, pt.life / 60);
      cCtx.fillStyle = "#a6466b";
      cCtx.font = "bold 14px sans-serif";
      cCtx.fillText(pt.text, pt.x - 20, pt.y);
      cCtx.globalAlpha = 1;
      return pt.life > 0;
    });

    requestAnimationFrame(updateCozyRoom);
  }
  updateCozyRoom();

  // =========================================================================
  // GAME 2: TORTORO'S BUGO ADVENTURE (Endless Parallax Runner Arcade)
  // =========================================================================
  const aCanvas = $("#arcade-canvas");
  const aCtx = aCanvas.getContext("2d");
  const overlay = $("#arcade-overlay");

  let bestScore = Number(localStorage.getItem("tortoro-best") || 0);
  $("#arc-best").textContent = bestScore;

  let arc = {
    running: false,
    score: 0,
    speed: 4.5,
    frame: 0,
    lives: 3,
    invuln: 0,
    magnetTimer: 0,
    cat: { x: 85, y: 275, vy: 0, jumps: 0, ducking: false },
    obstacles: [],
    collectibles: [],
    bgOffset: 0
  };

  function startArcade() {
    arc = {
      running: true,
      score: 0,
      speed: 4.6,
      frame: 0,
      lives: 3,
      invuln: 0,
      magnetTimer: 0,
      cat: { x: 85, y: 275, vy: 0, jumps: 0, ducking: false },
      obstacles: [],
      collectibles: [],
      bgOffset: 0
    };
    $("#arc-score").textContent = "0";
    overlay.classList.add("hidden");
    sfxJump();
  }

  function arcJump() {
    if (!arc.running) return;
    if (arc.cat.jumps < 2) {
      arc.cat.vy = arc.cat.jumps === 0 ? -11.5 : -10;
      arc.cat.jumps++;
      arc.cat.ducking = false;
      sfxJump();
    }
  }

  function arcDuck(isDucking) {
    if (!arc.running) return;
    arc.cat.ducking = isDucking;
    if (isDucking && arc.cat.y < 275) arc.cat.vy += 4;
  }

  $("#arc-start-btn").addEventListener("click", startArcade);
  $("#pad-jump").addEventListener("pointerdown", e => { e.preventDefault(); arcJump(); });
  $("#pad-duck").addEventListener("pointerdown", e => { e.preventDefault(); arcDuck(true); });
  $("#pad-duck").addEventListener("pointerup", () => arcDuck(false));
  $("#pad-duck").addEventListener("pointerleave", () => arcDuck(false));

  document.addEventListener("keydown", e => {
    if (!arc.running) return;
    if (e.key === "ArrowUp" || e.key === " ") { e.preventDefault(); arcJump(); }
    if (e.key === "ArrowDown") { e.preventDefault(); arcDuck(true); }
  });
  document.addEventListener("keyup", e => {
    if (e.key === "ArrowDown") arcDuck(false);
  });

  function gameOver() {
    arc.running = false;
    sfxHit();
    if (arc.score > bestScore) {
      bestScore = arc.score;
      localStorage.setItem("tortoro-best", bestScore);
      $("#arc-best").textContent = bestScore;
    }
    overlay.innerHTML = `
      <h4>Great Run, Tortoro! 🐾</h4>
      <p>Hearts & Fish Score: <strong>${arc.score}</strong> · Best: <strong>${bestScore}</strong></p>
      <button class="btn-romantic" id="arc-retry-btn">Play Again ↻</button>
    `;
    overlay.classList.remove("hidden");
    $("#arc-retry-btn").addEventListener("click", startArcade);
  }

  function updateArcade() {
    aCtx.clearRect(0, 0, 600, 340);

    // Sky gradient
    const sky = aCtx.createLinearGradient(0, 0, 0, 280);
    sky.addColorStop(0, "#fce4ec");
    sky.addColorStop(1, "#fff5e4");
    aCtx.fillStyle = sky;
    aCtx.fillRect(0, 0, 600, 340);

    // Parallax Mountains (Cagayan de Oro backdrop)
    aCtx.fillStyle = "#edd0dc";
    for (let i = 0; i < 5; i++) {
      const mx = ((i * 180 - arc.bgOffset * 0.3) % 900 + 900) % 900 - 150;
      aCtx.beginPath();
      aCtx.moveTo(mx, 280);
      aCtx.lineTo(mx + 90, 145);
      aCtx.lineTo(mx + 180, 280);
      aCtx.fill();
    }

    // Parallax Palm Trees
    aCtx.font = "44px serif";
    for (let i = 0; i < 4; i++) {
      const px = ((i * 210 - arc.bgOffset * 0.7) % 840 + 840) % 840 - 80;
      aCtx.fillText("🌴", px, 276);
    }

    // Ground
    aCtx.fillStyle = "#d992ad";
    aCtx.fillRect(0, 280, 600, 60);
    aCtx.fillStyle = "#c47694";
    aCtx.fillRect(0, 280, 600, 6);

    if (arc.running) {
      arc.frame++;
      arc.bgOffset += arc.speed;
      arc.speed = Math.min(9.5, 4.6 + arc.score * 0.04);
      if (arc.invuln > 0) arc.invuln--;
      if (arc.magnetTimer > 0) arc.magnetTimer--;

      // Cat Physics
      arc.cat.y += arc.cat.vy;
      arc.cat.vy += 0.62;
      if (arc.cat.y >= 275) {
        arc.cat.y = 275;
        arc.cat.vy = 0;
        arc.cat.jumps = 0;
      }

      // Spawn Obstacles (Crabs on ground or Tropical Birds in air)
      if (arc.frame % Math.max(58, Math.floor(110 - arc.speed * 5)) === 0) {
        const isBird = Math.random() > 0.62 && arc.score > 4;
        arc.obstacles.push({
          x: 630,
          y: isBird ? 222 : 262,
          type: isBird ? "bird" : (Math.random() > 0.5 ? "crab" : "coconut")
        });
      }

      // Spawn Collectibles (Hearts, Golden Fish, Love Magnet)
      if (arc.frame % 48 === 0) {
        const roll = Math.random();
        const type = roll > 0.9 ? "magnet" : (roll > 0.72 ? "fish" : "heart");
        arc.collectibles.push({
          x: 630,
          y: 175 + Math.random() * 85,
          type
        });
      }

      // Update & Draw Collectibles
      arc.collectibles = arc.collectibles.filter(item => {
        if (arc.magnetTimer > 0 && item.type !== "magnet") {
          item.x += (arc.cat.x - item.x) * 0.12;
          item.y += (arc.cat.y - 20 - item.y) * 0.12;
        } else {
          item.x -= arc.speed;
        }

        aCtx.font = "24px serif";
        const icon = item.type === "heart" ? "💖" : (item.type === "fish" ? "🐟" : "🧲");
        aCtx.fillText(icon, item.x, item.y);

        if (Math.hypot(item.x - arc.cat.x, item.y - (arc.cat.y - 20)) < 34) {
          sfxHeart();
          if (item.type === "magnet") {
            arc.magnetTimer = 320;
          } else {
            arc.score += item.type === "fish" ? 3 : 1;
            $("#arc-score").textContent = arc.score;
          }
          return false;
        }
        return item.x > -40;
      });

      // Update & Draw Obstacles
      arc.obstacles = arc.obstacles.filter(obs => {
        obs.x -= arc.speed * (obs.type === "bird" ? 1.18 : 1);
        aCtx.font = "28px serif";
        const icon = obs.type === "bird" ? "🦜" : (obs.type === "crab" ? "🦀" : "🥥");
        aCtx.fillText(icon, obs.x, obs.y + 12);

        const catHitY = arc.cat.ducking ? arc.cat.y - 10 : arc.cat.y - 22;
        if (arc.invuln === 0 && Math.abs(obs.x - arc.cat.x) < 26 && Math.abs(obs.y - catHitY) < 24) {
          arc.lives--;
          arc.invuln = 75;
          sfxHit();
          if (arc.lives <= 0) gameOver();
        }
        return obs.x > -40;
      });
    }

    // Draw Tortoro Runner
    if (arc.invuln % 8 < 5) {
      const catState = arc.cat.ducking ? "duck" : (arc.running ? "run" : "idle");
      drawTortoro(aCtx, arc.cat.x, arc.cat.y, 1.05, catState, arc.frame, 1);
    }

    // Magnet aura
    if (arc.magnetTimer > 0) {
      aCtx.strokeStyle = "rgba(214, 104, 146, 0.55)";
      aCtx.lineWidth = 3;
      aCtx.beginPath();
      aCtx.arc(arc.cat.x, arc.cat.y - 18, 36 + Math.sin(arc.frame * 0.2) * 4, 0, Math.PI * 2);
      aCtx.stroke();
    }

    // HUD Lives (Hearts top-left)
    aCtx.font = "18px serif";
    for (let i = 0; i < 3; i++) {
      aCtx.fillText(i < arc.lives ? "❤️" : "🤍", 16 + i * 24, 30);
    }
    if (arc.magnetTimer > 0) {
      aCtx.fillStyle = "#a6466b";
      aCtx.font = "bold 12px sans-serif";
      aCtx.fillText("🧲 MAGNET ACTIVE!", 105, 28);
    }

    requestAnimationFrame(updateArcade);
  }
  updateArcade();

  // --- QUIZ ---
  const questions = [
    { q: "Where did our story begin?", a: ["Instagram", "OmeTV", "A movie app", "At the gym"], c: 1, why: "OmeTV — one random night, a white T-shirt and two seconds of your face." },
    { q: "What did I use to illuminate my face?", a: ["My phone flashlight", "A lamp", "My white T-shirt", "A candle"], c: 2, why: "My white T-shirt! The most iconic flashlight ever." },
    { q: "Which movie did I recommend?", a: ["The Hangover", "Titanic", "Interstellar", "The Notebook"], c: 0, why: "The Hangover — and you watched it!" },
    { q: "Who sent the first Instagram message?", a: ["Stefanino", "Chrizza", "Both at once", "Nobody"], c: 1, why: "You sent me that first Reel after two days." },
    { q: "When did we officially become a couple?", a: ["18 November 2025", "18 December 2025", "18 January 2026", "14 February 2026"], c: 1, why: "18 December 2025 — right after a Reel. AHAHAHA." }
  ];
  let qi = 0, answered = false, qScore = 0;
  function renderQuiz() {
    const q = questions[qi];
    $("#quiz-progress").textContent = `${qi + 1} / ${questions.length}`;
    $("#quiz-question").textContent = q.q;
    $("#quiz-feedback").textContent = "";
    $("#quiz-next").classList.add("hidden");
    answered = false;
    $("#quiz-options").innerHTML = q.a.map((v, i) => `<button class="quiz-option" data-ans="${i}">${v}</button>`).join("");
  }
  $("#quiz-options").addEventListener("click", e => {
    const b = e.target.closest("[data-ans]");
    if (!b || answered) return;
    answered = true;
    const q = questions[qi], ans = Number(b.dataset.ans);
    if (ans === q.c) {
      qScore++;
      b.classList.add("correct");
      sfxHeart();
      $("#quiz-feedback").textContent = "Spot on! ♡ " + q.why;
    } else {
      b.classList.add("wrong");
      $("#quiz-options").querySelectorAll("button")[q.c].classList.add("correct");
      sfxHit();
      $("#quiz-feedback").textContent = q.why;
    }
    $("#quiz-next").textContent = qi === questions.length - 1 ? "See Final Score ♡" : "Next Question →";
    $("#quiz-next").classList.remove("hidden");
  });
  $("#quiz-next").addEventListener("click", () => {
    if (qi < questions.length - 1) { qi++; renderQuiz(); }
    else {
      $("#quiz-question").textContent = `You scored ${qScore} / ${questions.length}!`;
      $("#quiz-options").innerHTML = "";
      $("#quiz-feedback").textContent = qScore === 5 ? "Perfection! You know every detail of us ♡" : "Every memory with you is my favourite!";
      $("#quiz-next").textContent = "Play Quiz Again";
      $("#quiz-next").onclick = () => { qi = 0; qScore = 0; $("#quiz-next").onclick = null; renderQuiz(); };
    }
  });
  renderQuiz();

  // Active nav highlight
  const sections = [...document.querySelectorAll("main section[id]")];
  const obs = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) {
      document.querySelectorAll(".nav-link").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }
  }), { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(s => obs.observe(s));
})();
