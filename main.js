let songs = JSON.parse(localStorage.getItem("mcnotes_songs") || "{}");
let currentSong = null;
let currentLayer = 0;
let offsetX = 0;
let offsetY = 0;

function saveSongs() {
  localStorage.setItem("mcnotes_songs", JSON.stringify(songs));
}

function createSong() {
  const title = document.getElementById("songTitleInput").value.trim();
  if (!title || songs[title]) return alert("Ungültig oder bereits vorhanden!");
  songs[title] = { locked: false, layers: [{}, {}] };
  saveSongs();
  loadSongList();
  document.getElementById("songTitleInput").value = "";
}

function loadSongList() {
  const ul = document.getElementById("songList");
  ul.innerHTML = "";
  Object.keys(songs).forEach(title => {
    const li = document.createElement("li");
    li.textContent = title;
    li.addEventListener("click", () => openSong(title));
    li.addEventListener("touchstart", e => {
      li.dataset.touchstart = Date.now();
    });
    li.addEventListener("touchend", e => {
      const duration = Date.now() - li.dataset.touchstart;
      if (duration > 800) {
        if (confirm(`"${title}" wirklich löschen?`)) {
          delete songs[title];
          saveSongs();
          loadSongList();
        }
      }
    });
    ul.appendChild(li);
  });
}

function showMenu() {
  document.getElementById("editor").style.display = "none";
  document.getElementById("menu").style.display = "block";
  currentSong = null;
  loadSongList();
}

function openSong(title) {
  currentSong = title;
  document.getElementById("songName").textContent = title;
  document.getElementById("lockStatus").textContent = songs[title].locked ? "🔒" : "🔓";
  document.getElementById("layerInfo").textContent = currentLayer;
  document.getElementById("menu").style.display = "none";
  document.getElementById("editor").style.display = "block";
  updateGrid();
}

function toggleLock() {
  if (!currentSong) return;
  songs[currentSong].locked = !songs[currentSong].locked;
  document.getElementById("lockStatus").textContent = songs[currentSong].locked ? "🔒" : "🔓";
  saveSongs();
  updateGrid();
}

function switchLayer() {
  currentLayer = currentLayer === 0 ? 1 : 0;
  document.getElementById("layerInfo").textContent = currentLayer;
  updateGrid();
}

function move(dx, dy) {
  offsetX += dx;
  offsetY += dy;
  updateGrid();
}

function updateGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  const layer = songs[currentSong].layers[currentLayer];
  const locked = songs[currentSong].locked;

  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const key = `${x + offsetX},${y + offsetY}`;

      const select = document.createElement("select");
      const currentValue = layer[key] || "";
      const isLayer0 = currentLayer === 0;
      const options = isLayer0 ? getBlockOptions() : getItemOptions();

      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = "--";
      select.appendChild(emptyOption);

      options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
      });

      select.value = currentValue;

      if (locked) select.disabled = true;

      select.addEventListener("change", e => {
        layer[key] = e.target.value;
        saveSongs();
      });

      cell.appendChild(select);
      grid.appendChild(cell);
    }
  }
}

function getBlockOptions() {
  return [
    "BDIRT",     // Harfe
    "BSTONE",    // Bass
    "BSAND",     // Snare
    "BGLASS",    // Klick
    "BOBSIDIAN", // Bassdrum
    "BWOOD",     // Gitarre
    "BGOLD",     // Glockenspiel
    "BCLAY",     // Flöte
    "BPACKED",   // Xylophon
    "BIRON",     // Vibraphon
    "BEMERALD",  // Kuhglocke
    "BBONE",     // Didgeridoo
    "BWOOL",     // Banjo
    "BPISTON"    // Bit
  ];
}

function getItemOptions() {
  const items = [];
  for (let i = 1; i <= 24; i++) items.push("N" + i);
  items.push("R");
  const dirs = ["↑", "↓", "←", "→"];
  for (let i = 1; i <= 4; i++) {
    dirs.forEach(d => items.push(`V${i}${d}`));
  }
  items.push("K");
  return items;
}

loadSongList();
