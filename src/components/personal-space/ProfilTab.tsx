"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { profileApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfilTabProps {
  profile: any;
}

const GENDER_OPTIONS = ["Masculin", "Féminin", "Autre", "Non précisé"];

export default function ProfilTab({ profile }: ProfilTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    phone: profile.phone ?? "",
    gender: profile.gender ?? "",
    personalDescription: profile.personalDescription ?? "",
    motivation: profile.motivation ?? "",
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    skills: (profile.skills as string[]).join(", "),
    associationContribution: profile.associationContribution ?? "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update({
        firstName: form.firstName,
        lastName: form.lastName,
        city: form.city,
        country: form.country,
        personalDescription: form.personalDescription,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        associationContribution: form.associationContribution,
        // Extended fields
        phone: form.phone,
        gender: form.gender,
        motivation: form.motivation,
        dateOfBirth: form.dateOfBirth || null,
      } as Parameters<typeof profileApi.update>[0]);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profil mis à jour" });
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Échec", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-800 mb-6">Informations personnelles</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Prénom</label>
            <input value={form.firstName} onChange={set("firstName")} className={inputCls} placeholder="Prénom" />
          </div>
          <div>
            <label className={labelCls}>Nom</label>
            <input value={form.lastName} onChange={set("lastName")} className={inputCls} placeholder="Nom" />
          </div>
        </div>

        {/* Contact row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={set("phone")} className={inputCls} placeholder="+241 XX XX XX XX" />
          </div>
          <div>
            <label className={labelCls}>Genre</label>
            <select value={form.gender} onChange={set("gender")} className={inputCls}>
              <option value="">— Sélectionner —</option>
              {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Location + birthdate */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Ville</label>
            <input value={form.city} onChange={set("city")} className={inputCls} placeholder="Libreville" />
          </div>
          <div>
            <label className={labelCls}>Pays</label>
            <input value={form.country} onChange={set("country")} className={inputCls} placeholder="Gabon" />
          </div>
          <div>
            <label className={labelCls}>Date de naissance</label>
            <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} className={inputCls} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Description personnelle</label>
          <textarea
            value={form.personalDescription}
            onChange={set("personalDescription")}
            rows={3}
            placeholder="Parlez de vous en quelques mots…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Motivation */}
        <div>
          <label className={labelCls}>Motivation / Engagement</label>
          <textarea
            value={form.motivation}
            onChange={set("motivation")}
            rows={2}
            placeholder="Pourquoi avez-vous rejoint 2A ?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Skills */}
        <div>
          <label className={labelCls}>Compétences <span className="text-gray-400 font-normal">(séparées par des virgules)</span></label>
          <input value={form.skills} onChange={set("skills")} className={inputCls} placeholder="Leadership, Communication, Gestion de projet…" />
          {form.skills && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Contribution */}
        <div>
          <label className={labelCls}>Contribution à l&apos;association</label>
          <textarea
            value={form.associationContribution}
            onChange={set("associationContribution")}
            rows={2}
            placeholder="Comment souhaitez-vous contribuer ?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  );
}
