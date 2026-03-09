import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Download, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SkillTag from "./SkillTag";
import ScoreRing from "./ScoreRing";
import LearningRoadmapView from "./LearningRoadmap";
import type { AnalysisResult } from "@/lib/skillData";
import { generateReport } from "@/lib/generateReport";
import { generateRoadmap, type LearningRoadmap } from "@/lib/generateRoadmap";
import IndustryBenchmark from "./IndustryBenchmark";
import RoleComparison from "./RoleComparison";

interface AnalysisResultsProps {
  result: AnalysisResult;
  roleName: string;
  resumeFile: File | null;
  onBack: () => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
};

const AnalysisResults = ({ result, roleName, resumeFile, onBack }: AnalysisResultsProps) => {
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const handleGenerateRoadmap = useCallback(async () => {
    setRoadmapLoading(true);
    try {
      const data = await generateRoadmap(
        result.missingSkills,
        result.partialSkills,
        result.matchedSkills,
        roleName,
      );
      setRoadmap(data);
      toast.success("Roadmap generated!", { description: "Your personalized learning plan is ready." });
    } catch (err: any) {
      console.error("Roadmap generation failed:", err);
      toast.error(err.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setRoadmapLoading(false);
    }
  }, [result, roleName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto w-full pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors link-underline">
          <ArrowLeft className="w-4 h-4" />
          New analysis
        </button>
        <Button variant="outline" size="sm" className="gap-2 text-xs bg-card/60 backdrop-blur-md" onClick={() => generateReport(result, roleName)}>
          <Download className="w-3.5 h-3.5" />
          Export PDF
        </Button>
      </div>

      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-center mb-14 p-10 rounded-3xl border bg-card/60 backdrop-blur-xl shadow-elevated"
      >
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Analysis for</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mb-8">{roleName}</h2>
        <ScoreRing score={result.skillScore} />
      </motion.div>

      {/* Three column skill breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {/* Matched */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border bg-card/60 backdrop-blur-xl shadow-card hover:shadow-elevated transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-skill-matched" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Have</h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-mono">{result.matchedSkills.length}</span>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
            {result.matchedSkills.map((s) => (
              <motion.div key={s} variants={item}>
                <SkillTag label={s} variant="matched" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Missing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border bg-card/60 backdrop-blur-xl shadow-card hover:shadow-elevated transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-skill-missing" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Missing</h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-mono">{result.missingSkills.length}</span>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
            {result.missingSkills.map((s) => (
              <motion.div key={s} variants={item}>
                <SkillTag label={s} variant="missing" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Partial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border bg-card/60 backdrop-blur-xl shadow-card hover:shadow-elevated transition-shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-skill-partial" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Improve</h3>
            <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-mono">{result.partialSkills.length}</span>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
            {result.partialSkills.map((s) => (
              <motion.div key={s.has} variants={item}>
                <SkillTag label={`${s.has} → ${s.missing}`} variant="partial" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Priority learning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-14"
      >
        <h3 className="font-display text-xl font-bold mb-5">Priority Learning Order</h3>
        <div className="space-y-2">
          {result.priorityOrder.map((skill, i) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card/60 backdrop-blur-md hover:bg-secondary/50 transition-all group hover:shadow-card"
            >
              <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm font-semibold flex-1">{skill}</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Learning Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-14"
      >
        <LearningRoadmapView
          roadmap={roadmap}
          isLoading={roadmapLoading}
          onGenerate={handleGenerateRoadmap}
        />
      </motion.div>

      {/* Industry Benchmarking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="mb-14"
      >
        <IndustryBenchmark result={result} roleName={roleName} />
      </motion.div>

      {/* Role Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.88 }}
        className="mb-14"
      >
        <RoleComparison currentResult={result} currentRole={roleName} resumeFile={resumeFile} />
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="font-display text-xl font-bold mb-5">Quick Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(result.recommendations).map(([skill, recs], i) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.08 }}
              className="p-5 rounded-2xl border bg-card/60 backdrop-blur-md shadow-card hover:shadow-elevated transition-all group"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold">{skill}</h4>
              </div>
              <ul className="space-y-2">
                {recs.map((r, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-2.5 leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisResults;
