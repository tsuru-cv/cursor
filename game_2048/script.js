const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 4;
let board, score;

function init() {
  board = Array.from({ length: size }, () => Array(size).fill(0));
  score = 0;
  addRandomTile();
  addRandomTile();
  draw();
  updateScore();
}

function addRandomTile() {
  const empty = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === 0) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return;
  const { x, y } = empty[Math.floor(Math.random() * empty.length)];
  board[y][x] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  let arr = row.filter(v => v);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(v => v);
  while (arr.length < size) arr.push(0);
  return arr;
}

function rotateLeft(mat) {
  return mat[0].map((_, i) => mat.map(row => row[size - 1 - i]));
}
function rotateRight(mat) {
  return mat[0].map((_, i) => mat.map(row => row[i]).reverse());
}

function move(dir) {
  let old = board.map(row => row.slice());
  if (dir === 'left') {
    board = board.map(slide);
  } else if (dir === 'right') {
    board = board.map(row => slide(row.reverse()).reverse());
  } else if (dir === 'up') {
    board = rotateLeft(board);
    board = board.map(slide);
    board = rotateRight(board);
  } else if (dir === 'down') {
    board = rotateLeft(board);
    board = board.map(row => slide(row.reverse()).reverse());
    board = rotateRight(board);
  }
  if (JSON.stringify(old) !== JSON.stringify(board)) {
    addRandomTile();
    draw();
    updateScore();
    if (isGameOver()) setTimeout(() => alert('ゲームオーバー！'), 100);
  }
}

function isGameOver() {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === 0) return false;
      if (x < size - 1 && board[y][x] === board[y][x + 1]) return false;
      if (y < size - 1 && board[y][x] === board[y + 1][x]) return false;
    }
  }
  return true;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      drawTile(x, y, board[y][x]);
    }
  }
}

function drawTile(x, y, value) {
  const colors = {
    0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
    16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
    256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
  };
  ctx.fillStyle = colors[value] || '#3c3a32';
  ctx.fillRect(x * 100 + 8, y * 100 + 8, 84, 84);
  if (value) {
    ctx.font = value < 100 ? 'bold 44px sans-serif' : 'bold 36px sans-serif';
    ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x * 100 + 50, y * 100 + 50);
  }
}

function updateScore() {
  document.getElementById('score-value').textContent = score;
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move('left');
  if (e.key === 'ArrowRight') move('right');
  if (e.key === 'ArrowUp') move('up');
  if (e.key === 'ArrowDown') move('down');
});

document.getElementById('restart').onclick = init;

init(); 