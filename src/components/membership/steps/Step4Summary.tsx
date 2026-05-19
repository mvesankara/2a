"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberData } from "../MembershipForm";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function Step4Summary({
  data, onChange, errors,
}: {
  data: MemberData; onChange: (fields: Partial<MemberData>) => void; errors: { [k: string]: string };
}) {
  const membershipLabel = data.membershipType === "adherent" ? "Adhérent actif (5 000 FCFA/an)" :
    data.membershipType === "sympathisant" ? "Sympathisant (Gratuit)" : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Récapitulatif & Validation</h2>
        <p className="text-sm text-gray-500">Vérifiez vos informations avant de soumettre votre demande.</p>
      </div>

      {/* Personal info */}
      <Section title="👤 Informations personnelles">
        <Row label="Nom complet" value={`${data.firstName} ${data.lastName}`} />
        <Row label="Date de naissance" value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString("fr-FR") : undefined} />
        <Row label="Genre" value={data.gender} />
        <Row label="Pays" value={data.country} />
        <Row label="Ville" value={data.city} />
        <Row label="Adresse" value={data.address} />
        <Row label="Téléphone" value={`${data.countryCode} ${data.phone}`} />
        <Row label="Email" value={data.email} />
      </Section>

      {/* Membership */}
      <Section title="🎫 Adhésion">
        <Row label="Type d'adhésion" value={membershipLabel} />
        <Row label="Source" value={data.howDidYouHear} />
        {data.motivation && <Row label="Motivations" value={data.motivation} />}
      </Section>

      {/* Documents */}
      <Section title="📎 Documents">
        <Row label="Photo de profil" value={data.profilePhoto ? `✓ ${data.profilePhoto.name}` : "Non fourni"} />
        <Row label="Pièce d'identité" value={data.idDocument ? `✓ ${data.idDocument.name}` : "Non fournie"} />
      </Section>

      {/* Checkboxes */}
      <div className="space-y-3">
        {/* Confirm accuracy */}
        <label className={cn(
          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
          data.confirmAccuracy ? "border-primary/30 bg-primary/5" : "border-gray-200 hover:border-gray-300"
        )}>
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors",
              data.confirmAccuracy ? "bg-primary border-primary" : "border-gray-300"
            )}
            onClick={() => onChange({ confirmAccuracy: !data.confirmAccuracy })}
          >
            {data.confirmAccuracy && <CheckCircle2 size={12} className="text-white" />}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Je certifie que les informations fournies sont exactes et m&apos;engage à les mettre à jour en cas de changement.<span className="text-red-500">*</span>
          </p>
        </label>
        {errors.confirmAccuracy && <p className="text-red-500 text-xs px-1">{errors.confirmAccuracy}</p>}

        {/* Accept terms */}
        <label className={cn(
          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
          data.acceptTerms ? "border-primary/30 bg-primary/5" : "border-gray-200 hover:border-gray-300"
        )}>
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors",
              data.acceptTerms ? "bg-primary border-primary" : "border-gray-300"
            )}
            onClick={() => onChange({ acceptTerms: !data.acceptTerms })}
          >
            {data.acceptTerms && <CheckCircle2 size={12} className="text-white" />}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            J&apos;accepte le{" "}
            <a href="/reglement" className="text-primary underline hover:text-accent">règlement intérieur</a>
            {" "}et la{" "}
            <a href="/confidentialite" className="text-primary underline hover:text-accent">politique de confidentialité</a>
            {" "}de l&apos;association.<span className="text-red-500">*</span>
          </p>
        </label>
        {errors.acceptTerms && <p className="text-red-500 text-xs px-1">{errors.acceptTerms}</p>}
      </div>
    </div>
  );
}
