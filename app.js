/* Members ordered by role priority. Gallery has moving thumbnail row + clickable preview. */

const ROLE_ORDER = [
  "leader",
  "sub_leader",
  "mp",
  "up_chairman",
  "vice_chairman",
  "chairman",
  "member",
];

const ROLE_LABEL = {
  leader: "Leader",
  sub_leader: "Sub Leader",
  mp: "MP",
  up_chairman: "Up Chairman",
  vice_chairman: "Vice Chairman",
  chairman: "Chairman",
  member: "Member",
};

/* ✅ Members (root photos: rony.jpg, sakib.jpg, nahid.jpg, meraz.jpg etc) */
const MEMBERS = [
  { role: "leader", name: "Rony", photo: "rony.jpg" },
  { role: "sub_leader", name: "Sakib", photo: "sakib.jpg" },
  { role: "up_chairman", name: "Nahid", photo: "nahid.jpg" },

  // ✅ Chairman added
  { role: "chairman", name: "Meraz K", photo: "meraz.jpg" },

  // add more (uncomment):
  // { role: "mp", name: "MP 1", photo: "mp1.jpg" },
  // { role: "vice_chairman", name: "Vice Chairman 1", photo: "vice1.jpg" },
  // { role: "member", name: "Member 1", photo: "member1.jpg" },
];

/* ✅ Gallery (root photos: g1.jpg ... g9.jpg) */
const GALLERY_PHOTOS = [
  "g1.jpg","g2.jpg","g3.jpg","g4.jpg","g5.jpg","g6.jpg","g7.jpg","g8.jpg","g9.jpg",
];

function $(id){ return document.getElementById(id); }

function escapeHtml(s){
  return String(s || "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function roleRank(role){
  const i = ROLE_ORDER.indexOf(role);
  return i === -1 ? 999 : i;
}

function sortMembers(list){
  return [...list].sort((a,b) => {
    const ra = roleRank(a.role);
    const rb = roleRank(b.role);
    if (ra !== rb) return ra - rb;
    return (a.name || "").localeCompare(b.name || "");
  });
}

function matchesMember(m, q){
  if (!q) return true;
  const hay = `${m.name} ${ROLE_LABEL[m.role] || m.role}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

/* Render Members */
function renderMembers(){
  const grid = $("membersGrid");
  const q = $("search").value.trim();
  const filtered = MEMBERS.filter(m => matchesMember(m, q));
  const ordered = sortMembers(filtered);

  grid.innerHTML = "";

  for (const m of ordered){
    const card = document.createElement("div");
    card.className = "member-card";

    const photoHTML = m.photo
      ? `<img src="${m.photo}" alt="${escapeHtml(m.name)}" />`
      : `<div class="muted" style="height:100%;display:grid;place-items:center;">No photo</div>`;

    card.innerHTML = `
      <div class="member-photo">${photoHTML}</div>
      <div class="member-body">
        <h5 class="member-name">${escapeHtml(m.name)}</h5>
        <p class="member-role">${ROLE_LABEL[m.role] || m.role}</p>
      </div>
    `;
    grid.appendChild(card);
  }

  if (grid.children.length === 0){
    grid.innerHTML = `<div class="muted">No members</div>`;
  }
}

/* ---------------- Gallery slideshow + thumbs ---------------- */
let slideIndex = 0;
let autoPlay = true;
let autoTimer = null;

function normalizeSlideIndex(){
  if (GALLERY_PHOTOS.length === 0) slideIndex = 0;
  else slideIndex = ((slideIndex % GALLERY_PHOTOS.length) + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
}

function renderGallery(){
  const img = $("slideImg");
  const empty = $("slideEmpty");
  const counter = $("slideCounter");
  const nameEl = $("slideName");

  if (GALLERY_PHOTOS.length === 0){
    img.src = "";
    img.style.display = "none";
    empty.classList.remove("hidden");
    counter.textContent = "0 / 0";
    nameEl.textContent = "";
    stopAuto();
    return;
  }

  normalizeSlideIndex();
  img.style.display = "block";
  empty.classList.add("hidden");

  const file = GALLERY_PHOTOS[slideIndex];
  img.src = file;
  counter.textContent = `${slideIndex + 1} / ${GALLERY_PHOTOS.length}`;
  nameEl.textContent = file;

  // active thumb highlight
  setActiveThumb(file);
}

function nextSlide(){ slideIndex += 1; renderGallery(); }
function prevSlide(){ slideIndex -= 1; renderGallery(); }

function startAuto(){
  autoPlay = true;
  $("togglePlayBtn").textContent = "Auto: On";
  stopAuto();
  autoTimer = setInterval(nextSlide, 2500);
}
function stopAuto(){
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}
function toggleAuto(){
  autoPlay = !autoPlay;
  if (!autoPlay){
    $("togglePlayBtn").textContent = "Auto: Off";
    stopAuto();
  } else {
    startAuto();
  }
}

/* ✅ Thumbnails row: duplicate list for smooth marquee */
function buildThumbRow(){
  const track = $("thumbTrack");
  track.innerHTML = "";

  const files = [...GALLERY_PHOTOS];
  const doubled = [...files, ...files]; // for marquee -50%

  for (const file of doubled){
    const t = document.createElement("div");
    t.className = "thumb";
    t.setAttribute("data-file", file);
    t.innerHTML = `<img src="${file}" alt="${escapeHtml(file)}">`;
    track.appendChild(t);
  }

  // click: set preview to clicked file
  track.addEventListener("click", (e) => {
    const thumb = e.target.closest(".thumb");
    if (!thumb) return;
    const file = thumb.getAttribute("data-file");
    const idx = GALLERY_PHOTOS.indexOf(file);
    if (idx !== -1){
      slideIndex = idx;
      renderGallery();
    }
  });
}

function setActiveThumb(file){
  const track = $("thumbTrack");
  if (!track) return;
  track.querySelectorAll(".thumb").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-file") === file);
  });
}

/* ---------------- Title glow ---------------- */
function initTitleGlow(){
  const titleEl = document.querySelector(".party-title");
  if (!titleEl) return;

  titleEl.addEventListener("mouseenter", () => {
    titleEl.style.setProperty("--ha", "1"); // hover soft glow ON
    titleEl.style.setProperty("--ga", "1"); // spotlight ON
  });

  titleEl.addEventListener("mousemove", (e) => {
    const r = titleEl.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    titleEl.style.setProperty("--gx", `${x}%`);
    titleEl.style.setProperty("--gy", `${y}%`);
    titleEl.style.setProperty("--ga", "1");
  });

  titleEl.addEventListener("mouseleave", () => {
    titleEl.style.setProperty("--ha", "0");
    titleEl.style.setProperty("--ga", "0");
  });
}

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();

  initTitleGlow();
  renderMembers();

  buildThumbRow();
  renderGallery();
  startAuto();

  $("search").addEventListener("input", renderMembers);
  $("prevSlideBtn").addEventListener("click", prevSlide);
  $("nextSlideBtn").addEventListener("click", nextSlide);
  $("togglePlayBtn").addEventListener("click", toggleAuto);
});
