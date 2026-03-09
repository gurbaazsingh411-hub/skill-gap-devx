import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Briefcase, ChevronLeft, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/skillData";

interface RoleSelectorProps {
  onSelect: (role: string) => void;
  onCustom: (description: string) => void;
  onBack: () => void;
  initialSearch?: string;
}

const RoleSelector = ({ onSelect, onCustom, onBack, initialSearch = "" }: RoleSelectorProps) => {
  const [search, setSearch] = useState(initialSearch);
  const [showCustom, setShowCustom] = useState(false);
  const [customDesc, setCustomDesc] = useState("");

  const filtered = roles.filter((r) =>
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md mx-auto w-full"
    >
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 link-underline">
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <div className="p-8 rounded-3xl border bg-card/70 backdrop-blur-xl shadow-elevated">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold shadow-card">2</span>
          <div>
            <p className="font-display text-xl font-bold">Target role</p>
            <p className="text-sm text-muted-foreground">What position are you aiming for?</p>
          </div>
        </div>

        {!showCustom ? (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans"
              />
            </div>

            <div className="space-y-2 mb-4 max-h-80 overflow-y-auto stagger-children">
              {filtered.map((r) => (
                <button
                  key={r.role}
                  onClick={() => onSelect(r.role)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-secondary/30 hover:bg-secondary transition-all duration-200 text-left group hover:border-muted-foreground/50 hover:shadow-card"
                >
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.role}</p>
                    <p className="text-xs text-muted-foreground font-mono">{r.required.length} skills</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-3 border border-dashed rounded-xl hover:bg-secondary/50 hover:border-muted-foreground/50"
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste a job description instead
            </button>
          </>
        ) : (
          <>
            <textarea
              placeholder="Paste the full job description here..."
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              className="w-full h-44 p-4 rounded-xl border bg-secondary/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring font-mono leading-relaxed"
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowCustom(false)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => onCustom(customDesc)} disabled={!customDesc.trim()} className="flex-1 gap-2 group btn-shimmer">
                Analyze
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default RoleSelector;
