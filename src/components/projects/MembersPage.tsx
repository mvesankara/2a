"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Download, UserPlus, ChevronLeft, ChevronRight,
  MoreHorizontal, Mail, X, Users, Star, User, UserCheck,
  Shield, AlertCircle, ChevronDown
} from "lucide-react";
import { getToken } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type MemberRole = "Chef de projet" | "Responsable" | "Membre";
type MemberStatus = "actif" | "inactif";

interface MemberProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string | null;
}

interface Member {
  id: string;
  profileId: string;
  role: string | null;
  team: string | null;
  status: string;
  createdAt: string;
  profile: MemberProfile;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  specialty: string | null;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  chefDeProjet: number;
  responsable: number;
  membre: number;
  pendingInvitations: number;
}

interface ApiResponse {
  members: Member[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: Stats;
  project: { id: string; name: string; status: string };
  teams: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "Chef de projet": { label: "Chef de projet", color: "text-indigo-700", bg: "bg-indigo-50" },
  "Responsable":    { label: "Responsable",    color: "text-amber-700",  bg: "bg-amber-50"  },
  "Membre":         { label: "Membre",          color: "text-gray-600",   bg: "bg-gray-100"  },
};

const STATUS_PROJECT: Record<string, { label: string; color: string; bg: string }> = {
  en_cours: { label: "Actif",     color: "text-green-700", bg: "bg-green-50" },
  en_revue: { label: "En revue",  color: "text-blue-700",  bg: "bg-blue-50"  },
  cloture:  { label: "Clôturé",   color: "text-gray-500",  bg: "bg-gray-100" },
};

const DONUT_COLORS = ["#4F46E5", "#F59E0B", "#1A4D4F"];

function fullName(p: MemberProfile) {
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || "Membre";
}

function initials(p: MemberProfile) {
  return [p.firstName?.[0], p.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "M";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

async function apiFetch(path: string, opts?: RequestInit) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error ?? "Erreur");
  }
  return res.json();
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  if (total === 0) return (
    <div className="w-24 h-24 rounded-full border-[10px] border-gray-100 flex items-center justify-center">
      <span className="text-xs text-gray-400">Aucun</span>
    </div>
  );
  let cum = 0;
  const segments = data.map(d => {
    const pct = (d.count / total) * 100;
    const start = cum; cum += pct;
    return { ...d, pct, start };
  });
  const gradient = segments.map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`).join(", ");
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <div className="w-24 h-24 rounded-full" style={{ background: `conic-gradient(${gradient})` }} />
      <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
        <span className="text-base font-bold text-gray-800">{total}</span>
        <span className="text-[9px] text-gray-400 leading-tight">Total</span>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 9 }: { profile: MemberProfile; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden`;
  return (
    <div className={cls}>
      {profile.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={profile.avatarUrl} alt={fullName(profile)} className="w-full h-full object-cover" />
        : <span className="text-primary text-xs font-bold">{initials(profile)}</span>
      }
    </div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({
  open, onClose, projectId, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}) {
  const [email, setEmail]         = useState("");
  const [role, setRole]           = useState<MemberRole>("Membre");
  const [specialty, setSpecialty] = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await apiFetch(`/projects/${projectId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ email, role, specialty: specialty || undefined }),
      });
      setEmail(""); setRole("Membre"); setSpecialty("");
      onSuccess(); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Inviter un membre</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-sm text-red-600">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse e-mail *</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="membre@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Rôle</label>
            <select value={role} onChange={e => setRole(e.target.value as MemberRole)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="Membre">Membre</option>
              <option value="Responsable">Responsable</option>
              <option value="Chef de projet">Chef de projet</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Spécialité / Note (optionnel)</label>
            <input
              type="text" value={specialty} onChange={e => setSpecialty(e.target.value)}
              placeholder="ex: Expert technique, Designer…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Mail size={14} />}
              Envoyer l&apos;invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Member Modal ────────────────────────────────────────────────────────
function EditMemberModal({
  member, projectId, onClose, onSuccess, teams,
}: {
  member: Member;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
  teams: string[];
}) {
  const [role, setRole]     = useState<MemberRole>((member.role as MemberRole) ?? "Membre");
  const [team, setTeam]     = useState(member.team ?? "");
  const [status, setStatus] = useState<MemberStatus>((member.status as MemberStatus) ?? "actif");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await apiFetch(`/projects/${projectId}/members/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role, team: team || null, status }),
      });
      onSuccess(); onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Modifier le membre</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
            <Avatar profile={member.profile} />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{fullName(member.profile)}</p>
              <p className="text-xs text-gray-400">{member.profile.email}</p>
            </div>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</div>}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Rôle</label>
            <select value={role} onChange={e => setRole(e.target.value as MemberRole)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="Membre">Membre</option>
              <option value="Responsable">Responsable</option>
              <option value="Chef de projet">Chef de projet</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Équipe / Département</label>
            <input
              list="teams-list" value={team} onChange={e => setTeam(e.target.value)}
              placeholder="ex: Coordination, Finance…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <datalist id="teams-list">
              {teams.map(t => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Statut</label>
            <select value={status} onChange={e => setStatus(e.target.value as MemberStatus)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl">Annuler</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MembersPage({
  projectId, projectName, projectStatus, currentProfileId,
}: {
  projectId: string;
  projectName: string;
  projectStatus: string;
  currentProfileId: string;
}) {
  const [tab, setTab]           = useState<"all" | "role" | "invitations">("all");
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("");
  const [statusFilter, setStatus] = useState("");
  const [teamFilter, setTeam]   = useState("");
  const [page, setPage]         = useState(1);
  const [inviteOpen, setInviteOpen]   = useState(false);
  const [editMember, setEditMember]   = useState<Member | null>(null);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);

  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["members", projectId] });

  const queryKey = useMemo(
    () => ["members", projectId, tab, search, roleFilter, statusFilter, teamFilter, page],
    [projectId, tab, search, roleFilter, statusFilter, teamFilter, page]
  );

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey,
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), limit: "10" });
      if (search)      p.set("search", search);
      if (roleFilter)  p.set("role", roleFilter);
      if (statusFilter) p.set("status", statusFilter);
      if (teamFilter)  p.set("team", teamFilter);
      return apiFetch(`/projects/${projectId}/members?${p}`);
    },
    placeholderData: prev => prev,
  });

  const { data: invitations = [] } = useQuery<Invitation[]>({
    queryKey: ["invitations", projectId],
    queryFn: () => apiFetch(`/projects/${projectId}/invitations`),
  });

  const deleteMutation = useMutation({
    mutationFn: (memberId: string) =>
      apiFetch(`/projects/${projectId}/members/${memberId}`, { method: "DELETE" }),
    onSuccess: () => { invalidate(); setOpenMenu(null); },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (invId: string) =>
      apiFetch(`/projects/${projectId}/invitations/${invId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations", projectId] }),
  });

  const stats   = data?.stats;
  const members = data?.members ?? [];
  const pagination = data?.pagination;
  const teams   = data?.teams ?? [];

  const projStatusCfg = STATUS_PROJECT[projectStatus] ?? STATUS_PROJECT.en_cours;

  const donutData = stats ? [
    { label: "Chef de projet", count: stats.chefDeProjet, color: DONUT_COLORS[0] },
    { label: "Responsable",    count: stats.responsable,  color: DONUT_COLORS[1] },
    { label: "Membre",         count: stats.membre,       color: DONUT_COLORS[2] },
  ].filter(d => d.count > 0) : [];

  // Role distribution percentages
  const totalForPct = stats ? (stats.chefDeProjet + stats.responsable + stats.membre) : 0;

  return (
    <div className="flex gap-6 min-h-0">
      {/* ── Main ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">Participants du projet</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${projStatusCfg.bg} ${projStatusCfg.color}`}>
                {projStatusCfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Gérez les membres de l&apos;équipe projet et leurs rôles.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={15} /> Exporter
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <UserPlus size={15} /> Inviter des membres
            </button>
          </div>
        </div>

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Membres au total",        value: stats.total,            Icon: Users,     color: "text-primary",    bg: "bg-primary/5"  },
              { label: "Chefs de projet",          value: stats.chefDeProjet,     Icon: Shield,    color: "text-indigo-700", bg: "bg-indigo-50"  },
              { label: "Responsables",             value: stats.responsable,      Icon: Star,      color: "text-amber-700",  bg: "bg-amber-50"   },
              { label: "Membres",                  value: stats.membre,           Icon: User,      color: "text-gray-700",   bg: "bg-gray-50"    },
              { label: "Invitations en attente",   value: stats.pendingInvitations, Icon: UserCheck, color: "text-purple-700", bg: "bg-purple-50"  },
            ].map(c => (
              <div key={c.label} className={`${c.bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl ${c.bg} border border-current/10 flex items-center justify-center flex-shrink-0`}>
                  <c.Icon size={18} className={c.color} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-[11px] text-gray-500 leading-tight">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex gap-6">
            {[
              { id: "all",         label: "Tous les membres" },
              { id: "role",        label: "Par rôle" },
              { id: "invitations", label: `Invitations en attente${stats && stats.pendingInvitations > 0 ? ` (${stats.pendingInvitations})` : ""}` },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Tab: Tous les membres ─── */}
        {tab === "all" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text" placeholder="Rechercher un membre..."
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
                />
              </div>
              {[
                { label: "Rôle", value: roleFilter, onChange: setRole, options: [
                  { v: "", l: "Tous les rôles" },
                  { v: "Chef de projet", l: "Chef de projet" },
                  { v: "Responsable", l: "Responsable" },
                  { v: "Membre", l: "Membre" },
                ]},
                { label: "Statut", value: statusFilter, onChange: setStatus, options: [
                  { v: "", l: "Tous les statuts" },
                  { v: "actif", l: "Actif" },
                  { v: "inactif", l: "Inactif" },
                ]},
                { label: "Équipe", value: teamFilter, onChange: setTeam, options: [
                  { v: "", l: "Toutes les équipes" },
                  ...teams.map(t => ({ v: t, l: t })),
                ]},
              ].map(f => (
                <div key={f.label} className="relative">
                  <select
                    value={f.value}
                    onChange={e => { f.onChange(e.target.value); setPage(1); }}
                    className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white cursor-pointer"
                  >
                    {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Users size={36} className="mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Aucun membre trouvé</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Membre</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Équipe / Département</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Statut</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date d&apos;ajout</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {members.map(m => {
                        const rc  = ROLE_CONFIG[m.role ?? "Membre"] ?? ROLE_CONFIG["Membre"];
                        const isMe = m.profileId === currentProfileId;

                        return (
                          <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                            {/* Membre */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar profile={m.profile} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800">{fullName(m.profile)}</span>
                                    {isMe && (
                                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">Vous</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400">{m.profile.email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Rôle */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${rc.bg} ${rc.color}`}>
                                {m.role ?? "Membre"}
                              </span>
                            </td>
                            {/* Équipe */}
                            <td className="py-3.5 px-4 hidden md:table-cell">
                              <span className="text-sm text-gray-600">{m.team ?? "—"}</span>
                            </td>
                            {/* Statut */}
                            <td className="py-3.5 px-4 hidden sm:table-cell">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                m.status === "actif" ? "text-green-700" : "text-gray-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${m.status === "actif" ? "bg-green-500" : "bg-gray-300"}`} />
                                {m.status === "actif" ? "Actif" : "Inactif"}
                              </span>
                            </td>
                            {/* Date */}
                            <td className="py-3.5 px-4 text-sm text-gray-500 hidden lg:table-cell">
                              {formatDate(m.createdAt)}
                            </td>
                            {/* Actions */}
                            <td className="py-3.5 px-4">
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <MoreHorizontal size={15} />
                                </button>
                                {openMenu === m.id && (
                                  <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-40">
                                    <button
                                      onClick={() => { setEditMember(m); setOpenMenu(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <User size={13} /> Modifier le rôle
                                    </button>
                                    {!isMe && (
                                      <button
                                        onClick={() => { if (confirm(`Retirer ${fullName(m.profile)} du projet ?`)) deleteMutation.mutate(m.id); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <X size={13} /> Retirer du projet
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Affichage de {((page - 1) * pagination.limit) + 1} à {Math.min(page * pagination.limit, pagination.total)} sur {pagination.total} membres
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === page ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                </div>
                <select value={pagination.limit}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-600 focus:outline-none bg-white">
                  <option value="10">Par page 10</option>
                  <option value="20">Par page 20</option>
                </select>
              </div>
            )}
            {pagination && pagination.pages <= 1 && pagination.total > 0 && (
              <p className="text-sm text-gray-400">
                Affichage de 1 à {pagination.total} sur {pagination.total} membres
              </p>
            )}
          </>
        )}

        {/* ─── Tab: Par rôle ─── */}
        {tab === "role" && stats && (
          <div className="space-y-4">
            {(["Chef de projet", "Responsable", "Membre"] as const).map(r => {
              const rc = ROLE_CONFIG[r];
              const roleMembers = members.filter(m => m.role === r);
              // fetch all members for role view
              return (
                <div key={r} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`flex items-center justify-between px-5 py-3 border-b border-gray-50 ${rc.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${rc.color.replace("text-", "bg-")}`} />
                      <span className={`text-sm font-semibold ${rc.color}`}>{r}</span>
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {r === "Chef de projet" ? stats.chefDeProjet : r === "Responsable" ? stats.responsable : stats.membre} membre(s)
                    </span>
                  </div>
                  {roleMembers.length === 0 ? (
                    <p className="text-sm text-gray-400 px-5 py-4">Aucun membre dans cette catégorie affiché — utilisez le filtre dans l&apos;onglet &quot;Tous les membres&quot;</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {roleMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                          <Avatar profile={m.profile} size={8} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{fullName(m.profile)}</p>
                            <p className="text-xs text-gray-400">{m.team ?? m.profile.email}</p>
                          </div>
                          <span className={`text-xs font-medium ${m.status === "actif" ? "text-green-600" : "text-gray-400"}`}>
                            {m.status === "actif" ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <p className="text-xs text-gray-400 text-center">Affichage basé sur la page courante. Utilisez l&apos;onglet &quot;Tous les membres&quot; pour voir l&apos;équipe complète.</p>
          </div>
        )}

        {/* ─── Tab: Invitations ─── */}
        {tab === "invitations" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {invitations.filter(i => i.status === "pending").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Mail size={36} className="mb-3 text-gray-200" />
                <p className="font-medium text-gray-500">Aucune invitation en attente</p>
                <button onClick={() => setInviteOpen(true)}
                  className="mt-3 text-sm text-primary font-medium hover:underline">
                  Inviter un membre
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rôle</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Spécialité</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Invitée le</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invitations.filter(i => i.status === "pending").map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Mail size={13} className="text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-800">{inv.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_CONFIG[inv.role]?.bg ?? "bg-gray-100"} ${ROLE_CONFIG[inv.role]?.color ?? "text-gray-600"}`}>
                            {inv.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="text-sm text-gray-500">{inv.specialty ?? "—"}</span>
                        </td>
                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(inv.createdAt)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                            En attente
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => { if (confirm("Annuler cette invitation ?")) cancelInviteMutation.mutate(inv.id); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Annuler l'invitation"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <aside className="w-72 flex-shrink-0 space-y-4 hidden xl:flex xl:flex-col">
        {/* Répartition par rôle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Répartition par rôle</h3>
          {stats && (
            <div className="flex items-center gap-4">
              <DonutChart data={donutData} total={stats.total} />
              <div className="space-y-2 flex-1">
                {[
                  { label: "Chef de projet", count: stats.chefDeProjet, color: DONUT_COLORS[0] },
                  { label: "Responsable",    count: stats.responsable,  color: DONUT_COLORS[1] },
                  { label: "Membre",         count: stats.membre,       color: DONUT_COLORS[2] },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-gray-600 truncate">{d.label}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {d.count} ({totalForPct > 0 ? Math.round((d.count / totalForPct) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invitations en attente */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-800">
              Invitations en attente {stats && stats.pendingInvitations > 0 && (
                <span className="ml-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingInvitations}
                </span>
              )}
            </h3>
          </div>
          {invitations.filter(i => i.status === "pending").length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">Aucune invitation</p>
          ) : (
            <div className="space-y-3">
              {invitations.filter(i => i.status === "pending").slice(0, 3).map(inv => (
                <div key={inv.id} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={13} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{inv.email}</p>
                    {inv.specialty && <p className="text-[11px] text-gray-400 truncate">{inv.specialty}</p>}
                    <p className="text-[11px] text-gray-400 mt-0.5">Invitée le {formatDate(inv.createdAt)}</p>
                  </div>
                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full flex-shrink-0">
                    En attente
                  </span>
                </div>
              ))}
              {invitations.filter(i => i.status === "pending").length > 3 && (
                <button
                  onClick={() => setTab("invitations")}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-1"
                >
                  Voir toutes les invitations →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bon à savoir */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">Bon à savoir</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Les membres invités recevront un e-mail avec un lien pour rejoindre le projet.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectId={projectId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["invitations", projectId] });
          invalidate();
        }}
      />
      {editMember && (
        <EditMemberModal
          member={editMember}
          projectId={projectId}
          teams={teams}
          onClose={() => setEditMember(null)}
          onSuccess={invalidate}
        />
      )}

      {/* Close dropdowns on outside click */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
