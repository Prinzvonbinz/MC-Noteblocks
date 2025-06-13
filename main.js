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
  currentId = id;
  songName.value = song.name;
  noteInput.value = song.note || "";
  tempImage = song.image || null;
  imageInput.value = "";
  showEditor(true);
}

// Editor zeigen/verstecken
function showEditor(show) {
  main.classList.toggle("hidden", show);
  editor.classList.toggle("hidden", !show);
}

// Neuer Song
addBtn.onclick = () => {
  currentId = null;
  songName.value = "";
  noteInput.value = "";
  imageInput.value = "";
  tempImage = null;
  showEditor(true);
};

// Bild speichern
imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    tempImage = reader.result;
  };
  reader.readAsDataURL(file);
};

// Speichern
saveBtn.onclick = () => {
  const name = songName.value.trim();
  if (!name) return alert("Bitte gib einen Titel ein.");
  const note = noteInput.value.trim();
  const image = tempImage;

  if (currentId) {
    const song = songs.find(s => s.id === currentId);
    if (song) {
      song.name = name;
      song.note = note;
      song.image = image;
    }
  } else {
    const newSong = {
      id: "id_" + Date.now(),
      name,
      note,
      image
    };
    songs.push(newSong);
  }

  localStorage.setItem("songs", JSON.stringify(songs));
  renderSongs();
  showEditor(false);
};

// Löschen
deleteBtn.onclick = () => {
  if (!currentId) return alert("Kein Song zum Löschen ausgewählt.");
  if (!confirm("Diesen Song wirklich löschen?")) return;

  songs = songs.filter(s => s.id !== currentId);
  localStorage.setItem("songs", JSON.stringify(songs));
  renderSongs();
  showEditor(false);
};

// Zurück
backBtn.onclick = () => {
  showEditor(false);
};

renderSongs();
