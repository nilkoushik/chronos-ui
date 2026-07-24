// Shared canvas background-effect engine used by chronos-ui widgets (Banner, SlidingBanner,
// and anything else that renders a full-bleed <canvas> layer behind its content). This is
// deliberately a plain, framework-agnostic module — not a .lite.tsx component — so it compiles
// once and can be dropped into any component's onMount/onUpdate lifecycle without going through
// Mitosis codegen. New effects are added by registering a renderer in EFFECT_RENDERERS below;
// nothing else needs to change to make an effect available everywhere this engine is used.

export type BackgroundEffectName =
  | 'none'
  | 'particles'
  | 'waves'
  | 'rain'
  | 'thunderstorm'
  | 'sunrise'
  | 'sunset'
  | 'fog'
  | 'autumn'
  | 'festival'
  | 'santa'
  | 'sea';

export interface BackgroundEffectContext {
  animationFrameId: number | null;
  resizeHandler: (() => void) | null;
}

type EffectRenderer = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) => void;

function renderParticles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  const particles: any[] = [];
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * -1 - 0.2,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
    }
    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  animate();
}

function renderWaves(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  let time = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width; i += 20) {
      ctx.lineTo(i, canvas.height - 80 + Math.sin(i * 0.005 + time) * 30);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let i = 0; i <= canvas.width; i += 20) {
      ctx.lineTo(i, canvas.height - 40 + Math.sin(i * 0.008 + time * 1.5) * 20);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    time += 0.03;
    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  animate();
}

