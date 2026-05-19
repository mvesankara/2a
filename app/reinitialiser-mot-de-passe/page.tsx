"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

type PageState = "validating" | "valid" | "invalid" | "submitting" | "success";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-400", "bg-amber-400", "bg-green-400"];
  const labels = ["Faible", "Moyen", "Fort"];

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full transition-colors", i < score ? colors[score - 1] : "bg-gray-200")}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(({ label, ok }) => (
            <span key={label} className={`text-[11px] flex items-center gap-1 ${ok ? "text-green-500" : "text-gray-400"}`}>
              {ok ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />}
              {label}
            </span>
          ))}
        </div>
        {score > 0 && <span className={`text-[11px] font-semibold ${colors[score - 1].replace("bg-", "text-")}`}>{labels[score - 1]}</span>}
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-[#F8F7F2]">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      </div>
    }>
      <ResetPasswordConfirmContent />
    </Suspense>
  );
}

function ResetPasswordConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [pageState, setPageState] = useState<PageState>("validating");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) { setPageState("invalid"); setErrorMsg("Lien manquant ou invalide."); return; }

    fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setMaskedEmail(data.maskedEmail ?? "");
          setPageState("valid");
        } else {
          setErrorMsg(data.error ?? "Lien invalide ou expiré.");
          setPageState("invalid");
        }
      })
      .catch(() => { setErrorMsg("Erreur de validation. Réessayez."); setPageState("invalid"); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setErrorMsg("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 8) { setErrorMsg("Le mot de passe doit contenir au moins 8 caractères."); return; }

    setErrorMsg("");
    setPageState("submitting");

    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPageState("success");
      } else {
        setErrorMsg(data.error ?? "Une erreur est survenue.");
        setPageState("valid");
      }
    } catch {
      setErrorMsg("Impossible de se connecter au serveur.");
      setPageState("valid");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F2]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Validating */}
          {pageState === "validating" && (
            <div className="p-12 flex flex-col items-center gap-4">
              <Loader2 size={36} className="text-primary animate-spin" />
              <p className="text-gray-500 text-sm">Vérification du lien…</p>
            </div>
          )}

          {/* Invalid token */}
          {pageState === "invalid" && (
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h2 className="text-xl font-black text-primary">Lien invalide</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{errorMsg}</p>
              <Link
                href="/mot-de-passe-oublie"
                className="mt-2 w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                Faire une nouvelle demande
              </Link>
              <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors">
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </div>
          )}

          {/* Success */}
          {pageState === "success" && (
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-black text-primary">Mot de passe mis à jour !</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button
                onClick={() => router.replace("/login")}
                className="mt-2 w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}

          {/* Form */}
          {(pageState === "valid" || pageState === "submitting") && (
            <div className="px-10 py-10">
              <div className="flex flex-col items-center gap-2 mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                  <Lock size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-black text-primary">Nouveau mot de passe</h2>
                {maskedEmail && (
                  <p className="text-sm text-gray-500 text-center">
                    Pour le compte <strong>{maskedEmail}</strong>
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Nouveau mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                      placeholder="Choisissez un mot de passe"
                      required
                      minLength={8}
                      disabled={pageState === "submitting"}
                      className="w-full pl-10 pr-12 h-12 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
                      placeholder="Répétez votre mot de passe"
                      required
                      disabled={pageState === "submitting"}
                      className={cn(
                        "w-full pl-10 pr-12 h-12 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60",
                        confirm && password !== confirm ? "border-red-300" : "border-gray-200"
                      )}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pageState === "submitting" || !password || !confirm}
                  className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {pageState === "submitting" && <Loader2 size={16} className="animate-spin" />}
                  {pageState === "submitting" ? "Mise à jour…" : "Réinitialiser le mot de passe"}
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
