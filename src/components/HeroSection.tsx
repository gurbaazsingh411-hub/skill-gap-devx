import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkillMarquee from "@/components/SkillMarquee";

interface HeroSectionProps {
  onUpload: () => void;
  onDemo: () => void;
}

const HeroSection = ({ onUpload, onDemo }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Main hero content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 mb-10 border rounded-full text-xs font-mono uppercase tracking-wider text-muted-foreground bg-card/60 backdrop-blur-md shadow-card"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            AI-Powered Resume Intelligence
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-6xl sm:text-7xl lg:text-[5.5rem] font-800 tracking-tight leading-[0.95] mb-6">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              Know what
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              you're{" "}
              <span className="relative inline-block">
                missing
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-accent/40 -z-10 origin-left rounded-sm"
                />
              </span>
              <span className="text-accent">.</span>
            </motion.span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed"
          >
            Upload your resume. Pick a role. See exactly which skills you need to learn.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="xl" onClick={onUpload} className="gap-3 group btn-shimmer shadow-elevated">
              Upload Resume
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="xl" variant="outline" onClick={onDemo} className="gap-2 group bg-card/60 backdrop-blur-md border-border/80 hover:bg-card/80">
              Try Demo
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-20 flex items-center gap-10 sm:gap-16 text-center"
        >
          {[
            { value: "8+", label: "Roles" },
            { value: "60+", label: "Skills tracked" },
            { value: "<5s", label: "Analysis time" },
          ].map((stat) => (
            <div key={stat.label} className="group">
              <p className="text-2xl sm:text-3xl font-display font-bold group-hover:text-accent transition-colors">{stat.value}</p>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <SkillMarquee />
      </motion.div>
    </section>
  );
};

export default HeroSection;
