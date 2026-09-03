'use client';

import { useEffect, useRef } from 'react';

export type AnimatedBgType =
  | 'matrix'
  | 'ascii_aquarium'
  | 'starfield'
  | 'particles'
  | 'synthwave'
  | 'aura'
  | 'cyber_rain'
  | 'galaxy_spiral'
  | 'cyber_waves'
  | 'retro_terminal'
  | 'neon_embers';

interface Props {
  type: AnimatedBgType;
  className?: string;
}

export default function AnimatedBackground({ type }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 1. MATRIX DIGITAL RAIN
    // ==========================================
    if (type === 'matrix') {
      const chars = "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ".split("");
      const fontSize = 16;
      const columns = Math.floor(width / fontSize);
      const drops: number[] = Array(columns).fill(1);

      const renderMatrix = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#00ff66";
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        animationId = requestAnimationFrame(renderMatrix);
      };
      renderMatrix();
    }

    // ==========================================
    // 2. ASCII AQUARIUM
    // ==========================================
    else if (type === 'ascii_aquarium') {
      interface Fish {
        x: number;
        y: number;
        speed: number;
        art: string;
        color: string;
      }
      interface Bubble {
        x: number;
        y: number;
        speed: number;
        char: string;
      }

      const fishRight = ["><(((('>", ">)))*>", "><>"];
      const fishLeft = ["<'))><", "<*(((<", "<><"];
      const fishColors = ["#38bdf8", "#4ade80", "#fbbf24", "#f472b6", "#a78bfa"];

      const fishes: Fish[] = Array.from({ length: 10 }, () => {
        const goingRight = Math.random() > 0.5;
        const speed = (Math.random() * 1.2 + 0.6) * (goingRight ? 1 : -1);
        const artList = goingRight ? fishRight : fishLeft;
        return {
          x: Math.random() * width,
          y: 80 + Math.random() * (height - 180),
          speed,
          art: artList[Math.floor(Math.random() * artList.length)],
          color: fishColors[Math.floor(Math.random() * fishColors.length)],
        };
      });

      const bubbles: Bubble[] = Array.from({ length: 24 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 1.5 + 0.8,
        char: Math.random() > 0.5 ? "o" : "°",
      }));

      let waveOffset = 0;

      const renderAquarium = () => {
        ctx.fillStyle = "#030d1a";
        ctx.fillRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "rgba(14, 165, 233, 0.12)");
        gradient.addColorStop(0.5, "rgba(3, 105, 161, 0.05)");
        gradient.addColorStop(1, "rgba(2, 6, 23, 0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.font = "13px monospace";
        ctx.fillStyle = "rgba(186, 230, 253, 0.45)";
        for (const b of bubbles) {
          ctx.fillText(b.char, b.x, b.y);
          b.y -= b.speed;
          if (b.y < -10) {
            b.y = height + 10;
            b.x = Math.random() * width;
          }
        }

        ctx.font = "bold 15px monospace";
        for (const f of fishes) {
          ctx.fillStyle = f.color;
          ctx.fillText(f.art, f.x, f.y);
          f.x += f.speed;

          if (f.speed > 0 && f.x > width + 100) f.x = -100;
          else if (f.speed < 0 && f.x < -100) f.x = width + 100;
        }

        waveOffset += 0.03;
        ctx.font = "14px monospace";
        ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
        for (let x = 20; x < width; x += 36) {
          const sway = Math.sin(waveOffset + x) * 8;
          ctx.fillText("(|)", x + sway, height - 30);
          ctx.fillText("(|)", x + sway * 0.7, height - 15);
          ctx.fillText("###", x, height - 2);
        }

        animationId = requestAnimationFrame(renderAquarium);
      };
      renderAquarium();
    }

    // ==========================================
    // 3. STARFIELD WARP
    // ==========================================
    else if (type === 'starfield') {
      const count = 300;
      const stars = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
      }));

      const renderStarfield = () => {
        ctx.fillStyle = "rgba(5, 5, 10, 0.25)";
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        for (const s of stars) {
          s.z -= 4;
          if (s.z <= 0) {
            s.x = (Math.random() - 0.5) * width * 2;
            s.y = (Math.random() - 0.5) * height * 2;
            s.z = width;
          }

          const k = 250 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = Math.max(0.8, (1 - s.z / width) * 2.8);
            const shade = Math.floor((1 - s.z / width) * 255);
            ctx.fillStyle = `rgb(${shade},${shade},${Math.min(255, shade + 50)})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        animationId = requestAnimationFrame(renderStarfield);
      };
      renderStarfield();
    }

    // ==========================================
    // 4. PARTICLE CONSTELLATION
    // ==========================================
    else if (type === 'particles') {
      const count = 55;
      const pts = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5,
      }));

      const renderParticles = () => {
        ctx.fillStyle = "#0a0d14";
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < count; i++) {
          for (let j = i + 1; j < count; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
              ctx.strokeStyle = `rgba(74, 222, 128, ${0.25 * (1 - dist / 130)})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
        }

        for (const p of pts) {
          ctx.fillStyle = "#4ade80";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        animationId = requestAnimationFrame(renderParticles);
      };
      renderParticles();
    }

    // ==========================================
    // 5. SYNTHWAVE 80S NEON GRID
    // ==========================================
    else if (type === 'synthwave') {
      let offset = 0;

      const renderSynthwave = () => {
        ctx.fillStyle = "#0d021a";
        ctx.fillRect(0, 0, width, height);

        const horizon = height * 0.55;

        const sunRadius = Math.min(width, height) * 0.22;
        const sunGradient = ctx.createLinearGradient(width / 2, horizon - sunRadius, width / 2, horizon);
        sunGradient.addColorStop(0, "#ff007f");
        sunGradient.addColorStop(0.6, "#ffaa00");
        sunGradient.addColorStop(1, "#ff00aa");

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(width / 2, horizon, sunRadius, Math.PI, 0);
        ctx.fill();

        const skyGlow = ctx.createRadialGradient(width / 2, horizon, 10, width / 2, horizon, width * 0.6);
        skyGlow.addColorStop(0, "rgba(255, 0, 128, 0.25)");
        skyGlow.addColorStop(1, "transparent");
        ctx.fillStyle = skyGlow;
        ctx.fillRect(0, 0, width, horizon);

        offset = (offset + 0.8) % 30;

        ctx.strokeStyle = "rgba(236, 72, 153, 0.65)";
        ctx.lineWidth = 1.2;

        for (let y = horizon; y < height; y += (y - horizon) * 0.22 + 4) {
          const drawY = y + (offset * ((y - horizon) / (height - horizon)));
          if (drawY > horizon && drawY < height) {
            ctx.beginPath();
            ctx.moveTo(0, drawY);
            ctx.lineTo(width, drawY);
            ctx.stroke();
          }
        }

        const vanishingX = width / 2;
        for (let x = -width; x <= width * 2; x += 55) {
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        animationId = requestAnimationFrame(renderSynthwave);
      };
      renderSynthwave();
    }

    // ==========================================
    // 6. AMBIENT AURA GLOW
    // ==========================================
    else if (type === 'aura') {
      let t = 0;
      const renderAura = () => {
        ctx.fillStyle = "#090a0f";
        ctx.fillRect(0, 0, width, height);

        t += 0.01;

        const orbs = [
          { x: width * 0.3 + Math.sin(t) * 100, y: height * 0.3 + Math.cos(t * 0.8) * 80, r: 240, color: "rgba(168, 85, 247, 0.28)" },
          { x: width * 0.7 + Math.cos(t * 1.2) * 120, y: height * 0.6 + Math.sin(t) * 90, r: 280, color: "rgba(59, 130, 246, 0.25)" },
          { x: width * 0.5 + Math.sin(t * 0.7) * 80, y: height * 0.8 + Math.cos(t * 1.1) * 70, r: 220, color: "rgba(74, 222, 128, 0.22)" },
        ];

        for (const orb of orbs) {
          const g = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.r);
          g.addColorStop(0, orb.color);
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
          ctx.fill();
        }

        animationId = requestAnimationFrame(renderAura);
      };
      renderAura();
    }

    // ==========================================
    // 7. CYBER RAIN
    // ==========================================
    else if (type === 'cyber_rain') {
      const drops = Array.from({ length: 120 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 20 + 15,
        speed: Math.random() * 12 + 14,
        opacity: Math.random() * 0.5 + 0.3,
      }));

      interface Ripple {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        opacity: number;
      }
      const ripples: Ripple[] = [];

      const renderCyberRain = () => {
        ctx.fillStyle = "rgba(5, 10, 18, 0.3)";
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 1.2;
        for (const d of drops) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${d.opacity})`;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2, d.y + d.length);
          ctx.stroke();

          d.y += d.speed;
          d.x -= 1;

          if (d.y > height) {
            if (Math.random() > 0.6) {
              ripples.push({
                x: d.x,
                y: height - Math.random() * 40,
                radius: 1,
                maxRadius: Math.random() * 16 + 8,
                opacity: 0.6,
              });
            }
            d.y = -d.length;
            d.x = Math.random() * (width + 100);
          }
        }

        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          ctx.strokeStyle = `rgba(56, 189, 248, ${r.opacity})`;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();

          r.radius += 0.8;
          r.opacity -= 0.025;

          if (r.opacity <= 0 || r.radius >= r.maxRadius) {
            ripples.splice(i, 1);
          }
        }

        animationId = requestAnimationFrame(renderCyberRain);
      };
      renderCyberRain();
    }

    // ==========================================
    // 8. GALAXY SPIRAL
    // ==========================================
    else if (type === 'galaxy_spiral') {
      const starCount = 350;
      const galaxyStars = Array.from({ length: starCount }, () => {
        const arm = Math.floor(Math.random() * 3);
        const dist = Math.random();
        return {
          arm,
          dist,
          angleOffset: (arm * (2 * Math.PI / 3)) + dist * 3.5 + (Math.random() - 0.5) * 0.4,
          radius: dist * (Math.min(width, height) * 0.48),
          size: Math.random() * 2 + 0.8,
          color: dist < 0.3 ? "#fef08a" : dist < 0.7 ? "#c084fc" : "#60a5fa",
        };
      });

      let rotation = 0;

      const renderGalaxy = () => {
        ctx.fillStyle = "rgba(3, 4, 10, 0.2)";
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        rotation += 0.003;

        const coreGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 70);
        coreGlow.addColorStop(0, "rgba(253, 224, 71, 0.45)");
        coreGlow.addColorStop(0.5, "rgba(192, 132, 252, 0.2)");
        coreGlow.addColorStop(1, "transparent");
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.fill();

        for (const s of galaxyStars) {
          const theta = s.angleOffset + rotation;
          const x = cx + Math.cos(theta) * s.radius;
          const y = cy + Math.sin(theta) * (s.radius * 0.75);

          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        animationId = requestAnimationFrame(renderGalaxy);
      };
      renderGalaxy();
    }

    // ==========================================
    // 9. CYBER WAVES
    // ==========================================
    else if (type === 'cyber_waves') {
      let step = 0;

      const renderWaves = () => {
        ctx.fillStyle = "rgba(7, 10, 19, 0.25)";
        ctx.fillRect(0, 0, width, height);

        step += 0.02;

        const lines = [
          { color: "rgba(74, 222, 128, 0.5)", freq: 0.006, amp: 55, yOffset: height * 0.5, speed: 1 },
          { color: "rgba(56, 189, 248, 0.5)", freq: 0.008, amp: 70, yOffset: height * 0.55, speed: 1.3 },
          { color: "rgba(168, 85, 247, 0.5)", freq: 0.005, amp: 60, yOffset: height * 0.45, speed: 0.8 },
          { color: "rgba(244, 114, 182, 0.45)", freq: 0.007, amp: 45, yOffset: height * 0.6, speed: 1.1 },
        ];

        for (const line of lines) {
          ctx.strokeStyle = line.color;
          ctx.lineWidth = 2;
          ctx.beginPath();

          for (let x = 0; x <= width; x += 8) {
            const y = line.yOffset + Math.sin(x * line.freq + step * line.speed) * line.amp + Math.cos(x * 0.003 + step) * 20;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        animationId = requestAnimationFrame(renderWaves);
      };
      renderWaves();
    }

    // ==========================================
    // 10. RETRO TERMINAL GLITCH
    // ==========================================
    else if (type === 'retro_terminal') {
      const logs = [
        "> INITIALIZING_CORE_SYSTEM...",
        "> LOAD_MODULE [AUTH_OK]",
        "> VERIFYING_SIGNATURE: 0x7FA29",
        "> CONNECTED TO NEURAL_NET",
        "> BYPASSING_PROXY_GATEWAY...",
        "> STATUS: ENCRYPTED_OK",
        "> RUNNING_SYSTEM_DIAGNOSTICS",
        "> 100% COMPLETE. ACCESS_GRANTED",
      ];
      let lineIndex = 0;
      let charIndex = 0;
      let lastTime = 0;
      const displayedLines: string[] = ["> ROOT@POHONLINK:~#"];

      const renderTerminal = (time: number) => {
        ctx.fillStyle = "#050a05";
        ctx.fillRect(0, 0, width, height);

        if (time - lastTime > 60) {
          lastTime = time;
          if (lineIndex < logs.length) {
            const currentTarget = logs[lineIndex];
            if (charIndex < currentTarget.length) {
              charIndex += 2;
              displayedLines[displayedLines.length - 1] = currentTarget.slice(0, charIndex);
            } else {
              lineIndex++;
              charIndex = 0;
              if (displayedLines.length > 14) displayedLines.shift();
              if (lineIndex < logs.length) displayedLines.push("");
            }
          } else {
            lineIndex = 0;
            charIndex = 0;
            displayedLines.length = 0;
            displayedLines.push("> RE-SYNCING_NEURAL_KERNEL...");
          }
        }

        ctx.font = '13px "Courier New", monospace';
        ctx.fillStyle = "#22c55e";

        let startY = 60;
        for (const line of displayedLines) {
          ctx.fillText(line, 24, startY);
          startY += 24;
        }

        if (Math.floor(time / 400) % 2 === 0) {
          ctx.fillRect(24 + (displayedLines[displayedLines.length - 1]?.length || 0) * 7.8, startY - 24 - 11, 8, 14);
        }

        ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }

        animationId = requestAnimationFrame(renderTerminal);
      };
      animationId = requestAnimationFrame(renderTerminal);
    }

    // ==========================================
    // 11. NEON EMBERS
    // ==========================================
    else if (type === 'neon_embers') {
      const emberColors = ["#f97316", "#fbbf24", "#ef4444", "#f43f5e", "#a855f7"];
      const embers = Array.from({ length: 65 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 1.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.6,
        opacity: Math.random() * 0.7 + 0.3,
        color: emberColors[Math.floor(Math.random() * emberColors.length)],
        pulse: Math.random() * Math.PI,
      }));

      const renderEmbers = () => {
        ctx.fillStyle = "rgba(10, 5, 12, 0.25)";
        ctx.fillRect(0, 0, width, height);

        for (const e of embers) {
          e.y -= e.speedY;
          e.x += e.speedX + Math.sin(e.pulse) * 0.5;
          e.pulse += 0.03;

          if (e.y < -10) {
            e.y = height + 10;
            e.x = Math.random() * width;
          }

          const currentOpacity = e.opacity * (0.6 + 0.4 * Math.sin(e.pulse));
          ctx.fillStyle = e.color;
          ctx.globalAlpha = currentOpacity;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.globalAlpha = currentOpacity * 0.2;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        animationId = requestAnimationFrame(renderEmbers);
      };
      renderEmbers();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
