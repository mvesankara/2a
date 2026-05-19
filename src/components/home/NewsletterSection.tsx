"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de vous inscrire pour le moment.");
    }
  };

  return (
    <section className="py-20 bg-accent/10 border-t border-accent/20">
      <div className="container mx-auto px-4 xl:px-6">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Icon + text */}
          <div className="flex items-start gap-5 flex-1">
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-primary mb-2">
                Restez informé de nos actions
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Inscrivez-vous à notre newsletter pour recevoir nos actualités
                et nos opportunités d&apos;engagement.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="w-full md:w-auto md:min-w-[480px]">
            {status === "success" ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 text-green-700 text-sm font-medium text-center">
                ✓ {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  required
                  className="flex-1 border border-gray-200 bg-white rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-full hover:bg-accent/90 transition-colors disabled:opacity-70 whitespace-nowrap"
                >
                  {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>S&apos;inscrire <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-red-500 text-xs mt-2 px-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
