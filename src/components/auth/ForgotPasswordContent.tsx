"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Send, ArrowLeft, Loader2, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "email" | "phone";
type State = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordContent() {
  const [tab, setTab] = useState<Tab>("email");
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setState("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: value.trim() }),
      });
      const data = await res.json();
      setMessage(data.message ?? "E-mail envoyé.");
      setDevUrl(data.devResetUrl ?? null);
      setState("success");
    } catch {
      setMessage("Une erreur est survenue. Veuillez réessayer.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setValue("");
    setMessage("");
    setDevUrl(null);
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
      {state === "success" ? (
        /* ── Success state ── */
        <div className="px-10 py-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-black text-primary">E-mail envoyé !</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{message}</p>

          {/* Dev helper: show reset URL */}
          {devUrl && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mt-2">
              <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-black">DEV</span>
                Lien de réinitialisation (visible en développement uniquement)
              </p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] text-amber-800 break-all flex-1 leading-relaxed">{devUrl}</code>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => navigator.clipboard.writeText(devUrl)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                    title="Copier"
                  >
                    <Copy size={14} className="text-amber-700" />
                  </button>
                  <a href={devUrl} className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors" title="Ouvrir">
                    <ExternalLink size={14} className="text-amber-700" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={reset}
              className="text-sm text-primary font-semibold hover:underline"
            >
              Renvoyer le lien
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} />
              Retour à la connexion
            </button>
          </div>
        </div>
      ) : (
        /* ── Form state ── */
        <div className="px-10 py-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-7">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <Mail size={22} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black text-primary">Réinitialiser votre mot de passe</h2>
            <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
              Saisissez l&apos;adresse e-mail ou le numéro de téléphone utilisé lors de votre inscription.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {(["email", "phone"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setValue(""); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-semibold transition-colors",
                  tab === t
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {t === "email" ? <Mail size={15} /> : <Phone size={15} />}
                {t === "email" ? "Par e-mail" : "Par téléphone"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                {tab === "email" ? (
                  <>Adresse e-mail <span className="text-red-500">*</span></>
                ) : (
                  <>Numéro de téléphone <span className="text-red-500">*</span></>
                )}
              </label>
              <div className="relative">
                {tab === "email" ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                ) : (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
                <input
                  type={tab === "email" ? "email" : "tel"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={tab === "email" ? "Entrez votre adresse e-mail" : "+241 XX XX XX XX"}
                  required
                  disabled={state === "loading"}
                  className="w-full pl-10 pr-4 h-12 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            {state === "error" && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "loading" || !value.trim()}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {state === "loading" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {state === "loading" ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-12 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={15} />
              Retour à la connexion
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
