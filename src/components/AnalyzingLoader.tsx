import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const steps = [
  { text: "Parsing resume content", icon: "◇" },
  { text: "Extracting skills & experience", icon: "◈" },
  { text: "Comparing with role requirements", icon: "◆" },
  { text: "Generating recommendations", icon: "●" },
];

interface AnalyzingLoaderProps {
  step: number;
}

const AnalyzingLoader = ({ step }: AnalyzingLoaderProps) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-sm mx-auto text-center py-20 px-6"
    >
      <div className="p-8 rounded-3xl border bg-card/70 backdrop-blur-xl shadow-elevated">
        {/* Spinning ring */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <div className="absolute inset-4 rounded-full border border-transparent border-l-skill-matched animate-spin" style={{ animationDuration: "2s" }} />
        </div>

        <p className="font-display text-lg font-bold mb-1">Analyzing{dots}</p>
        <p className="text-sm text-muted-foreground mb-8">This usually takes a few seconds</p>

        <div className="space-y-3 text-left">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                i < step
                  ? "bg-skill-matched-bg border border-skill-matched/20"
                  : i === step
                  ? "bg-secondary/50 border border-border"
                  : "opacity-40"
              }`}
            >
              <span className={`text-sm font-mono transition-colors ${i < step ? "text-skill-matched" : i === step ? "text-foreground animate-pulse-soft" : "text-muted-foreground"}`}>
                {i < step ? "✓" : s.icon}
              </span>
              <span className="text-sm font-medium">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyzingLoader;
