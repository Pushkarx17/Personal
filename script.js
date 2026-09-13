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
        interval = null;
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
  const born = { m: 0, d: 14 }; // 14 jan 2004
  const bornYear = 2004;
  const now = new Date();

  let years = now.getFullYear() - bornYear;
  let lastBirthday = new Date(now.getFullYear(), born.m, born.d);
  if (now < lastBirthday) {
    years -= 1;
    lastBirthday = new Date(now.getFullYear() - 1, born.m, born.d);
  }

  // Compare calendar days, not elapsed ms — otherwise the BST/GMT switch
  // knocks the count an hour short and the day flips a day late.
  const midnight = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((midnight(now) - midnight(lastBirthday)) / 86400000);

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  el.textContent = days
    ? `${plural(years, "year")}, ${plural(days, "day")}`
    : plural(years, "year");
}

document.addEventListener("DOMContentLoaded", () => {
  updateUptime();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Only wire up the scramble where a real pointer can hover. On touch,
  // `mouseenter` fires on tap and garbles the label as you navigate away.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".scramble").forEach(scrambleOnHover);
  }

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
