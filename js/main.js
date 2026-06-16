'use strict';

/* ─── Loader ─── */
(() => {
  const dismiss = () => document.body.classList.add('ready');
  if (document.readyState === 'complete') setTimeout(dismiss, 1600);
  else window.addEventListener('load', () => setTimeout(dismiss, 1600));
})();

/* ─── Progress bar ─── */
(() => {
  const bar = document.getElementById('progress');
  const update = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = total > 0 ? `${(scrollY / total) * 100}%` : '0%';
  };
  addEventListener('scroll', update, { passive: true });
})();

/* ─── Navbar ─── */
(() => {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('navmenu');

  const close = () => {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  };

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', scrollY > 16);
    if (menu.classList.contains('open')) close();
  }, { passive: true });
})();

/* ─── Active nav + sidenav ─── */
(() => {
  const navLinks = [...document.querySelectorAll('.nav__link')];
  const sideBtns = [...document.querySelectorAll('.sidenav__btn')];
  const sections = [...document.querySelectorAll('main section[id]')];

  const activate = id => {
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.s === id));
    sideBtns.forEach(b => b.classList.toggle('active', b.dataset.t === id));
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) activate(e.target.id); });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(s => obs.observe(s));

  sideBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.t)?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ─── Scroll reveal ─── */
(() => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = `${e.target.dataset.delay ?? 0}ms`;
      e.target.classList.add('show');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.r').forEach(el => observer.observe(el));
})();

/* ─── Animated counters ─── */
(() => {
  const run = el => {
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix ?? '';
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 1800, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } });
  }, { threshold: .5 });

  document.querySelectorAll('.stat__n[data-target]').forEach(el => obs.observe(el));
})();

/* ─── Hero canvas — neural network ─── */
(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  const R      = '0,212,161';
  const DIST   = 145;
  const N_NODES = 65;

  let W, H, nodes = [], pulses = [], mouse = { x: -999, y: -999 }, raf;

  const resize = () => {
    const el = canvas.parentElement;
    W = canvas.width  = el.offsetWidth;
    H = canvas.height = el.offsetHeight;
    nodes = Array.from({ length: N_NODES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      r:  Math.random() * 1.5 + 1.2,
    }));
  };

  const spawnPulse = () => {
    const i = Math.floor(Math.random() * nodes.length);
    const a = nodes[i];
    for (const b of nodes) {
      if (b === a) continue;
      const dx = a.x - b.x, dy = a.y - b.y;
      if (Math.hypot(dx, dy) < DIST) { pulses.push({ a, b, t: 0 }); break; }
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
      const md  = Math.hypot(mdx, mdy);
      if (md < 130) { n.vx += (mdx / md) * .6; n.vy += (mdy / md) * .6; }
      n.vx *= .975; n.vy *= .975;
      n.x  += n.vx; n.y  += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < DIST) {
          const alpha = (1 - d / DIST) * .25;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${R},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R},.05)`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${R},.9)`;
      ctx.fill();
    });

    pulses = pulses.filter(p => p.t < 1);
    pulses.forEach(p => {
      p.t += .015;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 10);
      grd.addColorStop(0, `rgba(${R},1)`);
      grd.addColorStop(1, `rgba(${R},0)`);
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    if (Math.random() < .035) spawnPulse();
    raf = requestAnimationFrame(draw);
  };

  const onMouseMove = e => {
    const r  = canvas.getBoundingClientRect();
    mouse.x  = e.clientX - r.left;
    mouse.y  = e.clientY - r.top;
  };

  resize();
  draw();

  canvas.addEventListener('mousemove',  onMouseMove, { passive: true });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });
  addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); draw(); });
})();

/* ─── Hero name scramble ─── */
(() => {
  const el = document.getElementById('heroName');
  if (!el) return;

  const CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const target = el.textContent;
  let frame    = 0;

  const update = () => {
    el.textContent = target.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      return i < frame ? target[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    frame += target.length / 16;
    if (frame < target.length) requestAnimationFrame(update);
    else el.textContent = target;
  };

  setTimeout(update, 1400);
})();

/* ─── Typewriter ─── */
(() => {
  const el = document.getElementById('heroTw');
  if (!el) return;

  const phrases = [
    'Landing Pages de alto impacto',
    'Chatbots de WhatsApp con IA',
    'Automatizaciones con n8n',
    'Claude API + Twilio',
  ];
  let pi = 0, ci = 0, del = false;

  const tick = () => {
    const cur = phrases[pi];
    el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    let ms = del ? 38 : 80;
    if (!del && ci === cur.length)  { ms = 2200; del = true; }
    else if (del && ci === 0)       { del = false; pi = (pi + 1) % phrases.length; ms = 380; }
    setTimeout(tick, ms);
  };

  setTimeout(tick, 2300);
})();

/* ─── Terminal typing ─── */
(() => {
  const body   = document.getElementById('termBody');
  const cursor = document.getElementById('termCursor');
  if (!body || !cursor) return;

  const lines = [
    `<span class="t-kw">const</span> <span class="t-var">dev</span> = {`,
    `  <span class="t-var">name</span>: <span class="t-str">'Juan Sebastián Henao'</span>,`,
    `  <span class="t-var">age</span>: <span class="t-num">18</span>,`,
    `  <span class="t-var">city</span>: <span class="t-str">'Medellín 🇨🇴'</span>,`,
    `  <span class="t-var">study</span>: <span class="t-str">'EAFIT · Sistemas'</span>,`,
    `  <span class="t-var">stack</span>: [<span class="t-str">'Web'</span>, <span class="t-str">'IA'</span>, <span class="t-str">'n8n'</span>],`,
    `  <span class="t-var">available</span>: <span class="t-fn">true</span>,`,
    `};`,
    ``,
    `<span class="t-cm">// ejecutar proyecto</span>`,
    `dev<span class="t-fn">.build</span>(<span class="t-str">'tu negocio'</span>);`,
    `<span class="t-ok">✓ Landing page deployed!</span>`,
  ];

  let lineIdx = 0;

  const showNext = () => {
    if (lineIdx >= lines.length) { cursor.style.display = 'none'; return; }

    const span = document.createElement('span');
    span.className = 'terminal__line';
    span.innerHTML = lines[lineIdx] || '&nbsp;';
    body.insertBefore(span, cursor);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => span.classList.add('visible'));
    });

    lineIdx++;
    setTimeout(showNext, lines[lineIdx - 1] ? 120 : 60);
  };

  setTimeout(showNext, 1800);
})();

/* ─── Service card mouse glow ─── */
(() => {
  document.querySelectorAll('.scard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();

/* ─── Portfolio 3-D tilt ─── */
(() => {
  if (!matchMedia('(pointer:fine)').matches) return;

  document.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)  / r.width;
      const y = (e.clientY - r.top)   / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 9}deg) rotateY(${(x - .5) * 9}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ─── Magnetic buttons ─── */
(() => {
  if (!matchMedia('(pointer:fine)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * .27;
      const dy = (e.clientY - (r.top  + r.height / 2)) * .27;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ─── Process line ─── */
(() => {
  const line = document.getElementById('procLine');
  if (!line) return;

  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { line.classList.add('drawn'); obs.unobserve(e.target); }
    });
  }, { threshold: .4 }).observe(line.closest('section') ?? line);
})();

/* ─── Copy email ─── */
(() => {
  const btn = document.getElementById('copyEmail');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('juansebastian9117@gmail.com');
      btn.setAttribute('data-ok', '');
      setTimeout(() => btn.removeAttribute('data-ok'), 2200);
    } catch {}
  });
})();
