import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Minus, Zap, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateBenchmark, type BenchmarkData } from "@/lib/generateBenchmark";
import type { AnalysisResult } from "@/lib/skillData";

interface IndustryBenchmarkProps {
  result: AnalysisResult;
  roleName: string;
}

const DemandBadge = ({ demand }: { demand: "rising" | "stable" | "declining" }) => {
  const config = {
    rising: { icon: TrendingUp, label: "Rising", className: "text-skill-matched bg-skill-matched-bg" },
    stable: { icon: Minus, label: "Stable", className: "text-muted-foreground bg-secondary" },
    declining: { icon: TrendingDown, label: "Declining", className: "text-skill-missing bg-skill-missing-bg" },
  };
  const { icon: Icon, label, className } = config[demand];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full ${className}`}>
      <Icon className="w-2.5 h-2.5" /> {label}
    </span>
  );
};

const SkillBar = ({ skill, candidateLevel, industryAverage, demand, index }: {
  skill: string; candidateLevel: number; industryAverage: number; demand: "rising" | "stable" | "declining"; index: number;
}) => {
  const diff = candidateLevel - industryAverage;
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold">{skill}</span>
        <div className="flex items-center gap-2">
          <DemandBadge demand={demand} />
          <span className={`text-[10px] font-mono ${diff >= 0 ? "text-skill-matched" : "text-skill-missing"}`}>
            {diff >= 0 ? "+" : ""}{diff}
          </span>
        </div>
      </div>
      <div className="relative h-5 rounded-full bg-secondary overflow-hidden">
        {/* Industry average marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10"
          style={{ left: `${industryAverage}%` }}
        />
        {/* Candidate bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${candidateLevel}%` }}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute inset-y-0 left-0 rounded-full ${
            candidateLevel >= industryAverage ? "bg-skill-matched/70" : "bg-skill-missing/70"
          }`}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">You: {candidateLevel}%</span>
        <span className="text-[10px] text-muted-foreground">Avg: {industryAverage}%</span>
      </div>
    </motion.div>
  );
};

const IndustryBenchmark = ({ result, roleName }: IndustryBenchmarkProps) => {
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await generateBenchmark(
        result.matchedSkills, result.missingSkills, result.partialSkills, result.skillScore, roleName
      );
      setBenchmark(data);
      toast.success("Benchmark ready!", { description: "See how you compare to the industry." });
    } catch (err: any) {
      console.error("Benchmark generation failed:", err);
      toast.error(err.message || "Failed to generate benchmark.");
    } finally {
      setLoading(false);
    }
  }, [result, roleName]);

  if (!benchmark) {
    return (
      <div className="text-center p-10 rounded-2xl border border-dashed bg-card/40 backdrop-blur-md">
        <BarChart3 className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-display text-lg font-bold mb-2">Industry Benchmarking</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          See how your skills compare to average candidates applying for {roleName} roles.
        </p>
        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          {loading ? "Analyzing market data…" : "Compare to Industry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-bold">Industry Benchmarking</h3>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Your Percentile</p>
          <p className="font-display text-3xl font-bold">{benchmark.percentile}<span className="text-base text-muted-foreground">th</span></p>
          <p className="text-xs text-muted-foreground mt-1">of all applicants</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Average Candidate</p>
          <p className="font-display text-3xl font-bold">{benchmark.averageScore}<span className="text-base text-muted-foreground">/100</span></p>
          <p className="text-xs text-muted-foreground mt-1">skill score</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Top 10%</p>
          <p className="font-display text-3xl font-bold">{benchmark.topPerformerScore}<span className="text-base text-muted-foreground">/100</span></p>
          <p className="text-xs text-muted-foreground mt-1">skill score</p>
        </motion.div>
      </div>

      {/* Skill comparisons */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="p-6 rounded-2xl border bg-card/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono">Skill Comparison</h4>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground/40" /> Avg</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-skill-matched/70" /> Above</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-skill-missing/70" /> Below</span>
          </div>
        </div>
        <div className="space-y-4">
          {benchmark.skillComparisons.map((sc, i) => (
            <SkillBar key={sc.skill} {...sc} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Edges & Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-skill-matched" />
            <h4 className="text-sm font-bold">Competitive Edges</h4>
          </div>
          <ul className="space-y-2">
            {benchmark.competitiveEdges.map((edge, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-skill-matched shrink-0" />
                {edge}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-skill-missing" />
            <h4 className="text-sm font-bold">Biggest Gaps</h4>
          </div>
          <ul className="space-y-2">
            {benchmark.biggestGaps.map((gap, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-skill-missing shrink-0" />
                {gap}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Market Insights */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-bold">Market Insights</h4>
        </div>
        <ul className="space-y-2">
          {benchmark.marketInsights.map((insight, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default IndustryBenchmark;
