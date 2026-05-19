"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Users2, PieChart, Bell, Leaf, Lock } from "lucide-react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import ResetPasswordForm from "./ResetPasswordForm";

type Mode = "login" | "signup" | "reset";

const features = [
  {
    Icon: Users2,
    title: "Collaborer facilement",
    desc: "Travaillez sur vos projets avec les membres de la communauté.",
  },
  {
    Icon: PieChart,
    title: "Suivre vos projets",
    desc: "Consultez l'avancement de vos projets et atteignez vos objectifs.",
  },
  {
    Icon: Bell,
    title: "Rester informé",
    desc: "Recevez les dernières actualités et notifications importantes.",
  },
  {
    Icon: Leaf,
    title: "Agir pour l'avenir",
    desc: "Contribuez à un impact positif et durable sur le terrain.",
  },
];

const cardMeta: Record<Mode, { title: string; desc: string }> = {
  login: {
    title: "Connexion",
    desc: "Entrez vos identifiants pour accéder à votre compte",
  },
  signup: {
    title: "Créer un compte",
    desc: "Rejoignez la communauté 2A dès aujourd'hui",
  },
  reset: {
    title: "Mot de passe oublié ?",
    desc: "Entrez votre e-mail pour recevoir un lien de réinitialisation",
  },
};

const SAFE_REDIRECT_PREFIXES = ["/dashboard", "/my-space", "/projets", "/actualites", "/evenements"];

function getSafeRedirect(param: string | null): string {
  if (!param) return "/dashboard";
  const isInternal = SAFE_REDIRECT_PREFIXES.some((p) => param.startsWith(p));
  return isInternal ? param : "/dashboard";
}

export default function LoginPageContent() {
  const [mode, setMode] = useState<Mode>("login");
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  useEffect(() => {
    if (user && !loading) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const { title, desc } = cardMeta[mode];

  return (
    <section className="relative flex-1 grid lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
      {/* ── Left panel: features ── */}
      <div className="relative flex flex-col justify-center px-8 md:px-16 py-20 bg-[#F8F7F2] overflow-hidden">
        <div className="relative z-10 max-w-md">
          <p className="text-accent font-bold text-lg mb-2">Bienvenue !</p>
          <h1 className="text-4xl font-black text-primary leading-tight mb-4">
            Connectez-vous<br />à votre espace
          </h1>
          <div className="w-14 h-1 bg-accent rounded mb-6" />
          <p className="text-gray-600 mb-10 leading-relaxed text-sm">
            Accédez à votre tableau de bord, gérez vos projets,
            collaborez avec d&apos;autres membres et participez à nos actions.
          </p>

          <ul className="space-y-6">
            {features.map(({ Icon, title: ftitle, desc: fdesc }) => (
              <li key={ftitle} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">{ftitle}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{fdesc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Geometric triangle decorations */}
        <div className="absolute bottom-0 left-0 pointer-events-none select-none">
          <svg width="220" height="180" viewBox="0 0 220 180" fill="none">
            <polygon points="0,180 110,0 220,180" fill="#1A4D4F" opacity="0.07" />
            <polygon points="0,180 90,30 180,180" fill="#E6B325" opacity="0.10" />
            <polygon points="30,180 130,20 155,180" fill="#1A4D4F" opacity="0.05" />
          </svg>
        </div>
      </div>

      {/* ── Right panel: background image ── */}
      <div
        className="hidden lg:block relative bg-primary"
        aria-hidden="true"
      >
        {/* Place /public/images/login-hero.jpg to show a real photo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/login-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/40 to-transparent" />
      </div>

      {/* ── Form card: overlaps image on lg, stacked below on mobile ── */}
      <div className="
        lg:absolute lg:top-1/2 lg:-translate-y-1/2
        lg:right-8 xl:right-14
        w-full lg:w-[420px] xl:w-[460px]
        bg-white
        rounded-none lg:rounded-3xl
        shadow-none lg:shadow-2xl
        px-8 py-10
      ">
        {/* Card header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-1">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary">{title}</h2>
          <p className="text-sm text-gray-500 text-center">{desc}</p>
        </div>

        {mode === "login" && (
          <LoginForm
            onToggleMode={() => setMode("signup")}
            onToggleReset={() => setMode("reset")}
            redirectTo={redirectTo}
          />
        )}
        {mode === "signup" && (
          <SignUpForm onToggleMode={() => setMode("login")} redirectTo={redirectTo} />
        )}
        {mode === "reset" && (
          <ResetPasswordForm onCancel={() => setMode("login")} />
        )}
      </div>
    </section>
  );
}
