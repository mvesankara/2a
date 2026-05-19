import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Informations personnelles" },
  { id: 2, label: "Adhésion & Cotisation" },
  { id: 3, label: "Documents (optionnel)" },
  { id: 4, label: "Récapitulatif & Validation" },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 mb-8">
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {STEPS.map((step, idx) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
              {/* Circle */}
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors",
                  done ? "bg-accent text-white" :
                  active ? "bg-primary text-white" :
                  "bg-gray-100 text-gray-400 border-2 border-gray-200"
                )}
              >
                {done ? <Check size={16} /> : step.id}
              </div>
              {/* Label */}
              <div className="hidden md:block">
                <p className={cn(
                  "text-xs font-semibold leading-tight",
                  active ? "text-primary" : done ? "text-accent" : "text-gray-400"
                )}>
                  {step.label}
                </p>
              </div>
              {/* Separator */}
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  "hidden md:block h-px w-8 lg:w-12 mx-2 flex-shrink-0",
                  done ? "bg-accent" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
