"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SecurityTab() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggle = (f: keyof typeof show) => setShow((s) => ({ ...s, [f]: !s[f] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast({ title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (form.next.length < 8) {
      toast({ title: "Erreur", description: "Le nouveau mot de passe doit contenir au moins 8 caractères", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(form.current, form.next);
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      toast({ title: "Mot de passe mis à jour" });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Échec", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-10 pr-12 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg">
      <h3 className="text-base font-bold text-gray-800 mb-2">Changer le mot de passe</h3>
      <p className="text-sm text-gray-400 mb-6">Choisissez un mot de passe fort d&apos;au moins 8 caractères.</p>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5 text-sm text-green-700">
          <CheckCircle2 size={16} className="flex-shrink-0" />
          Mot de passe mis à jour avec succès.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["current", "next", "confirm"] as const).map((field) => {
          const labels = { current: "Mot de passe actuel", next: "Nouveau mot de passe", confirm: "Confirmer le nouveau mot de passe" };
          return (
            <div key={field}>
              <label className={labelCls}>{labels[field]}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={show[field] ? "text" : "password"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required
                  disabled={loading}
                  className={inputCls}
                />
                <button type="button" tabIndex={-1} onClick={() => toggle(field)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </div>
      </form>
    </div>
  );
}
