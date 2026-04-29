import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/dashboard/summary");
      setSummary(data);
    };

    load().catch(() => {});
  }, []);

  const cards = [
    { label: "Total", value: summary.totalTasks, tone: "from-orange-200 to-orange-50" },
    { label: "Completed", value: summary.completedTasks, tone: "from-emerald-200 to-emerald-50" },
    { label: "Pending", value: summary.pendingTasks, tone: "from-amber-200 to-amber-50" },
    { label: "Overdue", value: summary.overdueTasks, tone: "from-rose-200 to-rose-50" }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 p-6 text-white shadow-xl">
        <p className="text-sm text-amber-100">Logged in as {user?.role}</p>
        <h1 className="mt-1 font-['Space_Grotesk'] text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-amber-50/90">Track outcomes, keep your team focused, and close tasks before due dates.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className={`rounded-2xl border border-stone-200 bg-gradient-to-b p-4 shadow-sm ${card.tone}`}>
            <p className="text-xs uppercase tracking-wider text-stone-600">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-stone-900">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Tasks by Status</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Todo: {summary.tasksByStatus?.['todo'] || 0}</li>
            <li>In Progress: {summary.tasksByStatus?.['in-progress'] || 0}</li>
            <li>Done: {summary.tasksByStatus?.['done'] || 0}</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Tasks per User</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {summary.tasksPerUser?.length ? summary.tasksPerUser.map((u) => (
              <li key={u.userId}>{u.name}: {u.count}</li>
            )) : <li>No assignments yet</li>}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md" to="/projects">
          <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-stone-900">Projects</h2>
          <p className="mt-2 text-sm text-stone-600">Create and manage team projects with members.</p>
        </Link>
        <Link className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md" to="/tasks">
          <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-stone-900">Task Board</h2>
          <p className="mt-2 text-sm text-stone-600">Assign tasks, update status, and monitor deadlines.</p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
