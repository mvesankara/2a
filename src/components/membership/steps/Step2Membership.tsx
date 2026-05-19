"use client";

import { Check, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberData } from "../MembershipForm";

const MEMBERSHIP_TYPES = [
  {
    value: "adherent" as const,
    label: "Adhérent actif",
    icon: Users,
    price: "5 000 FCFA / an",
    description: "Membres engagés qui participent activement aux projets et décisions de l'association.",
    benefits: ["Droit de vote en assemblée", "Accès aux formations", "Participation aux projets", "Carte de membre"],
  },
  {
    value: "sympathisant" as const,
    label: "Sympathisant",
    icon: Heart,
    price: "Libre / Gratuit",
    description: "Soutenez l'association sans engagement formel, à votre propre rythme.",
    benefits: ["Newsletter mensuelle", "Invitations aux événements", "Accès aux actualités", "Soutien moral"],
  },
];

const HOW_DID_YOU_HEAR = [
  "Réseaux sociaux (Facebook, Instagram, etc.)",
  "Un ami / Bouche à oreille",
  "Site internet",
  "Événement de l'association",
  "Médias (radio, TV, presse)",
  "Autre",
];

interface Errors { [key: string]: string }

export default function Step2Membership({
  data, onChange, errors,
}: {
  data: MemberData; onChange: (fields: Partial<MemberData>) => void; errors: Errors;
}) {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Adhésion & Cotisation</h2>
        <p className="text-sm text-gray-500">Choisissez le type d&apos;adhésion qui vous correspond.</p>
      </div>

      {/* Membership type cards */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Type d&apos;adhésion<span className="text-red-500 ml-0.5">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MEMBERSHIP_TYPES.map(({ value, label, icon: Icon, price, description, benefits }) => {
            const selected = data.membershipType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ membershipType: value })}
                className={cn(
                  "text-left p-5 rounded-2xl border-2 transition-all duration-200 w-full",
                  selected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                {/* Icon + label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", selected ? "bg-primary text-white" : "bg-gray-100 text-gray-500")}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", selected ? "text-primary" : "text-gray-700")}>{label}</p>
                    <p className={cn("text-xs font-semibold", selected ? "text-accent" : "text-gray-400")}>{price}</p>
                  </div>
                  {selected && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{description}</p>
                <ul className="space-y-1">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", selected ? "bg-accent" : "bg-gray-300")} />
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        {errors.membershipType && <p className="text-red-500 text-xs mt-2">{errors.membershipType}</p>}
      </div>

      {/* How did you hear */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Comment avez-vous entendu parler de nous ?
        </label>
        <div className="relative">
          <select
            value={data.howDidYouHear}
            onChange={(e) => onChange({ howDidYouHear: e.target.value })}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none appearance-none bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent text-gray-700"
          >
            <option value="">Sélectionnez une option</option>
            {HOW_DID_YOU_HEAR.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
        </div>
      </div>

      {/* Motivation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Vos motivations <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          value={data.motivation}
          onChange={(e) => onChange({ motivation: e.target.value })}
          placeholder="Expliquez-nous pourquoi vous souhaitez rejoindre l'association..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm outline-none resize-none bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent text-gray-700 placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{data.motivation.length}/500 caractères</p>
      </div>

      {/* Cotisation note */}
      {data.membershipType === "adherent" && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-gray-700">
          <p className="font-semibold text-accent mb-1">💳 Cotisation annuelle</p>
          <p>La cotisation de <strong>5 000 FCFA</strong> sera à régler lors de la validation de votre adhésion par virement ou en espèces. Notre équipe vous contactera avec les instructions.</p>
        </div>
      )}
    </div>
  );
}
