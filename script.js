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

  // Only wire up the scramble where a mouse can hover. On touch,
  // `mouseenter` fires on tap and garbles the label as you navigate away.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".scramble").forEach(scrambleOnHover);
  }
});
