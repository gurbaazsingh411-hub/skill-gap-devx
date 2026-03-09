import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Clock, BookOpen, Video, FileText, Code2, ExternalLink,
  ChevronDown, ChevronRight, Rocket, Target, Loader2, Sparkles,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningRoadmap, RoadmapPhase, RoadmapResource } from "@/lib/generateRoadmap";

const typeIcons: Record<string, React.ReactNode> = {
  course: <GraduationCap className="w-3.5 h-3.5" />,
  documentation: <FileText className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  book: <BookOpen className="w-3.5 h-3.5" />,
  tutorial: <Code2 className="w-3.5 h-3.5" />,
  project: <Rocket className="w-3.5 h-3.5" />,
};

const typeLabels: Record<string, string> = {
  course: "Course",
  documentation: "Docs",
  video: "Video",
  book: "Book",
  tutorial: "Tutorial",
  project: "Project",
};

const ResourceCard = ({ resource }: { resource: RoadmapResource }) => (
  <a
    href={resource.url || "#"}
    target={resource.url ? "_blank" : undefined}
    rel="noopener noreferrer"
    className={`flex items-start gap-3 p-3 rounded-xl border bg-card/40 backdrop-blur-sm hover:bg-secondary/50 transition-all group ${resource.url ? "cursor-pointer" : "cursor-default"}`}
  >
    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 text-accent">
      {typeIcons[resource.type] || <BookOpen className="w-3.5 h-3.5" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium leading-snug group-hover:text-accent transition-colors">
        {resource.title}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
          {typeLabels[resource.type] || resource.type}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${resource.isFree ? "bg-skill-matched-bg text-skill-matched-foreground" : "bg-accent/15 text-accent"}`}>
          {resource.isFree ? "Free" : "Paid"}
        </span>
        {resource.estimatedHours && (
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {resource.estimatedHours}h
          </span>
        )}
      </div>
    </div>
    {resource.url && (
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    )}
  </a>
);

const PhaseCard = ({ phase, index, isLast }: { phase: RoadmapPhase; index: number; isLast: boolean }) => {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5 }}
      className="relative"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[19px] top-[52px] bottom-[-12px] w-px bg-border" />
      )}

      <div className="flex gap-4">
        {/* Timeline dot */}
        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold shrink-0 z-10">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left p-5 rounded-2xl border bg-card/60 backdrop-blur-xl shadow-card hover:shadow-elevated transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-lg font-bold">{phase.name}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {phase.weeks}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
              </div>
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              )}
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {phase.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-accent/15 text-accent-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-4">
                  {/* Resources */}
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 ml-1">
                      Resources
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.resources.map((resource, i) => (
                        <ResourceCard key={i} resource={resource} />
                      ))}
                    </div>
                  </div>

                  {/* Project */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-4 h-4 text-accent" />
                      <p className="text-sm font-bold">Project: {phase.project.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {phase.project.description}
                    </p>
                  </div>

                  {/* Milestone */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-skill-matched-bg/50">
                    <Target className="w-4 h-4 text-skill-matched shrink-0 mt-0.5" />
                    <p className="text-xs text-skill-matched-foreground leading-relaxed">
                      <span className="font-bold">Milestone:</span> {phase.milestone}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

interface LearningRoadmapViewProps {
  roadmap: LearningRoadmap | null;
  isLoading: boolean;
  onGenerate: () => void;
}

const LearningRoadmapView = ({ roadmap, isLoading, onGenerate }: LearningRoadmapViewProps) => {
  if (!roadmap && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-10 rounded-2xl border border-dashed bg-card/40 backdrop-blur-md"
      >
        <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
          <Map className="w-7 h-7 text-accent" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Learning Roadmap</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get a personalized, phased learning plan with curated courses, projects, and milestones tailored to your skill gaps.
        </p>
        <Button onClick={onGenerate} className="gap-2 btn-shimmer shadow-elevated">
          <Sparkles className="w-4 h-4" />
          Generate My Roadmap
        </Button>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
        <p className="text-sm text-muted-foreground font-mono">Generating your personalized roadmap...</p>
        <p className="text-xs text-muted-foreground/60 mt-1">This may take a few seconds</p>
      </motion.div>
    );
  }

  if (!roadmap) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <Map className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Your Learning Roadmap</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3" />
              ~{roadmap.totalWeeks} weeks estimated
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{roadmap.summary}</p>
      </div>

      {/* Phases */}
      <div>
        {roadmap.phases.map((phase, i) => (
          <PhaseCard
            key={i}
            phase={phase}
            index={i}
            isLast={i === roadmap.phases.length - 1}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LearningRoadmapView;
