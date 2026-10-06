import React, { useState } from 'react';
import {
  X,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Code2,
  FolderGit2,
  Users,
  HeartHandshake,
  Languages,
  PlusCircle,
} from 'lucide-react';
import { SectionType, ResumeSection } from '../../types/resume';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: ResumeSection) => void;
}

interface SectionPreset {
  type: SectionType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PRESETS: SectionPreset[] = [
  {
    type: 'skills',
    title: 'KEY SKILLS & COMPETENCIES',
    description: 'Technical tools, domain knowledge, programming, financial modeling',
    icon: <Code2 className="w-5 h-5 text-indigo-600" />,
  },
  {
    type: 'projects',
    title: 'ACADEMIC & LIVE PROJECTS',
    description: 'Consulting projects, live industry engagements, capstone research',
    icon: <FolderGit2 className="w-5 h-5 text-blue-600" />,
  },
  {
    type: 'work_experience',
    title: 'WORK EXPERIENCE',
    description: 'Full-time corporate roles, engineering, consulting experience',
    icon: <Briefcase className="w-5 h-5 text-amber-600" />,
  },
  {
    type: 'academic_achievements',
    title: 'PUBLICATIONS & RESEARCH',
    description: 'Scopus indexed journals, working papers, conference presentations',
    icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
  },
  {
    type: 'academic_achievements',
    title: 'AWARDS & SCHOLARSHIPS',
    description: 'Merit list, academic awards, case study competitions',
    icon: <Award className="w-5 h-5 text-purple-600" />,
  },
  {
    type: 'por',
    title: 'LEADERSHIP & INITIATIVES',
    description: 'Club leadership, festival convenor, student council roles',
    icon: <Users className="w-5 h-5 text-rose-600" />,
  },
  {
    type: 'por',
    title: 'VOLUNTEER & SOCIAL IMPACT',
    description: 'NGO work, community initiatives, social stewardship',
    icon: <HeartHandshake className="w-5 h-5 text-teal-600" />,
  },
  {
    type: 'other_interests',
    title: 'LANGUAGES KNOWN',
    description: 'Native and professional language proficiencies',
    icon: <Languages className="w-5 h-5 text-cyan-600" />,
  },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: SectionPreset) => {
    const newSection: ResumeSection = {
      id: `sec-${Date.now()}`,
      title: preset.title,
      type: preset.type,
      visible: true,
      entries: [
        {
          id: `ent-${Date.now()}`,
          category: 'Key Category',
          organization: 'Organization Name',
          roleOrTitle: 'Role Title',
          dateOrYear: '2025',
          bullets: [
            {
              id: `b-${Date.now()}`,
              text: 'Spearheaded key initiative resulting in measurable performance improvement.',
            },
          ],
        },
      ],
    };

    onAddSection(newSection);
    onClose();
  };

  const handleAddCustom = () => {
    if (!customTitle.trim()) return;

    const newSection: ResumeSection = {
      id: `sec-custom-${Date.now()}`,
      title: customTitle.trim().toUpperCase(),
      type: 'custom',
      visible: true,
      entries: [
        {
          id: `ent-${Date.now()}`,
          category: 'Category / Role',
          dateOrYear: '2025',
          bullets: [
            {
              id: `b-${Date.now()}`,
              text: 'Describe notable achievement, project deliverable, or skill set.',
            },
          ],
        },
      ],
    };

    onAddSection(newSection);
    setCustomTitle('');
    setIsCustomMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Add New Resume Section</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-500 mb-2">
            Choose a standard MBA placement section or create your own custom section. Every added section automatically conforms to the uploaded template styling.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="flex items-start gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group"
              >
                <div className="p-2 rounded-md bg-slate-50 group-hover:bg-white border border-slate-100 shadow-2xs mt-0.5">
                  {p.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 uppercase">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {p.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Section Card */}
          <div className="pt-3 border-t border-slate-100">
            {!isCustomMode ? (
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full py-2.5 px-3 text-xs font-semibold text-slate-700 border border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50/30 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>+ Create Custom Section with Your Own Title</span>
              </button>
            ) : (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Custom Section Heading
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. PATENTS & INTELLECTUAL PROPERTY"
                    className="flex-1 text-xs border border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none uppercase font-semibold"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="px-2.5 py-2 text-slate-500 hover:text-slate-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
