const app = document.getElementById('app');
const mainMenu = document.getElementById('main-menu');
const songEditor = document.getElementById('song-editor');

const newSongBtn = document.getElementById('new-song-btn');
const backToMenuBtn = document.getElementById('back-to-menu');
const songListEl = document.getElementById('song-list');
const songTitleInput = document.getElementById('song-title');
const toggleLockBtn = document.getElementById('toggle-lock-btn');
const layerLowerBtn = document.getElementById('layer-lower');
const layerUpperBtn = document.getElementById('layer-upper');
const charInput = document.getElementById('char-input');
const extraInputsDiv = document.getElementById('extra-inputs');
const placeBtn = document.getElementById('place-btn');
const grid = document.getElementById('grid');
const saveSongBtn = document.getElementById('save-song-btn');

let songs = [];
let currentSong = null;
let currentLayer = 'lower'; // 'lower' = Blöcke, 'upper' = Items
let locked = false;

const GRID_SIZE = 20; // 20x20 Zellen
let gridData = {
  lower: Array(GRID_SIZE*GRID_SIZE).fill(null), // für Blöcke
  upper: Array(GRID_SIZE*GRID_SIZE).fill(null), // für Items
};

// --- Hilfsfunktionen ---
function saveSongsToStorage() {
  localStorage.setItem('mcnotes_songs', JSON.stringify(songs));
}

function loadSongsFromStorage() {
  const saved = localStorage.getItem('mcnotes_songs');
  if (saved) {
    songs = JSON.parse(saved);
  } else {
    songs = [];
  }
}

function renderSongList() {
  songListEl.innerHTML = '';
  if (songs.length === 0) {
    songListEl.innerHTML = '<li>Keine Songs vorhanden.</li>';
    return;
  }
  songs.forEach((song, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = song.title;
    li.appendChild(span);

    // Lang drücken für Löschen (mobil und PC)
    let pressTimer = null;
    li.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        if (confirm(`Song "${song.title}" wirklich löschen?`)) {
          songs.splice(i,1);
          saveSongsToStorage();
          renderSongList();
        }
      }, 800);
    });
    li.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => {
        if (confirm(`Song "${song.title}" wirklich löschen?`)) {
          songs.splice(i,1);
          saveSongsToStorage();
          renderSongList();
        }
      }, 800);
    });
    li.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });
    li.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });
    li.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });

    // Klick auf Song lädt diesen
    li.addEventListener('click', () => {
      if (pressTimer) return; // nicht bei lang gedrückt
      loadSong(i);
    });

    songListEl.appendChild(li);
  });
}

