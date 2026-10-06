export type SectionType =
  | 'internships'
  | 'education'
  | 'por' // Position of Responsibility
  | 'academic_achievements'
  | 'extracurricular'
  | 'certifications'
  | 'other_interests'
  | 'skills'
  | 'projects'
  | 'work_experience'
  | 'custom';

export interface PersonalHeader {
  fullName: string;
  cohortOrDegree: string;
  instituteName: string;
  instituteSubtext: string;
  showEmblem: boolean;
  address: string;
  phone: string;
  email: string;
  linkedin?: string;
  portfolio?: string;
}

export interface ResumeBullet {
  id: string;
  text: string;
  year?: string;
}

export interface ResumeEntry {
  id: string;
  // Header row fields
  organization?: string;       // e.g. "Rancho Labs", "Sports Committee", "IIM Bodh Gaya"
  roleOrTitle?: string;        // e.g. "Business Development Intern", "POC"
  dateOrYear?: string;         // e.g. "Apr'26 – Jun'26", "2025"
  
  // Left column category/descriptor
  category?: string;           // e.g. "Research Papers", "Competitions", "Operations", "Hobbies", "Roles and Responsibilities"
  subtitle?: string;           // e.g. "Roles and Responsibilities"
  
  // Education-specific fields
  degree?: string;             // e.g. "M.B.A.", "B.B.A.", "12TH", "10TH"
  institution?: string;        // e.g. "Indian Institute of Management, Bodh Gaya"
  score?: string;              // e.g. "73.7 %", "85 %"
  
  // Content
  bullets: ResumeBullet[];
  isInlineList?: boolean;      // For inline comma/bullet lists like Hobbies/Interests
  inlineItems?: string[];      // e.g. ["Badminton", "Volleyball", "Football"]
  
  // Border customization per row
  hideBottomBorder?: boolean;  // toggle line border for this entry
  hasCustomBorder?: boolean;
}

export interface ResumeSection {
  id: string;
  title: string;
  type: SectionType;
  badgeText?: string;          // e.g. "5 months" in INTERNSHIPS header
  visible: boolean;
  entries: ResumeEntry[];
  columnRatioPercent?: number; // draggable left column width (e.g. 14 for 14%, 18 for 18%)
  dateColWidthPercent?: number; // draggable right date column width (e.g. 12 for 12%, 15 for 15%)
  educationColWidths?: [number, number, number, number]; // [degree, inst, score, year]
  hideVerticalBorders?: boolean;
  hideHorizontalBorders?: boolean;
  hideOuterBorder?: boolean;
  hideBorders?: boolean;
}

export interface ResumeSettings {
  fontFamily: 'serif' | 'cambria' | 'garamond' | 'sans';
  fontSize: 'compact' | 'normal' | 'relaxed';
  spacingDensity: 'ultra-compact' | 'compact' | 'normal';
  showBorders: boolean;
  borderStyle: 'all' | 'no-vertical' | 'no-horizontal' | 'minimal' | 'none';
  accentColor: string;
  leftColWidth: number; // default global ratio, e.g. 15 (%)
  dateColWidth: number; // default global date column ratio, e.g. 12 (%)
  educationColWidths: [number, number, number, number]; // [degree, inst, score, year]
}

export interface ResumeData {
  header: PersonalHeader;
  sections: ResumeSection[];
  settings: ResumeSettings;
}
