import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const statusOptions = ["todo", "in-progress", "done"];

const TasksPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    status: "todo",
    priority: "medium"
  });
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === projectId),
    [projects, projectId]
  );

  const loadProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
    if (!projectId && data.length > 0) {
      setProjectId(data[0]._id);
    }
  };

  const loadTasks = async (id) => {
    if (!id) return;
    const { data } = await api.get(`/tasks/${id}`);
    setTasks(data);
  };

  useEffect(() => {
    loadProjects().catch(() => setError("Failed to load projects"));
  }, []);

  useEffect(() => {
    loadTasks(projectId).catch(() => setError("Failed to load tasks"));
  }, [projectId]);

  const onCreateTask = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/tasks", {
        ...form,
        projectId
      });
      setForm({ title: "", description: "", assignedTo: "", dueDate: "", status: "todo" });
      await loadTasks(projectId);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to create task");
    }
  };

  const onUpdateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      await loadTasks(projectId);
    } catch {
      setError("Unable to update task status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-stone-900">Task Board</h1>
        <p className="mt-1 text-sm text-stone-600">Track status from todo to done.</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-medium text-stone-700">Project</label>
        <select
          className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        >
          {projects.map((project) => (
            <option key={project._id} value={project._id}>{project.title}</option>
          ))}
        </select>
      </div>

      {user?.role === "admin" && selectedProject && (
        <form className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" onSubmit={onCreateTask}>
          <h2 className="font-semibold text-stone-900">Create Task</h2>
          <input
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <textarea
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <input
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            placeholder="Assigned user ID"
            value={form.assignedTo}
            onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            required
          />
          <select
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            value={form.priority}
            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="rounded-xl bg-stone-900 px-4 py-2 text-white" type="submit">Create Task</button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article key={task._id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-stone-900">{task.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{task.description || "No description"}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-stone-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            <p className="mt-1 text-xs text-stone-500">Assigned to: {task.assignedTo?.name || "Unknown"}</p>
            <p className="mt-1 text-xs text-stone-500">Priority: <strong className="capitalize">{task.priority || 'medium'}</strong></p>
            <select
              className="mt-3 w-full rounded-lg border border-stone-300 px-2 py-2 text-sm"
              value={task.status}
              onChange={(e) => onUpdateStatus(task._id, e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
