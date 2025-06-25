const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// プレイヤー情報
const player = {
  x: 100,
  y: 300,
  width: 40,
  height: 40,
  color: '#3498db',
  vx: 0,
  vy: 0,
  speed: 4,
  jumpPower: 12,
  onGround: false
};

const gravity = 0.6;
const groundY = 340;

const keys = {};

// ステージ全体の幅
const stageWidth = 2400;

// カメラの表示範囲
const camera = {
  x: 0,
  width: canvas.width
};

// ゴール情報
const goal = {
  x: stageWidth - 80,
  y: groundY - 60,
  width: 40,
  height: 60
};

let isGoal = false;
let goalEffectFrame = 0;
let isDead = false;
let deadEffectFrame = 0;
let canRestart = false;

// 敵キャラ情報
const enemies = [
  { x: 500, y: groundY - 30, r: 20, vx: 2 },
  { x: 900, y: groundY - 30, r: 20, vx: -2 },
  { x: 1400, y: groundY - 30, r: 20, vx: 1.5 },
  { x: 1800, y: groundY - 30, r: 20, vx: -1.5 }
];

// やられ演出用：パーティクル
let deadParticles = [];

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (isDead && canRestart) {
    resetGame();
    isDead = false;
    deadEffectFrame = 0;
    canRestart = false;
  }
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function update() {
  if (isGoal) return;
  if (isDead) {
    deadEffectFrame++;
    if (deadEffectFrame === 1) {
      // パーティクル生成
      deadParticles = [];
      const cx = player.x + player.width / 2;
      const cy = player.y + player.height / 2;
      for (let i = 0; i < 32; i++) {
        const angle = (Math.PI * 2 * i) / 32;
        const speed = 4 + Math.random() * 2;
        deadParticles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1
        });
      }
    }
    // パーティクル更新
    for (const p of deadParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha *= 0.93;
    }
    if (deadEffectFrame > 45) {
      canRestart = true;
    }
    return;
  }
  // 左右移動
  if (keys['ArrowLeft'] || keys['a']) {
    player.vx = -player.speed;
  } else if (keys['ArrowRight'] || keys['d']) {
    player.vx = player.speed;
  } else {
    player.vx = 0;
  }

  // ジャンプ
  if ((keys[' '] || keys['ArrowUp'] || keys['w']) && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }

  // 重力
  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // 地面との当たり判定
  if (player.y + player.height > groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // ステージ端で止める
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > stageWidth) player.x = stageWidth - player.width;

  // カメラの追従（プレイヤー中心）
  camera.x = player.x + player.width / 2 - camera.width / 2;
  // カメラがステージ端を超えないように
  if (camera.x < 0) camera.x = 0;
  if (camera.x + camera.width > stageWidth) camera.x = stageWidth - camera.width;

  // ゴール判定
  if (
    player.x + player.width > goal.x &&
    player.x < goal.x + goal.width &&
    player.y + player.height > goal.y &&
    player.y < goal.y + goal.height
  ) {
    isGoal = true;
    goalEffectFrame = 0;
  }

  // 敵の移動
  for (const enemy of enemies) {
    enemy.x += enemy.vx;
    // ステージ端で反転
    if (enemy.x < 0 || enemy.x > stageWidth) enemy.vx *= -1;
  }

  // プレイヤーと敵の当たり判定
  for (const enemy of enemies) {
    const dx = (player.x + player.width / 2) - enemy.x;
    const dy = (player.y + player.height / 2) - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.width / 2 + enemy.r) {
      isDead = true;
      deadEffectFrame = 0;
      return;
    }
  }
}

function resetGame() {
  player.x = 100;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;
  isGoal = false;
  goalEffectFrame = 0;
}

function drawBackground() {
  // 空のグラデーション
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#87ceeb'); // 明るい青
  skyGradient.addColorStop(1, '#e0f7fa'); // 薄い水色
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 雲を描画（カメラ位置に応じて）
  drawCloud(150 - camera.x * 0.5, 80, 40);
  drawCloud(400 - camera.x * 0.4, 60, 30);
  drawCloud(650 - camera.x * 0.6, 100, 50);
  drawCloud(1200 - camera.x * 0.5, 70, 35);
  drawCloud(1800 - camera.x * 0.7, 90, 45);
}

function drawCloud(x, y, size) {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.arc(x + size * 0.7, y + size * 0.2, size * 0.8, 0, Math.PI * 2);
  ctx.arc(x - size * 0.7, y + size * 0.2, size * 0.6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.restore();
}

function drawGround() {
  // 地面のグラデーション
  const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
  groundGradient.addColorStop(0, '#43a047');
  groundGradient.addColorStop(1, '#2e7d32');
  ctx.fillStyle = groundGradient;
  // スクロールに合わせて地面を描画
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // 地面の模様（ストライプ）
  for (let i = Math.floor(camera.x / 40) * 40; i < camera.x + camera.width; i += 40) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(i - camera.x, groundY, 20, 10);
  }
}