function loadSong(index) {
  currentSong = JSON.parse(JSON.stringify(songs[index])); // klonen
  gridData.lower = currentSong.grid.lower.slice();
  gridData.upper = currentSong.grid.upper.slice();
  songTitleInput.value = currentSong.title;
  locked = currentSong.locked || false;
  updateLockButton();
  currentLayer = 'lower';
  setLayerButtons();
  renderGrid();
  showScreen('song-editor');
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function updateLockButton() {
  toggleLockBtn.textContent = locked ? 'Entsperren' : 'Sperren';
  if (locked) {
    placeBtn.disabled = true;
    charInput.disabled = true;
    extraInputsDiv.innerHTML = '';
  } else {
    placeBtn.disabled = false;
    charInput.disabled = false;
    updateExtraInputs();
  }
}

function setLayerButtons() {
  if (currentLayer === 'lower') {
    layerLowerBtn.classList.add('active');
    layerUpperBtn.classList.remove('active');
  } else {
    layerLowerBtn.classList.remove('active');
    layerUpperBtn.classList.add('active');
  }
}

function updateExtraInputs() {
  // Je nach charInput zeigt man Zusatzfelder
  extraInputsDiv.innerHTML = '';
  const c = charInput.value.toUpperCase();
  if (c === 'N') {
    // Zahl 1-24
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = 24;
    input.placeholder = '1-24';
    input.id = 'extra-number';
    extraInputsDiv.appendChild(input);
  } else if (c === 'V') {
    // Zahl 1-4 + Richtung
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = 4;
    input.placeholder = '1-4';
    input.id = 'extra-number';
    extraInputsDiv.appendChild(input);

    const select = document.createElement('select');
    select.id = 'extra-direction';
    ['↑','→','↓','←'].forEach(dir => {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      select.appendChild(option);
    });
    extraInputsDiv.appendChild(select);
  } else if (c === 'B') {
    // Blockname als Text
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Blockname';
    input.id = 'extra-block';
    extraInputsDiv.appendChild(input);
  }
}

function renderGrid() {
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 40px)`;
  grid.style.gridTemplateRows = `repeat(${GRID_SIZE}, 40px)`;

  for (let i=0; i<GRID_SIZE*GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    const val = gridData[currentLayer][i];
    if (val) {
      if (typeof val === 'object') {
        if (currentLayer === 'upper') {
          // Item
          if (val.char === 'N') cell.textContent = `N${val.number}`;
          else if (val.char === 'R') cell.textContent = 'R';
          else if (val.char === 'V') cell.textContent = `V${val.number}${val.direction}`;
          else if (val.char === 'B') cell.textContent = `B:${val.block}`;
          else if (val.char === 'K') cell.textContent = 'K';
        } else {
          // lower layer = Blöcke: hier nur blockname speichern (B)
          if (val.char === 'B') cell.textContent = val.block;
          else cell.textContent = val.char;
        }
      } else {
        cell.textContent = val;
      }
    }

    if (locked) {
      cell.classList.add('locked');
    } else {
      cell.classList.remove('locked');
    }

    // Klick auf Zelle: platzieren wenn nicht gesperrt
    if (!locked) {
      cell.addEventListener('click', () => {
        placeAtCell(i);
      });
    }

    grid.appendChild(cell);
  }
}

function placeAtCell(index) {
  const c = charInput.value.toUpperCase();
  if (!['N','R','V','B','K'].includes(c)) {
    alert('Ungültiger Buchstabe! Erlaubt sind N,R,V,B,K.');
    return;
  }
  // Wert je nach Buchstabe holen
  let val = { char: c };

  if (c === 'N') {
    const num = parseInt(document.getElementById('extra-number')?.value);
    if (!num || num < 1 || num > 24) {
      alert('Bitte gültige Zahl 1-24 bei Notenblock angeben.');
      return;
    }
    val.number = num;
  } else if (c === 'V') {
    const num = parseInt(document.getElementById('extra-number')?.value);
    const dir = document.getElementById('extra-direction')?.value;
    if (!num || num < 1 || num > 4) {
      alert('Bitte gültige Zahl 1-4 beim Verstärker angeben.');
      return;
    }
    if (!dir) {
      alert('Bitte Richtung beim Verstärker angeben.');
      return;
    }
    val.number = num;
    val.direction = dir;
  } else if (c === 'B') {
    const blockName = document.getElementById('extra-block')?.value.trim();
    if (!blockName) {
      alert('Bitte Blockname beim Block angeben.');
      return;
    }
    val.block = blockName;
  }

  // Platzieren im Grid-Daten-Array
  gridData[currentLayer][index] = val;
  renderGrid();
}

function clearGridData() {
  gridData.lower = Array(GRID_SIZE*GRID_SIZE).fill(null);
  gridData.upper = Array(GRID_SIZE*GRID_SIZE).fill(null);
}

function saveCurrentSong() {
  if (!currentSong) {
    alert('Kein Song geladen.');
    return;
  }
  const title = songTitleInput.value.trim();
  if (!title) {
    alert('Songtitel darf nicht leer sein.');
    return;
  }
  currentSong.title = title;
  currentSong.grid = {
    lower: gridData.lower,
    upper: gridData.upper
  };
  currentSong.locked = locked;

  // Song in songs-Array updaten oder neu rein
  const idx = songs.findIndex(s => s.id === currentSong.id);
  if (idx >= 0) {
    songs[idx] = JSON.parse(JSON.stringify(currentSong));
  } else {
    currentSong.id = Date.now();
    songs.push(JSON.parse(JSON.stringify(currentSong)));
  }
  saveSongsToStorage();
  alert('Song gespeichert!');
  renderSongList();
  showScreen('main-menu');
}

// --- Event Listeners ---
newSongBtn.addEventListener('click', () => {
  currentSong = {
    id: Date.now(),
    title: '',
    grid: {
      lower: Array(GRID_SIZE*GRID_SIZE).fill(null),
      upper: Array(GRID_SIZE*GRID_SIZE).fill(null)
    },
    locked: false
  };
  gridData = {
    lower: currentSong.grid.lower.slice(),
    upper: currentSong.grid.upper.slice()
  };
  songTitleInput.value = '';
  locked = false;
  updateLockButton();
  currentLayer = 'lower';
  setLayerButtons();
  renderGrid();
  showScreen('song-editor');
});

backToMenuBtn.addEventListener('click', () => {
  showScreen('main-menu');
});

toggleLockBtn.addEventListener('click', () => {
  locked = !locked;
  updateLockButton();
  renderGrid();
});

layerLowerBtn.addEventListener('click', () => {
  currentLayer = 'lower';
  setLayerButtons();
  renderGrid();
});

layerUpperBtn.addEventListener('click', () => {
  currentLayer = 'upper';
  setLayerButtons();
  renderGrid();
});

charInput.addEventListener('input', () => {
  charInput.value = charInput.value.toUpperCase();
  updateExtraInputs();
});

placeBtn.addEventListener('click', () => {
  alert('Bitte auf eine Zelle klicken, um zu platzieren.');
});

saveSongBtn.addEventListener('click', () => {
  saveCurrentSong();
});

// Grid click handled in renderGrid

// --- Init ---
loadSongsFromStorage();
renderSongList();
showScreen('main-menu');
