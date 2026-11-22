import React, { useState, useEffect } from "react";
import { fetchRepos, switchRepo, indexLocalRepo, cloneAndIndexGithub } from "../utils/api";
import type { RepoRegistry } from "../utils/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FolderPlus, RefreshCw, GitBranch, Play, AlertCircle, CheckCircle2, Loader2, Database, Sparkles } from "lucide-react";

interface RepoManagerProps {
  onRepoUpdated: () => void;
}

export const RepoManager: React.FC<RepoManagerProps> = ({ onRepoUpdated }) => {
  const [localPath, setLocalPath] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [repos, setRepos] = useState<RepoRegistry>({});
  const [activeRepo, setActiveRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [alert, setAlert] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const loadReposList = async () => {
    try {
      const data = await fetchRepos();
      setRepos(data);
      if (Object.keys(data).length > 0 && !activeRepo) {
        const firstKey = Object.keys(data)[0];
        setActiveRepo(data[firstKey]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReposList();
  }, []);

  const triggerAlert = (type: "success" | "error" | "info", message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 8000);
  };

  const handleIndexLocal = async () => {
    if (!localPath.trim()) {
      triggerAlert("error", "Please provide a valid local repository directory path.");
      return;
    }
    setLoading(true);
    setLoadingText("Parsing and indexing local codebase...");
    try {
      const res = await indexLocalRepo(localPath);
      triggerAlert("success", `✓ Indexed local repository successfully. Added ${res.chunks_added} chunks.`);
      setLocalPath("");
      loadReposList();
      onRepoUpdated();
    } catch (err: any) {
      triggerAlert("error", `Failed to index repository: ${err.message || err}`);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleResetLocal = async () => {
    if (!localPath.trim()) {
      triggerAlert("error", "Please provide a valid local repository directory path to reset.");
      return;
    }
    setLoading(true);
    setLoadingText("Re-indexing codebase cache...");
    try {
      const res = await switchRepo(localPath);
      triggerAlert("success", `✓ Re-indexed local repository successfully. Loaded ${res.chunks_added} chunks.`);
      loadReposList();
      onRepoUpdated();
    } catch (err: any) {
      triggerAlert("error", `Failed to reset repository: ${err.message || err}`);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleIndexGithub = async () => {
    if (!githubUrl.trim()) {
      triggerAlert("error", "Please provide a valid public GitHub repository URL.");
      return;
    }
    setLoading(true);
    setLoadingText("Cloning repository from GitHub and generating vector embeddings...");
    try {
      const res = await cloneAndIndexGithub(githubUrl);
      if (res.error) {
        triggerAlert("error", res.error);
      } else {
        triggerAlert("success", `✓ Cloned & indexed repository successfully! Added ${res.chunks_added} code chunks.`);
        setGithubUrl("");
        loadReposList();
        onRepoUpdated();
      }
    } catch (err: any) {
      triggerAlert("error", `Failed to clone and index GitHub repo: ${err.message || err}`);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleSwitchRepo = async () => {
    if (!activeRepo) {
      triggerAlert("error", "Please select a repository from the list to activate.");
      return;
    }
    setLoading(true);
    setLoadingText("Switching active repository context...");
    try {
      const res = await switchRepo(activeRepo);
      triggerAlert("success", `✓ Switched active repository context. Loaded ${res.chunks_added} chunks into memory.`);
      onRepoUpdated();
    } catch (err: any) {
      triggerAlert("error", `Failed to switch repository: ${err.message || err}`);
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 w-full max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="shrink-0 flex flex-col gap-1.5 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
          <Database size={22} className="text-cyan-400" />
          Codebase & Repository Management
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Index GitHub or local codebases to power DevPilot AI's hybrid RAG search (FAISS + BM25) and multi-agent developer workflows.
        </p>
      </div>

      {/* Progress / Status Alerts */}
      {loading && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-sm shadow-lg">
          <Loader2 size={18} className="animate-spin text-cyan-400 shrink-0" />
          <span className="font-medium">{loadingText}</span>
        </div>
      )}

      {alert && (
        <div
          className={`shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm shadow-lg transition-all ${
            alert.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
              : alert.type === "error"
              ? "border-rose-500/40 bg-rose-950/30 text-rose-300"
              : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* CARD 1: GitHub Repository (Recommended for Cloud Deployments) */}
      <Card className="border border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>
            <GitBranch size={18} className="text-cyan-400" />
            GitHub Repository
            <span className="ml-auto text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Cloud Ready
            </span>
          </CardTitle>
          <CardDescription>
            Provide any public Git repository URL to clone, extract AST code chunks, and build vector embeddings automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              className="h-11 font-mono text-xs bg-zinc-950/90 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500"
              placeholder="https://github.com/username/repository"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={loading}
            />
            <Button
              className="h-11 px-6 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold shadow-lg shadow-cyan-500/20 shrink-0"
              onClick={handleIndexGithub}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />}
              Clone & Index
            </Button>
          </div>

          {/* Quick preset suggestion buttons */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[11px] text-zinc-500">Quick fill:</span>
            <button
              type="button"
              onClick={() => setGithubUrl("https://github.com/tarunyadav1230/Devpilot-ai")}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-600/60 rounded px-2 py-0.5 transition-colors"
            >
              tarunyadav1230/Devpilot-ai
            </button>
            <button
              type="button"
              onClick={() => setGithubUrl("https://github.com/fastapi/fastapi")}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded px-2 py-0.5 transition-colors"
            >
              fastapi/fastapi
            </button>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Local Workspace Repository */}
      <Card className="border border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>
            <FolderPlus size={18} className="text-cyan-400" />
            Local Workspace Directory
          </CardTitle>
          <CardDescription>
            Provide the local filesystem workspace directory path to index codebase structures on this server or machine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            className="h-11 font-mono text-xs bg-zinc-950/90 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500"
            placeholder="C:\Users\username\Desktop\my-project  or  /workspace/my-project"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            disabled={loading}
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              className="h-10 flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold shadow-lg shadow-cyan-500/20"
              onClick={handleIndexLocal}
              disabled={loading}
            >
              <FolderPlus size={15} className="mr-2" />
              Index Local Repository
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1 border-zinc-800 hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100"
              onClick={handleResetLocal}
              disabled={loading}
            >
              <RefreshCw size={15} className="mr-2" />
              Re-Index / Reset Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: Switch Active Cached Repository */}
      <Card className="border border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>
            <Play size={18} className="text-cyan-400" />
            Switch Active Codebase Context
          </CardTitle>
          <CardDescription>
            Select between previously parsed and indexed codebases to switch active RAG retrieval context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(repos).length > 0 ? (
            <div className="flex flex-col gap-4">
              <Select value={activeRepo} onValueChange={(val) => setActiveRepo(val || "")} disabled={loading}>
                <SelectTrigger className="w-full h-11 bg-zinc-950/90 border-zinc-800 text-zinc-200 focus:border-cyan-500">
                  <SelectValue placeholder="Select indexed repository..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-2xl">
                  {Object.keys(repos).map((name) => (
                    <SelectItem key={name} value={repos[name]} className="focus:bg-zinc-800 focus:text-zinc-100">
                      <span className="font-bold text-cyan-400">{name}</span>
                      <span className="text-xs text-zinc-400 ml-2">({repos[name]})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="h-11 w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold shadow-lg shadow-cyan-500/20"
                onClick={handleSwitchRepo}
                disabled={loading}
              >
                <Play size={16} className="mr-2 fill-current" />
                Activate Selected Repository
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-zinc-400 border border-dashed border-zinc-800/80 bg-zinc-950/30 p-4 rounded-xl">
              <Database size={18} className="text-zinc-500 shrink-0" />
              <span>No repositories indexed yet. Enter a GitHub repository URL or a local path above to get started.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