function drawPlayer() {
  // やられ演出中は小さくなりながら消える
  let scale = 1;
  if (isDead) {
    scale = Math.max(0, 1 - deadEffectFrame / 30);
    if (scale < 0.05) return; // 完全に消えたら描画しない
  }
  // 影
  ctx.save();
  ctx.globalAlpha = 0.3 * scale;
  ctx.beginPath();
  ctx.ellipse(
    player.x + player.width / 2 - camera.x,
    groundY + 8,
    player.width * 0.5 * scale,
    player.height * 0.2 * scale,
    0, 0, Math.PI * 2
  );
  ctx.fillStyle = '#333';
  ctx.fill();
  ctx.restore();

  // 丸キャラ本体（グラデーション）
  const grad = ctx.createRadialGradient(
    player.x + player.width / 2 - camera.x,
    player.y + player.height / 2,
    player.width * 0.2 * scale,
    player.x + player.width / 2 - camera.x,
    player.y + player.height / 2,
    (player.width / 1.1) * scale
  );
  grad.addColorStop(0, '#6ec6ff');
  grad.addColorStop(1, '#1565c0');
  ctx.save();
  ctx.translate(player.x + player.width / 2 - camera.x, player.y + player.height / 2);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.shadowColor = '#1565c0';
  ctx.shadowBlur = 16 * scale;
  ctx.fill();
  ctx.shadowBlur = 0;
  // 顔（目）
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-player.width * 0.15, -player.height * 0.05, 4, 0, Math.PI * 2);
  ctx.arc(player.width * 0.15, -player.height * 0.05, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-player.width * 0.15, -player.height * 0.05, 2, 0, Math.PI * 2);
  ctx.arc(player.width * 0.15, -player.height * 0.05, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoal() {
  // ゴールポール
  ctx.save();
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(goal.x - camera.x + goal.width / 2 - 4, goal.y, 8, goal.height);
  // ゴールフラッグ
  ctx.beginPath();
  ctx.moveTo(goal.x - camera.x + goal.width / 2 + 4, goal.y);
  ctx.lineTo(goal.x - camera.x + goal.width / 2 + 34, goal.y + 12);
  ctx.lineTo(goal.x - camera.x + goal.width / 2 + 4, goal.y + 24);
  ctx.closePath();
  ctx.fillStyle = '#ff5252';
  ctx.fill();
  ctx.restore();
}

function drawGoalEffect() {
  // ゴール時の光る円
  const centerX = player.x + player.width / 2 - camera.x;
  const centerY = player.y + player.height / 2;
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60 + goalEffectFrame * 2 + i * 10, 0, Math.PI * 2);
    ctx.strokeStyle = `hsl(${(goalEffectFrame * 8 + i * 60) % 360}, 80%, 60%)`;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }
  // "ゴール!"の文字
  ctx.save();
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 6;
  ctx.textAlign = 'center';
  ctx.strokeText('ゴール!', canvas.width / 2, canvas.height / 2 - 40);
  ctx.fillText('ゴール!', canvas.width / 2, canvas.height / 2 - 40);
  ctx.restore();
}

function drawDeadEffect() {
  // パーティクル描画
  for (const p of deadParticles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x - camera.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  }
  // "やられた！"の文字（上から落ちてくるアニメーション）
  ctx.save();
  let t = Math.min(1, deadEffectFrame / 18);
  let y = (canvas.height / 2 - 40) * t + (-80) * (1 - t);
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 6;
  ctx.textAlign = 'center';
  ctx.strokeText('やられた！', canvas.width / 2, y);
  ctx.fillText('やられた！', canvas.width / 2, y);
  ctx.restore();
  // リスタート案内
  ctx.save();
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#fff';
  if (canRestart) {
    ctx.fillText('何かキーを押してリスタート', canvas.width / 2, canvas.height / 2 + 20);
  }
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(enemy.x - camera.x, enemy.y, enemy.r, 0, Math.PI * 2);
    ctx.fillStyle = '#e53935';
    ctx.shadowColor = '#b71c1c';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    // 目
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(enemy.x - camera.x - 5, enemy.y - 5, 3, 0, Math.PI * 2);
    ctx.arc(enemy.x - camera.x + 5, enemy.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(enemy.x - camera.x - 5, enemy.y - 5, 1.2, 0, Math.PI * 2);
    ctx.arc(enemy.x - camera.x + 5, enemy.y - 5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function draw() {
  drawBackground();
  drawGround();
  drawGoal();
  drawEnemies();
  drawPlayer();
  if (isGoal) {
    drawGoalEffect();
    goalEffectFrame++;
  }
  if (isDead) {
    drawDeadEffect();
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop(); 