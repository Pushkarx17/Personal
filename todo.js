const STORAGE_KEY = "pushkar-todo-items";
const TOKEN_KEY = "pushkar-todo-token";
const API_URL = "/api/todos";

let items = [];
let syncState = "loading"; // loading | synced | offline | auth
let pushTimer = null;

/* ----- local cache ----- */

function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      items = parsed.filter((it) => it && typeof it.text === "string");
    }
  } catch {
    items = [];
  }
}

function saveCache() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ----- server sync ----- */

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setSyncState(state) {
  syncState = state;
  const authForm = document.getElementById("todo-auth");
  authForm.hidden = state !== "auth";
  updateStatus();
}

async function pullFromServer() {
  const token = getToken();
  if (!token) {
    setSyncState("auth");
    return;
  }
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      setSyncState("auth");
      return;
    }
    if (!res.ok) throw new Error(`http ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.items)) {
      items = data.items;
      saveCache();
      render();
    }
    setSyncState("synced");
  } catch {
    setSyncState("offline");
  }
}

function pushToServer() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const token = getToken();
    if (!token) {
      setSyncState("auth");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });
      if (res.status === 401) {
        setSyncState("auth");
        return;
      }
      if (!res.ok) throw new Error(`http ${res.status}`);
      setSyncState("synced");
    } catch {
      setSyncState("offline");
    }
  }, 300);
}

/* ----- rendering ----- */

function updateStatus() {
  const el = document.getElementById("todo-status");
  const suffix = {
    loading: " · syncing…",
    synced: " · synced",
    offline: " · offline, saved on this device",
    auth: " · enter sync token above",
  }[syncState];

  if (!items.length) {
    el.textContent = (syncState === "auth" ? "locked" : "no tasks. add one below.") + suffix;
    return;
  }
  const done = items.filter((it) => it.done).length;
  el.textContent = `${done}/${items.length} done${suffix}`;
}

function render() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (item.done ? " done" : "");

    const label = document.createElement("label");
    label.className = "todo-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      items[index].done = checkbox.checked;
      saveCache();
      render();
      pushToServer();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = item.text;

    label.appendChild(checkbox);
    label.appendChild(text);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-delete";
    del.textContent = "×";
    del.setAttribute("aria-label", `delete "${item.text}"`);
    del.addEventListener("click", () => {
      items.splice(index, 1);
      saveCache();
      render();
      pushToServer();
    });

    li.appendChild(label);
    li.appendChild(del);
    list.appendChild(li);
  });

  updateStatus();
}

/* ----- init ----- */

document.addEventListener("DOMContentLoaded", () => {
  loadCache();
  render();
  pullFromServer();

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    items.push({ text, done: false });
    saveCache();
    render();
    pushToServer();
    input.value = "";
    input.focus();
  });

  const authForm = document.getElementById("todo-auth");
  const tokenInput = document.getElementById("todo-token");

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    tokenInput.value = "";
    setSyncState("loading");
    pullFromServer();
  });
});
