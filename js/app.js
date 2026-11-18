(() => {
const $ = s => document.querySelector(s);
const gate = $("#gate"), site = $("#site");

function enter(){
  if($("#secret-code").value.trim().toUpperCase()==="PATATINA"){
    gate.classList.add("hidden");
    site.classList.remove("hidden");
    sessionStorage.setItem("cw-entered","yes");
    window.scrollTo(0,0);
  } else {
    $("#gate-error").textContent="Not quite, my love. Try again ♡";
  }
}

$("#enter-btn").addEventListener("click",enter);
$("#secret-code").addEventListener("keydown",e=>{if(e.key==="Enter")enter();});
if(sessionStorage.getItem("cw-entered")==="yes"){gate.classList.add("hidden");site.classList.remove("hidden");}

$("#menu-toggle").addEventListener("click",()=>$("#main-nav").classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>$("#main-nav").classList.remove("open")));
$("#music-toggle").addEventListener("click",()=>{alert("Music will be added when you choose the song. ♡");});

const start = new Date(2025,11,18), now = new Date();
$("#days-together").textContent = Math.max(0,Math.floor((now-start)/86400000)).toLocaleString();

const monthNotes=[
  ["2nd","I CHOOSE U, always."],
  ["3rd","You became my favourite part of the day."],
  ["4th & 5th","We found our way back to each other."],
  ["6th","You are my safe place."],
  ["7th","The celestial kiss of the Moon and Venus."],
  ["8th","You became my comfort and my home."],
  ["9th","You became my benzina."],
  ["10th","Learning to choose each other, even when it's difficult."],
  ["11th","A new chapter, still being written."]
];

$("#monthsary-list").innerHTML=monthNotes.map(([m,n])=>`<article class="month-card"><strong>${m} month${m.includes("&")?"s":""}</strong><span>Our little milestone</span><p>${n}</p></article>`).join("");

const letters=window.CHRIZZA_LETTERS||[];
$("#letter-list").innerHTML=letters.map((l,i)=>`<button class="envelope" data-letter="${i}"><span class="envelope-icon">✉</span><strong>${l.month}</strong><span>${l.date} · Open letter ↗</span></button>`).join("");

$("#letter-list").addEventListener("click",e=>{
  const b=e.target.closest("[data-letter]");
  if(!b)return;
  const l=letters[Number(b.dataset.letter)];
  $("#modal-title").textContent=l.month;
  $("#modal-letter-body").textContent=l.text;
  $("#letter-modal").classList.remove("hidden");
});

function closeModal(){$("#letter-modal").classList.add("hidden");}
$("#close-letter").addEventListener("click",closeModal);
$("#letter-modal").addEventListener("click",e=>{if(e.target.dataset.close)closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

// Quiz setup
const questions=[
  {q:"Where did our story begin?",a:["Instagram","OmeTV","A movie app","At the gym"],c:1,why:"OmeTV — one random night, a white T-shirt and two seconds of your face."},
  {q:"What did I use to illuminate my face?",a:["My phone flashlight","A lamp","My white T-shirt","A candle"],c:2,why:"My white T-shirt! The most unusual flashlight ever."},
  {q:"Which movie did I recommend?",a:["The Hangover","Titanic","Interstellar","The Notebook"],c:0,why:"The Hangover — and you actually watched it. That made me feel listened to."},
  {q:"Who sent the first Instagram message?",a:["Stefanino","Chrizza","Both at the same time","Nobody remembers"],c:1,why:"You did! You sent me a Reel after I hadn't written for two days."},
  {q:"When did we officially become a couple?",a:["18 November 2025","18 December 2025","18 January 2026","14 February 2026"],c:1,why:"18 December 2025 — after two weeks of talking, and after a Reel. AHAHAHA."}
];

let qi=0,answered=false,score=0;
function renderQuiz(){
  const q=questions[qi];
  $("#quiz-progress").textContent=`QUESTION ${qi+1} / ${questions.length}`;
  $("#quiz-question").textContent=q.q;
  $("#quiz-feedback").textContent="";
  $("#quiz-next").classList.add("hidden");
  answered=false;
  $("#quiz-options").innerHTML=q.a.map((v,i)=>`<button class="quiz-option" data-answer="${i}">${v}</button>`).join("");
}

$("#quiz-options").addEventListener("click",e=>{
  const b=e.target.closest("[data-answer]");
  if(!b||answered)return;
  answered=true;
  const q=questions[qi],a=Number(b.dataset.answer);
  if(a===q.c){
    score++;
    b.classList.add("correct");
    $("#quiz-feedback").textContent="That's right! ♡ "+q.why;
  }else{
    b.classList.add("wrong");
    $("#quiz-options").querySelectorAll("button")[q.c].classList.add("correct");
    $("#quiz-feedback").textContent=q.why;
  }
  $("#quiz-next").textContent=qi===questions.length-1?"See my result ♡":"Next question →";
  $("#quiz-next").classList.remove("hidden");
});

$("#quiz-next").addEventListener("click",()=>{
  if(qi<questions.length-1){qi++;renderQuiz();}
  else{
    $("#quiz-progress").textContent="OUR LITTLE QUIZ";
    $("#quiz-question").textContent=`You got ${score} out of ${questions.length}!`;
    $("#quiz-options").innerHTML="";
    $("#quiz-feedback").textContent=score===5?"Perfect score, my love. You know our little story!":"Every answer is another memory to keep. Let's play again!";
    $("#quiz-next").textContent="Play again";
    $("#quiz-next").classList.remove("hidden");
    $("#quiz-next").onclick=()=>{qi=0;score=0;$("#quiz-next").onclick=null;renderQuiz();};
  }
});
renderQuiz();

// GAME 1: COZY TAMAGOTCHI / CARE IN BUGO
let hunger=80, happiness=90;
function updateCozyStats(){
  $("#hunger-val").textContent = hunger;
  $("#happy-val").textContent = happiness;
  $("#hunger-bar").style.width = hunger + "%";
  $("#happy-bar").style.width = happiness + "%";
}

$("#feed-btn").addEventListener("click",()=>{
  hunger = Math.min(100, hunger + 15);
  happiness = Math.min(100, happiness + 5);
  updateCozyStats();
  $("#cozy-status").textContent = "Nom nom! Tortoro enjoyed his delicious snack in Bugo! 🍖😺";
});

$("#pet-btn").addEventListener("click",()=>{
  happiness = Math.min(100, happiness + 15);
  updateCozyStats();
  $("#cozy-status").textContent = "Purrr... Tortoro is so happy and is making sweet purring noises! 🥰💖";
});

$("#sleep-btn").addEventListener("click",()=>{
  hunger = Math.max(10, hunger - 10);
  happiness = Math.min(100, happiness + 10);
  updateCozyStats();
  $("#cozy-status").textContent = "Zzz... Tortoro is taking a peaceful tropical nap in Cagayan de Oro 💤🌴";
});
updateCozyStats();

// GAME 2: TORTORO ARCADE RUNNER
const canvas=$("#game-canvas"),ctx=canvas.getContext("2d");
let player={x:55,y:190,vy:0},hearts=[],clouds=[],points=0,frame=0,keys={};

function resetGame(){
  player={x:55,y:190,vy:0};
  hearts=[];
  clouds=[];
  points=0;
  frame=0;
  $("#score").textContent=0;
  $("#game-hint").textContent="Collect the floating hearts. Avoid the little obstacles!";
  drawGame();
}

function jump(){if(player.y>=188)player.vy=-10;}
function move(dir){player.x=Math.max(15,Math.min(600,player.x+dir*22));}

$("#left-btn").addEventListener("click",()=>move(-1));
$("#right-btn").addEventListener("click",()=>move(1));
$("#jump-btn").addEventListener("click",jump);
$("#restart-game").addEventListener("click",resetGame);

document.addEventListener("keydown",e=>{
  if(["ArrowLeft","ArrowRight","ArrowUp"," "].includes(e.key)&&!site.classList.contains("hidden")){
    keys[e.key]=true;
    if(e.key==="ArrowUp"||e.key===" ")jump();
  }
});
document.addEventListener("keyup",e=>keys[e.key]=false);

function drawGame(){
  ctx.clearRect(0,0,640,260);
  ctx.fillStyle="#faedf1";
  ctx.fillRect(0,0,640,260);

  // Background tropical hills / clouds
  ctx.fillStyle="#f0dce5";
  for(let i=0;i<8;i++){
    ctx.beginPath();
    ctx.arc(i*95+20,220,35,Math.PI,0);
    ctx.fill();
  }

  // Ground floor
  ctx.fillStyle="#d8a4b7";
  ctx.fillRect(0,226,640,34);

  // Decorations
  ctx.fillStyle="#fff";
  ctx.font="22px serif";
  ctx.fillText("🌴",18,40);
  ctx.fillText("✨",580,55);

  // Cat & items
  ctx.font="26px serif";
  ctx.fillText("🐈",player.x,player.y+10);
  ctx.font="21px serif";
  hearts.forEach(h=>ctx.fillText("♥",h.x,h.y));
  
  clouds.forEach(c=>{
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(c.x,c.y,12,0,Math.PI*2);
    ctx.arc(c.x+12,c.y-5,15,0,Math.PI*2);
    ctx.arc(c.x+27,c.y,11,0,Math.PI*2);
    ctx.fill();
  });
}

function tick(){
  if(site.classList.contains("hidden")){requestAnimationFrame(tick);return;}
  frame++;
  if(keys.ArrowLeft)move(-1);
  if(keys.ArrowRight)move(1);
  player.y+=player.vy;
  player.vy+=.55;
  if(player.y>190){player.y=190;player.vy=0;}
  
  if(frame%75===0)hearts.push({x:650,y:130+Math.random()*65});
  if(frame%135===0)clouds.push({x:650,y:190});
  
  hearts.forEach(h=>h.x-=2.5);
  clouds.forEach(c=>c.x-=2.8);
  
  hearts=hearts.filter(h=>{
    if(Math.abs(h.x-player.x)<28&&Math.abs(h.y-player.y)<30){
      points++;
      $("#score").textContent=points;
      $("#game-hint").textContent=points%5===0?"Tortoro is doing amazing! Keep going!":"A heart for Chrizza! ♡";
      return false;
    }
    return h.x>-30;
  });
  
  clouds=clouds.filter(c=>c.x>-50);
  drawGame();
  requestAnimationFrame(tick);
}

resetGame();
tick();

// Active navigation marker
const sections=[...document.querySelectorAll("main section[id]")];
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){
    document.querySelectorAll(".nav-link").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id));
  }
}),{rootMargin:"-35% 0px -55% 0px"});
sections.forEach(s=>observer.observe(s));
})();
