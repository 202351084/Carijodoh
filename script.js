// script.js — Tinder-style offline w/ 100 users, sounds, swipe, localStorage likes

// -------------------- util: generate random data --------------------
const maleNames = [
  "Ardi","Bagas","Bayu","Bima","Deni","Doni","Eko","Fajar","Fauzi","Gilang",
  "Hendra","Imam","Jaka","Kevin","Lucky","Miftah","Nando","Oscar","Putra","Rian",
  "Rifqi","Rizky","Rio","Ryan","Sakti","Sandy","Satria","Teguh","Toni","Wawan",
  "Yusuf","Zaki","Adi","Agus","Ahmad","Alan","Andi","Bayu","Cahyo","Dimas",
  "Evan","Fikri","Galih","Hadi","Ilham","Joko","Kurnia","Luthfi","Mika","Nanda"
];
const femaleNames = [
  "Alya","Anisa","Annisa","Bella","Cindy","Citra","Dewi","Dinda","Fitri","Gita",
  "Hana","Indah","Intan","Lia","Lina","Maya","Melati","Mira","Nadia","Nina",
  "Nita","Putri","Raisa","Rani","Rina","Sari","Sinta","Siti","Tika","Tina",
  "Uni","Vina","Wulan","Yuni","Yulia","Zahra","Ayu","Anita","Bella","Carla",
  "Dhea","Eka","Fara","Ghea","Hesti","Ika","Jihan","Kirana","Lulu","Mella"
];

const cities = ["Jakarta","Bandung","Surabaya","Yogyakarta","Bali","Semarang","Malang","Medan"];
const jobs = ["Mahasiswa","Karyawan","Wirausaha","Freelancer","Guru","Dokter","Insinyur","Designer"];
const s1Univs = [
  { uni: "Universitas Indonesia", short: "UI" },
  { uni: "Universitas Gadjah Mada", short: "UGM" },
  { uni: "Institut Teknologi Bandung", short: "ITB" },
  { uni: "Universitas Airlangga", short: "Unair" },
  { uni: "Universitas Brawijaya", short: "UB" },
  { uni: "Universitas Diponegoro", short: "Undip" }
];
const majors = ["Teknik Informatika","Akuntansi","Psikologi","Agronomi","Agroteknologi","Manajemen","Hukum","Desain Komunikasi Visual"];

// helper random
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

// compute DOB string from age
function randomDOB(age) {
  const today = new Date();
  const year = today.getFullYear() - age;
  const month = rndInt(1,12);
  const day = rndInt(1,28);
  const dob = new Date(year, month-1, day);
  return dob.toISOString().split('T')[0]; // YYYY-MM-DD
}
// build education object (sma / d3 / s1 / s2). If s2 then include s1
function buildEducation(level) {
  if (level === "SMA") {
    return { level: "SMA/SMK", school: `SMA Negeri ${rndInt(1,50)}` };
  }
  if (level === "D3") {
    const major = rnd(majors);
    const uni = rnd(s1Univs);
    return { level: "D3", program: `${major}`, university: uni.uni };
  }
  if (level === "S1") {
    const major = rnd(majors);
    const uni = rnd(s1Univs);
    return { level: "S1", program: major, university: uni.uni };
  }
  // S2
  const masterMajor = rnd(majors);
  const masterUni = rnd(s1Univs);
  const bachelorMajor = rnd(majors);
  const bachelorUni = rnd(s1Univs);
  return {
    level: "S2",
    master: { program: masterMajor, university: masterUni.uni },
    bachelor: { program: bachelorMajor, university: bachelorUni.uni }
  };
}

