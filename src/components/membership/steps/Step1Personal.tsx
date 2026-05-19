"use client";

import { useState } from "react";
import { User, Calendar, MapPin, Phone, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberData } from "../MembershipForm";

const COUNTRY_CODES = [
  { code: "+241", flag: "🇬🇦", name: "Gabon" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+32", flag: "🇧🇪", name: "Belgique" },
  { code: "+41", flag: "🇨🇭", name: "Suisse" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+242", flag: "🇨🇬", name: "Congo-Brazzaville" },
  { code: "+243", flag: "🇨🇩", name: "Congo-Kinshasa" },
  { code: "+237", flag: "🇨🇲", name: "Cameroun" },
  { code: "+221", flag: "🇸🇳", name: "Sénégal" },
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
  { code: "+1", flag: "🇺🇸", name: "États-Unis" },
];

const COUNTRIES = [
  "Gabon", "France", "Belgique", "Suisse", "Canada",
  "Congo (Brazzaville)", "Congo (Kinshasa)", "Cameroun", "Sénégal",
  "Côte d'Ivoire", "Maroc", "Algérie", "Tunisie", "Mali", "Burkina Faso",
  "Togo", "Bénin", "Niger", "Tchad", "Centrafrique", "Guinée équatoriale",
  "Rwanda", "Burundi", "Kenya", "Nigéria", "Ghana", "Autre",
];

interface Errors {
  [key: string]: string;
}

function InputField({
  label, required, children, error,
}: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Field({
  icon: Icon, placeholder, type = "text", value, onChange, error, className,
}: {
  icon?: React.ElementType; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; error?: string; className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full border rounded-xl py-3 text-sm outline-none transition-colors bg-white",
          Icon ? "pl-9 pr-4" : "px-4",
          error ? "border-red-300 focus:ring-red-200 focus:border-red-400" :
                  "border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent"
        )}
      />
    </div>
  );
}

export default function Step1Personal({
  data, onChange, errors,
}: {
  data: MemberData; onChange: (fields: Partial<MemberData>) => void; errors: Errors;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <User size={18} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Informations personnelles</h2>
          <p className="text-xs text-gray-500">Merci de remplir tous les champs obligatoires.</p>
        </div>
      </div>

      {/* Row: Prénom / Nom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Prénom" required error={errors.firstName}>
          <Field icon={User} placeholder="Entrez votre prénom" value={data.firstName} onChange={(v) => onChange({ firstName: v })} error={errors.firstName} />
        </InputField>
        <InputField label="Nom" required error={errors.lastName}>
          <Field icon={User} placeholder="Entrez votre nom" value={data.lastName} onChange={(v) => onChange({ lastName: v })} error={errors.lastName} />
        </InputField>
      </div>

      {/* Row: Date de naissance / Genre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Date de naissance" required error={errors.dateOfBirth}>
          <div className="relative">
            <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => onChange({ dateOfBirth: e.target.value })}
              className={cn(
                "w-full border rounded-xl py-3 pl-9 pr-4 text-sm outline-none transition-colors bg-white",
                errors.dateOfBirth ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent"
              )}
            />
          </div>
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </InputField>

        <InputField label="Genre" required error={errors.gender}>
          <div className="relative">
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={data.gender}
              onChange={(e) => onChange({ gender: e.target.value })}
              className={cn(
                "w-full border rounded-xl py-3 px-4 text-sm outline-none appearance-none bg-white transition-colors",
                errors.gender ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent",
                !data.gender ? "text-gray-400" : "text-gray-800"
              )}
            >
              <option value="">Sélectionnez votre genre</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre / Non précisé</option>
            </select>
          </div>
        </InputField>
      </div>

      {/* Row: Pays / Ville */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Pays de résidence" required error={errors.country}>
          <div className="relative">
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              className={cn(
                "w-full border rounded-xl py-3 px-4 text-sm outline-none appearance-none bg-white transition-colors",
                errors.country ? "border-red-300" : "border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent",
                !data.country ? "text-gray-400" : "text-gray-800"
              )}
            >
              <option value="">Sélectionnez votre pays</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </InputField>

        <InputField label="Ville" required error={errors.city}>
          <Field icon={MapPin} placeholder="Entrez votre ville" value={data.city} onChange={(v) => onChange({ city: v })} error={errors.city} />
        </InputField>
      </div>

      {/* Adresse complète */}
      <InputField label="Adresse complète" required error={errors.address}>
        <div className="relative">
          <MapPin size={15} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Numéro, rue, quartier, commune..."
            className={cn(
              "w-full border rounded-xl py-3 pl-9 pr-4 text-sm outline-none transition-colors bg-white",
              errors.address ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:ring-2 focus:ring-accent/20 focus:border-accent"
            )}
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </InputField>

      {/* Row: Téléphone / Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Téléphone" required error={errors.phone}>
          <div className={cn("flex border rounded-xl overflow-hidden bg-white transition-colors", errors.phone ? "border-red-300" : "border-gray-200 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent")}>
            <select
              value={data.countryCode}
              onChange={(e) => onChange({ countryCode: e.target.value })}
              className="bg-gray-50 border-r border-gray-200 px-2 py-3 text-sm text-gray-700 outline-none appearance-none min-w-[80px]"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={`${c.code}-${c.name}`} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="XX XX XX XX"
              className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
            />
          </div>
        </InputField>

        <InputField label="Adresse e-mail" required error={errors.email}>
          <Field icon={Mail} placeholder="exemple@email.com" type="email" value={data.email} onChange={(v) => onChange({ email: v })} error={errors.email} />
        </InputField>
      </div>

      {/* Row: Mot de passe / Confirmation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Mot de passe" required error={errors.password}>
          <div className={cn("relative border rounded-xl bg-white transition-colors", errors.password ? "border-red-300" : "border-gray-200 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent")}>
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showPwd ? "text" : "password"}
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full py-3 pl-9 pr-10 text-sm outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </InputField>

        <InputField label="Confirmer le mot de passe" required error={errors.confirmPassword}>
          <div className={cn("relative border rounded-xl bg-white transition-colors", errors.confirmPassword ? "border-red-300" : "border-gray-200 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent")}>
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type={showConfirm ? "text" : "password"}
              value={data.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full py-3 pl-9 pr-10 text-sm outline-none bg-transparent"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </InputField>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <span className="text-lg leading-none mt-0.5">ℹ️</span>
        <p>Votre demande sera examinée par notre équipe. Vous recevrez un e-mail dès que votre inscription sera validée.</p>
      </div>
    </div>
  );
}
