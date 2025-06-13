let currentSong = '';
let gridOffset = { x: 0, y: 0 };
let currentLayer = 'top'; // 'top' or 'bottom'
let locked = false;

const grid = document.getElementById('grid');
const titleInput = document.getElementById('titleInput');
const editor = document.getElementById('editor');
const menu = document.getElementById('menu');
const songList = document.getElementById('songList');
const layerInfo = document.getElementById('layerInfo');
const lockButton = document.getElementById('lockButton');

const noteOptions = Array.from({ length: 24 }, (_, i) => `N${i + 1}`);
const ampOptions = ['→', '←', '↑', '↓'].flatMap(d =>
  Array.from({ length: 4 }, (_, i) => `V${i + 1}${d}`)
);
const redstoneOptions = ['R'];
const buttonOptions = ['K'];
const blockOptions = [
  'BNoteblock', 'BGlass', 'BStone', 'BWood', 'BSand', 'BGold', 'BIron', 'BClay'
];

const allOptions = [...noteOptions, ...ampOptions, ...redstoneOptions, ...buttonOptions, ...blockOptions];

function createCell(x, y) {
  const cell = document.createElement('div');
  cell.className = 'cell';

  const select = document.createElement('select');
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '-';
  select.appendChild(empty);

  allOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });

  const key = `${x},${y},${currentLayer}`;
  const data = JSON.parse(localStorage.getItem('mcnotes_' + currentSong)) || {};
  if (data[key]) select.value = data[key];

  select.disabled = locked;

  select.addEventListener('change', () => {
    const val = select.value;
    const songData = JSON.parse(localStorage.getItem('mcnotes_' + currentSong)) || {};
    if (val === '') {
      delete songData[key];
    } else {
      songData[key] = val;
    }
    localStorage.setItem('mcnotes_' + currentSong, JSON.stringify(songData));
  });

  cell.appendChild(select);
  return cell;
}

function renderGrid() {
  grid.innerHTML = '';
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const x = gridOffset.x + dx;
      const y = gridOffset.y + dy;
      grid.appendChild(createCell(x, y));
    }
  }
  layerInfo.textContent = currentLayer === 'top' ? 'Ebene: Oben' : 'Ebene: Unten';
  lockButton.textContent = locked ? 'Entsperren' : 'Sperren';
}

function saveSong() {
  const name = titleInput.value.trim();
  if (!name) return alert('Bitte einen Titel eingeben!');
  currentSong = name;
  localStorage.setItem('mcnotes_list', JSON.stringify([...getSongList().filter(n => n !== name), name]));
  if (!localStorage.getItem('mcnotes_' + name)) {
    localStorage.setItem('mcnotes_' + name, JSON.stringify({}));
  }
  showEditor();
}

function getSongList() {
  return JSON.parse(localStorage.getItem('mcnotes_list')) || [];
}

function loadSongs() {
  songList.innerHTML = '';
  const names = getSongList();
  names.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    li.addEventListener('click', () => {
      currentSong = name;
      showEditor();
    });

    // Langes Drücken zum Löschen
    let pressTimer;
    li.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => confirmDelete(name), 700);
    });
    li.addEventListener('mouseup', () => clearTimeout(pressTimer));
    li.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    li.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => confirmDelete(name), 700);
    });
    li.addEventListener('touchend', () => clearTimeout(pressTimer));

    songList.appendChild(li);
  });
}

function confirmDelete(name) {
  if (confirm(`Möchtest du den Song "${name}" wirklich löschen?`)) {
    localStorage.removeItem('mcnotes_' + name);
    const list = getSongList().filter(n => n !== name);
    localStorage.setItem('mcnotes_list', JSON.stringify(list));
    loadSongs();
  }
}

function showEditor() {
  menu.style.display = 'none';
  editor.style.display = 'block';
  gridOffset = { x: 0, y: 0 };
  currentLayer = 'top';
  locked = false;
  renderGrid();
}

function showMenu() {
  menu.style.display = 'block';
  editor.style.display = 'none';
  titleInput.value = '';
  loadSongs();
}

document.getElementById('saveBtn').addEventListener('click', saveSong);
document.getElementById('backBtn').addEventListener('click', showMenu);

document.getElementById('upBtn').addEventListener('click', () => {
  gridOffset.y -= 1;
  renderGrid();
});
document.getElementById('downBtn').addEventListener('click', () => {
  gridOffset.y += 1;
  renderGrid();
});
document.getElementById('leftBtn').addEventListener('click', () => {
  gridOffset.x -= 1;
  renderGrid();
});
document.getElementById('rightBtn').addEventListener('click', () => {
  gridOffset.x += 1;
  renderGrid();
});

document.getElementById('switchLayerBtn').addEventListener('click', () => {
  currentLayer = currentLayer === 'top' ? 'bottom' : 'top';
  renderGrid();
});

lockButton.addEventListener('click', () => {
  locked = !locked;
  renderGrid();
});

loadSongs();
