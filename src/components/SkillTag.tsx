import { Check, X, AlertTriangle } from "lucide-react";

type SkillTagVariant = "matched" | "missing" | "partial";

interface SkillTagProps {
  label: string;
  variant: SkillTagVariant;
}

const config: Record<SkillTagVariant, { icon: typeof Check; bg: string; text: string; border: string }> = {
  matched: { icon: Check, bg: "bg-skill-matched-bg", text: "text-skill-matched-foreground", border: "border-skill-matched/25" },
  missing: { icon: X, bg: "bg-skill-missing-bg", text: "text-skill-missing-foreground", border: "border-skill-missing/25" },
  partial: { icon: AlertTriangle, bg: "bg-skill-partial-bg", text: "text-skill-partial-foreground", border: "border-skill-partial/25" },
};

const SkillTag = ({ label, variant }: SkillTagProps) => {
  const c = config[variant];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-transform duration-200 hover:scale-105 cursor-default ${c.bg} ${c.text} ${c.border}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default SkillTag;
