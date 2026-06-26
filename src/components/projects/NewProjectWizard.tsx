"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Check, ChevronDown, Upload, X, Loader2, ArrowRight, ArrowLeft,
  MapPin, Lightbulb, Info, FolderOpen, Plus, Trash2, CalendarDays,
  ClipboardList, Package, FileUp, CheckCircle2, ImageOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_META = [
  { id: 1, label: "Informations générales" },
  { id: 2, label: "Objectifs & activités" },
  { id: 3, label: "Budget & ressources" },
  { id: 4, label: "Documents" },
  { id: 5, label: "Revue & publication" },
];

const CATEGORIES = [
  "Éducation", "Environnement", "Social", "Santé",
  "Innovation", "Jeunesse", "Agriculture", "Culture", "Autre",
];

const AFRICAN_COUNTRIES = [
  "Gabon", "Congo", "Cameroun", "Côte d'Ivoire", "Sénégal",
  "Mali", "Burkina Faso", "Togo", "Bénin", "Guinée",
  "France", "Belgique", "Canada", "Autre",
];

const DURATIONS = [
  "1 mois", "3 mois", "6 mois", "1 an", "2 ans", "3 ans et plus",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Éducation":     "bg-blue-100 text-blue-700",
  "Environnement": "bg-green-100 text-green-700",
  "Social":        "bg-purple-100 text-purple-700",
  "Santé":         "bg-cyan-100 text-cyan-700",
  "Innovation":    "bg-amber-100 text-amber-700",
  "Jeunesse":      "bg-pink-100 text-pink-700",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1 {
  name: string; category: string; city: string; country: string;
  shortDescription: string; problemStatement: string;
  startDate: string; estimatedDuration: string;
  coverFile: File | null; coverPreview: string | null;
}
interface Step2 {
  objectives: string; plannedActivities: string;
  targetBeneficiaries: string; successIndicators: string;
}
interface Step3 {
  budget: string; budgetSources: string;
  humanResources: string; materialResources: string;
}
interface Step4Doc { name: string; file: File; preview: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const reqStar = <span className="text-red-500 ml-0.5">*</span>;
const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
const inputBase = "w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white";
const textareaBase = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none";
const selectBase = "w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-white appearance-none";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return (
    <span className={cn("text-[10px] font-medium", len > max * 0.9 ? "text-amber-500" : "text-gray-400")}>
      {len}/{max}
    </span>
  );
}

function SelectWithChevron({
  value, onChange, placeholder, options, error, disabled,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: string[]; error?: string; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(selectBase, !value && "text-gray-400", error && "border-red-400")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <FieldError msg={error} />
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-5 mb-6">
      <div className="flex items-start justify-between">
        {STEP_META.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step.id < current  ? "bg-primary/20 text-primary border-2 border-primary/30" :
                step.id === current ? "bg-primary text-white shadow-md shadow-primary/30" :
                "bg-gray-100 text-gray-400"
              )}>
                {step.id < current ? <Check size={16} strokeWidth={2.5} /> : step.id}
              </div>
              <span className={cn(
                "text-[11px] font-semibold text-center leading-tight whitespace-nowrap",
                step.id === current ? "text-primary" : step.id < current ? "text-primary/70" : "text-gray-400"
              )}>
                {step.label}
              </span>
            </div>
            {i < STEP_META.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-3 mb-6 transition-colors",
                current > step.id ? "bg-primary/30" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function ProjectPreview({ s1 }: { s1: Step1 }) {
  const isEmpty = !s1.name && !s1.category && !s1.city;
  const catCls = CATEGORY_COLORS[s1.category ?? ""] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-primary mb-4">Aperçu du projet</h3>
      {isEmpty ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="w-24 h-20 flex items-center justify-center text-gray-100 mb-3">
            <svg viewBox="0 0 96 80" fill="none" className="w-full h-full">
              <rect x="8" y="24" width="80" height="52" rx="6" fill="#E5E7EB" />
              <rect x="8" y="16" width="36" height="14" rx="4" fill="#D1D5DB" />
              <circle cx="68" cy="60" r="14" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
              <path d="M62 60h12M68 54v12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
              <rect x="18" y="36" width="40" height="4" rx="2" fill="#D1D5DB" />
              <rect x="18" y="46" width="28" height="3" rx="1.5" fill="#E5E7EB" />
            </svg>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">Votre aperçu apparaîtra ici au fur et à mesure.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {s1.coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s1.coverPreview} alt="" className="w-full h-28 object-cover rounded-xl" />
          ) : (
            <div className="w-full h-20 bg-gray-100 rounded-xl flex items-center justify-center">
              <FolderOpen size={24} className="text-gray-300" />
            </div>
          )}
          {s1.name && <p className="text-sm font-bold text-gray-800 line-clamp-2">{s1.name}</p>}
          <div className="flex flex-wrap gap-2">
            {s1.category && (
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", catCls)}>
                {s1.category}
              </span>
            )}
            {s1.city && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin size={10} /> {s1.city}{s1.country && s1.country !== "Gabon" ? `, ${s1.country}` : ""}
              </span>
            )}
          </div>
          {s1.shortDescription && (
            <p className="text-xs text-gray-500 line-clamp-3">{s1.shortDescription}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarTips({ step }: { step: number }) {
  const content: Record<number, { title: string; tips: string[]; icon: React.ElementType }> = {
    1: {
      title: "Conseils",
      icon: Lightbulb,
      tips: [
        "Soyez clair et précis dans la description.",
        "Identifiez un problème réel de votre communauté.",
        "Expliquez l'impact positif attendu.",
      ],
    },
    2: {
      title: "Définir des objectifs SMART",
      icon: ClipboardList,
      tips: [
        "Spécifiques : précisez ce que vous voulez accomplir.",
        "Mesurables : fixez des indicateurs chiffrés.",
        "Décrivez les activités concrètes par étape.",
      ],
    },
    3: {
      title: "Conseils budget",
      icon: Package,
      tips: [
        "Estimez le budget en Franc CFA (XAF).",
        "Listez toutes les sources de financement potentielles.",
        "Incluez les ressources humaines bénévoles.",
      ],
    },
    4: {
      title: "Documents requis",
      icon: FileUp,
      tips: [
        "Joignez votre proposition de projet en PDF.",
        "La fiche budget détaillée est fortement recommandée.",
        "Les formats acceptés : PDF, DOCX, XLSX.",
      ],
    },
    5: {
      title: "Avant de publier",
      icon: CheckCircle2,
      tips: [
        "Relisez attentivement toutes les informations.",
        "Assurez-vous que le budget est réaliste.",
        "Votre projet sera visible par tous les membres.",
      ],
    },
  };

  const { title, tips, icon: Icon } = content[step] ?? content[1];

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-amber-600" />
        <h3 className="text-sm font-bold text-amber-800">{title}</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-xs text-amber-700">
            <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarInfo() {
  const items = [
    { icon: CalendarDays, label: "Ajouter des activités détaillées" },
    { icon: Plus,         label: "Inviter des collaborateurs" },
    { icon: ClipboardList,label: "Suivre l'avancement du projet" },
    { icon: CheckCircle2, label: "Publier et mobiliser la communauté" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Info size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-gray-800">Bon à savoir</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">Une fois votre projet créé, vous pourrez :</p>
      <ul className="space-y-2">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-xs text-gray-600">
            <Icon size={13} className="text-primary flex-shrink-0" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1Form({
  data, onChange, errors, saving, onNext, onCancel,
}: {
  data: Step1;
  onChange: (d: Partial<Step1>) => void;
  errors: Record<string, string>;
  saving: boolean;
  onNext: () => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Type invalide", description: "JPG, PNG ou WebP uniquement", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Max 5 Mo", variant: "destructive" });
      return;
    }
    const preview = URL.createObjectURL(file);
    onChange({ coverFile: file, coverPreview: preview });
  }, [onChange, toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-primary">Informations générales</h2>
        <p className="text-xs text-gray-400 mt-0.5">Renseignez les informations essentielles de votre projet.</p>
      </div>

      {/* Titre + Catégorie */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Titre du projet {reqStar}</label>
          <input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex : Éducation numérique pour tous"
            className={cn(inputBase, errors.name && "border-red-400")}
          />
          <FieldError msg={errors.name} />
        </div>
        <div>
          <label className={labelCls}>Catégorie {reqStar}</label>
          <SelectWithChevron
            value={data.category}
            onChange={(v) => onChange({ category: v })}
            placeholder="Sélectionnez une catégorie"
            options={CATEGORIES}
            error={errors.category}
          />
        </div>
      </div>

      {/* Localisation + Pays */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Localisation {reqStar}</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Ville, quartier ou région"
              className={cn(inputBase, "pl-10", errors.city && "border-red-400")}
            />
          </div>
          <FieldError msg={errors.city} />
        </div>
        <div>
          <label className={labelCls}>Pays {reqStar}</label>
          <SelectWithChevron
            value={data.country}
            onChange={(v) => onChange({ country: v })}
            placeholder="Sélectionnez un pays"
            options={AFRICAN_COUNTRIES}
            error={errors.country}
          />
        </div>
      </div>

      {/* Résumé */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Résumé du projet {reqStar}</label>
          <CharCount value={data.shortDescription} max={500} />
        </div>
        <p className="text-xs text-gray-400 mb-2">Décrivez brièvement votre projet, ses objectifs principaux et l&apos;impact attendu.</p>
        <textarea
          value={data.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value.slice(0, 500) })}
          rows={4}
          placeholder="Décrivez votre projet en quelques lignes..."
          className={cn(textareaBase, errors.shortDescription && "border-red-400")}
        />
        <FieldError msg={errors.shortDescription} />
      </div>

      {/* Problématique */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Problématique identifiée {reqStar}</label>
          <CharCount value={data.problemStatement} max={500} />
        </div>
        <p className="text-xs text-gray-400 mb-2">Quel problème ce projet cherche-t-il à résoudre&nbsp;?</p>
        <textarea
          value={data.problemStatement}
          onChange={(e) => onChange({ problemStatement: e.target.value.slice(0, 500) })}
          rows={4}
          placeholder="Décrivez la problématique ou le besoin auquel votre projet répond..."
          className={cn(textareaBase, errors.problemStatement && "border-red-400")}
        />
        <FieldError msg={errors.problemStatement} />
      </div>

      {/* Date + Durée */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date de début prévue {reqStar}</label>
          <div className="relative">
            <CalendarDays size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className={cn(inputBase, "pl-10", errors.startDate && "border-red-400")}
            />
          </div>
          <FieldError msg={errors.startDate} />
        </div>
        <div>
          <label className={labelCls}>Durée estimée {reqStar}</label>
          <SelectWithChevron
            value={data.estimatedDuration}
            onChange={(v) => onChange({ estimatedDuration: v })}
            placeholder="Sélectionnez la durée"
            options={DURATIONS}
            error={errors.estimatedDuration}
          />
        </div>
      </div>

      {/* Image de couverture */}
      <div>
        <label className={labelCls}>Image de couverture</label>
        <p className="text-xs text-gray-400 mb-2">Ajoutez une image qui représente votre projet (JPG, PNG – Max 5 Mo).</p>
        {data.coverPreview ? (
          <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.coverPreview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange({ coverFile: null, coverPreview: null })}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X size={13} className="text-white" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
            )}
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", dragOver ? "bg-primary/10" : "bg-gray-100")}>
              <Upload size={20} className={dragOver ? "text-primary" : "text-gray-400"} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Cliquez pour télécharger ou glissez-déposez</p>
              <p className="text-xs text-gray-400">une image ici</p>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : null}
          {saving ? "Enregistrement…" : "Enregistrer et continuer"}
          {!saving && <ArrowRight size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2Form({
  data, onChange, errors, saving, onNext, onBack,
}: {
  data: Step2; onChange: (d: Partial<Step2>) => void;
  errors: Record<string, string>; saving: boolean;
  onNext: () => void; onBack: () => void;
}) {
  const [activities, setActivities] = useState<string[]>(
    data.plannedActivities ? data.plannedActivities.split("\n").filter(Boolean) : [""]
  );

  const syncActivities = (list: string[]) => {
    setActivities(list);
    onChange({ plannedActivities: list.filter(Boolean).join("\n") });
  };

  const addActivity = () => syncActivities([...activities, ""]);
  const removeActivity = (i: number) => syncActivities(activities.filter((_, idx) => idx !== i));
  const updateActivity = (i: number, val: string) => {
    const next = [...activities];
    next[i] = val;
    syncActivities(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-primary">Objectifs &amp; activités</h2>
        <p className="text-xs text-gray-400 mt-0.5">Définissez ce que votre projet cherche à accomplir.</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Objectifs principaux {reqStar}</label>
          <CharCount value={data.objectives} max={600} />
        </div>
        <textarea
          value={data.objectives}
          onChange={(e) => onChange({ objectives: e.target.value.slice(0, 600) })}
          rows={4}
          placeholder="Décrivez les 3 à 5 objectifs principaux de votre projet..."
          className={cn(textareaBase, errors.objectives && "border-red-400")}
        />
        <FieldError msg={errors.objectives} />
      </div>

      <div>
        <label className={labelCls}>Activités planifiées {reqStar}</label>
        <p className="text-xs text-gray-400 mb-2">Listez les activités concrètes à mener.</p>
        <div className="space-y-2">
          {activities.map((act, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                {i + 1}
              </span>
              <input
                value={act}
                onChange={(e) => updateActivity(i, e.target.value)}
                placeholder={`Activité ${i + 1}…`}
                className={cn(inputBase, "flex-1")}
              />
              {activities.length > 1 && (
                <button type="button" onClick={() => removeActivity(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addActivity}
          className="mt-2 flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
        >
          <Plus size={14} /> Ajouter une activité
        </button>
        <FieldError msg={errors.plannedActivities} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Bénéficiaires cibles {reqStar}</label>
          <CharCount value={data.targetBeneficiaries} max={400} />
        </div>
        <textarea
          value={data.targetBeneficiaries}
          onChange={(e) => onChange({ targetBeneficiaries: e.target.value.slice(0, 400) })}
          rows={3}
          placeholder="Qui bénéficiera de ce projet ? Nombre estimé, profil, localisation..."
          className={cn(textareaBase, errors.targetBeneficiaries && "border-red-400")}
        />
        <FieldError msg={errors.targetBeneficiaries} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Indicateurs de réussite</label>
          <CharCount value={data.successIndicators} max={400} />
        </div>
        <textarea
          value={data.successIndicators}
          onChange={(e) => onChange({ successIndicators: e.target.value.slice(0, 400) })}
          rows={3}
          placeholder="Comment mesurerez-vous le succès ? (ex: 200 enfants scolarisés, 50 emplois créés...)"
          className={textareaBase}
        />
      </div>

      <StepActions onBack={onBack} onNext={onNext} saving={saving} />
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3Form({
  data, onChange, errors, saving, onNext, onBack,
}: {
  data: Step3; onChange: (d: Partial<Step3>) => void;
  errors: Record<string, string>; saving: boolean;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-primary">Budget &amp; ressources</h2>
        <p className="text-xs text-gray-400 mt-0.5">Estimez les moyens nécessaires à la réalisation du projet.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Budget total estimé (XAF)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">CFA</span>
            <input
              type="number"
              min={0}
              value={data.budget}
              onChange={(e) => onChange({ budget: e.target.value })}
              placeholder="Ex : 5 000 000"
              className={cn(inputBase, "pl-12")}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Sources de financement</label>
          <input
            value={data.budgetSources}
            onChange={(e) => onChange({ budgetSources: e.target.value })}
            placeholder="Ex : subvention, fonds propres, dons..."
            className={inputBase}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Ressources humaines</label>
          <CharCount value={data.humanResources} max={400} />
        </div>
        <textarea
          value={data.humanResources}
          onChange={(e) => onChange({ humanResources: e.target.value.slice(0, 400) })}
          rows={3}
          placeholder="Décrivez l'équipe projet : coordinateur, bénévoles, partenaires..."
          className={textareaBase}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelCls}>Ressources matérielles</label>
          <CharCount value={data.materialResources} max={400} />
        </div>
        <textarea
          value={data.materialResources}
          onChange={(e) => onChange({ materialResources: e.target.value.slice(0, 400) })}
          rows={3}
          placeholder="Équipements, locaux, matériel informatique, véhicules..."
          className={textareaBase}
        />
      </div>

      <StepActions onBack={onBack} onNext={onNext} saving={saving} />
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

function Step4Form({
  docs, onAddDoc, onRemoveDoc, saving, onNext, onBack,
}: {
  docs: Step4Doc[]; onAddDoc: (d: Step4Doc) => void; onRemoveDoc: (i: number) => void;
  saving: boolean; onNext: () => void; onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Max 10 Mo", variant: "destructive" });
      return;
    }
    onAddDoc({ name: file.name, file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "" });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-primary">Documents</h2>
        <p className="text-xs text-gray-400 mt-0.5">Joignez les documents liés à votre projet (facultatif).</p>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-gray-50 transition-colors"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <FileUp size={20} className="text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Cliquez pour ajouter un document</p>
          <p className="text-xs text-gray-400">PDF, DOCX, XLSX — Max 10 Mo</p>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {doc.preview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={doc.preview} alt="" className="w-full h-full object-cover rounded-lg" />
                  : <ImageOff size={15} className="text-red-400" />
                }
              </div>
              <p className="text-sm text-gray-700 flex-1 truncate">{doc.name}</p>
              <button type="button" onClick={() => onRemoveDoc(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <StepActions onBack={onBack} onNext={onNext} saving={saving} nextLabel="Continuer" />
    </div>
  );
}

// ─── Step 5 ───────────────────────────────────────────────────────────────────

function Step5Review({
  s1, s2, s3, saving, onPublish, onSaveDraft, onBack,
}: {
  s1: Step1; s2: Step2; s3: Step3; saving: boolean;
  onPublish: () => void; onSaveDraft: () => void; onBack: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const catCls = CATEGORY_COLORS[s1.category ?? ""] ?? "bg-gray-100 text-gray-600";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-gray-100 rounded-xl p-4">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{title}</h4>
      {children}
    </div>
  );

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1.5 border-b border-gray-50 last:border-0">
        <span className="text-xs text-gray-400 sm:w-36 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-700">{value}</span>
      </div>
    ) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold text-primary">Revue &amp; publication</h2>
        <p className="text-xs text-gray-400 mt-0.5">Vérifiez les informations avant de publier votre projet.</p>
      </div>

      {/* Project preview header */}
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="w-16 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
          {s1.coverPreview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={s1.coverPreview} alt="" className="w-full h-full object-cover" />
            : <FolderOpen size={18} className="text-gray-300" />
          }
        </div>
        <div>
          <p className="font-bold text-gray-800">{s1.name || "—"}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {s1.category && <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", catCls)}>{s1.category}</span>}
            {s1.city && <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10}/>{s1.city}</span>}
          </div>
        </div>
      </div>

      <Section title="Informations générales">
        <Row label="Titre"        value={s1.name} />
        <Row label="Catégorie"    value={s1.category} />
        <Row label="Localisation" value={[s1.city, s1.country].filter(Boolean).join(", ")} />
        <Row label="Date de début" value={s1.startDate ? format(new Date(s1.startDate), "d MMMM yyyy", { locale: fr }) : undefined} />
        <Row label="Durée estimée" value={s1.estimatedDuration} />
        <Row label="Résumé"       value={s1.shortDescription} />
        <Row label="Problématique" value={s1.problemStatement} />
      </Section>

      {(s2.objectives || s2.plannedActivities) && (
        <Section title="Objectifs & activités">
          <Row label="Objectifs"    value={s2.objectives} />
          <Row label="Activités"    value={s2.plannedActivities?.replace(/\n/g, " · ")} />
          <Row label="Bénéficiaires" value={s2.targetBeneficiaries} />
          <Row label="Indicateurs"  value={s2.successIndicators} />
        </Section>
      )}

      {(s3.budget || s3.budgetSources) && (
        <Section title="Budget & ressources">
          <Row label="Budget"         value={s3.budget ? `${Number(s3.budget).toLocaleString("fr-FR")} XAF` : undefined} />
          <Row label="Financement"    value={s3.budgetSources} />
          <Row label="Ressources humaines" value={s3.humanResources} />
          <Row label="Ressources mat." value={s3.materialResources} />
        </Section>
      )}

      {/* Confirmation */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary"
        />
        <span className="text-sm text-gray-600">
          Je confirme l&apos;exactitude des informations renseignées et accepte que ce projet soit visible par les membres de 2A Acteurs de l&apos;Avenir.
        </span>
      </label>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} /> Retour
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="flex-1 sm:flex-none border border-primary/30 text-primary rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary/5 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin inline mr-2" /> : null}
          Sauvegarder brouillon
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={saving || !confirmed}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          Publier le projet
        </button>
      </div>
    </div>
  );
}

// ─── Shared step navigation ───────────────────────────────────────────────────

function StepActions({
  onBack, onNext, saving, nextLabel = "Enregistrer et continuer",
}: {
  onBack: () => void; onNext: () => void; saving: boolean; nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft size={15} /> Retour
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-70"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : null}
        {saving ? "Enregistrement…" : nextLabel}
        {!saving && <ArrowRight size={15} />}
      </button>
    </div>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────

export default function NewProjectWizard() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [projectId,   setProjectId]   = useState<string | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const [s1, setS1] = useState<Step1>({
    name: "", category: "", city: "", country: "Gabon",
    shortDescription: "", problemStatement: "",
    startDate: "", estimatedDuration: "",
    coverFile: null, coverPreview: null,
  });
  const [s2, setS2] = useState<Step2>({ objectives: "", plannedActivities: "", targetBeneficiaries: "", successIndicators: "" });
  const [s3, setS3] = useState<Step3>({ budget: "", budgetSources: "", humanResources: "", materialResources: "" });
  const [docs, setDocs] = useState<Step4Doc[]>([]);

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "");

  // ─── Save helpers ────────────────────────────────────────────────────────

  const saveStep1 = async (): Promise<string | null> => {
    const e: Record<string, string> = {};
    if (!s1.name.trim()) e.name = "Le titre est requis";
    if (!s1.category)    e.category = "La catégorie est requise";
    if (!s1.city.trim()) e.city = "La localisation est requise";
    if (!s1.shortDescription.trim()) e.shortDescription = "Le résumé est requis";
    if (!s1.problemStatement.trim()) e.problemStatement = "La problématique est requise";
    if (!s1.startDate)           e.startDate = "La date de début est requise";
    if (!s1.estimatedDuration)   e.estimatedDuration = "La durée est requise";
    if (Object.keys(e).length) { setErrors(e); return null; }
    setErrors({});

    try {
      const payload = {
        name: s1.name, category: s1.category, city: s1.city, country: s1.country,
        shortDescription: s1.shortDescription, problemStatement: s1.problemStatement,
        startDate: s1.startDate || null, estimatedDuration: s1.estimatedDuration,
      };
      let id = projectId;
      if (!id) {
        const created = await projectApi.create(payload);
        id = created.id;
        setProjectId(id);
      } else {
        await projectApi.update(id, payload);
      }
      if (s1.coverFile && id) {
        await projectApi.uploadImage(id, s1.coverFile);
      }
      return id;
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur lors de la sauvegarde", variant: "destructive" });
      return null;
    }
  };

  const saveStep2 = async (id: string) => {
    const e: Record<string, string> = {};
    if (!s2.objectives.trim()) e.objectives = "Les objectifs sont requis";
    if (!s2.plannedActivities.trim()) e.plannedActivities = "Au moins une activité est requise";
    if (!s2.targetBeneficiaries.trim()) e.targetBeneficiaries = "Les bénéficiaires sont requis";
    if (Object.keys(e).length) { setErrors(e); return false; }
    setErrors({});
    try {
      await projectApi.update(id, {
        objectives: s2.objectives, plannedActivities: s2.plannedActivities,
        targetBeneficiaries: s2.targetBeneficiaries, successIndicators: s2.successIndicators,
      });
      return true;
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
      return false;
    }
  };

  const saveStep3 = async (id: string) => {
    setErrors({});
    try {
      await projectApi.update(id, {
        budget: s3.budget || undefined, budgetSources: s3.budgetSources,
        humanResources: s3.humanResources, materialResources: s3.materialResources,
      });
      return true;
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
      return false;
    }
  };

  // ─── Navigation handlers ─────────────────────────────────────────────────

  const handleStep1Next = async () => {
    setSaving(true);
    const id = await saveStep1();
    setSaving(false);
    if (id) setCurrentStep(2);
  };

  const handleStep2Next = async () => {
    if (!projectId) return;
    setSaving(true);
    const ok = await saveStep2(projectId);
    setSaving(false);
    if (ok) setCurrentStep(3);
  };

  const handleStep3Next = async () => {
    if (!projectId) return;
    setSaving(true);
    const ok = await saveStep3(projectId);
    setSaving(false);
    if (ok) setCurrentStep(4);
  };

  const handleStep4Next = () => setCurrentStep(5);

  const handlePublish = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await projectApi.update(projectId, { isPublished: true, status: "en_cours" });
      toast({ title: "Projet publié avec succès !" });
      router.push("/dashboard/projets");
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Erreur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!projectId) return;
    toast({ title: "Brouillon sauvegardé", description: "Votre projet a été enregistré." });
    router.push("/dashboard/projets");
  };

  const handleCancel = () => {
    if (projectId) {
      toast({ title: "Brouillon conservé", description: "Vous pouvez reprendre plus tard." });
    }
    router.push("/dashboard/projets");
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1400px] mx-auto">
      <StepIndicator current={currentStep} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Main form */}
        <div>
          {currentStep === 1 && (
            <Step1Form data={s1} onChange={(d) => setS1((p) => ({ ...p, ...d }))} errors={errors} saving={saving} onNext={handleStep1Next} onCancel={handleCancel} />
          )}
          {currentStep === 2 && (
            <Step2Form data={s2} onChange={(d) => setS2((p) => ({ ...p, ...d }))} errors={errors} saving={saving} onNext={handleStep2Next} onBack={() => setCurrentStep(1)} />
          )}
          {currentStep === 3 && (
            <Step3Form data={s3} onChange={(d) => setS3((p) => ({ ...p, ...d }))} errors={errors} saving={saving} onNext={handleStep3Next} onBack={() => setCurrentStep(2)} />
          )}
          {currentStep === 4 && (
            <Step4Form docs={docs} onAddDoc={(d) => setDocs((p) => [...p, d])} onRemoveDoc={(i) => setDocs((p) => p.filter((_, idx) => idx !== i))} saving={saving} onNext={handleStep4Next} onBack={() => setCurrentStep(3)} />
          )}
          {currentStep === 5 && (
            <Step5Review s1={s1} s2={s2} s3={s3} saving={saving} onPublish={handlePublish} onSaveDraft={handleSaveDraft} onBack={() => setCurrentStep(4)} />
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <ProjectPreview s1={s1} />
          <SidebarTips step={currentStep} />
          {currentStep === 1 && <SidebarInfo />}
        </div>
      </div>
    </div>
  );
}
