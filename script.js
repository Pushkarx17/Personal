const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function scrambleOnHover(el) {
  const original = el.textContent;
  let interval = null;

  el.addEventListener("mouseenter", () => {
    if (interval) clearInterval(interval);
    let pos = 0;
    interval = setInterval(() => {
      el.textContent = original
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < pos) return original[i];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      pos += 1;
      if (pos > original.length) {
        clearInterval(interval);
        el.textContent = original;
      }
    }, 28);
  });
}

function countUp(el) {
  const raw = el.textContent.trim();
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return;
  const target = parseInt(match[1], 10);
  const suffix = match[2];
  const duration = 1000;
  const start = performance.now();
  el.textContent = "0" + suffix;

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateUptime() {
  const el = document.getElementById("uptime");
  if (!el) return;
  const born = new Date(2004, 0, 14); // 14 jan 2004
  const now = new Date();

  let years = now.getFullYear() - born.getFullYear();
  let lastBirthday = new Date(now.getFullYear(), 0, 14);
  if (now < lastBirthday) {
    years -= 1;
    lastBirthday = new Date(now.getFullYear() - 1, 0, 14);
  }
  const days = Math.floor((now - lastBirthday) / 86400000);

  el.textContent = `${years} years, ${days} days`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateUptime();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".scramble").forEach(scrambleOnHover);

  const stats = document.querySelectorAll(".stat-num");
  if (stats.length && "IntersectionObserver" in window) {
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach((el) => observer.observe(el));
  }
});
