import React, { useEffect, useMemo, useState, useCallback } from "react";

// Yaparak öğren serisi — Proje 3: Custom Hook (useLocalStorage) & Refactor
// Kavramlar: custom hook, yeniden kullanılabilir state, klavye kısayolları, küçük UX cilaları

/********************
 *  useLocalStorage  *
 ********************/
function useLocalStorage(key, initialValue) {
  const init = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch {}
    return typeof initialValue === "function" ? initialValue() : initialValue;
  }, [key, initialValue]);

  const [state, setState] = useState(init);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setState(typeof initialValue === "function" ? initialValue() : initialValue);
  }, [initialValue, key]);

  return [state, setState, clear];
}

/********************
 *  UI Yardımcıları  *
 ********************/
function Icon({ name, className = "w-5 h-5" }) {
  const paths = {
    sun: (
      <path stroke="currentColor" strokeWidth="1.5" d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.657-6.343 1.414-1.414M4.93 19.071l1.414-1.414m0-10.314L4.93 4.93m13.142 13.142-1.414-1.414M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" fill="none" />
    ),
    moon: (
      <path stroke="currentColor" strokeWidth="1.5" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="none" />
    ),
    plus: <path stroke="currentColor" strokeWidth="1.5" d="M12 5v14m7-7H5" fill="none" />,
    trash: (
      <path stroke="currentColor" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m3 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-9 0h10" fill="none" />
    ),
    check: <path stroke="currentColor" strokeWidth="1.5" d="M5 13l4 4L19 7" fill="none" />,
    minus: <path stroke="currentColor" strokeWidth="1.5" d="M5 12h14" fill="none" />,
    filter: <path stroke="currentColor" strokeWidth="1.5" d="M3 5h18M6 12h12M10 19h4" fill="none" />,
    refresh: (
      <path stroke="currentColor" strokeWidth="1.5" d="M4 4v6h6M20 20v-6h-6M20 10A8 8 0 1 0 9.17 3.17M4 14A8 8 0 0 0 14.83 20" fill="none" />
    ),
    reset: (
      <path stroke="currentColor" strokeWidth="1.5" d="M12 5v14m7-7H5" fill="none" />
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {paths[name]}
    </svg>
  );
}

function Button({ onClick, children, type = "button", className = "", title }) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      className={
        "px-3 py-2 rounded-2xl shadow text-sm font-medium transition active:scale-[.98] " +
        "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 " +
        className
      }
    >
      {children}
    </button>
  );
}

/********************
 *   Küçük Bileşenler *
 ********************/
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="p-4 rounded-2xl border bg-white/80 dark:bg-gray-900/60 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs opacity-70">Sayaç</p>
          <p className="text-3xl font-semibold">{count}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCount((c) => Math.max(0, c - 1))}>
            <span className="inline-flex items-center gap-1"><Icon name="minus" />Azalt</span>
          </Button>
          <Button onClick={() => setCount((c) => c + 1)}>
            <span className="inline-flex items-center gap-1"><Icon name="plus" />Arttır</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onRemove }) {
  return (
    <li className="group flex items-center gap-3 justify-between p-2 rounded-xl border hover:shadow-sm bg-white/80 dark:bg-gray-900/60">
      <label className="flex items-center gap-3 flex-1 cursor-pointer">
        <input
          type="checkbox"
          className="size-4 accent-black dark:accent-white"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          aria-label={`${task.text} görevini ${task.done ? "geri al" : "tamamla"}`}
        />
        <span className={`text-sm ${task.done ? "line-through opacity-60" : ""}`}>
          {task.text}
        </span>
      </label>
      <button
        onClick={() => onRemove(task.id)}
        className="opacity-0 group-hover:opacity-100 transition px-2 py-1 text-xs rounded-lg bg-red-600 text-white"
        title="Sil"
        aria-label={`${task.text} görevini sil`}
      >
        <span className="inline-flex items-center gap-1"><Icon name="trash" className="w-4 h-4"/>Sil</span>
      </button>
    </li>
  );
}

