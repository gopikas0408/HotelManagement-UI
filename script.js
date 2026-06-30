const header = document.querySelector('.site-header');
const drawer = document.querySelector('.nav-drawer');
const navOverlay = document.querySelector('.nav-overlay');
const navToggle = document.querySelector('.nav-toggle');
const drawerClose = document.querySelector('.drawer-close');
const themeToggle = document.querySelector('.theme-toggle');
const toast = document.querySelector('.toast');
const scrollTop = document.querySelector('.scroll-top');

const storedTheme = localStorage.getItem('auris-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));

window.addEventListener('load', () => {
  document.querySelector('.loader').classList.add('done');
  window.lucide?.createIcons();
});

function setHeaderState() {
  const scrolled = window.scrollY > 20;
  header.classList.toggle('scrolled', scrolled);
  scrollTop.classList.toggle('show', window.scrollY > 600);
}

window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();

navToggle.addEventListener('click', () => {
  document.body.classList.add('nav-open');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  navToggle.setAttribute('aria-expanded', 'true');
});

drawerClose.addEventListener('click', closeDrawer);
navOverlay.addEventListener('click', closeDrawer);
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', closeDrawer);
});
document.querySelectorAll('.nav-actions a, .drawer-brand, .drawer-footer a').forEach(link => {
  link.addEventListener('click', closeDrawer);
});
document.querySelectorAll('.nav-actions button').forEach(button => {
  button.addEventListener('click', closeDrawer);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDrawer();
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  localStorage.setItem('auris-theme', nextTheme);
});

function closeDrawer() {
  document.body.classList.remove('nav-open');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  navToggle.setAttribute('aria-expanded', 'false');
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}

document.querySelectorAll('.nav-links a, .nav-actions button, .nav-actions a, .drawer-footer button, .drawer-footer a').forEach(item => {
  item.addEventListener('click', event => {
    const ripple = document.createElement('span');
    const rect = item.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    item.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });

sections.forEach(section => activeObserver.observe(section));

document.querySelectorAll('.filter-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('.filter-tabs .active').classList.remove('active');
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.room-card').forEach(card => {
      card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.type !== filter);
    });
  });
});

document.querySelectorAll('.food-tabs button, .payment-methods button').forEach(button => {
  button.addEventListener('click', () => {
    const group = button.parentElement;
    group.querySelector('.active')?.classList.remove('active');
    button.classList.add('active');
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelector('#searchForm').addEventListener('submit', event => {
  event.preventDefault();
  showToast('Luxury stays found for your dates.');
  document.querySelector('#hotels').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.book-room').forEach(button => {
  button.addEventListener('click', () => {
    showToast('Room added to booking summary.');
    document.querySelector('#booking').scrollIntoView({ behavior: 'smooth' });
  });
});

document.querySelectorAll('.add-food').forEach(button => {
  button.addEventListener('click', () => showToast('Dining item added to your room.'));
});

document.querySelector('#payButton').addEventListener('click', () => {
  showToast('Booking confirmed. Invoice is ready to download.');
});

scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('.qty').forEach(control => {
  const [minus, plus] = control.querySelectorAll('button');
  const value = control.querySelector('b');
  minus.addEventListener('click', () => {
    value.textContent = Math.max(1, Number(value.textContent) - 1);
  });
  plus.addEventListener('click', () => {
    value.textContent = Number(value.textContent) + 1;
  });
});

const counter = document.querySelector('.counter');
const counterObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  const target = Number(counter.dataset.count);
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / 1600, 1);
    counter.textContent = Math.floor(target * progress).toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  counterObserver.disconnect();
}, { threshold: 0.5 });
counterObserver.observe(counter);

document.querySelectorAll('.masonry img').forEach(image => {
  image.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `<button aria-label="Close gallery">&times;</button><img src="${image.src}" alt="${image.alt}">`;
    document.body.appendChild(overlay);
    overlay.querySelector('button').focus();
    overlay.addEventListener('click', () => overlay.remove());
  });
});

const style = document.createElement('style');
style.textContent = `
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 22px;
    background: rgba(8,17,31,.9);
  }
  .lightbox img {
    width: min(980px, 96vw);
    max-height: 86vh;
    border-radius: 18px;
    object-fit: contain;
  }
  .lightbox button {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: #0f172a;
    background: #d4af37;
    font-size: 1.7rem;
  }
`;
document.head.appendChild(style);
