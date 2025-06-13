let songs = JSON.parse(localStorage.getItem("songs") || "[]");
let currentId = null;
let tempImage = null;

const songList = document.getElementById("songList");
const main = document.getElementById("main");
const editor = document.getElementById("editor");

const addBtn = document.getElementById("addBtn");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const backBtn = document.getElementById("backBtn");

const songName = document.getElementById("songName");
const imageInput = document.getElementById("imageInput");
const noteInput = document.getElementById("noteInput");

// Render Songs
function renderSongs() {
  songList.innerHTML = "";
  songs.forEach(song => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${song.name}</strong>
      ${song.image ? `<img src="${song.image}" alt="Bild" />` : ""}
    `;
    card.onclick = () => openEditor(song.id);
    songList.appendChild(card);
  });
}

// Editor öffnen
function openEditor(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;
  currentId = song.id; // <- hier sicherstellen, dass currentId gesetzt wird
  songName.value = song.name;
  noteInput.value = song.note || "";
  tempImage = song.image || null;
  imageInput.value = "";
  showEditor(true);
}

// Löschen
deleteBtn.onclick = () => {
  if (!currentId) {
    alert("Kein Song zum Löschen ausgewählt.");
    return;
  }
  if (!confirm("Diesen Song wirklich löschen?")) return;

  songs = songs.filter(s => s.id !== currentId);
  localStorage.setItem("songs", JSON.stringify(songs));
  renderSongs();
  showEditor(false);
  currentId = null; // reset
};

// Zurück
backBtn.onclick = () => {
  showEditor(false);
};

renderSongs();
