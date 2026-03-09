import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import ResumeUpload from "@/components/ResumeUpload";
import RoleSelector from "@/components/RoleSelector";
import AnalyzingLoader from "@/components/AnalyzingLoader";
import AnalysisResults from "@/components/AnalysisResults";
import AnimatedBackground from "@/components/AnimatedBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { demoResult, type AnalysisResult } from "@/lib/skillData";
import { analyzeResume } from "@/lib/analyzeResume";

type Step = "hero" | "upload" | "role" | "analyzing" | "results";

const Index = () => {
  const [step, setStep] = useState<Step>("hero");
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loaderStep, setLoaderStep] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const handleSkillClick = useCallback((skill: string) => {
    setSkillSearch(skill);
    toast(`Filtering by "${skill}"`, { description: "Showing roles that require this skill." });
    if (step === "hero" || step === "upload") {
      setStep("role");
    }
  }, [step]);

  const runRealAnalysis = useCallback(async (selectedRole: string, jobDescription?: string) => {
    setRole(selectedRole);
    setStep("analyzing");
    setLoaderStep(0);
    setIsDemo(false);

    try {
      setLoaderStep(1);
      await new Promise((r) => setTimeout(r, 400));
      setLoaderStep(2);

      const result = await analyzeResume(file!, selectedRole, jobDescription);
      setLoaderStep(3);

      await new Promise((r) => setTimeout(r, 400));
      setAnalysisResult(result);
      setStep("results");
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error(err.message || "Analysis failed. Please try again.");
      setStep("role");
    }
  }, [file]);

  const runDemoAnalysis = useCallback(() => {
    setRole("Frontend Developer");
    setStep("analyzing");
    setLoaderStep(0);
    setIsDemo(true);

    // Demo uses fake timers
    setTimeout(() => setLoaderStep(1), 800);
    setTimeout(() => setLoaderStep(2), 1600);
    setTimeout(() => setLoaderStep(3), 2400);
    setTimeout(() => {
      setAnalysisResult(demoResult);
      setStep("results");
    }, 3200);
  }, []);

  const reset = () => {
    setStep("hero");
    setFile(null);
    setRole("");
    setAnalysisResult(null);
    setIsDemo(false);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground onSkillClick={handleSkillClick} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/40 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={reset} className="font-display text-lg font-bold tracking-tight hover:opacity-70 transition-opacity flex items-center gap-2">
            <span>skill<span className="text-accent">gap</span></span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium border border-accent/20">by DevX</span>
          </button>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {step !== "hero" && step !== "analyzing" && (
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider hidden sm:block">
                {step === "upload" ? "Step 1/3" : step === "role" ? "Step 2/3" : "Results"}
              </span>
            )}
            {step !== "hero" && (
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors link-underline">
                Start over
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 pt-14">
        <AnimatePresence mode="wait">
          {step === "hero" && (
            <motion.div key="hero" exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <HeroSection onUpload={() => setStep("upload")} onDemo={runDemoAnalysis} />
            </motion.div>
          )}

          {step === "upload" && (
            <motion.div key="upload" exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }} className="min-h-[85vh] flex items-center px-6">
              <ResumeUpload
                selectedFile={file}
                onFileSelect={setFile}
                onContinue={() => setStep("role")}
                onBack={() => setStep("hero")}
              />
            </motion.div>
          )}

          {step === "role" && (
            <motion.div key="role" exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }} className="min-h-[85vh] flex items-center px-6">
              <RoleSelector
                onSelect={runRealAnalysis}
                onCustom={(desc) => runRealAnalysis("Custom Role", desc)}
                onBack={() => setStep("upload")}
                initialSearch={skillSearch}
              />
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div key="analyzing" exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="min-h-[85vh] flex items-center">
              <AnalyzingLoader step={loaderStep} />
            </motion.div>
          )}

          {step === "results" && analysisResult && (
            <motion.div key="results" className="px-6 py-10">
              <AnalysisResults result={analysisResult} roleName={role} resumeFile={file} onBack={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-10 py-12 px-6 border-t border-border/40 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-display text-xl font-bold tracking-tight">
              skill<span className="text-accent">gap</span>
            </div>
            <p className="text-sm text-muted-foreground">Master the skills for your dream role.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ by <span className="text-foreground font-semibold">DevX</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest font-mono">
              <span>DevX Tools</span>
              <span>•</span>
              <span>2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
