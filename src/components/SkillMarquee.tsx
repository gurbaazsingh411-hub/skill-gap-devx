import { roles } from "@/lib/skillData";

const skills = roles.flatMap((r) => r.required).filter((v, i, a) => a.indexOf(v) === i);
const doubled = [...skills, ...skills];

const SkillMarquee = () => (
  <div className="relative overflow-hidden py-4 border-y border-border/50">
    <div className="animate-marquee flex gap-6 whitespace-nowrap">
      {doubled.map((s, i) => (
        <span key={i} className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
          {s}
        </span>
      ))}
    </div>
  </div>
);

export default SkillMarquee;
