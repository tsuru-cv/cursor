const canvas = document.getElementById('boids-canvas');
const ctx = canvas.getContext('2d');

const BOID_COUNT = 50;
const BOID_SIZE = 4;
const MAX_SPEED = 2;
const MAX_FORCE = 0.03;
const PERCEPTION_RADIUS = 50;

// グラデーション背景を描画する関数
function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#0f2027');
  grad.addColorStop(0.5, '#2c5364');
  grad.addColorStop(1, '#f8ffae');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Boid {
  constructor() {
    this.position = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    };
    const angle = Math.random() * 2 * Math.PI;
    this.velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    };
    this.acceleration = { x: 0, y: 0 };
    // 個性の追加
    this.size = 3 + Math.random() * 5; // 3〜8px
    this.maxSpeed = 1.5 + Math.random() * 2.5; // 1.5〜4.0
    this.maxForce = 0.02 + Math.random() * 0.06; // 0.02〜0.08
    this.perception = 35 + Math.random() * 65; // 35〜100
    this.baseHue = Math.floor(Math.random() * 360);
    // 色をランダムに
    this.color = `hsl(${this.baseHue}, 70%, 60%)`;
  }

  edges() {
    if (this.position.x > canvas.width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.y > canvas.height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = canvas.height;
  }

  align(boids) {
    let steering = { x: 0, y: 0 };
    let total = 0;
    for (let other of boids) {
      const d = Math.hypot(
        this.position.x - other.position.x,
        this.position.y - other.position.y
      );
      if (other !== this && d < this.perception) {
        steering.x += other.velocity.x;
        steering.y += other.velocity.y;
        total++;
      }
    }
    if (total > 0) {
      steering.x /= total;
      steering.y /= total;
      const mag = Math.hypot(steering.x, steering.y);
      if (mag > 0) {
        steering.x = (steering.x / mag) * this.maxSpeed;
        steering.y = (steering.y / mag) * this.maxSpeed;
      }
      steering.x -= this.velocity.x;
      steering.y -= this.velocity.y;
      const steerMag = Math.hypot(steering.x, steering.y);
      if (steerMag > this.maxForce) {
        steering.x = (steering.x / steerMag) * this.maxForce;
        steering.y = (steering.y / steerMag) * this.maxForce;
      }
    }
    return steering;
  }

  cohesion(boids) {
    let steering = { x: 0, y: 0 };
    let total = 0;
    for (let other of boids) {
      const d = Math.hypot(
        this.position.x - other.position.x,
        this.position.y - other.position.y
      );
      if (other !== this && d < this.perception) {
        steering.x += other.position.x;
        steering.y += other.position.y;
        total++;
      }
    }
    if (total > 0) {
      steering.x /= total;
      steering.y /= total;
      steering.x -= this.position.x;
      steering.y -= this.position.y;
      const mag = Math.hypot(steering.x, steering.y);
      if (mag > 0) {
        steering.x = (steering.x / mag) * this.maxSpeed;
        steering.y = (steering.y / mag) * this.maxSpeed;
      }
      steering.x -= this.velocity.x;
      steering.y -= this.velocity.y;
      const steerMag = Math.hypot(steering.x, steering.y);
      if (steerMag > this.maxForce) {
        steering.x = (steering.x / steerMag) * this.maxForce;
        steering.y = (steering.y / steerMag) * this.maxForce;
      }
    }
    return steering;
  }

  separation(boids) {
    let steering = { x: 0, y: 0 };
    let total = 0;
    for (let other of boids) {
      const d = Math.hypot(
        this.position.x - other.position.x,
        this.position.y - other.position.y
      );
      if (other !== this && d < this.perception / 2) {
        steering.x += this.position.x - other.position.x;
        steering.y += this.position.y - other.position.y;
        total++;
      }
    }
    if (total > 0) {
      steering.x /= total;
      steering.y /= total;
      const mag = Math.hypot(steering.x, steering.y);
      if (mag > 0) {
        steering.x = (steering.x / mag) * this.maxSpeed;
        steering.y = (steering.y / mag) * this.maxSpeed;
      }
      steering.x -= this.velocity.x;
      steering.y -= this.velocity.y;
      const steerMag = Math.hypot(steering.x, steering.y);
      if (steerMag > this.maxForce) {
        steering.x = (steering.x / steerMag) * this.maxForce;
        steering.y = (steering.y / steerMag) * this.maxForce;
      }
    }
    return steering;
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > this.maxSpeed) {
      this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
      this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
    }
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  applyForce(force) {
    this.acceleration.x += force.x;
    this.acceleration.y += force.y;
  }

  flock(boids) {
    const alignment = this.align(boids);
    const cohesion = this.cohesion(boids);
    const separation = this.separation(boids);
    // 各重みを調整
    this.applyForce({ x: alignment.x * 1.0, y: alignment.y * 1.0 });
    this.applyForce({ x: cohesion.x * 0.8, y: cohesion.y * 0.8 });
    this.applyForce({ x: separation.x * 1.5, y: separation.y * 1.5 });
  }

  draw() {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
    // 速度で色相を変化させる
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    const hue = (this.baseHue + speed * 60) % 360;
    ctx.beginPath();
    // 滑らかな三角形
    ctx.moveTo(this.size * 2, 0);
    ctx.quadraticCurveTo(-this.size, this.size, -this.size, 0);
    ctx.quadraticCurveTo(-this.size, -this.size, this.size * 2, 0);
    ctx.closePath();
    ctx.globalAlpha = 0.6;
    ctx.shadowColor = `hsl(${hue}, 80%, 80%)`;
    ctx.shadowBlur = 10;
    ctx.fillStyle = `hsl(${hue}, 80%, 70%)`;
    ctx.fill();
    ctx.restore();
  }
}

const boids = [];
for (let i = 0; i < BOID_COUNT; i++) {
  boids.push(new Boid());
}

function animate() {
  // 残像効果
  ctx.globalAlpha = 0.18;
  drawBackground();
  ctx.globalAlpha = 1.0;
  for (let boid of boids) {
    boid.edges();
    boid.flock(boids);
    boid.update();
    boid.draw();
  }
  requestAnimationFrame(animate);
}

animate(); 