import { saveAs } from 'file-saver';
import { ResumeData } from '../types/resume';

export function exportResumeToTxt(resume: ResumeData): void {
  let content = '';

  // Header
  content += `${resume.header.fullName.toUpperCase()} | ${resume.header.cohortOrDegree}\n`;
  content += `Address: ${resume.header.address}\n`;
  content += `Contact: ${resume.header.phone} | E-mail: ${resume.header.email}\n`;
  content += `${'='.repeat(78)}\n\n`;

  for (const section of resume.sections) {
    if (!section.visible) continue;

    content += `[ ${section.title.toUpperCase()} ]`;
    if (section.badgeText) {
      content += ` (${section.badgeText})`;
    }
    content += '\n' + '-'.repeat(78) + '\n';

    if (section.type === 'education') {
      content += `Degree\tInstitution\tScore\tYear\n`;
      for (const entry of section.entries) {
        content += `${entry.degree || ''}\t${entry.institution || ''}\t${entry.score || ''}\t${entry.dateOrYear || ''}\n`;
      }
      content += '\n';
      continue;
    }

    if (section.type === 'other_interests') {
      for (const entry of section.entries) {
        content += `${entry.category || 'Hobbies'}: ${(entry.inlineItems || []).join(' | ')}\n`;
      }
      content += '\n';
      continue;
    }

    for (const entry of section.entries) {
      if (entry.organization || entry.roleOrTitle || entry.dateOrYear) {
        const line = [entry.organization, entry.roleOrTitle, entry.dateOrYear].filter(Boolean).join(' | ');
        content += `${line}\n`;
      }
      if (entry.category && section.type !== 'internships') {
        content += `[${entry.category}]`;
        if (entry.dateOrYear && !entry.organization) content += ` (${entry.dateOrYear})`;
        content += '\n';
      }

      for (const bullet of entry.bullets) {
        content += `  • ${bullet.text}${bullet.year ? ` [${bullet.year}]` : ''}\n`;
      }
      content += '\n';
    }
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const cleanName = resume.header.fullName.replace(/\s+/g, '_') || 'Resume';
  saveAs(blob, `${cleanName}_CV.txt`);
}
