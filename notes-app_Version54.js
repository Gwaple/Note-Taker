// --- User DB (localStorage, for demo) ---
function saveUser(username, password) {
  localStorage.setItem('notesapp-user-'+username, JSON.stringify({ password }));
}
function getUser(username) {
  try {
    return JSON.parse(localStorage.getItem('notesapp-user-'+username));
  } catch(e) { return null; }
}

// --- Auth Logic ---
let currentUser = '';
function login() {
  let u = document.getElementById('loginUser').value.trim();
  let p = document.getElementById('loginPass').value;
  let user = getUser(u);
  if (!u || !p) { setMsg('loginMsg', "Enter username & password."); return; }
  if (!user) { setMsg('loginMsg', "User not found."); return; }
  if (user.password !== p) { setMsg('loginMsg', "Wrong password."); return; }
  // Success:
  currentUser = u;
  document.getElementById('authArea').style.display = "none";
  document.getElementById('notesApp').style.display = "";
  document.getElementById('welcome').textContent = "Hello, " + u + "!";
  showNotes();
}
function register() {
  let u = document.getElementById('regUser').value.trim();
  let p = document.getElementById('regPass').value;
  if (!u || !p) { setMsg('registerMsg', "Enter username & password."); return; }
  if (getUser(u)) { setMsg('registerMsg', "User already exists."); return; }
  saveUser(u, p);
  setMsg('registerMsg', "Registered! You can sign in now.", true);
}
function showLogin() {
  document.getElementById('loginBox').style.display = "";
  document.getElementById('registerBox').style.display = "none";
  setMsg('loginMsg',"");setMsg('registerMsg',"");
}
function showRegister() {
  document.getElementById('loginBox').style.display = "none";
  document.getElementById('registerBox').style.display = "";
  setMsg('loginMsg',"");setMsg('registerMsg',"");
}
function logout() {
  currentUser = '';
  document.getElementById('authArea').style.display = "";
  document.getElementById('notesApp').style.display = "none";
}
function setMsg(id, msg, ok) {
  let el = document.getElementById(id);
  el.textContent = msg;
  el.style.color = ok ? "#388e3c" : "#b22222";
}

// --- Note Data ---
function getNotes() {
  try {
    return JSON.parse(localStorage.getItem('notesapp-notes-'+currentUser)) || [];
  } catch(e) { return []; }
}
function saveNotes(notes) {
  localStorage.setItem('notesapp-notes-'+currentUser, JSON.stringify(notes));
}
function showNotes() {
  let notes = getNotes();
  let notesList = document.getElementById('notesList');
  notesList.innerHTML = "";
  if (!notes.length) notesList.innerHTML = `<div style="color:#adb5bd;font-size:1.1em;padding:18px;">No notes yet.</div>`;
  notes.forEach((n, i) => {
    let div = document.createElement('div');
    div.className = "note";
    div.style.background = n.color || "#ffe066";
    div.innerHTML = `<div class="note-actions">
      <button class="edit-btn" title="Edit" onclick="editNote(${i})">✎</button>
      <button class="del-btn" title="Delete" onclick="deleteNote(${i})">🗑</button>
    </div>
    <div>${n.text.replace(/\n/g,"<br>")}</div>`;
    notesList.appendChild(div);
  });
}

// --- Note Form ---
let chosenColor = "#ffe066";
function showNoteForm(editIdx) {
  document.getElementById('noteFormWrap').style.display = "";
  document.getElementById('formTitle').textContent = (typeof editIdx === "number") ? "Edit Note" : "Add Note";
  document.getElementById('noteText').value = "";
  document.getElementById('noteId').value = "";
  chosenColor = "#ffe066";
  highlightColorBtn();
  if (typeof editIdx === "number") {
    let n = getNotes()[editIdx];
    document.getElementById('noteText').value = n.text;
    document.getElementById('noteId').value = editIdx;
    chosenColor = n.color;
    highlightColorBtn();
  }
}
function hideNoteForm() {
  document.getElementById('noteFormWrap').style.display = "none";
}
function pickColor(color) {
  chosenColor = color;
  highlightColorBtn();
}
function highlightColorBtn() {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.style.backgroundColor.replace(/ /g,'') === chosenColor);
  });
}
function saveNote() {
  let text = document.getElementById('noteText').value.trim();
  let notes = getNotes();
  let id = document.getElementById('noteId').value;
  if (!text) return;
  if (id !== "") {
    notes[parseInt(id)] = { text, color: chosenColor };
  } else {
    notes.unshift({ text, color: chosenColor });
  }
  saveNotes(notes);
  hideNoteForm();
  showNotes();
}
function editNote(idx) {
  showNoteForm(idx);
}
function deleteNote(idx) {
  if (!confirm("Delete this note?")) return;
  let notes = getNotes();
  notes.splice(idx, 1);
  saveNotes(notes);
  showNotes();
}
window.showNoteForm = showNoteForm; // so inline onclick works

// --- BG Animation (colorful floating blobs) ---
const bg = document.getElementById('bgAnim'), ctx = bg.getContext('2d');
let blobs = [];
function resizeAnimBg() { bg.width = window.innerWidth; bg.height = window.innerHeight; }
function makeBlobs() {
  blobs = [];
  const palette = [
    "#ffe066", "#b8f2e6", "#fcbaff", "#caffbf", "#ffd6a5", "#d0cfff"
  ];
  for (let i=0;i<12;++i) {
    blobs.push({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: 60+Math.random()*120,
      color: palette[Math.floor(Math.random()*palette.length)],
      dx: (Math.random()*2-1)*0.4, dy: (Math.random()*2-1)*0.32,
      t: Math.random()*Math.PI*2
    });
  }
}
function drawBlobs() {
  ctx.clearRect(0,0,bg.width,bg.height);
  blobs.forEach(b => {
    ctx.save();
    ctx.globalAlpha = 0.19+0.13*Math.sin(Date.now()/850+b.t);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2*Math.PI);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.restore();
    b.x += b.dx; b.y += b.dy;
    b.t += 0.005;
    if (b.x < -b.r) b.x = bg.width+b.r;
    if (b.x > bg.width+b.r) b.x = -b.r;
    if (b.y < -b.r) b.y = bg.height+b.r;
    if (b.y > bg.height+b.r) b.y = -b.r;
  });
  requestAnimationFrame(drawBlobs);
}
window.addEventListener('resize', ()=>{resizeAnimBg(); makeBlobs();});
resizeAnimBg(); makeBlobs(); drawBlobs();

// --- INIT ---
showLogin();