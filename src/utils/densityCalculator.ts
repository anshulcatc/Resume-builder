import { ResumeData } from '../types/resume';

export interface DensityAnalysis {
  totalCharacters: number;
  totalWords: number;
  totalBullets: number;
  estimatedHeightPx: number;
  maxPageHeightPx: number; // approx 1080px printable on A4
  densityPercentage: number;
  status: 'Too Sparse' | 'Balanced' | 'Dense' | 'Too Dense';
  pageCountEstimate: number;
  recommendations: string[];
  orphanRiskBullets: { sectionTitle: string; bulletText: string }[];
}

export function analyzeResumeDensity(resume: ResumeData): DensityAnalysis {
  let totalChars = 0;
  let totalWords = 0;
  let totalBullets = 0;
  const orphanRiskBullets: { sectionTitle: string; bulletText: string }[] = [];
  const recommendations: string[] = [];

  // Base overhead: Header + Margins + Footer
  let estimatedHeightPx = 65; // Name + Logo + Subtitle
  estimatedHeightPx += 30; // Contact footer bar

  // Spacing multiplier from settings
  const spacingMultiplier =
    resume.settings.spacingDensity === 'ultra-compact'
      ? 0.82
      : resume.settings.spacingDensity === 'compact'
      ? 0.95
      : 1.1;

  const fontMultiplier =
    resume.settings.fontSize === 'compact'
      ? 0.92
      : resume.settings.fontSize === 'normal'
      ? 1.0
      : 1.1;

  for (const section of resume.sections) {
    if (!section.visible) continue;

    // Section header height (table header row)
    estimatedHeightPx += 24 * spacingMultiplier;

    if (section.type === 'education') {
      // 4-column education table (1 row header + rows)
      for (const entry of section.entries) {
        estimatedHeightPx += 19 * spacingMultiplier * fontMultiplier;
        totalChars += (entry.degree?.length || 0) + (entry.institution?.length || 0) + (entry.score?.length || 0);
      }
      continue;
    }

    if (section.type === 'other_interests') {
      for (const entry of section.entries) {
        estimatedHeightPx += 20 * spacingMultiplier;
        const text = (entry.inlineItems || []).join(' ') + (entry.category || '');
        totalChars += text.length;
      }
      continue;
    }

    for (const entry of section.entries) {
      // Entry top row (e.g. Org, Title, Date)
      if (entry.organization || entry.roleOrTitle || entry.dateOrYear) {
        estimatedHeightPx += 18 * spacingMultiplier;
        totalChars += (entry.organization?.length || 0) + (entry.roleOrTitle?.length || 0) + (entry.dateOrYear?.length || 0);
      }

      // Check category row
      if (entry.category && section.type !== 'por') {
        totalChars += entry.category.length;
      }

      // Bullets
      for (const bullet of entry.bullets) {
        totalBullets++;
        const text = bullet.text.trim();
        const chars = text.length;
        totalChars += chars;
        const words = text.split(/\s+/).filter(Boolean);
        totalWords += words.length;

        // Approx line estimation: In standard column width (~540px), ~95 characters per line
        const lines = Math.max(1, Math.ceil(chars / 95));
        const lineHeight = 16 * fontMultiplier * spacingMultiplier;
        estimatedHeightPx += lines * lineHeight;

        // Orphan word detection: Last word length < 4 on a multi-line bullet
        if (lines > 1 && words.length > 0) {
          const lastWord = words[words.length - 1];
          if (lastWord.replace(/[.,;:]/g, '').length <= 3 && chars % 95 <= 15) {
            orphanRiskBullets.push({
              sectionTitle: section.title,
              bulletText: text,
            });
          }
        }
      }
    }
  }

  const maxPageHeightPx = 1040; // Safe printable height for A4 with 10mm top/bottom margins
  const densityPercentage = Math.round((estimatedHeightPx / maxPageHeightPx) * 100);

  let status: 'Too Sparse' | 'Balanced' | 'Dense' | 'Too Dense' = 'Balanced';
  let pageCountEstimate = 1;

  if (densityPercentage < 70) {
    status = 'Too Sparse';
    recommendations.push('Resume has significant unused space. Consider adding Projects, Certifications, or Key Skills.');
  } else if (densityPercentage <= 92) {
    status = 'Balanced';
    recommendations.push('Optimal 1-page density! Matches the IIM Bodh Gaya template perfectly.');
  } else if (densityPercentage <= 104) {
    status = 'Dense';
    recommendations.push('Content is compact and near the 1-page threshold. Use Ultra-Compact spacing or trim 1-2 long bullets.');
  } else {
    status = 'Too Dense';
    pageCountEstimate = Math.ceil(estimatedHeightPx / maxPageHeightPx);
    recommendations.push('Content will spill onto page 2! Use "Auto-Fit Spacing" or shorten descriptions to maintain a 1-page resume.');
  }

  if (orphanRiskBullets.length > 0) {
    recommendations.push(`${orphanRiskBullets.length} bullet(s) may end with an isolated short word (orphan). Consider shortening them slightly.`);
  }

  return {
    totalCharacters: totalChars,
    totalWords,
    totalBullets,
    estimatedHeightPx: Math.round(estimatedHeightPx),
    maxPageHeightPx,
    densityPercentage,
    status,
    pageCountEstimate,
    recommendations,
    orphanRiskBullets,
  };
}

// Character counter classification for individual bullet points
export interface CharCountStatus {
  count: number;
  suggestedMin: number;
  suggestedMax: number;
  level: 'optimal' | 'warning' | 'overflow';
  message: string;
}

export function evaluateCharCount(text: string, type: 'bullet' | 'short' | 'title' = 'bullet'): CharCountStatus {
  const count = text.length;

  if (type === 'bullet') {
    // 120-180 chars is golden standard for 1.5 - 2 line bullet in A4 grid
    if (count === 0) {
      return { count: 0, suggestedMin: 80, suggestedMax: 180, level: 'warning', message: 'Empty bullet' };
    }
    if (count < 60) {
      return { count, suggestedMin: 80, suggestedMax: 180, level: 'optimal', message: 'Short (1 line)' };
    }
    if (count <= 180) {
      return { count, suggestedMin: 80, suggestedMax: 180, level: 'optimal', message: 'Optimal length' };
    }
    if (count <= 230) {
      return { count, suggestedMin: 80, suggestedMax: 180, level: 'warning', message: 'Getting long (may wrap 3 lines)' };
    }
    return { count, suggestedMin: 80, suggestedMax: 180, level: 'overflow', message: 'Very long (risk of page overflow)' };
  }

  if (type === 'title') {
    if (count <= 45) {
      return { count, suggestedMin: 10, suggestedMax: 45, level: 'optimal', message: 'Good length' };
    }
    return { count, suggestedMin: 10, suggestedMax: 45, level: 'warning', message: 'Title may wrap' };
  }

  return { count, suggestedMin: 50, suggestedMax: 120, level: 'optimal', message: 'Balanced' };
}
