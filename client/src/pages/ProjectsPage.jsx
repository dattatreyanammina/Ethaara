import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [addMemberMap, setAddMemberMap] = useState({});
  const [members, setMembers] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects().catch(() => setError("Failed to load projects"));
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const memberIds = members
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await api.post("/projects", {
        ...form,
        members: memberIds
      });

      setForm({ title: "", description: "" });
      setMembers("");
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to create project");
    }
  };

  const onAddMember = async (projectId) => {
    const memberId = addMemberMap[projectId];
    if (!memberId) return;
    try {
      await api.patch(`/projects/${projectId}/members`, { action: "add", memberId });
      await fetchProjects();
      setAddMemberMap((m) => ({ ...m, [projectId]: "" }));
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to add member");
    }
  };

  const onRemoveMember = async (projectId, memberId) => {
    try {
      await api.patch(`/projects/${projectId}/members`, { action: "remove", memberId });
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to remove member");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-stone-900">Projects</h1>
        <p className="mt-1 text-sm text-stone-600">Manage project scope and team members.</p>
      </div>

      {user?.role === "admin" && (
        <form className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" onSubmit={onCreate}>
          <h2 className="font-semibold text-stone-900">Create Project</h2>
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
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
          <input
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            placeholder="Member IDs (comma separated)"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
          />
          <button className="rounded-xl bg-stone-900 px-4 py-2 text-white" type="submit">
            Create Project
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project._id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-stone-900">{project.title}</h3>
            <p className="mt-1 text-sm text-stone-600">{project.description || "No description"}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-stone-500">Members: {project.members?.length || 0}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {project.members?.map((m) => (
                <li key={m._id} className="flex items-center justify-between">
                  <span>{m.name} <span className="text-xs text-stone-500">({m.email})</span></span>
                  {user?.role === "admin" && (
                    <button className="ml-3 rounded px-2 py-1 text-xs text-rose-600" onClick={() => onRemoveMember(project._id, m._id)}>Remove</button>
                  )}
                </li>
              ))}
            </ul>

            {user?.role === "admin" && (
              <div className="mt-3 flex gap-2">
                <input
                  placeholder="Member ID"
                  className="flex-1 rounded-xl border border-stone-300 px-3 py-2"
                  value={addMemberMap[project._id] || ""}
                  onChange={(e) => setAddMemberMap((m) => ({ ...m, [project._id]: e.target.value }))}
                />
                <button className="rounded-xl bg-amber-700 px-3 py-2 text-white" onClick={() => onAddMember(project._id)}>Add</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
