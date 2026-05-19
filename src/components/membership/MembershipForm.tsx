"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { setToken } from "@/lib/api";
import StepIndicator from "./StepIndicator";
import MembershipSidebar from "./MembershipSidebar";
import Step1Personal from "./steps/Step1Personal";
import Step2Membership from "./steps/Step2Membership";
import Step3Documents from "./steps/Step3Documents";
import Step4Summary from "./steps/Step4Summary";

export interface MemberData {
  // Step 1
  firstName: string; lastName: string;
  dateOfBirth: string; gender: string;
  country: string; city: string; address: string;
  countryCode: string; phone: string;
  email: string; password: string; confirmPassword: string;
  // Step 2
  membershipType: "adherent" | "sympathisant" | "";
  motivation: string; howDidYouHear: string;
  // Step 3
  profilePhoto: File | null; idDocument: File | null;
  // Step 4
  confirmAccuracy: boolean; acceptTerms: boolean;
}

const EMPTY: MemberData = {
  firstName: "", lastName: "", dateOfBirth: "", gender: "",
  country: "", city: "", address: "", countryCode: "+241", phone: "",
  email: "", password: "", confirmPassword: "",
  membershipType: "", motivation: "", howDidYouHear: "",
  profilePhoto: null, idDocument: null,
  confirmAccuracy: false, acceptTerms: false,
};

function validate(step: number, data: MemberData): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 1) {
    if (!data.firstName.trim()) e.firstName = "Prénom requis";
    if (!data.lastName.trim()) e.lastName = "Nom requis";
    if (!data.dateOfBirth) e.dateOfBirth = "Date de naissance requise";
    else {
      const age = (Date.now() - new Date(data.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (age < 16) e.dateOfBirth = "Vous devez avoir au moins 16 ans";
    }
    if (!data.gender) e.gender = "Genre requis";
    if (!data.country) e.country = "Pays requis";
    if (!data.city.trim()) e.city = "Ville requise";
    if (!data.address.trim()) e.address = "Adresse requise";
    if (!data.phone.trim()) e.phone = "Téléphone requis";
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email invalide";
    if (data.password.length < 8) e.password = "Minimum 8 caractères";
    if (data.password !== data.confirmPassword) e.confirmPassword = "Les mots de passe ne correspondent pas";
  }
  if (step === 2) {
    if (!data.membershipType) e.membershipType = "Choisissez un type d'adhésion";
  }
  if (step === 4) {
    if (!data.confirmAccuracy) e.confirmAccuracy = "Veuillez certifier l'exactitude des informations";
    if (!data.acceptTerms) e.acceptTerms = "Veuillez accepter le règlement intérieur";
  }
  return e;
}

export default function MembershipForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<MemberData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const update = (fields: Partial<MemberData>) => {
    setData((prev) => ({ ...prev, ...fields }));
    setErrors({});
  };

  const next = () => {
    const e = validate(step, data);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    const e = validate(4, data);
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError("");

    try {
      // 1. Create account
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName, lastName: data.lastName,
          dateOfBirth: data.dateOfBirth, gender: data.gender,
          country: data.country, city: data.city, address: data.address,
          phone: `${data.countryCode} ${data.phone}`,
          email: data.email, password: data.password,
          membershipType: data.membershipType,
          motivation: data.motivation || undefined,
          howDidYouHear: data.howDidYouHear || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setApiError(json.error ?? "Une erreur est survenue.");
        return;
      }

      // 2. Log in the user
      setToken(json.token);
      login(json.token, json.user, json.profile);

      // 3. Upload documents if provided
      if (data.profilePhoto || data.idDocument) {
        const fd = new FormData();
        if (data.profilePhoto) fd.append("profilePhoto", data.profilePhoto);
        if (data.idDocument) fd.append("idDocument", data.idDocument);
        await fetch("/api/membership/documents", {
          method: "POST",
          headers: { Authorization: `Bearer ${json.token}` },
          body: fd,
        });
      }

      setSuccess(true);
    } catch {
      setApiError("Impossible de soumettre votre demande. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-primary mb-3">Demande soumise !</h2>
        <p className="text-gray-600 mb-2">
          Votre demande d&apos;adhésion a été transmise avec succès.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Notre équipe l&apos;examinera sous 48–72h et vous contactera à l&apos;adresse{" "}
          <strong>{data.email}</strong> pour la suite du processus.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/my-space")}
            className="bg-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            Mon espace
          </button>
          <button
            onClick={() => router.push("/")}
            className="border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {step === 1 && <Step1Personal data={data} onChange={update} errors={errors} />}
            {step === 2 && <Step2Membership data={data} onChange={update} errors={errors} />}
            {step === 3 && <Step3Documents data={data} onChange={update} />}
            {step === 4 && <Step4Summary data={data} onChange={update} errors={errors} />}

            {apiError && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {apiError}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={step === 1 ? () => router.push("/") : back}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full px-5 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={15} />
                {step === 1 ? "Annuler" : "Étape précédente"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors"
                >
                  Étape suivante
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" />Envoi...</> : <>Soumettre ma demande <ArrowRight size={15} /></>}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-3">* Champs obligatoires</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <MembershipSidebar />
        </div>
      </div>
    </div>
  );
}
