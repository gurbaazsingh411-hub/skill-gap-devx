import jsPDF from "jspdf";
import type { AnalysisResult } from "@/lib/skillData";

export function generateReport(result: AnalysisResult, roleName: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  const colors = {
    bg: [245, 243, 238] as [number, number, number],
    fg: [30, 33, 39] as [number, number, number],
    accent: [230, 190, 60] as [number, number, number],
    matched: [34, 139, 94] as [number, number, number],
    missing: [210, 70, 70] as [number, number, number],
    partial: [210, 160, 30] as [number, number, number],
    muted: [120, 120, 115] as [number, number, number],
    cardBg: [238, 236, 230] as [number, number, number],
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Header ──
  doc.setFillColor(...colors.fg);
  doc.rect(0, 0, W, 52, "F");

  doc.setTextColor(245, 243, 238);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("skillgap", margin, 18);

  doc.setFontSize(9);
  doc.setTextColor(180, 180, 175);
  doc.text("SKILL GAP ANALYSIS REPORT", margin, 28);

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(roleName, margin, 42);

  // Date
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 175);
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), W - margin, 18, { align: "right" });

  y = 62;

  // ── Score ──
  doc.setFillColor(...colors.cardBg);
  doc.roundedRect(margin, y, contentW, 30, 3, 3, "F");

  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.text("OVERALL SKILL MATCH", margin + 8, y + 12);

  doc.setFontSize(28);
  doc.setTextColor(...colors.fg);
  doc.text(`${result.skillScore}%`, margin + 8, y + 25);

  // Score bar
  const barX = margin + 55;
  const barW = contentW - 63;
  const barY = y + 18;
  doc.setFillColor(210, 210, 205);
  doc.roundedRect(barX, barY, barW, 5, 2.5, 2.5, "F");
  const fillW = (result.skillScore / 100) * barW;
  doc.setFillColor(...colors.matched);
  doc.roundedRect(barX, barY, Math.max(fillW, 5), 5, 2.5, 2.5, "F");

  y += 40;

  // ── Skills section helper ──
  const drawSkillSection = (
    title: string,
    skills: string[],
    color: [number, number, number],
    bgColor: [number, number, number],
  ) => {
    if (skills.length === 0) return;
    ensureSpace(30);

    // Dot + title
    doc.setFillColor(...color);
    doc.circle(margin + 3, y + 2, 2, "F");
    doc.setFontSize(11);
    doc.setTextColor(...colors.fg);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 8, y + 4);
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text(`${skills.length}`, margin + 8 + doc.getTextWidth(title) + 4, y + 4);
    y += 10;

    // Tags
    let tagX = margin;
    skills.forEach((skill) => {
      const tw = doc.getTextWidth(skill) + 8;
      if (tagX + tw > W - margin) {
        tagX = margin;
        y += 8;
        ensureSpace(10);
      }
      doc.setFillColor(...bgColor);
      doc.roundedRect(tagX, y - 3, tw, 7, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...color);
      doc.text(skill, tagX + 4, y + 2);
      tagX += tw + 3;
    });
    y += 14;
  };

  drawSkillSection("Skills You Have", result.matchedSkills, colors.matched, [220, 245, 235]);
  drawSkillSection("Missing Skills", result.missingSkills, colors.missing, [250, 225, 225]);

  // Partial skills
  if (result.partialSkills.length > 0) {
    ensureSpace(30);
    doc.setFillColor(...colors.partial);
    doc.circle(margin + 3, y + 2, 2, "F");
    doc.setFontSize(11);
    doc.setTextColor(...colors.fg);
    doc.setFont("helvetica", "bold");
    doc.text("Skills to Improve", margin + 8, y + 4);
    y += 10;

    result.partialSkills.forEach((s) => {
      ensureSpace(10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.fg);
      doc.text(`${s.has}  →  ${s.missing}`, margin + 4, y + 2);
      y += 7;
    });
    y += 6;
  }

  // ── Priority Order ──
  if (result.priorityOrder.length > 0) {
    ensureSpace(20);
    doc.setFontSize(13);
    doc.setTextColor(...colors.fg);
    doc.setFont("helvetica", "bold");
    doc.text("Priority Learning Order", margin, y + 4);
    y += 12;

    result.priorityOrder.forEach((skill, i) => {
      ensureSpace(12);
      doc.setFillColor(...colors.cardBg);
      doc.roundedRect(margin, y - 2, contentW, 9, 2, 2, "F");

      doc.setFillColor(...colors.fg);
      doc.circle(margin + 6, y + 2.5, 3.5, "F");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`${i + 1}`, margin + 6 - doc.getTextWidth(`${i + 1}`) / 2, y + 4);

      doc.setFontSize(9);
      doc.setTextColor(...colors.fg);
      doc.setFont("helvetica", "normal");
      doc.text(skill, margin + 14, y + 4);
      y += 12;
    });
    y += 4;
  }

  // ── Recommendations ──
  const recEntries = Object.entries(result.recommendations);
  if (recEntries.length > 0) {
    ensureSpace(20);
    doc.setFontSize(13);
    doc.setTextColor(...colors.fg);
    doc.setFont("helvetica", "bold");
    doc.text("Learning Resources", margin, y + 4);
    y += 12;

    recEntries.forEach(([skill, recs]) => {
      ensureSpace(20 + recs.length * 7);
      doc.setFillColor(...colors.cardBg);
      const blockH = 10 + recs.length * 7;
      doc.roundedRect(margin, y - 2, contentW, blockH, 3, 3, "F");

      doc.setFontSize(10);
      doc.setTextColor(...colors.fg);
      doc.setFont("helvetica", "bold");
      doc.text(skill, margin + 6, y + 5);
      y += 10;

      recs.forEach((r) => {
        doc.setFillColor(...colors.accent);
        doc.circle(margin + 8, y + 1.5, 1, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.muted);
        const lines = doc.splitTextToSize(r, contentW - 18);
        doc.text(lines, margin + 12, y + 2.5);
        y += lines.length * 5 + 2;
      });
      y += 6;
    });
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...colors.muted);
    doc.text("Generated by skillgap", margin, 290);
    doc.text(`Page ${p} of ${pageCount}`, W - margin, 290, { align: "right" });
  }

  doc.save(`skillgap-${roleName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
