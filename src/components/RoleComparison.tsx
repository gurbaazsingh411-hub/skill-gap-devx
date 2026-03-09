import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompareArrows, Plus, X, Loader2, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ScoreRing from "./ScoreRing";
import SkillTag from "./SkillTag";
import type { AnalysisResult } from "@/lib/skillData";
import { roles } from "@/lib/skillData";
import { supabase } from "@/integrations/supabase/client";

interface RoleComparisonProps {
  currentResult: AnalysisResult;
  currentRole: string;
  resumeFile: File | null;
}

interface ComparedRole {
  role: string;
  result: AnalysisResult;
}

const RoleComparison = ({ currentResult, currentRole, resumeFile }: RoleComparisonProps) => {
  const [comparisons, setComparisons] = useState<ComparedRole[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const usedRoles = [currentRole, ...comparisons.map((c) => c.role)];

  const availableRoles = roles.filter(
    (r) => !usedRoles.includes(r.role) && r.role.toLowerCase().includes(search.toLowerCase())
  );

  const addRole = useCallback(
    async (roleName: string) => {
      setShowPicker(false);
      setSearch("");
      setLoading(roleName);

      try {
        const roleData = roles.find((r) => r.role === roleName);
        const roleSkills = roleData?.required ?? [];

        // We need to re-analyze the same resume for a different role
        // If no file, use the current result's matched skills as a proxy
        let body: Record<string, unknown>;

        if (resumeFile) {
          const isPdf = resumeFile.type === "application/pdf" || resumeFile.name.toLowerCase().endsWith(".pdf");
          if (isPdf) {
            const base64 = await fileToBase64(resumeFile);
            body = { resumeBase64: base64, mimeType: "application/pdf", targetRole: roleName, roleSkills };
          } else {
            const text = await readFileAsText(resumeFile);
            body = { resumeText: text, targetRole: roleName, roleSkills };
          }
        } else {
          // Demo mode — send matched skills as resume text
          body = {
            resumeText: `Skills: ${currentResult.matchedSkills.join(", ")}`,
            targetRole: roleName,
            roleSkills,
          };
        }

        const { data, error } = await supabase.functions.invoke("analyze-resume", { body });
        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        const result: AnalysisResult = {
          matchedSkills: data.matchedSkills ?? [],
          missingSkills: data.missingSkills ?? [],
          partialSkills: data.partialSkills ?? [],
          skillScore: typeof data.skillScore === "number" ? data.skillScore : 0,
          priorityOrder: data.priorityOrder ?? [],
          recommendations: data.recommendations ?? {},
        };

        setComparisons((prev) => [...prev, { role: roleName, result }]);
        toast.success(`${roleName} analysis complete!`);
      } catch (err: any) {
        console.error("Comparison analysis failed:", err);
        toast.error(err.message || "Failed to analyze role.");
      } finally {
        setLoading(null);
      }
    },
    [resumeFile, currentResult]
  );

  const removeRole = (roleName: string) => {
    setComparisons((prev) => prev.filter((c) => c.role !== roleName));
  };

  const allResults = [
    { role: currentRole, result: currentResult },
    ...comparisons,
  ];

  if (comparisons.length === 0 && !showPicker && !loading) {
    return (
      <div className="text-center p-10 rounded-2xl border border-dashed bg-card/40 backdrop-blur-md">
        <GitCompareArrows className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-display text-lg font-bold mb-2">Role Comparison</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Compare your skill gaps across multiple roles side-by-side to find your best fit.
        </p>
        <Button onClick={() => setShowPicker(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Role to Compare
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold">Role Comparison</h3>
        {comparisons.length < 3 && !showPicker && !loading && (
          <Button variant="outline" size="sm" onClick={() => setShowPicker(true)} className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Role
          </Button>
        )}
      </div>

      {/* Role picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Select a role to compare</p>
                <button onClick={() => { setShowPicker(false); setSearch(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border bg-secondary/50 text-xs focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                />
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {availableRoles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => addRole(r.role)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/70 transition-colors text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{r.role}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{r.required.length} skills</p>
                    </div>
                  </button>
                ))}
                {availableRoles.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No more roles available</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl border bg-card/40">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Analyzing for {loading}…</span>
        </motion.div>
      )}

      {/* Side-by-side comparison */}
      <div className={`grid gap-4 ${allResults.length === 2 ? "grid-cols-1 md:grid-cols-2" : allResults.length >= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>
        {allResults.map(({ role, result }, idx) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md shadow-card relative group"
          >
            {idx > 0 && (
              <button
                onClick={() => removeRole(role)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Role header */}
            <div className="text-center mb-4">
              {idx === 0 && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent mb-1 block">Current</span>
              )}
              <h4 className="text-sm font-bold">{role}</h4>
            </div>

            {/* Score */}
            <div className="flex justify-center mb-5">
              <ScoreRing score={result.skillScore} size={90} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-skill-matched-bg">
                <p className="font-mono text-lg font-bold text-skill-matched-foreground">{result.matchedSkills.length}</p>
                <p className="text-[10px] text-skill-matched-foreground/70">Have</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-skill-missing-bg">
                <p className="font-mono text-lg font-bold text-skill-missing-foreground">{result.missingSkills.length}</p>
                <p className="text-[10px] text-skill-missing-foreground/70">Missing</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-skill-partial-bg">
                <p className="font-mono text-lg font-bold text-skill-partial-foreground">{result.partialSkills.length}</p>
                <p className="text-[10px] text-skill-partial-foreground/70">Partial</p>
              </div>
            </div>

            {/* Top missing skills */}
            {result.missingSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Top gaps</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.slice(0, 4).map((s) => (
                    <SkillTag key={s} label={s} variant="missing" />
                  ))}
                  {result.missingSkills.length > 4 && (
                    <span className="text-[10px] text-muted-foreground px-2 py-1">+{result.missingSkills.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Best fit indicator */}
      {comparisons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border bg-accent/10 backdrop-blur-md"
        >
          <p className="text-sm">
            <span className="font-bold">Best fit:</span>{" "}
            <span className="font-semibold text-accent-foreground">
              {allResults.reduce((best, curr) => (curr.result.skillScore > best.result.skillScore ? curr : best)).role}
            </span>
            <span className="text-muted-foreground">
              {" "}— highest skill match at{" "}
              {Math.max(...allResults.map((r) => r.result.skillScore))}%
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default RoleComparison;