function renderRain(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext, stormy?: boolean) {
  const wind = stormy ? 2.4 : 1.2;
  const dropCount = stormy ? 220 : 140;
  const drops: any[] = [];
  for (let i = 0; i < dropCount; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 14 + (stormy ? 16 : 10),
      speed: (Math.random() * 4 + 6) * (stormy ? 1.6 : 1),
      opacity: Math.random() * 0.35 + 0.15
    });
  }

  // A thin "water" band along the bottom of the frame that raindrops land in and
  // ripple across, like rain hitting a puddle/pond.
  const waterLevel = () => canvas.height * 0.88;
  const ripples: { x: number; y: number; r: number; alpha: number; maxR: number }[] = [];
  const spawnRipple = (x: number, y: number) => {
    if (ripples.length > 90) ripples.shift();
    ripples.push({ x, y, r: 1, alpha: 0.5, maxR: Math.random() * 16 + 14 });
  };

  let nextFlashAt = performance.now() + Math.random() * 3000 + 1500;
  let flashUntil = 0;
  let boltUntil = 0;
  let bolt: { x: number; y: number }[] = [];

  const buildBolt = () => {
    const startX = Math.random() * canvas.width;
    const points: { x: number; y: number }[] = [{ x: startX, y: 0 }];
    let x = startX;
    let y = 0;
    const segments = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < segments; i++) {
      y += canvas.height / segments;
      x += (Math.random() - 0.5) * 60;
      points.push({ x, y });
    }
    return points;
  };

  // Cap heavier effects to ~30fps instead of the display's native rate. These effects
  // are decorative background motion, not something that needs 60fps — leaving more of
  // the main thread free avoids the effect competing with (and delaying) things like a
  // parent SlidingBanner's own autoplay transition.
  let lastFrameT = 0;
  const animate = (t: number) => {
    if (t - lastFrameT < 32) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (stormy) {
      if (t > nextFlashAt) {
        flashUntil = t + 120 + Math.random() * 100;
        boltUntil = t + 90;
        bolt = buildBolt();
        nextFlashAt = t + 2500 + Math.random() * 5500;
      }
      if (t < flashUntil) {
        ctx.fillStyle = `rgba(255, 255, 255, ${t < boltUntil ? 0.35 : 0.12})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (t < boltUntil && bolt.length > 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(bolt[0].x, bolt[0].y);
        for (let i = 1; i < bolt.length; i++) ctx.lineTo(bolt[i].x, bolt[i].y);
        ctx.stroke();
      }
    }

    const wl = waterLevel();
    const waterGrad = ctx.createLinearGradient(0, wl, 0, canvas.height);
    waterGrad.addColorStop(0, 'rgba(148, 175, 214, 0.16)');
    waterGrad.addColorStop(1, 'rgba(30, 41, 82, 0.32)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, wl, canvas.width, canvas.height - wl);

    // Drops/ripples are drawn in a handful of opacity "buckets" instead of one
    // beginPath()+stroke() call per particle. Canvas stroke() calls carry real
    // per-call overhead (path finalization/rasterization), and at 140-220 drops
    // plus up to 90 ripples that was ~300+ individual stroke calls every frame —
    // enough to compete with the main thread for something like a parent
    // SlidingBanner's autoplay timer. Bucketing collapses that to ~15 calls/frame
    // with no visible difference (opacity is quantized to steps of 0.05).
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.2;
    const dropBuckets = new Map<number, { x: number; y: number; x2: number; y2: number }[]>();
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      const willLandInWater = d.y + d.len >= wl && d.y < wl;
      const x2 = d.x + wind * (d.len / 10);
      const y2 = Math.min(d.y + d.len, wl);
      const bucket = Math.round(d.opacity * 20) / 20;
      let arr = dropBuckets.get(bucket);
      if (!arr) { arr = []; dropBuckets.set(bucket, arr); }
      arr.push({ x: d.x, y: d.y, x2, y2 });
      if (willLandInWater) spawnRipple(x2, wl);
      d.x += wind;
      d.y += d.speed;
      if (d.y > canvas.height + d.len) {
        d.y = -d.len;
        d.x = Math.random() * canvas.width;
      }
      if (d.x > canvas.width + d.len) d.x = -d.len;
    }
    dropBuckets.forEach((segs, opacity) => {
      ctx.strokeStyle = `rgba(210, 225, 255, ${opacity})`;
      ctx.beginPath();
      for (let i = 0; i < segs.length; i++) {
        ctx.moveTo(segs[i].x, segs[i].y);
        ctx.lineTo(segs[i].x2, segs[i].y2);
      }
      ctx.stroke();
    });

    ctx.lineWidth = 1;
    const rippleBuckets = new Map<number, { x: number; y: number; r: number }[]>();
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += 0.55;
      r.alpha *= 0.94;
      if (r.alpha < 0.02 || r.r > r.maxR) {
        ripples.splice(i, 1);
        continue;
      }
      const bucket = Math.round(r.alpha * 20) / 20;
      let arr = rippleBuckets.get(bucket);
      if (!arr) { arr = []; rippleBuckets.set(bucket, arr); }
      arr.push({ x: r.x, y: r.y, r: r.r });
    }
    rippleBuckets.forEach((circles, alpha) => {
      ctx.strokeStyle = `rgba(210, 230, 255, ${alpha})`;
      ctx.beginPath();
      for (let i = 0; i < circles.length; i++) {
        ctx.ellipse(circles[i].x, circles[i].y, circles[i].r, circles[i].r * 0.35, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
    });

    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

function renderSun(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext, rising: boolean) {
  let time = Math.random() * 1000;
  const cycleMs = 16000;
  const skyStops = rising
    ? [
        ['#1e1b4b', '#3730a3', '#f59e0b'],
        ['#312e81', '#c2410c', '#fbbf24']
      ]
    : [
        ['#7c2d12', '#c2410c', '#fbbf24'],
        ['#1e1b4b', '#3730a3', '#f59e0b']
      ];
  let lastFrameT = 0;
  const animate = (t: number) => {
    if (t - lastFrameT < 32) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    time = t;
    const phase = (time % cycleMs) / cycleMs;
    const eased = 1 - Math.pow(1 - phase, 2);
    const sunY = rising
      ? canvas.height * (1.05 - eased * 0.75)
      : canvas.height * (0.3 + eased * 0.75);
    const sunX = canvas.width * 0.5 + Math.sin(phase * Math.PI) * canvas.width * 0.15;
    const from = skyStops[0];
    const to = skyStops[1];
    const mix = (a: string, b: string, f: number) => {
      const pa = parseInt(a.slice(1), 16);
      const pb = parseInt(b.slice(1), 16);
      const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255;
      const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255;
      const r = Math.round(ar + (br - ar) * f);
      const g = Math.round(ag + (bg - ag) * f);
      const b2 = Math.round(ab + (bb - ab) * f);
      return `rgb(${r},${g},${b2})`;
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, mix(from[0], to[0], eased));
    sky.addColorStop(0.55, mix(from[1], to[1], eased));
    sky.addColorStop(1, mix(from[2], to[2], eased));
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    const glowR = Math.min(canvas.width, canvas.height) * 0.35;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
    glow.addColorStop(0, 'rgba(255, 214, 140, 0.85)');
    glow.addColorStop(0.4, 'rgba(255, 170, 90, 0.35)');
    glow.addColorStop(1, 'rgba(255, 170, 90, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff4d6';
    ctx.beginPath();
    ctx.arc(sunX, sunY, glowR * 0.16, 0, Math.PI * 2);
    ctx.fill();

    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

function makeFrostShard(): any {
  return {
    angle: Math.random() * Math.PI * 2,
    z: Math.random(),
    speed: Math.random() * 0.0035 + 0.0035,
    baseSize: Math.random() * 2.4 + 1.8,
    spin: (Math.random() - 0.5) * 0.03,
    rotation: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.6,
    points: 5 + Math.floor(Math.random() * 2) // 5 or 6-pointed ice crystal
  };
}

function drawFrostShard(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number, points: number) {
  if (opacity <= 0 || size <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `rgba(224, 242, 255, ${opacity})`;
  ctx.lineWidth = Math.max(0.5, size * 0.1);
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = ((Math.PI * 2) / points) * i;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
    // small cross-branches for a crystalline look
    const bx = Math.cos(a) * size * 0.55;
    const by = Math.sin(a) * size * 0.55;
    const perp = a + Math.PI / 2;
    ctx.moveTo(bx - Math.cos(perp) * size * 0.18, by - Math.sin(perp) * size * 0.18);
    ctx.lineTo(bx + Math.cos(perp) * size * 0.18, by + Math.sin(perp) * size * 0.18);
  }
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.4, size * 0.14), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderFog(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  const layers = [
    { count: 4, speed: 0.15, sizeMul: 0.55, alpha: 0.18, yBand: 0.35 },
    { count: 3, speed: 0.28, sizeMul: 0.75, alpha: 0.24, yBand: 0.6 },
    { count: 2, speed: 0.42, sizeMul: 1, alpha: 0.3, yBand: 0.85 }
  ];
  const blobs: any[] = [];
  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      blobs.push({
        x: Math.random() * canvas.width,
        y: canvas.height * layer.yBand + (Math.random() - 0.5) * canvas.height * 0.15,
        r: (Math.random() * 80 + 120) * layer.sizeMul,
        speed: layer.speed + Math.random() * 0.08,
        alpha: layer.alpha,
        bob: Math.random() * 1000
      });
    }
  });
  const snow: any[] = [];
  for (let i = 0; i < 60; i++) {
    snow.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.6,
      speed: Math.random() * 0.6 + 0.3,
      sway: Math.random() * 1000
    });
  }
  // Frost shards: 3D-ish ice crystals that fly outward from a central vanishing point
  // toward the viewer, growing and accelerating (a cinematic warp/zoom flurry) before
  // fading out past the edges of the frame and respawning near the center.
  const frostShards: any[] = [];
  for (let i = 0; i < 34; i++) frostShards.push(makeFrostShard());

  let lastFrameT = 0;
  const animate = (t: number) => {
    if (t - lastFrameT < 32) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const y = b.y + Math.sin((t + b.bob) * 0.0006) * 8;
      const grad = ctx.createRadialGradient(b.x, y, 0, b.x, y, b.r);
      grad.addColorStop(0, `rgba(226, 232, 240, ${b.alpha})`);
      grad.addColorStop(1, 'rgba(226, 232, 240, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, y, b.r, 0, Math.PI * 2);
      ctx.fill();
      b.x += b.speed;
      if (b.x - b.r > canvas.width) b.x = -b.r;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < snow.length; i++) {
      const s = snow[i];
      const sway = Math.sin((t + s.sway) * 0.001) * 12;
      ctx.beginPath();
      ctx.arc(s.x + sway, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y += s.speed;
      s.x += 0.35;
      if (s.y > canvas.height + 4) {
        s.y = -4;
        s.x = Math.random() * canvas.width;
      }
      if (s.x > canvas.width + 10) s.x = -10;
    }

    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.42;
    const maxR = Math.max(canvas.width, canvas.height) * 0.75;
    for (let i = 0; i < frostShards.length; i++) {
      const s = frostShards[i];
      s.z += s.speed;
      s.rotation += s.spin;
      if (s.z > 1) {
        const fresh = makeFrostShard();
        fresh.z = 0;
        frostShards[i] = fresh;
        continue;
      }
      const eased = s.z * s.z; // ease-in acceleration for the cinematic zoom-past feel
      const dist = eased * maxR;
      const x = cx + Math.cos(s.angle) * dist + s.driftX * s.z * 40;
      const y = cy + Math.sin(s.angle) * dist * 0.6;
      const size = s.baseSize * (0.3 + eased * 3.4);
      const fadeIn = Math.min(1, s.z / 0.15);
      const fadeOut = s.z > 0.82 ? Math.max(0, (1 - s.z) / 0.18) : 1;
      const opacity = Math.max(0, Math.min(1, fadeIn * fadeOut)) * 0.85;
      drawFrostShard(ctx, x, y, size, s.rotation, opacity, s.points);
    }

    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

function hexToRgba(hex: string, alpha: number): string {
  const p = parseInt(hex.slice(1), 16);
  const r = (p >> 16) & 255;
  const g = (p >> 8) & 255;
  const b = p & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function makeLeaf(canvas: HTMLCanvasElement): any {
  const palette = ['#c2410c', '#ea580c', '#f59e0b', '#b91c1c', '#eab308', '#a16207'];
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 7 + 6,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.02 + 0.012,
    speedY: Math.random() * 0.6 + 0.4,
    color: palette[Math.floor(Math.random() * palette.length)]
  };
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.85, -size * 0.15, 0, size);
  ctx.quadraticCurveTo(-size * 0.85, -size * 0.15, 0, -size);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();
  ctx.restore();
}

// Autumn: falling, swaying, tumbling leaves in warm palette — a seasonal counterpart to
// the winter fog/frost effect above, built on the same "reset when off-screen" pattern.
function renderAutumn(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  const leaves: any[] = [];
  for (let i = 0; i < 42; i++) leaves.push(makeLeaf(canvas));

  let lastFrameT = 0;
  const animate = (t: number) => {
    if (t - lastFrameT < 32) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < leaves.length; i++) {
      const l = leaves[i];
      l.swayPhase += l.swaySpeed;
      const x = l.x + Math.sin(l.swayPhase) * 18;
      drawLeaf(ctx, x, l.y, l.size, l.rotation, l.color);
      l.y += l.speedY;
      l.rotation += l.rotSpeed;
      if (l.y - l.size > canvas.height) {
        Object.assign(l, makeLeaf(canvas));
        l.y = -l.size * 2;
      }
    }
    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

function makeSparkle(canvas: HTMLCanvasElement): any {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height * (0.55 + Math.random() * 0.45),
    r: Math.random() * 1.6 + 0.6,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.025 + 0.012
  };
}

function makeFirework(canvas: HTMLCanvasElement, t: number): any {
  const colors = ['#fbbf24', '#f472b6', '#f97316', '#a78bfa', '#34d399', '#facc15', '#f87171'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const cx = canvas.width * (0.15 + Math.random() * 0.7);
  const cy = canvas.height * (0.15 + Math.random() * 0.45);
  const count = 22 + Math.floor(Math.random() * 12);
  const particles: any[] = [];
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.15;
    const speed = Math.random() * 1.7 + 1.2;
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1 });
  }
  return { particles, color, born: t };
}

// Indian festival (Diwali-style): warm ambient diya sparkle low in the frame plus
// periodic firework bursts in gold/magenta/orange, each burst's particles falling
// under light gravity and fading out as they go.
function renderFestival(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  const sparkles: any[] = [];
  for (let i = 0; i < 46; i++) sparkles.push(makeSparkle(canvas));
  let fireworks: any[] = [];
  let nextBurstAt = performance.now() + 400;

  let lastFrameT = 0;
  const animate = (t: number) => {
    if (t - lastFrameT < 32) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < sparkles.length; i++) {
      const s = sparkles[i];
      s.phase += s.speed;
      const opacity = 0.3 + Math.sin(s.phase) * 0.3;
      ctx.fillStyle = `rgba(255, 214, 130, ${Math.max(0, opacity)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (t > nextBurstAt) {
      fireworks.push(makeFirework(canvas, t));
      nextBurstAt = t + 900 + Math.random() * 1400;
    }
    fireworks = fireworks.filter((fw) => t - fw.born < 1500);

    for (let i = 0; i < fireworks.length; i++) {
      const fw = fireworks[i];
      for (let j = 0; j < fw.particles.length; j++) {
        const p = fw.particles[j];
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        p.life -= 0.013;
        ctx.fillStyle = hexToRgba(fw.color, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

function makeSnowflake(canvas: HTMLCanvasElement): any {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    speed: Math.random() * 0.7 + 0.4,
    sway: Math.random() * 1000
  };
}

function drawSantaSleigh(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, t: number, dir: number = 1) {
  ctx.save();
  ctx.translate(x, y);
  // Reindeer are drawn at negative local x (see `ox` below) and the sleigh body at
  // positive local x. For rightward travel (dir=1) a negative x-scale mirrors the whole
  // rig so the reindeer lead ahead of the sleigh instead of trailing behind it (which
  // read as the cart dragging the reindeer). For the leftward return trip (dir=-1) the
  // sign flips back so the reindeer still lead in the direction actually being traveled.
  ctx.scale(-scale * dir, scale);

  const reindeerCount = 3;
  const bodyColor = 'rgba(20, 20, 30, 0.85)';
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = bodyColor;

  // Rein lines from the sleigh front back to each reindeer's neck, drawn first so the
  // reindeer/sleigh bodies render on top of them.
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < reindeerCount; i++) {
    const ox = -40 - i * 34;
    const bob = Math.sin(t * 0.012 + i * 1.1) * 2.5;
    ctx.moveTo(10, -8);
    ctx.lineTo(ox - 8, -4 + bob);
  }
  ctx.stroke();

  for (let i = 0; i < reindeerCount; i++) {
    const ox = -40 - i * 34;
    const bob = Math.sin(t * 0.012 + i * 1.1) * 2.5;
    const legSwing = Math.sin(t * 0.022 + i * 1.3) * 8;
    const isLeader = i === reindeerCount - 1;

    ctx.fillStyle = bodyColor;
    // running legs (galloping — front/back pairs swing opposite directions)
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ox - 8, 6 + bob);
    ctx.lineTo(ox - 8 + legSwing, 15 + bob);
    ctx.moveTo(ox + 8, 6 + bob);
    ctx.lineTo(ox + 8 - legSwing, 15 + bob);
    ctx.stroke();

    // body
    ctx.beginPath();
    ctx.ellipse(ox, bob, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // head — on the far side of the body from the sleigh, so the reindeer faces the
    // direction of travel instead of looking back at the sleigh it's pulling.
    ctx.beginPath();
    ctx.ellipse(ox - 13, -4 + bob, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // branching antlers
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(ox - 15, -8 + bob);
    ctx.lineTo(ox - 19, -15 + bob);
    ctx.moveTo(ox - 17, -12 + bob);
    ctx.lineTo(ox - 21, -12 + bob);
    ctx.moveTo(ox - 12, -8 + bob);
    ctx.lineTo(ox - 8, -15 + bob);
    ctx.moveTo(ox - 10, -12 + bob);
    ctx.lineTo(ox - 6, -12 + bob);
    ctx.stroke();

    if (isLeader) {
      // Rudolph's glowing red nose leads the pack
      const glow = ctx.createRadialGradient(ox - 18, -3 + bob, 0, ox - 18, -3 + bob, 6);
      const pulse = 0.6 + Math.sin(t * 0.01) * 0.4;
      glow.addColorStop(0, `rgba(255, 80, 60, ${0.9 * pulse})`);
      glow.addColorStop(1, 'rgba(255, 80, 60, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ox - 18, -3 + bob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 90, 70, 0.95)';
      ctx.beginPath();
      ctx.arc(ox - 18, -3 + bob, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(34, -6);
  ctx.quadraticCurveTo(40, -6, 40, 2);
  ctx.lineTo(40, 8);
  ctx.lineTo(6, 8);
  ctx.quadraticCurveTo(2, 8, 4, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(185, 28, 28, 0.9)';
  ctx.beginPath();
  ctx.arc(22, -10, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(22, -15, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function makeCapPeek(canvas: HTMLCanvasElement, t: number): any {
  const edges = ['top', 'left', 'right', 'bottom'] as const;
  return {
    edge: edges[Math.floor(Math.random() * edges.length)],
    pos: 0.12 + Math.random() * 0.76,
    changeAt: t + 2500 + Math.random() * 5000,
    phase: 'hidden' as 'hidden' | 'in' | 'hold' | 'out'
  };
}

// Draws a peeking Santa hat: a red triangular cap with white fur trim and pom-pom,
// oriented to "poke in" from whichever edge it's currently hiding at, with a soft warm
// glow behind it that pulses while it's visible. `t` drives the pulse animation.
function drawPeekingCap(ctx: CanvasRenderingContext2D, x: number, y: number, edgeAngle: number, reveal: number, t: number) {
  if (reveal <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(edgeAngle);
  const s = 0.8 + reveal * 0.65;
  ctx.scale(s, s);

  const pulse = 0.65 + Math.sin(t * 0.006) * 0.35;
  const glowAlpha = Math.max(0, Math.min(1, reveal)) * pulse * 0.75;
  if (glowAlpha > 0.01) {
    const glow = ctx.createRadialGradient(0, -2, 0, 0, -2, 42);
    glow.addColorStop(0, `rgba(255, 214, 130, ${glowAlpha})`);
    glow.addColorStop(0.55, `rgba(255, 180, 90, ${glowAlpha * 0.5})`);
    glow.addColorStop(1, 'rgba(255, 180, 90, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -2, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = Math.max(0, Math.min(1, reveal * 1.3));

  ctx.fillStyle = 'rgba(190, 24, 24, 0.95)';
  ctx.beginPath();
  ctx.moveTo(-22, 16);
  ctx.lineTo(22, 16);
  ctx.quadraticCurveTo(10, -10, 26, -30);
  ctx.quadraticCurveTo(0, -14, -22, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.beginPath();
  ctx.ellipse(0, 16, 24, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(27, -31, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function makeCandy(canvas: HTMLCanvasElement): any {
  return {
    kind: Math.random() < 0.5 ? 'cane' : 'mint',
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 5 + 8,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.015 + 0.008,
    speedY: Math.random() * 0.35 + 0.22
  };
}

function drawCandyCane(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, -size * 0.25);
    ctx.quadraticCurveTo(0, -size * 0.95, size * 0.55, -size * 0.95);
  };

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = size * 0.32;
  path();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(220, 38, 38, 0.9)';
  ctx.lineWidth = size * 0.32;
  ctx.setLineDash([size * 0.24, size * 0.24]);
  path();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}

function drawMintCandy(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)';
  ctx.lineWidth = size * 0.26;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0.3, Math.PI * 1.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, Math.PI * 1.3, Math.PI * 2.1);
  ctx.stroke();

  ctx.restore();
}

// Santa's winter flyby: twinkling string lights along the top edge, gentle snowfall
// mixed with tumbling candy canes and peppermints, a silhouette of Santa's sleigh +
// galloping reindeer crossing the frame every so often, and a playful "hide and seek"
// Santa cap that randomly peeks in from one of the four frame edges.
function renderSanta(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  // This is the heaviest effect (sleigh + 3 reindeer, string lights, snow, a growing
  // candy trail, and an occasional cap glow), so it keeps its particle counts and frame
  // budget a bit tighter than the other renderers to avoid competing with things like a
  // parent SlidingBanner's autoplay transition.
  const snow: any[] = [];
  for (let i = 0; i < 40; i++) snow.push(makeSnowflake(canvas));

  const candies: any[] = [];
  for (let i = 0; i < 10; i++) candies.push(makeCandy(canvas));

  const lightColors = ['#ef4444', '#22c55e', '#facc15', '#3b82f6'];
  const lightCount = 14;
  const lights: any[] = [];
  for (let i = 0; i < lightCount; i++) {
    lights.push({ phase: Math.random() * Math.PI * 2, color: lightColors[i % lightColors.length] });
  }

  // 'out' = left-to-right pass across the upper band; 'return' = right-to-left pass back
  // through the bottom half of the banner, looping the flight instead of just vanishing
  // and reappearing at the start each time.
  let leg: 'idle' | 'out' | 'return' = 'idle';
  let legStart = performance.now() + 800;
  let lastDropAt = 0;

  const capInMs = 550;
  const capHoldMs = 1300;
  const capOutMs = 500;
  let cap = makeCapPeek(canvas, performance.now());
  cap.changeAt = performance.now() + 1200;

  let lastFrameT = 0;
  const animate = (t: number) => {
    // A slightly wider frame budget (~25fps) than the other effects, since this one
    // has meaningfully more per-frame draw work.
    if (t - lastFrameT < 40) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < lights.length; i++) {
      const lgt = lights[i];
      const x = lightCount > 1 ? (canvas.width / (lightCount - 1)) * i : canvas.width / 2;
      const y = 10 + Math.sin((x / canvas.width) * Math.PI) * 6;
      const twinkle = 0.5 + Math.sin(t * 0.004 + lgt.phase) * 0.5;
      ctx.fillStyle = hexToRgba(lgt.color, 0.4 + twinkle * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snow shares one fillStyle, so it's drawn as a single path with one fill() call
    // instead of one beginPath()/fill() per flake.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    for (let i = 0; i < snow.length; i++) {
      const s = snow[i];
      const sway = Math.sin((t + s.sway) * 0.001) * 12;
      ctx.moveTo(s.x + sway + s.r, s.y);
      ctx.arc(s.x + sway, s.y, s.r, 0, Math.PI * 2);
      s.y += s.speed;
      s.x += 0.3;
      if (s.y > canvas.height + 4) {
        s.y = -4;
        s.x = Math.random() * canvas.width;
      }
      if (s.x > canvas.width + 10) s.x = -10;
    }
    ctx.fill();

    for (let i = 0; i < candies.length; i++) {
      const c = candies[i];
      c.swayPhase += c.swaySpeed;
      const x = c.x + Math.sin(c.swayPhase) * 16;
      if (c.kind === 'cane') drawCandyCane(ctx, x, c.y, c.size, c.rotation);
      else drawMintCandy(ctx, x, c.y, c.size, c.rotation);
      c.y += c.speedY;
      c.rotation += c.rotSpeed;
      if (c.y - c.size * 2 > canvas.height) {
        Object.assign(c, makeCandy(canvas));
        c.y = -c.size * 2;
      }
    }

    if (leg === 'idle' && t > legStart) {
      leg = 'out';
      legStart = t;
    }

    if (leg === 'out' || leg === 'return') {
      const dur = 5000;
      const progress = (t - legStart) / dur;
      if (progress > 1) {
        if (leg === 'out') {
          leg = 'return';
          legStart = t + 850;
        } else {
          leg = 'idle';
          legStart = t + 6000 + Math.random() * 6000;
        }
      } else {
        let x: number;
        let y: number;
        let dir: number;
        if (leg === 'out') {
          dir = 1;
          x = -60 + progress * (canvas.width + 160);
          y = canvas.height * 0.18 + Math.sin(progress * Math.PI * 2) * 14;
        } else {
          dir = -1;
          x = canvas.width + 60 - progress * (canvas.width + 160);
          y = canvas.height * 0.72 + Math.sin(progress * Math.PI * 2) * 16;
        }
        drawSantaSleigh(ctx, x, y, 1.3, t, dir);

        // Candy trail dropped behind the sleigh as it flies, on both legs of the trip.
        if (t - lastDropAt > 190 + Math.random() * 150) {
          lastDropAt = t;
          candies.push({
            kind: Math.random() < 0.5 ? 'cane' : 'mint',
            x: x + (Math.random() - 0.5) * 22 - dir * 30,
            y: y + 12,
            size: Math.random() * 5 + 8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.02 + 0.01,
            speedY: Math.random() * 0.55 + 0.35
          });
          if (candies.length > 22) candies.splice(0, candies.length - 22);
        }
      }
    }

    // Hide-and-seek Santa cap: pokes in from a random edge, holds briefly, then retreats,
    // then picks a fresh random edge/position for its next appearance.
    if (cap.phase === 'hidden' && t > cap.changeAt) {
      cap.phase = 'in';
      cap.changeAt = t + capInMs;
    } else if (cap.phase === 'in' && t > cap.changeAt) {
      cap.phase = 'hold';
      cap.changeAt = t + capHoldMs;
    } else if (cap.phase === 'hold' && t > cap.changeAt) {
      cap.phase = 'out';
      cap.changeAt = t + capOutMs;
    } else if (cap.phase === 'out' && t > cap.changeAt) {
      cap = makeCapPeek(canvas, t);
    }

    if (cap.phase !== 'hidden') {
      let reveal = 1;
      if (cap.phase === 'in') reveal = 1 - Math.max(0, (cap.changeAt - t) / capInMs);
      else if (cap.phase === 'out') reveal = Math.max(0, (cap.changeAt - t) / capOutMs);
      reveal = Math.max(0, Math.min(1, reveal));

      // hiddenOffset: fully outside the frame. shownOffset: how far past the edge the
      // cap pokes in once fully revealed (positive = into the visible frame).
      const hiddenOffset = -75;
      const shownOffset = 42;
      const offset = hiddenOffset + (shownOffset - hiddenOffset) * reveal;

      let cx = 0;
      let cy = 0;
      let angle = 0;
      if (cap.edge === 'top') {
        cx = canvas.width * cap.pos;
        cy = offset;
        angle = Math.PI; // tip points down, into the frame
      } else if (cap.edge === 'bottom') {
        cx = canvas.width * cap.pos;
        cy = canvas.height - offset;
        angle = 0; // upright, tip points up, into the frame
      } else if (cap.edge === 'left') {
        cx = offset;
        cy = canvas.height * cap.pos;
        angle = Math.PI * 0.5; // tip points right, into the frame
      } else {
        cx = canvas.width - offset;
        cy = canvas.height * cap.pos;
        angle = Math.PI * 1.5; // tip points left, into the frame
      }
      drawPeekingCap(ctx, cx, cy, angle, reveal, t);
    }

    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

function makeFoamBlob(): any {
  return {
    u: Math.random(),
    vBand: Math.random(),
    driftSpeed: (Math.random() - 0.5) * 0.00012,
    stretchX: Math.random() * 1.8 + 1.5,
    size: Math.random() * 13 + 10,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.05 + 0.03
  };
}

function makeFoamFilament(): any {
  return {
    u: Math.random(),
    vBand: Math.random() * 0.65,
    len: Math.random() * 46 + 26,
    wiggle: Math.random() * 10 + 6,
    driftSpeed: (Math.random() - 0.5) * 0.00008,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.045 + 0.025
  };
}

// Sea waves, aerial view: the banner's own background image IS the seashore — this effect
// stays fully transparent everywhere except a thin band (~10% of the banner height) along
// the bottom edge, where a translucent sea-tinted wash breathes in and out with foam blobs
// and lacy filament streaks drifting across it, mimicking a top-down drone shot of the
// waterline lapping at the sand rather than a side-on shoreline illustration.
function renderSea(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, ctxBox: BackgroundEffectContext) {
  const blobs: any[] = [];
  for (let i = 0; i < 40; i++) blobs.push(makeFoamBlob());

  const filaments: any[] = [];
  for (let i = 0; i < 26; i++) filaments.push(makeFoamFilament());

  let lastFrameT = 0;
  const animate = (t: number) => {
    if (t - lastFrameT < 32) {
      ctxBox.animationFrameId = requestAnimationFrame(animate);
      return;
    }
    lastFrameT = t;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Surge-and-retreat, tuned for an active sea rather than a gentle tide: two blended,
    // out-of-phase, non-harmonic cycles (~3.4s and ~2.6s) so waves don't fall into lockstep,
    // run through an asymmetric ease — quick surge in, slightly slower pull back — for a
    // punchier "wave arriving" feel instead of a slow, calm breathing motion.
    const cycle = (Math.sin(t * 0.0011) + Math.sin(t * 0.0014 + 1.4) * 0.6) / 1.6;
    const raw = (cycle + 1) / 2;
    const surge = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
    const crash = Math.max(0, surge - 0.72) / 0.28; // 0..1 burst right at peak surge

    const baseBand = Math.max(canvas.height * 0.1, 22);
    const bandHeight = baseBand * (0.62 + surge * 0.75);
    const bandTop = canvas.height - bandHeight;

    // Base sea-tint wash — transparent where it meets the banner image, deepening toward
    // the bottom edge of the frame. Slightly more saturated/opaque during a crash.
    const wash = ctx.createLinearGradient(0, bandTop, 0, canvas.height);
    wash.addColorStop(0, `rgba(64, 178, 196, ${0.03 + crash * 0.05})`);
    wash.addColorStop(0.3, `rgba(48, 156, 182, ${0.16 + crash * 0.1})`);
    wash.addColorStop(1, `rgba(24, 108, 140, ${0.32 + crash * 0.12})`);
    ctx.fillStyle = wash;
    ctx.fillRect(0, bandTop, canvas.width, bandHeight);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, bandTop, canvas.width, bandHeight);
    ctx.clip();

    // Aerial foam blobs: soft, horizontally-stretched glows scattered through the band,
    // biased toward its upper edge (closer to "shore") and drifting sideways.
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      b.u += b.driftSpeed;
      if (b.u < 0) b.u += 1;
      if (b.u > 1) b.u -= 1;
      b.phase += b.speed;
      const x = b.u * canvas.width;
      const y = bandTop + Math.pow(b.vBand, 1.5) * bandHeight;
      const pulse = 0.55 + Math.sin(b.phase) * 0.4;
      const opacity = Math.max(0, pulse) * (1 - b.vBand * 0.45) * (0.8 + crash * 0.5);
      if (opacity <= 0.02) continue;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(b.stretchX, 0.4);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size);
      glow.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      glow.addColorStop(0.6, `rgba(255, 255, 255, ${opacity * 0.4})`);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, b.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Lacy foam filaments: thin, gently wiggling white streaks that fake the branching
    // aerial foam texture without a full noise field.
    ctx.lineCap = 'round';
    for (let i = 0; i < filaments.length; i++) {
      const f = filaments[i];
      f.u += f.driftSpeed;
      if (f.u < 0) f.u += 1;
      if (f.u > 1) f.u -= 1;
      f.phase += f.speed;
      const cx = f.u * canvas.width;
      const cy = bandTop + f.vBand * bandHeight;
      const wig = Math.sin(f.phase) * f.wiggle;
      const opacity = (0.22 + Math.sin(f.phase * 1.3) * 0.16) * (0.85 + crash * 0.5);
      if (opacity <= 0.02) continue;

      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - f.len / 2, cy);
      ctx.quadraticCurveTo(cx, cy + wig, cx + f.len / 2, cy);
      ctx.stroke();
    }

    ctx.restore();

    // A brighter foam edge right where the band meets the banner image above, flaring up
    // sharply during the crash burst so the wave reads as actively arriving, not idling.
    const edgeOpacity = 0.3 + surge * 0.35 + crash * 0.35;
    const edgeSpread = 8 + crash * 10;
    const edgeGrad = ctx.createLinearGradient(0, bandTop - edgeSpread, 0, bandTop + edgeSpread + 6);
    edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    edgeGrad.addColorStop(0.5, `rgba(255, 255, 255, ${Math.min(1, edgeOpacity)})`);
    edgeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, bandTop - edgeSpread, canvas.width, edgeSpread * 2 + 6);

    ctxBox.animationFrameId = requestAnimationFrame(animate);
  };
  ctxBox.animationFrameId = requestAnimationFrame(animate);
}

const EFFECT_RENDERERS: Partial<Record<BackgroundEffectName, EffectRenderer>> = {
  particles: renderParticles,
  waves: renderWaves,
  rain: (ctx, canvas, ctxBox) => renderRain(ctx, canvas, ctxBox, false),
  thunderstorm: (ctx, canvas, ctxBox) => renderRain(ctx, canvas, ctxBox, true),
  sunrise: (ctx, canvas, ctxBox) => renderSun(ctx, canvas, ctxBox, true),
  sunset: (ctx, canvas, ctxBox) => renderSun(ctx, canvas, ctxBox, false),
  fog: renderFog,
  autumn: renderAutumn,
  festival: renderFestival,
  santa: renderSanta,
  sea: renderSea
};

// Starts (or restarts) the given effect on `canvas`, tracking its RAF id and resize
// listener on `ctxBox` so a caller can stop it later with `stopBackgroundEffect`.
// Safe to call repeatedly — always stops any effect already running via this ctxBox first.
export function startBackgroundEffect(
  canvas: HTMLCanvasElement | null | undefined,
  effect: BackgroundEffectName | undefined,
  ctxBox: BackgroundEffectContext
): void {
  stopBackgroundEffect(ctxBox);
  if (!canvas || !effect || effect === 'none') return;
  const renderer = EFFECT_RENDERERS[effect];
  if (!renderer) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  ctxBox.resizeHandler = resize;
  window.addEventListener('resize', ctxBox.resizeHandler);

  renderer(ctx, canvas, ctxBox);
}

export function stopBackgroundEffect(ctxBox: BackgroundEffectContext): void {
  if (ctxBox.animationFrameId) {
    cancelAnimationFrame(ctxBox.animationFrameId);
    ctxBox.animationFrameId = null;
  }
  if (ctxBox.resizeHandler) {
    window.removeEventListener('resize', ctxBox.resizeHandler);
    ctxBox.resizeHandler = null;
  }
}
