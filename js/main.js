'use strict';

/* ─── Loader ─── */
(() => {
  const dismiss = () => document.body.classList.add('ready');
  if (document.readyState === 'complete') setTimeout(dismiss, 900);
  else window.addEventListener('load', () => setTimeout(dismiss, 900));
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

/* ─── Service card mouse glow ─── */
(() => {
  if (!matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll('.scard').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();

/* ─── Magnetic buttons ─── */
(() => {
  if (!matchMedia('(pointer:fine)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * .18;
      const dy = (e.clientY - (r.top  + r.height / 2)) * .18;
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
