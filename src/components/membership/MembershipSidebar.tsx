import { Users, Sprout, BookOpen, Heart, Phone, Mail, Clock, Shield } from "lucide-react";

const reasons = [
  { icon: Users, title: "Agir ensemble", desc: "Participez à des projets concrets qui changent des vies." },
  { icon: Sprout, title: "Avoir un impact", desc: "Contribuez à un développement durable et inclusif." },
  { icon: BookOpen, title: "Apprendre & évoluer", desc: "Accédez à des ressources et des formations." },
  { icon: Heart, title: "Faire partie d'une communauté", desc: "Rejoignez un réseau engagé et bienveillant." },
];

export default function MembershipSidebar() {
  return (
    <div className="space-y-6">
      {/* Why join */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-bold text-primary mb-5">Pourquoi adhérer ?</h3>
        <div className="space-y-4">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-bold text-accent mb-4">Besoin d&apos;aide ?</h3>
        <p className="text-sm text-gray-500 mb-4">Notre équipe est là pour vous accompagner.</p>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-primary flex-shrink-0" />
            <span>+241 00 00 00 00</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-primary flex-shrink-0" />
            <span>contact@acteurs-avenir.org</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-primary flex-shrink-0" />
            <span>Lun - Ven : 8h00 - 17h00</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-primary mb-1">Vos données sont sécurisées</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Vos informations sont protégées et ne seront jamais partagées avec des tiers.
          </p>
        </div>
      </div>
    </div>
  );
}