function StatsBar({ total, done }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-2 opacity-70">
        <span>Toplam: {total} • Tamamlanan: {done} • Bekleyen: {total - done}</span>
        <span>%{pct} tamamlandı</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gray-900 dark:bg-white" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FilterTabs({ value, onChange, counts }) {
  const tabs = [
    { id: "all", label: `Tümü (${counts.all})` },
    { id: "active", label: `Aktif (${counts.active})` },
    { id: "done", label: `Tamamlanan (${counts.done})` },
  ];
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1 opacity-70"><Icon name="filter" />Filtre:</span>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-xl border transition ${
            value === t.id
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          aria-pressed={value === t.id}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TaskList({ tasks, onToggle, onRemove }) {
  if (tasks.length === 0) {
    return <p className="text-sm opacity-60">Bu filtrede görev yok.</p>;
  }
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}

/********************
 *      App         *
 ********************/
export default function App() {
  // Tema ve görevleri artık custom hook ile yönetiyoruz
  const [dark, setDark] = useLocalStorage("rbdo_theme_v1", true);
  const [tasks, setTasks, resetTasks] = useLocalStorage("rbdo_tasks_v3", []);

  const theme = dark ? "dark bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900";

  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done
  const [helper, setHelper] = useState(""); // küçük uyarılar için

  const counts = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const active = total - done;
    return { total, done, active, all: total };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.done);
    if (filter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }, [tasks, filter]);

  function addTask(e, asDone = false) {
    if (e) e.preventDefault();
    const value = text.trim();
    if (value.length < 3) {
      setHelper("En az 3 karakter gir.");
      return;
    }
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    setTasks((prev) => [{ id, text: value, done: !!asDone }, ...prev]);
    setText("");
    setHelper("");
  }

  function onKeyDownInput(e) {
    if (e.key === "Enter" && e.altKey) {
      // Alt+Enter: tamamlanmış olarak ekle
      addTask(null, true);
    }
  }

  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  function toggleAll() {
    const allDone = tasks.length > 0 && tasks.every((t) => t.done);
    setTasks((prev) => prev.map((t) => ({ ...t, done: !allDone })));
  }

  return (
    <div className={"min-h-screen transition-colors " + theme}>
      <div className="max-w-2xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">React — Yaparak Öğren • Proje 3</h1>
            <p className="text-sm opacity-70">Custom Hook (useLocalStorage) & Refactor + Kısayollar</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setDark((d) => !d)} className="!bg-transparent !text-current !shadow-none border" title="Tema değiştir">
              <span className="inline-flex items-center gap-2"><Icon name={dark ? "sun" : "moon"} />Tema</span>
            </Button>
            <Button onClick={resetTasks} className="bg-gray-700 hover:bg-gray-600 dark:bg-gray-200 dark:hover:bg-gray-100" title="Kayıtlı görevleri sıfırla">
              <span className="inline-flex items-center gap-2"><Icon name="refresh" />Sıfırla</span>
            </Button>
          </div>
        </header>

        <main className="space-y-6">
          <Counter />

          <section className="p-4 rounded-2xl border bg-white/80 dark:bg-gray-900/60 backdrop-blur space-y-4">
            <form onSubmit={(e) => addTask(e)} className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDownInput}
                placeholder="Görev ekle (Enter: ekle • Alt+Enter: tamamlanmış ekle)"
                className={`flex-1 px-3 py-2 rounded-xl border bg-white/80 dark:bg-gray-950/80 ${
                  text.trim().length > 0 && text.trim().length < 3 ? "border-red-400" : ""
                }`}
                aria-invalid={text.trim().length > 0 && text.trim().length < 3}
                aria-describedby="helper"
              />
              <Button type="submit">
                <span className="inline-flex items-center gap-1"><Icon name="plus"/>Ekle</span>
              </Button>
            </form>

            <div id="helper" className="text-xs text-red-500 min-h-4">{helper}</div>

            <StatsBar total={counts.total} done={counts.done} />

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <FilterTabs value={filter} onChange={setFilter} counts={counts} />
              <div className="flex items-center gap-2 ml-auto">
                <Button onClick={toggleAll} title="Hepsini tamamla / geri al">
                  <span className="inline-flex items-center gap-1"><Icon name="check"/>Tümü</span>
                </Button>
                <Button onClick={clearCompleted} title="Tamamlananları temizle" className="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400">
                  <span className="inline-flex items-center gap-1"><Icon name="trash"/>Temizle</span>
                </Button>
              </div>
            </div>

            <TaskList tasks={filteredTasks} onToggle={toggleTask} onRemove={removeTask} />
          </section>

          <section className="text-sm opacity-80 space-y-2">
            <p className="font-medium">Bu derste öğrendiklerimiz</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Yerleşik davranışları soyutlayan <b>custom hook</b>: <code>useLocalStorage</code>.</li>
              <li>Aynı hook’u hem <i>tema</i> hem <i>görevler</i> için tekrar kullanmak.</li>
              <li>Kullanılabilirlik: <b>Alt+Enter</b> ile tamamlanmış ekle, basit hatırlatıcı mesaj.</li>
              <li>Küçük refactor: bileşenleri net sorumluluklarla ayrıştırmak.</li>
            </ul>
          </section>
        </main>

        <footer className="mt-10 text-xs opacity-60">
          <p>Sonraki derste: <b>React Router</b> ile çok sayfa (Home / About / Tasks) ve URL tabanlı filtre.</p>
        </footer>
      </div>
    </div>
  );
}
