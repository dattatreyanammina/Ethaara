import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import SignupPage from "./pages/SignupPage";
import TasksPage from "./pages/TasksPage";

const Shell = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f7f3ee]">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-700">Ethara</p>
            <p className="font-['Space_Grotesk'] text-xl font-bold text-stone-900">Team Task Manager</p>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link className={`rounded-lg px-3 py-1.5 ${location.pathname === "/dashboard" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-200"}`} to="/dashboard">Dashboard</Link>
            <Link className={`rounded-lg px-3 py-1.5 ${location.pathname === "/projects" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-200"}`} to="/projects">Projects</Link>
            <Link className={`rounded-lg px-3 py-1.5 ${location.pathname === "/tasks" ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-200"}`} to="/tasks">Tasks</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs uppercase tracking-wider text-stone-500 sm:inline">{user?.role}</span>
            <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100" onClick={logout} type="button">Logout</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<Shell />} />
      </Route>
    </Routes>
  );
}

export default App;