// -------------------- generate 100 profiles with matched gender images --------------------
const profiles = [];
// We'll create approx 50 male and 50 female using name arrays; ensure images match gender
for (let i=0;i<100;i++){
  const isMale = i % 2 === 0; // alternate to keep balance (can be randomized if wanted)
  const name = isMale ? rnd(maleNames) : rnd(femaleNames);
  const age = rndInt(18,40);
  const gender = isMale ? "male" : "female";
  const job = rnd(jobs);
  // education level randomly weighted
  const eduLevel = (Math.random()<0.05) ? "S2" : (Math.random()<0.45 ? "S1" : (Math.random()<0.7 ? "SMA" : "D3"));
  const education = buildEducation(eduLevel);
  const city = rnd(cities);
  // image id: use randomuser's men/women endpoints 0-99
  const imgId = i % 100; // deterministic but unique-ish
  const img = `https://randomuser.me/api/portraits/${gender === "male" ? "men" : "women"}/${imgId}.jpg`;
  const dob = randomDOB(age);

  profiles.push({
    id: i+1,
    name,
    age,
    dob,
    gender,
    job,
    education,
    city,
    img,
    bio: `Halo! Aku ${name}, umur ${age}. Suka ${rnd(["musik","travel","kuliner","film","olahraga","membaca"])}.`
  });
}



// -------------------- localStorage likes --------------------
const LIKES_KEY = "jodohku_likes_v1";
function loadLikes() {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}
function saveLikes(arr) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(arr));
}
let likes = loadLikes(); // array of profile ids

// -------------------- UI elements --------------------
const profileArea = document.getElementById("profile-area");
const searchBtn = document.getElementById("searchBtn");
const filterGender = document.getElementById("gender");
const filterAge = document.getElementById("age");
const filterJob = document.getElementById("job");
const filterEducation = document.getElementById("education");
const filterLocation = document.getElementById("location");

// create floating liked list button
const likeListBtn = document.createElement("button");
likeListBtn.id = "likedListBtn";
likeListBtn.title = "Lihat yang kamu suka";
Object.assign(likeListBtn.style, {
  position: "fixed",
  right: "16px",
  bottom: "90px",
  zIndex: 9999,
  background: "#ff6fa5",
  color: "#fff",
  border: "none",
  padding: "12px 14px",
  borderRadius: "28px",
  boxShadow: "0 6px 18px rgba(255,105,180,0.25)",
  cursor: "pointer",
  fontWeight: "700"
});
document.body.appendChild(likeListBtn);
updateLikeListBtn();

likeListBtn.addEventListener("click", () => openLikeListModal());

// -------------------- create detail modal container --------------------
const detailModal = document.createElement("div");
detailModal.id = "profileDetailModal";
Object.assign(detailModal.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000, // pastikan tinggi agar di atas semua elemen
  overflowY: "auto"
});

detailModal.innerHTML = `
  <div id="modalInner" style="width:95%;max-width:420px;background:#fff;border-radius:16px;overflow:hidden;position:relative;">
    <div style="position:relative;">
      <img id="modalImg" src="" alt="foto" style="width:100%;height:220px;object-fit:cover;">
      <button id="modalClose" style="position:absolute;right:12px;top:12px;background:rgba(255,255,255,0.9);border:none;padding:8px;border-radius:8px;cursor:pointer;z-index:10001;">✕</button>
    </div>
    <div style="padding:14px;">
      <h3 id="modalName" style="color:#ff4d79;margin:0 0 6px 0"></h3>
      <p id="modalBio" style="margin:0 0 8px 0;color:#444"></p>
      <div id="modalDetails" style="font-size:0.9rem;color:#555;line-height:1.4"></div>
      <div style="margin-top:12px;display:flex;gap:10px;">
        <a href="chat.html" style="flex:1;text-decoration:none;">
          <button id="modalLike" style="flex:1;background:#ff6fa5;color:#fff;border:none;padding:10px;border-radius:10px;cursor:pointer;" class="message-btn">Kirim Salam 💌</button>
        </a>
        <button id="modalClose2" style="flex:1;background:#eee;border:none;padding:10px;border-radius:10px;cursor:pointer;">Tutup</button>
      </div>
    </div>
  </div>
`;
document.body.appendChild(detailModal);

