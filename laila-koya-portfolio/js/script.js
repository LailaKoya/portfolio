/* ==========================================================================
   Laila Koya — Digital Portfolio
   script.js — background animation, nav behaviour, scroll reveals,
   typewriter effect, skill bars
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initRevealOnScroll();
  initSkillBars();
  initTypewriter();
  initNetworkBackground();
});

/* --------------------------------------------------------------------------
   Nav bar: solid background after scrolling, active link, mobile toggle
   -------------------------------------------------------------------------- */
function initNav() {
  const navWrap = document.querySelector('.nav-wrap');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (navWrap) {
    const onScroll = () => {
      navWrap.classList.toggle('scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }
}

/* --------------------------------------------------------------------------
   Reveal elements as they scroll into view
   -------------------------------------------------------------------------- */
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

/* --------------------------------------------------------------------------
   Animate skill progress bars once visible
   -------------------------------------------------------------------------- */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target.dataset.level || '0';
          entry.target.style.width = target + '%';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

/* --------------------------------------------------------------------------
   Typewriter effect for the hero role line
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const el = document.querySelector('[data-typewriter]');
  if (!el) return;

  const phrases = JSON.parse(el.dataset.typewriter);
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const span = document.createElement('span');
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  el.textContent = '';
  el.appendChild(span);
  el.appendChild(cursor);

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      span.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      span.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 35 : 65);
  }

  tick();
}

/* --------------------------------------------------------------------------
   Ambient background: slow-drifting network / circuit nodes.
   Subtle parallax response to mouse position and scroll — evokes a
   network topology diagram, tying back to the networking project.
   -------------------------------------------------------------------------- */
function initNetworkBackground() {
  const canvas = document.getElementById('net-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, nodes;
  let mouseX = 0.5, mouseY = 0.5;
  let scrollFactor = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.round((width * height) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    const parallaxX = (mouseX - 0.5) * 18;
    const parallaxY = (mouseY - 0.5) * 18 + scrollFactor * 0.02;

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(95, 224, 200, ${0.09 * (1 - dist / 140)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x + parallaxX, a.y + parallaxY);
          ctx.lineTo(b.x + parallaxX, b.y + parallaxY);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x + parallaxX, n.y + parallaxY, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(157, 140, 255, 0.35)';
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    scrollFactor = window.scrollY;
  }, { passive: true });

  resize();
  step(); // draws one frame; loops on its own via requestAnimationFrame unless reduced motion is on
}
