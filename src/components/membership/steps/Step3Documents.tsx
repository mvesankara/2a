"use client";

import { Upload, Image as ImageIcon, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberData } from "../MembershipForm";

function FileUploadZone({
  label, hint, accept, file, onChange,
  icon: Icon,
}: {
  label: string; hint: string; accept: string; file: File | null;
  onChange: (f: File | null) => void; icon: React.ElementType;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      {file ? (
        <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-700 truncate">{file.name}</p>
            <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} Ko</p>
          </div>
          <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="block border-2 border-dashed border-gray-200 hover:border-accent/50 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 group-hover:bg-accent/10 rounded-xl flex items-center justify-center transition-colors">
              <Icon size={22} className="text-gray-400 group-hover:text-accent transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                <span className="text-accent">Cliquez</span> ou glissez un fichier ici
              </p>
              <p className="text-xs text-gray-400 mt-1">{hint}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Upload size={12} />
              Taille max : 5 Mo
            </div>
          </div>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size <= 5 * 1024 * 1024) onChange(f);
            }}
          />
        </label>
      )}
    </div>
  );
}

export default function Step3Documents({
  data, onChange,
}: {
  data: MemberData; onChange: (fields: Partial<MemberData>) => void;
}) {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-1">Documents</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">Optionnel</span>
          <span>Ces documents ne sont pas obligatoires mais accéléreront le traitement.</span>
        </div>
      </div>

      {/* Photo de profil */}
      <FileUploadZone
        label="Photo de profil"
        hint="JPG, PNG ou WEBP"
        accept="image/*"
        file={data.profilePhoto}
        icon={ImageIcon}
        onChange={(f) => onChange({ profilePhoto: f })}
      />

      {/* Pièce d'identité */}
      <FileUploadZone
        label="Pièce d'identité (CNI, Passeport, Permis)"
        hint="JPG, PNG ou PDF"
        accept="image/*,.pdf"
        file={data.idDocument}
        icon={FileText}
        onChange={(f) => onChange({ idDocument: f })}
      />

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex items-start gap-3">
        <span className="text-lg leading-none">🔒</span>
        <p>Vos documents sont stockés de manière sécurisée et seront uniquement consultés par notre équipe administrative dans le cadre de la validation de votre adhésion.</p>
      </div>
    </div>
  );
}