document.getElementById("modalClose").onclick = () => detailModal.style.display = "none";
document.getElementById("modalClose2").onclick = () => detailModal.style.display = "none";

// when click "Kirim Salam" in modal -> like + save
document.getElementById("modalLike").addEventListener("click", () => {
  const pid = detailModal.dataset.profileId;
  if (pid) {
    doLike(parseInt(pid,10));
    closeModal();
  }
});



function openModalWithProfile(p) {
  detailModal.style.display = "flex";
  detailModal.dataset.profileId = p.id;
  document.getElementById("modalImg").src = p.img;
  document.getElementById("modalName").textContent = `${p.name}, ${p.age}`;
  document.getElementById("modalBio").textContent = p.bio;

  // build education details text
  let eduHtml = `<strong>Lokasi:</strong> ${p.city}<br>`;
  eduHtml += `<strong>Pekerjaan:</strong> ${p.job}<br>`;
  eduHtml += `<strong>Tanggal Lahir:</strong> ${p.dob} (umur ${p.age})<br>`;
  if (p.education.level === "SMA/SMK") {
    eduHtml += `<strong>Pendidikan:</strong> ${p.education.level} — ${p.education.school}`;
  } else if (p.education.level === "D3" || p.education.level === "S1") {
    eduHtml += `<strong>Pendidikan:</strong> ${p.education.level} — ${p.education.program}, ${p.education.university}`;
  } else if (p.education.level === "S2") {
    eduHtml += `<strong>Pendidikan:</strong> S2 ${p.education.master.program}, ${p.education.master.university}<br>`;
    eduHtml += `S1 ${p.education.bachelor.program}, ${p.education.bachelor.university}`;
  }
  document.getElementById("modalDetails").innerHTML = eduHtml;
}
function closeModal(){ detailModal.style.display = "none"; delete detailModal.dataset.profileId; }

// -------------------- sound via Web Audio API --------------------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playLikeSound(){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, audioCtx.currentTime);
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
  setTimeout(()=>{ o.stop(); }, 350);
}

function playDislikeSound(){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(200, audioCtx.currentTime);
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.18);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);
  setTimeout(()=>{ o.stop(); }, 500);
}

