import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  onContinue: () => void;
  onBack: () => void;
  selectedFile: File | null;
}

const ResumeUpload = ({ onFileSelect, onContinue, onBack, selectedFile }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
          <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-mono font-bold shadow-card">1</span>
          <div>
            <p className="font-display text-xl font-bold">Upload resume</p>
            <p className="text-sm text-muted-foreground">We'll extract skills & experience</p>
          </div>
        </div>

        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
            isDragging
              ? "border-accent bg-accent/10 scale-[1.02]"
              : "border-border hover:border-muted-foreground/60 hover:bg-secondary/50"
          }`}
        >
          <input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={handleInputChange} className="hidden" />
          <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragging ? "bg-accent/20 scale-110" : "bg-secondary group-hover:bg-accent/10"
          }`}>
            <Upload className={`w-6 h-6 transition-colors ${isDragging ? "text-accent" : "text-muted-foreground group-hover:text-foreground"}`} />
          </div>
          <p className="font-semibold text-sm mb-1">Drop your resume here</p>
          <p className="text-xs text-muted-foreground font-mono">PDF · DOCX · TXT</p>
        </div>

        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl border bg-secondary/50">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onFileSelect(null as any); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Button onClick={onContinue} size="lg" className="w-full mt-4 gap-2 group btn-shimmer shadow-elevated">
                Continue
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ResumeUpload;
