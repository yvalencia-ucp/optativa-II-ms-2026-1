(function () {
  // Si abres desde Live Server (puerto 5500) la API sigue en 3000
  const API_BASE =
    window.location.port === "3000" ? "" : "http://localhost:3000";

  const $form = document.getElementById("form-add");
  const $input = document.getElementById("input-title");
  const $list = document.getElementById("tasks-list");
  const $empty = document.getElementById("empty-state");
  const $error = document.getElementById("error-state");
  const $status = document.getElementById("api-status");

  function setStatus(ok, text) {
    $status.classList.remove("online", "offline");
    $status.classList.add(ok ? "online" : "offline");
    $status.querySelector(".status-text").textContent = text;
  }

  async function checkHealth() {
    try {
      const res = await fetch(API_BASE + "/health");
      const data = await res.json();
      if (data.status === "ok") {
        setStatus(true, "Sistema en línea");
      } else {
        setStatus(false, "API con errores");
      }
    } catch (_e) {
      setStatus(false, "Sin conexión");
    }
  }

  async function loadTodos() {
    hideError();
    try {
      const res = await fetch(API_BASE + "/todos");
      if (!res.ok) throw new Error("Error al cargar");
      const tasks = await res.json();
      renderList(Array.isArray(tasks) ? tasks : []);
    } catch (e) {
      showError("No se pudieron cargar las tareas. Revisa que la API esté en marcha.");
      renderList([]);
    }
  }

  function renderList(tasks) {
    $list.innerHTML = "";
    $empty.hidden = tasks.length > 0;

    tasks.forEach(function (task) {
      const li = document.createElement("li");
      li.className = "task-item" + (task.done ? " done" : "");
      li.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.done;
      checkbox.setAttribute("aria-label", "Marcar como " + (task.done ? "pendiente" : "hecha"));

      const title = document.createElement("span");
      title.className = "task-title";
      title.textContent = task.title || "(sin título)";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "task-delete";
      delBtn.setAttribute("aria-label", "Eliminar tarea");
      delBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';

      checkbox.addEventListener("change", function () {
        toggleDone(task.id, checkbox.checked);
      });
      delBtn.addEventListener("click", function () {
        deleteTodo(task.id, li);
      });

      li.appendChild(checkbox);
      li.appendChild(title);
      li.appendChild(delBtn);
      $list.appendChild(li);
    });
  }

  async function toggleDone(id, done) {
    try {
      const res = await fetch(API_BASE + "/todos/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: done }),
      });
      if (!res.ok) throw new Error();
      const task = await res.json();
      const li = $list.querySelector('[data-id="' + task.id + '"]');
      if (li) li.classList.toggle("done", task.done);
    } catch (_e) {
      loadTodos();
    }
  }

  async function deleteTodo(id, li) {
    try {
      const res = await fetch(API_BASE + "/todos/" + id, { method: "DELETE" });
      if (!res.ok) throw new Error();
      li.remove();
      if ($list.children.length === 0) $empty.hidden = false;
    } catch (_e) {
      loadTodos();
    }
  }

  function showError(msg) {
    $error.textContent = msg;
    $error.hidden = false;
    $empty.hidden = true;
  }

  function hideError() {
    $error.hidden = true;
    $error.textContent = "";
  }

  $form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const title = $input.value.trim();
    if (!title) return;

    const btn = $form.querySelector('button[type="submit"]');
    btn.disabled = true;
    hideError();

    try {
      const res = await fetch(API_BASE + "/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear");
      }
      const task = await res.json();
      $input.value = "";
      loadTodos();
    } catch (e) {
      showError(e.message || "No se pudo añadir la tarea.");
    } finally {
      btn.disabled = false;
    }
  });

  checkHealth();
  loadTodos();
})();