// -------------------- render cards (stack) --------------------
let workingProfiles = [...profiles]; // copy, used for filtering
function renderStack() {
  profileArea.innerHTML = "";
  // render from last -> first so first is topmost with highest z-index
  for (let i = workingProfiles.length - 1; i >= 0; i--) {
    const p = workingProfiles[i];
    const card = document.createElement("div");
    card.className = "profile-card";
    card.dataset.id = p.id;
    card.dataset.index = i;
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" draggable="false"/>
      <div class="info">
        <h3>${p.name}, ${p.age}</h3>
        <p>📍 ${p.city} • 💼 ${p.job}</p>
        <p style="font-size:0.85rem;color:#666;margin-top:6px">${p.education.level === "S2" ? `S2 ${p.education.master.program} (${p.education.master.university})` : (p.education.level==="S1" ? `S1 ${p.education.program} (${p.education.university})` : p.education.level==="D3" ? `D3 ${p.education.program} (${p.education.university})` : p.education.school)}</p>
      </div>
    `;
    // click to open detail modal
    card.addEventListener("click", (ev) => {
      // avoid opening modal when swipe dragging
      if (card.classList.contains('dragging')) return;
      openModalWithProfile(p);
    });
    profileArea.appendChild(card);
  }
  attachSwipeHandlers();
  updateLikeListBtn();
}
renderStack();

// -------------------- swipe handlers --------------------
function attachSwipeHandlers(){
  const cards = document.querySelectorAll(".profile-card");
  cards.forEach(card => {
    let startX = 0, currentX = 0, translateX = 0, isDown=false;
    const threshold = 100;

    const topZ = parseInt(card.style.zIndex || 0,10);

    const onStart = (e) => {
      isDown = true;
      card.classList.remove("swipe-left","swipe-right");
      card.style.transition = "none";
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      card.classList.add('dragging');
    };
    const onMove = (e) => {
      if (!isDown) return;
      currentX = e.touches ? e.touches[0].clientX : e.clientX;
      translateX = currentX - startX;
      const rotate = translateX * 0.05;
      card.style.transform = `translateX(${translateX}px) rotate(${rotate}deg)`;
      // visual feedback: lighten opacity when far
      const opacity = 1 - Math.min(Math.abs(translateX)/600, 0.6);
      card.style.opacity = opacity;
    };
    const onEnd = (e) => {
      if (!isDown) return;
      isDown=false;
      card.classList.remove('dragging');
      card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      if (translateX > threshold) {
        // like
        card.style.transform = `translateX(120%) rotate(25deg)`;
        card.style.opacity = 0;
        const pid = parseInt(card.dataset.id,10);
        setTimeout(() => {
          removeProfileFromStack(pid, true);
        }, 300);
      } else if (translateX < -threshold) {
        // dislike
        card.style.transform = `translateX(-120%) rotate(-25deg)`;
        card.style.opacity = 0;
        const pid = parseInt(card.dataset.id,10);
        setTimeout(() => {
          removeProfileFromStack(pid, false);
        }, 300);
      } else {
        // reset
        card.style.transform = "";
        card.style.opacity = 1;
      }
      translateX = 0;
    };

    // mouse events for desktop
    card.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);

    // touch events for mobile
    card.addEventListener("touchstart", onStart, {passive:true});
    card.addEventListener("touchmove", onMove, {passive:true});
    card.addEventListener("touchend", onEnd);
  });
}

// remove profile after swipe; liked = true => save to likes
function removeProfileFromStack(pid, liked) {
  // find and remove from workingProfiles (by id)
  const idx = workingProfiles.findIndex(p => p.id === pid);
  if (idx === -1) return;
  const profile = workingProfiles[idx];
  // sound + save
  if (liked) {
    playLikeSound();
    doLike(pid);
  } else {
    playDislikeSound();
  }
  // remove and re-render
  workingProfiles.splice(idx,1);
  renderStack();
  // if empty show message
  if (workingProfiles.length === 0) {
    profileArea.innerHTML = `<div style="padding:20px;text-align:center;color:#666">✨ Kamu sudah melihat semua profil yang tersedia.</div>`;
  }
}

// like function (adds to localStorage set)
function doLike(pid) {
  if (!likes.includes(pid)) {
    likes.push(pid);
    saveLikes(likes);
    updateLikeListBtn();
  }
}

// -------------------- filter / search --------------------
searchBtn.addEventListener("click", () => {
  const g = filterGender.value;
  const ageRange = filterAge.value;
  const job = filterJob.value;
  const edu = filterEducation.value;
  const loc = filterLocation.value;

  // filter based on original profiles dataset (not currently shrunken workingProfiles)
  workingProfiles = profiles.filter(p => {
    let ok = true;
    if (g && g !== "" && p.gender !== g) ok = false;
    if (job && job !== "" && p.job.toLowerCase() !== job.toLowerCase()) ok = false;
    if (loc && loc !== "" && p.city.toLowerCase() !== loc.toLowerCase()) ok = false;
    if (edu && edu !== "") {
      // match by level name substring
      if (edu === "SMA" && p.education.level !== "SMA/SMK") ok = false;
      if (edu === "D3" && p.education.level !== "D3") ok = false;
      if (edu === "S1" && p.education.level !== "S1") ok = false;
      if (edu === "S2" && p.education.level !== "S2") ok = false;
    }
    if (ageRange && ageRange !== "") {
      if (ageRange === "46+") {
        if (p.age < 46) ok = false;
      } else {
        const [min,max] = ageRange.split("-").map(Number);
        if (p.age < min || p.age > max) ok = false;
      }
    }
    return ok;
  });

  // re-render stack
  renderStack();
});

// -------------------- Like list modal --------------------
const likeModal = document.createElement("div");
likeModal.id = "likeModal";
Object.assign(likeModal.style, {
  position: "fixed",
  inset: "0",
  background: "rgba(0,0,0,0.5)",
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9000  // <-- turunkan agar berada di belakang detail modal
});
likeModal.innerHTML = `
  <div style="width:95%;max-width:520px;background:#fff;border-radius:12px;overflow:hidden;">
    <div style="padding:12px;display:flex;justify-content:space-between;align-items:center;background:#fff;">
      <strong>Profil yang kamu suka ❤️</strong>
      <button id="likeModalClose" style="border:none;background:#ff6fa5;color:#fff;padding:8px 10px;border-radius:8px;cursor:pointer">Tutup</button>
    </div>
    <div id="likeListContent" style="max-height:60vh;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:#fff"></div>
  </div>
`;
document.body.appendChild(likeModal);

document.getElementById("likeModalClose").addEventListener("click", ()=>{ 
  likeModal.style.display = "none"; 
});

function openLikeListModal(){
  likeModal.style.display = "flex";
  const container = document.getElementById("likeListContent");
  container.innerHTML = "";
  if (likes.length === 0) {
    container.innerHTML = `<div style="padding:20px;color:#666;text-align:center">Belum ada profil yang kamu suka 💔</div>`;
    return;
  }

  // show liked profiles (lookup in profiles by id)
  likes.forEach(id => {
    const p = profiles.find(x => x.id === id);
    if (!p) return;
    const node = document.createElement("div");
    node.style.display = "flex";
    node.style.gap = "10px";
    node.style.alignItems = "center";
    node.style.padding = "8px";
    node.style.borderRadius = "10px";
    node.style.background = "#fff0f6";
    node.innerHTML = `
      <img src="${p.img}" alt="${p.name}" style="width:56px;height:56px;border-radius:8px;object-fit:cover">
      <div style="flex:1">
        <div style="font-weight:700;color:#ff4d79">${p.name}, ${p.age}</div>
        <div style="font-size:0.9rem;color:#555">${p.job} • ${p.city}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="openDetailBtn" data-id="${p.id}" style="background:#fff;border:1px solid #ff6fa5;padding:6px 8px;border-radius:8px;cursor:pointer">Detail</button>
        <button class="removeLikeBtn" data-id="${p.id}" style="background:#ff6fa5;color:#fff;border:none;padding:6px 8px;border-radius:8px;cursor:pointer">Hapus</button>
      </div>
    `;
    container.appendChild(node);
  });

  // attach events
  document.querySelectorAll(".removeLikeBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id,10);
      likes = likes.filter(x => x !== id);
      saveLikes(likes);
      openLikeListModal(); // refresh
      updateLikeListBtn();
    });
  });
  document.querySelectorAll(".openDetailBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id,10);
      const p = profiles.find(x => x.id === id);
      if (p) {
        openModalWithProfile(p); // modal detail akan muncul di atas like modal
      }
    });
  });
}

function updateLikeListBtn(){
  likeListBtn.textContent = `❤️ ${likes.length}`;
}

// -------------------- keyboard support & buttons --------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") swipeTopCard(false);
  if (e.key === "ArrowRight") swipeTopCard(true);
});

function swipeTopCard(like) {
  const top = document.querySelector(".profile-card:last-child");
  if (!top) return;
  if (like) {
    top.classList.add("swipe-right");
    setTimeout(()=> removeProfileFromStack(parseInt(top.dataset.id,10), true), 300);
  } else {
    top.classList.add("swipe-left");
    setTimeout(()=> removeProfileFromStack(parseInt(top.dataset.id,10), false), 300);
  }
}

// menu
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
  if(menu.style.display === 'flex') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column'; // pastikan dropdown kolom
  }
});







// expose for debug
window._jodohku = { profiles, workingProfiles, likes };

// -------------------- end --------------------