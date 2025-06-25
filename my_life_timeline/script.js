const timelineData = [
  { year: '1990', event: '誕生', mood: 8 },
  { year: '1996', event: '小学校入学', mood: 7 },
  { year: '2002', event: '中学校入学', mood: 6 },
  { year: '2005', event: '高校入学', mood: 8 },
  { year: '2008', event: '大学入学', mood: 9 },
  { year: '2012', event: '大学卒業', mood: 7 },
  { year: '2013', event: '初めての就職', mood: 6 },
  { year: '2020', event: '転職', mood: 8 },
  { year: '2024', event: '新しい挑戦', mood: 10 }
];

// 折れ線グラフ描画（リッチデザイン＆アニメーション付き、エリア塗りは初回から全体表示）
function drawMoodChartRich(data) {
  const canvas = document.getElementById('moodChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 40;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const moods = data.map(d => d.mood);
  const years = data.map(d => d.year);
  const minMood = 1;
  const maxMood = 10;

  // 軸
  ctx.strokeStyle = '#bbb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // ラベル
  ctx.fillStyle = '#888';
  ctx.font = '13px sans-serif';
  ctx.fillText('気分スコア', 2, padding - 10);
  ctx.fillText(maxMood, 8, padding + 6);
  ctx.fillText(minMood, 8, canvas.height - padding + 6);

  // 年ラベル
  years.forEach((year, i) => {
    const x = padding + (chartWidth) * (i / (years.length - 1));
    ctx.save();
    ctx.translate(x, canvas.height - padding + 18);
    ctx.rotate(-Math.PI / 8);
    ctx.fillText(year, 0, 0);
    ctx.restore();
  });

  // エリア塗り（初回から全体表示）
  const points = moods.map((mood, i) => {
    const x = padding + (chartWidth) * (i / (moods.length - 1));
    const y = padding + (maxMood - mood) / (maxMood - minMood) * chartHeight;
    return { x, y, mood, year: years[i], idx: i };
  });
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, canvas.height - padding);
  points.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
  ctx.closePath();
  const grad = ctx.createLinearGradient(padding, 0, canvas.width - padding, 0);
  grad.addColorStop(0, 'rgba(76,175,80,0.18)');
  grad.addColorStop(1, 'rgba(33,150,243,0.10)');
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // 折れ線・点のみアニメーション
  let progress = 0;
  const total = moods.length - 1;
  const duration = 1200; // ms
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    progress = t * total;

    // 折れ線（グラデーション）
    ctx.save();
    const lineGrad = ctx.createLinearGradient(padding, 0, canvas.width - padding, 0);
    lineGrad.addColorStop(0, '#4caf50');
    lineGrad.addColorStop(1, '#2196f3');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= Math.floor(progress); i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
    // 補間点
    if (progress < total) {
      const i = Math.floor(progress);
      const frac = progress - i;
      if (i < moods.length - 1) {
        const x = points[i].x + (points[i + 1].x - points[i].x) * frac;
        const y = points[i].y + (points[i + 1].y - points[i].y) * frac;
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.restore();

    // 点と値（シャドウ付き）
    for (let i = 0; i <= Math.ceil(progress); i++) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 8, 0, Math.PI * 2);
      ctx.shadowColor = '#2196f3aa';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4caf50';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#4caf50';
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = '#333';
      ctx.font = '13px sans-serif';
      ctx.fillText(points[i].mood, points[i].x - 8, points[i].y - 14);
      ctx.restore();
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);

  // ツールチップ
  canvas.onmousemove = function(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // エリア塗りは常に全体表示
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, canvas.height - padding);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    animate(performance.now());
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    points.forEach(pt => {
      if (Math.abs(mx - pt.x) < 12 && Math.abs(my - pt.y) < 12) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(33,150,243,0.12)';
        ctx.fill();
        ctx.restore();
        // ツールチップ
        ctx.save();
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        const tipWidth = ctx.measureText(pt.year + '年  ' + pt.mood + '点').width + 24;
        const tipX = Math.min(canvas.width - tipWidth - 10, Math.max(10, pt.x - tipWidth / 2));
        const tipY = pt.y - 40;
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, tipWidth, 36, 8);
        ctx.fillStyle = '#2196f3';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillText(pt.year + '年', tipX + 12, tipY + 18);
        ctx.fillText(pt.mood + '点', tipX + 12, tipY + 32);
        ctx.restore();
      }
    });
  };
  canvas.onmouseleave = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // エリア塗りは常に全体表示
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, canvas.height - padding);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, canvas.height - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    animate(performance.now());
  };
}

drawMoodChartRich(timelineData);

const timeline = document.getElementById('timeline');

timeline.innerHTML = timelineData.map((item, idx) => {
  // moodスコアに応じて丸の大きさと色を決定
  const minSize = 20;
  const maxSize = 48;
  const size = minSize + (maxSize - minSize) * ((item.mood - 1) / 9);
  // moodスコアに応じて色をグラデーション（赤→黄→緑）
  const getMoodColor = (score) => {
    // 1:赤, 5:黄, 10:緑
    if (score <= 5) {
      // 赤→黄
      const ratio = (score - 1) / 4;
      return `rgb(${255}, ${Math.round(255 * ratio)}, 0)`;
    } else {
      // 黄→緑
      const ratio = (score - 5) / 5;
      return `rgb(${Math.round(255 * (1 - ratio))}, 255, 0)`;
    }
  };
  const moodColor = getMoodColor(item.mood);

  return `
    <div class="timeline-item-graphic ${idx % 2 === 0 ? 'left' : 'right'}">
      <div class="timeline-content">
        <div class="timeline-year">${item.year}</div>
        <div class="timeline-event">${item.event}</div>
        <div class="timeline-mood-label">気分スコア: ${item.mood}</div>
      </div>
      <div class="timeline-circle" style="width:${size}px;height:${size}px;border-color:${moodColor};background:${moodColor}22;"></div>
    </div>
  `;
}).join(''); 