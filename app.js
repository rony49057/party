/* One grid: members are ordered by role priority, so cards sit side-by-side. */

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

/* ✅ Members (photos in root: rony.jpg, sakib.jpg, nahid.jpg) */
const MEMBERS = [
  { role: "leader", name: "Rony", photo: "rony.jpg" },
  { role: "sub_leader", name: "Sakib", photo: "sakib.jpg" },
  { role: "up_chairman", name: "Nahid", photo: "nahid.jpg" },

  // add more (uncomment):
  // { role: "mp", name: "MP 1", photo: "mp1.jpg" },
  // { role: "vice_chairman", name: "Vice Chairman 1", photo: "vice1.jpg" },
  // { role: "chairman", name: "Chairman 1", photo: "chairman1.jpg" },
  // { role: "member", name: "Member 1", photo: "member1.jpg" },
];

/* ✅ Gallery photos (root: g1.jpg, g2.jpg, g3.jpg ...) */
const GALLERY_PHOTOS = [
  "g1.jpg",
  "g2.jpg",
  "g3.jpg",
  // "g4.jpg",
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
    if (ra !== rb) return ra - rb;                 // role order first
    return (a.name || "").localeCompare(b.name || ""); // then name
  });
}

function matchesMember(m, q){
  if (!q) return true;
  const hay = `${m.name} ${ROLE_LABEL[m.role] || m.role}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

/* ✅ Render into ONE GRID so no empty space per-role */
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

/* Gallery slideshow */
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

  if (GALLERY_PHOTOS.length === 0){
    img.src = "";
    img.style.display = "none";
    empty.classList.remove("hidden");
    counter.textContent = "0 / 0";
    stopAuto();
    return;
  }

  normalizeSlideIndex();
  img.style.display = "block";
  empty.classList.add("hidden");
  img.src = GALLERY_PHOTOS[slideIndex];
  counter.textContent = `${slideIndex + 1} / ${GALLERY_PHOTOS.length}`;
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

/* Title cursor-point glow init */
function initTitleGlow(){
  const titleEl = document.querySelector(".party-title");
  if (!titleEl) return;

  titleEl.addEventListener("mousemove", (e) => {
    const r = titleEl.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    titleEl.style.setProperty("--gx", `${x}%`);
    titleEl.style.setProperty("--gy", `${y}%`);
    titleEl.style.setProperty("--ga", "1");
  });

  titleEl.addEventListener("mouseenter", () => titleEl.style.setProperty("--ga", "1"));
  titleEl.addEventListener("mouseleave", () => titleEl.style.setProperty("--ga", "0"));
}

/* Init */
document.addEventListener("DOMContentLoaded", () => {
  $("year").textContent = new Date().getFullYear();

  initTitleGlow();
  renderMembers();
  renderGallery();
  startAuto();

  $("search").addEventListener("input", renderMembers);
  $("prevSlideBtn").addEventListener("click", prevSlide);
  $("nextSlideBtn").addEventListener("click", nextSlide);
  $("togglePlayBtn").addEventListener("click", toggleAuto);
});
