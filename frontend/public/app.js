// Frontend sencillo en JavaScript puro que consume la API a través de Nginx.
const list = document.getElementById('list');
const form = document.getElementById('form');
const input = document.getElementById('title');
const statusBadge = document.getElementById('status');
const counter = document.getElementById('counter');

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

async function checkHealth() {
  try {
    await api('/health');
    statusBadge.textContent = 'API + BD conectadas';
    statusBadge.className = 'badge ok';
  } catch {
    statusBadge.textContent = 'API no disponible';
    statusBadge.className = 'badge err';
  }
}

function render(tasks) {
  const done = tasks.filter((t) => t.done).length;
  counter.textContent = tasks.length
    ? `${done} de ${tasks.length} tareas completadas`
    : 'No hay tareas todavía';
  list.innerHTML = '';
  for (const task of tasks) {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = task.done;
    check.onchange = () => api(`/tasks/${task.id}`, {
      method: 'PATCH', body: JSON.stringify({ done: check.checked }),
    }).then(load);

    const span = document.createElement('span');
    span.textContent = task.title; // textContent evita inyección de HTML (XSS)

    const del = document.createElement('button');
    del.textContent = '✕';
    del.className = 'del';
    del.onclick = () => api(`/tasks/${task.id}`, { method: 'DELETE' }).then(load);

    li.append(check, span, del);
    list.append(li);
  }
}

async function load() {
  try {
    render(await api('/tasks'));
  } catch (err) {
    console.error(err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await api('/tasks', { method: 'POST', body: JSON.stringify({ title }) });
  input.value = '';
  load();
});

checkHealth();
load();
