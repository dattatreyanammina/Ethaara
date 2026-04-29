import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const emptyProjectForm = { title: "", description: "" };

const ProjectsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [createForm, setCreateForm] = useState(emptyProjectForm);
  const [createMembers, setCreateMembers] = useState([]);
  const [memberSelections, setMemberSelections] = useState({});
  const [editForms, setEditForms] = useState({});
  const [editingProjectId, setEditingProjectId] = useState("");
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    const { data } = await api.get("/users");
    setUsers(data);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchProjects(), fetchUsers()]);
    };

    load().catch(() => setError("Failed to load projects"));
  }, [isAdmin]);

  const availableMembers = (project) => {
    const memberIds = new Set((project.members || []).map((member) => member._id));
    return users.filter((member) => !memberIds.has(member._id));
  };

  const onCreate = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/projects", {
        ...createForm,
        members: createMembers
      });

      setCreateForm(emptyProjectForm);
      setCreateMembers([]);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to create project");
    }
  };

  const startEditing = (project) => {
    setEditingProjectId(project._id);
    setEditForms((current) => ({
      ...current,
      [project._id]: {
        title: project.title || "",
        description: project.description || ""
      }
    }));
  };

  const cancelEditing = () => {
    setEditingProjectId("");
  };

  const saveProject = async (projectId) => {
    setError("");

    try {
      const form = editForms[projectId];
      await api.put(`/projects/${projectId}`, form);
      setEditingProjectId("");
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to update project");
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Delete this project and its tasks?")) return;

    setError("");

    try {
      await api.delete(`/projects/${projectId}`);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete project");
    }
  };

  const onAddMember = async (projectId) => {
    const memberId = memberSelections[projectId];
    if (!memberId) return;

    try {
      await api.patch(`/projects/${projectId}/members`, { action: "add", memberId });
      setMemberSelections((current) => ({ ...current, [projectId]: "" }));
      await fetchProjects();
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
        <p className="mt-1 text-sm text-stone-600">
          {isAdmin ? "Manage all projects, edit details, and assign members by name." : "View the projects you have been assigned to."}
        </p>
      </div>

      {isAdmin && (
        <form className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm" onSubmit={onCreate}>
          <h2 className="font-semibold text-stone-900">Create Project</h2>
          <input
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            placeholder="Title"
            value={createForm.title}
            onChange={(e) => setCreateForm((current) => ({ ...current, title: e.target.value }))}
            required
          />
          <textarea
            className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
            placeholder="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((current) => ({ ...current, description: e.target.value }))}
            rows={3}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Members</label>
            <select
              multiple
              className="min-h-36 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
              value={createMembers}
              onChange={(event) => setCreateMembers(Array.from(event.target.selectedOptions, (option) => option.value))}
            >
              {users.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email}) - {member.role} - {member._id}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-stone-500">Hold Ctrl or Cmd to select multiple users.</p>
          </div>
          <button className="rounded-xl bg-stone-900 px-4 py-2 text-white" type="submit">
            Create Project
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const editing = editingProjectId === project._id;
          const memberOptions = availableMembers(project);

          return (
            <article key={project._id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
                        value={editForms[project._id]?.title || ""}
                        onChange={(event) =>
                          setEditForms((current) => ({
                            ...current,
                            [project._id]: { ...current[project._id], title: event.target.value }
                          }))
                        }
                      />
                      <textarea
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
                        rows={3}
                        value={editForms[project._id]?.description || ""}
                        onChange={(event) =>
                          setEditForms((current) => ({
                            ...current,
                            [project._id]: { ...current[project._id], description: event.target.value }
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-stone-900">{project.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">{project.description || "No description"}</p>
                    </>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      <>
                        <button className="rounded-xl bg-stone-900 px-3 py-2 text-sm text-white" type="button" onClick={() => saveProject(project._id)}>
                          Save
                        </button>
                        <button className="rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-700" type="button" onClick={cancelEditing}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-700" type="button" onClick={() => startEditing(project)}>
                        Edit
                      </button>
                    )}
                    <button className="rounded-xl bg-rose-600 px-3 py-2 text-sm text-white" type="button" onClick={() => deleteProject(project._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs uppercase tracking-wide text-stone-500">Members: {project.members?.length || 0}</p>
              <div className="mt-3 space-y-2 text-sm">
                {project.members?.map((member) => (
                  <div key={member._id} className="flex flex-col gap-1 rounded-xl border border-stone-100 bg-stone-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-stone-900">
                        {member.name} <span className="text-xs text-stone-500">({member.email})</span>
                      </p>
                      <p className="text-xs text-stone-500">ID: {member._id}</p>
                    </div>
                    {isAdmin && (
                      <button className="self-start rounded px-2 py-1 text-xs text-rose-600" type="button" onClick={() => onRemoveMember(project._id, member._id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <select
                    className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-amber-500"
                    value={memberSelections[project._id] || ""}
                    onChange={(event) => setMemberSelections((current) => ({ ...current, [project._id]: event.target.value }))}
                  >
                    <option value="">Add a member</option>
                    {memberOptions.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email}) - {member._id}
                      </option>
                    ))}
                  </select>
                  <button className="shrink-0 rounded-xl bg-amber-700 px-3 py-2 text-white" type="button" onClick={() => onAddMember(project._id)}>
                    Add
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {!projects.length && <p className="text-sm text-stone-600">No projects found.</p>}
    </div>
  );
};

export default ProjectsPage;