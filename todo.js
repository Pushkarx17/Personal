const STORAGE_KEY = "pushkar-todo-items";

let items = [];

function loadItems() {
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

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function updateStatus() {
  const el = document.getElementById("todo-status");
  if (!items.length) {
    el.textContent = "no tasks. add one below.";
    return;
  }
  const done = items.filter((it) => it.done).length;
  el.textContent = `${done}/${items.length} done`;
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
      saveItems();
      render();
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
      saveItems();
      render();
    });

    li.appendChild(label);
    li.appendChild(del);
    list.appendChild(li);
  });

  updateStatus();
}

document.addEventListener("DOMContentLoaded", () => {
  loadItems();
  render();

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    items.push({ text, done: false });
    saveItems();
    render();
    input.value = "";
    input.focus();
  });
});
