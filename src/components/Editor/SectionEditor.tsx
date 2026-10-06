import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  GripVertical,
  Edit2,
  Check,
  TableProperties,
} from 'lucide-react';
import { ResumeSection, ResumeEntry, ResumeBullet } from '../../types/resume';
import { BulletEditor } from './BulletEditor';

interface SectionEditorProps {
  section: ResumeSection;
  onChange: (updated: ResumeSection) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onOpenAi: (text: string, onApply: (revised: string) => void) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenAi,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ ...section, visible: !section.visible });
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onChange({ ...section, title: tempTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleAddEntry = () => {
    const newEntry: ResumeEntry = {
      id: `ent-${Date.now()}`,
      organization: section.type === 'internships' ? 'New Organization' : '',
      roleOrTitle: section.type === 'internships' ? 'Intern' : '',
      category: section.type === 'education' ? '' : 'New Category',
      degree: section.type === 'education' ? 'Degree' : undefined,
      institution: section.type === 'education' ? 'Institution Name' : undefined,
      score: section.type === 'education' ? 'CGPA / %' : undefined,
      dateOrYear: '2025',
      subtitle: section.type === 'internships' ? 'Roles and\nResponsibilities' : undefined,
      bullets: [
        {
          id: `b-${Date.now()}`,
          text: 'Key achievement or responsibility described here.',
        },
      ],
      isInlineList: section.type === 'other_interests',
      inlineItems: section.type === 'other_interests' ? ['New Interest'] : undefined,
    };

    onChange({
      ...section,
      entries: [...section.entries, newEntry],
    });
  };

  const handleDuplicateEntry = (index: number) => {
    const original = section.entries[index];
    const duplicated: ResumeEntry = {
      ...original,
      id: `ent-${Date.now()}`,
      bullets: original.bullets.map((b) => ({
        ...b,
        id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      })),
      inlineItems: original.inlineItems ? [...original.inlineItems] : undefined,
    };

    const newEntries = [...section.entries];
    newEntries.splice(index + 1, 0, duplicated);
    onChange({ ...section, entries: newEntries });
  };

  const handleDeleteEntry = (index: number) => {
    const newEntries = section.entries.filter((_, i) => i !== index);
    onChange({ ...section, entries: newEntries });
  };

  const handleMoveEntry = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= section.entries.length) return;
    const newEntries = [...section.entries];
    const temp = newEntries[index];
    newEntries[index] = newEntries[targetIndex];
    newEntries[targetIndex] = temp;
    onChange({ ...section, entries: newEntries });
  };

  const handleEntryChange = (index: number, updated: ResumeEntry) => {
    const newEntries = [...section.entries];
    newEntries[index] = updated;
    onChange({ ...section, entries: newEntries });
  };

  return (
    <div
      className={`border rounded-lg shadow-xs overflow-hidden mb-3 transition-colors ${
        section.visible ? 'bg-white border-slate-200' : 'bg-slate-50/70 border-slate-200/60 opacity-70'
      }`}
    >
      {/* Section Header Accordion Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-b border-slate-200 select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />

          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 flex-1 max-w-xs">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-xs font-semibold px-2 py-1 border border-indigo-400 rounded bg-white w-full focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span
                onClick={() => setIsOpen(!isOpen)}
                className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide cursor-pointer truncate"
              >
                {section.title}
              </span>
              <button
                onClick={() => {
                  setTempTitle(section.title);
                  setIsEditingTitle(true);
                }}
                title="Rename section"
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Badge text (e.g. 5 months) */}
          {section.type === 'internships' && (
            <input
              type="text"
              value={section.badgeText || ''}
              onChange={(e) => onChange({ ...section, badgeText: e.target.value })}
              placeholder="e.g. 5 months"
              className="text-[10px] w-24 border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700"
            />
          )}
        </div>

        {/* Section actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleVisibility}
            title={section.visible ? 'Hide section from resume' : 'Show section on resume'}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50"
          >
            {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-500" />}
          </button>

          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              title="Move Section Up"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              title="Move Section Down"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            title="Delete Section"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/50"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3 sm:p-4 space-y-4 bg-slate-50/40">
          {/* Table Borders & Lines Configuration */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
              <span className="flex items-center gap-1.5">
                <TableProperties className="w-3.5 h-3.5 text-indigo-600" />
                <span>Table Borders & Lines</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...section, hideHorizontalBorders: !section.hideHorizontalBorders })}
                className={`py-1 px-2 rounded border text-[10px] font-semibold flex items-center justify-between transition-colors ${
                  section.hideHorizontalBorders
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <span>Horizontal:</span>
                <b>{section.hideHorizontalBorders ? 'Removed' : 'Active'}</b>
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...section, hideVerticalBorders: !section.hideVerticalBorders })}
                className={`py-1 px-2 rounded border text-[10px] font-semibold flex items-center justify-between transition-colors ${
                  section.hideVerticalBorders
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <span>Vertical:</span>
                <b>{section.hideVerticalBorders ? 'Removed' : 'Active'}</b>
              </button>

              <button
                type="button"
                onClick={() => onChange({ ...section, hideOuterBorder: !section.hideOuterBorder })}
                className={`py-1 px-2 rounded border text-[10px] font-semibold flex items-center justify-between transition-colors ${
                  section.hideOuterBorder
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <span>Outer Box:</span>
                <b>{section.hideOuterBorder ? 'Removed' : 'Active'}</b>
              </button>
            </div>

            {/* Bulk Row Line Border Options */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[10px]">
              <span className="font-bold text-slate-600">Row Line Borders:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const updatedEntries = section.entries.map((e) => ({ ...e, hideBottomBorder: false }));
                    onChange({ ...section, entries: updatedEntries });
                  }}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium text-[9px] cursor-pointer"
                  title="Make all row separator line borders visible"
                >
                  ✓ Show All Row Lines
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updatedEntries = section.entries.map((e) => ({ ...e, hideBottomBorder: true }));
                    onChange({ ...section, entries: updatedEntries });
                  }}
                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-medium text-[9px] cursor-pointer"
                  title="Remove row separator line borders from all rows"
                >
                  — Remove All Row Lines
                </button>
              </div>
            </div>

            {/* Column Widths (Word Table Style) for ALL Sections */}
            {section.type === 'education' && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Education Column Widths (Word Table):</span>
                  <button
                    type="button"
                    onClick={() => onChange({ ...section, educationColWidths: [12, 60, 14, 14] })}
                    className="text-[9px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Reset (12/60/14/14)
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Degree: {(section.educationColWidths || [12, 60, 14, 14])[0]}%</label>
                    <input
                      type="range"
                      min="6"
                      max="28"
                      value={(section.educationColWidths || [12, 60, 14, 14])[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = section.educationColWidths || [12, 60, 14, 14];
                        const diff = val - cur[0];
                        onChange({
                          ...section,
                          educationColWidths: [val, Math.max(20, 100 - val - cur[2] - cur[3]), cur[2], cur[3]],
                        });
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Institution: {(section.educationColWidths || [12, 60, 14, 14])[1]}%</label>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      value={(section.educationColWidths || [12, 60, 14, 14])[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = section.educationColWidths || [12, 60, 14, 14];
                        onChange({
                          ...section,
                          educationColWidths: [cur[0], val, Math.max(6, 100 - cur[0] - val - cur[3]), cur[3]],
                        });
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Score: {(section.educationColWidths || [12, 60, 14, 14])[2]}%</label>
                    <input
                      type="range"
                      min="6"
                      max="25"
                      value={(section.educationColWidths || [12, 60, 14, 14])[2]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = section.educationColWidths || [12, 60, 14, 14];
                        onChange({
                          ...section,
                          educationColWidths: [cur[0], Math.max(20, 100 - cur[0] - val - cur[3]), val, cur[3]],
                        });
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Year: {(section.educationColWidths || [12, 60, 14, 14])[3]}%</label>
                    <input
                      type="range"
                      min="6"
                      max="25"
                      value={(section.educationColWidths || [12, 60, 14, 14])[3]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = section.educationColWidths || [12, 60, 14, 14];
                        onChange({
                          ...section,
                          educationColWidths: [cur[0], cur[1], Math.max(6, 100 - cur[0] - cur[1] - val), val],
                        });
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If internships: 2 column ratio sliders */}
            {section.type === 'internships' && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Internship Column Widths (Word Table):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, columnRatioPercent: 12 })}
                      className="text-[9px] text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      Compact (12%)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, columnRatioPercent: 14 })}
                      className="text-[9px] text-indigo-600 hover:underline cursor-pointer font-bold"
                    >
                      Reset (14%)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, columnRatioPercent: 18 })}
                      className="text-[9px] text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      Wide (18%)
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Roles & Responsibilities: <b className="text-indigo-700">{section.columnRatioPercent || 14}%</b>
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={section.columnRatioPercent || 14}
                      onChange={(e) =>
                        onChange({
                          ...section,
                          columnRatioPercent: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Bullets Content Area: <b className="text-indigo-700">{100 - (section.columnRatioPercent || 14)}%</b>
                    </label>
                    <div className="h-6 flex items-center">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          style={{ width: `${section.columnRatioPercent || 14}%` }}
                          className="bg-indigo-400 h-full"
                          title="Role label"
                        />
                        <div
                          style={{ width: `${100 - (section.columnRatioPercent || 14)}%` }}
                          className="bg-indigo-600 h-full"
                          title="Bullets description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If other_interests: 2 column ratio sliders */}
            {section.type === 'other_interests' && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Interests Column Widths (Word Table):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, columnRatioPercent: 12 })}
                      className="text-[9px] text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      Compact (12%)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, columnRatioPercent: 14 })}
                      className="text-[9px] text-indigo-600 hover:underline cursor-pointer font-bold"
                    >
                      Reset (14%)
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...section, columnRatioPercent: 18 })}
                      className="text-[9px] text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      Wide (18%)
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Category Label: <b className="text-indigo-700">{section.columnRatioPercent || 14}%</b>
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={section.columnRatioPercent || 14}
                      onChange={(e) =>
                        onChange({
                          ...section,
                          columnRatioPercent: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Items Area: <b className="text-indigo-700">{100 - (section.columnRatioPercent || 14)}%</b>
                    </label>
                    <div className="h-6 flex items-center">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          style={{ width: `${section.columnRatioPercent || 14}%` }}
                          className="bg-indigo-400 h-full"
                          title="Category"
                        />
                        <div
                          style={{ width: `${100 - (section.columnRatioPercent || 14)}%` }}
                          className="bg-indigo-600 h-full"
                          title="Items list"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard 3-column sections (projects, por, academic_achievements, extracurricular, skills, certifications, work_experience, custom) */}
            {section.type !== 'education' && section.type !== 'internships' && section.type !== 'other_interests' && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-700 flex items-center justify-between">
                  <span>{section.title} Column Widths (Word Table):</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...section,
                          columnRatioPercent: 12,
                          dateColWidthPercent: 12,
                        })
                      }
                      className="text-[9px] text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      Compact (12/76/12)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...section,
                          columnRatioPercent: 15,
                          dateColWidthPercent: 12,
                        })
                      }
                      className="text-[9px] text-indigo-600 hover:underline cursor-pointer font-bold"
                    >
                      Reset (15/73/12)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...section,
                          columnRatioPercent: 18,
                          dateColWidthPercent: 12,
                        })
                      }
                      className="text-[9px] text-slate-500 hover:text-indigo-600 cursor-pointer"
                    >
                      Wide Org (18/70/12)
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Org / Category: <b className="text-indigo-700">{section.columnRatioPercent || 15}%</b>
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={section.columnRatioPercent || 15}
                      onChange={(e) =>
                        onChange({
                          ...section,
                          columnRatioPercent: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Bullets Content:{' '}
                      <b className="text-indigo-700">
                        {100 - (section.columnRatioPercent || 15) - (section.dateColWidthPercent || 12)}%
                      </b>
                    </label>
                    <div className="h-6 flex items-center">
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                        <div
                          style={{ width: `${section.columnRatioPercent || 15}%` }}
                          className="bg-indigo-400 h-full"
                          title="Category / Organization"
                        />
                        <div
                          style={{
                            width: `${100 - (section.columnRatioPercent || 15) - (section.dateColWidthPercent || 12)}%`,
                          }}
                          className="bg-indigo-600 h-full"
                          title="Bullets Content"
                        />
                        <div
                          style={{ width: `${section.dateColWidthPercent || 12}%` }}
                          className="bg-amber-400 h-full"
                          title="Date / Year"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">
                      Date / Year: <b className="text-indigo-700">{section.dateColWidthPercent || 12}%</b>
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="25"
                      value={section.dateColWidthPercent || 12}
                      onChange={(e) =>
                        onChange({
                          ...section,
                          dateColWidthPercent: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {section.entries.map((entry, index) => (
            <EntryItemEditor
              key={entry.id}
              entry={entry}
              sectionType={section.type}
              index={index}
              totalEntries={section.entries.length}
              onChange={(updated) => handleEntryChange(index, updated)}
              onDuplicate={() => handleDuplicateEntry(index)}
              onDelete={() => handleDeleteEntry(index)}
              onMoveUp={() => handleMoveEntry(index, 'up')}
              onMoveDown={() => handleMoveEntry(index, 'down')}
              onOpenAi={onOpenAi}
            />
          ))}

          {/* Add Entry Button */}
          <button
            type="button"
            onClick={handleAddEntry}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Entry to {section.title}
          </button>
        </div>
      )}
    </div>
  );
};

// --- Sub-component: Individual Entry Item Editor ---

interface EntryItemEditorProps {
  entry: ResumeEntry;
  sectionType: string;
  index: number;
  totalEntries: number;
  onChange: (updated: ResumeEntry) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenAi: (text: string, onApply: (revised: string) => void) => void;
}

const EntryItemEditor: React.FC<EntryItemEditorProps> = ({
  entry,
  sectionType,
  index,
  totalEntries,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenAi,
}) => {
  const handleBulletChange = (bIndex: number, text: string) => {
    const newBullets = [...entry.bullets];
    newBullets[bIndex] = { ...newBullets[bIndex], text };
    onChange({ ...entry, bullets: newBullets });
  };

  const handleBulletYearChange = (bIndex: number, year: string) => {
    const newBullets = [...entry.bullets];
    newBullets[bIndex] = { ...newBullets[bIndex], year };
    onChange({ ...entry, bullets: newBullets });
  };

  const handleAddBullet = () => {
    const newBullet: ResumeBullet = {
      id: `b-${Date.now()}`,
      text: '',
    };
    onChange({
      ...entry,
      bullets: [...entry.bullets, newBullet],
    });
  };

  const handleDeleteBullet = (bIndex: number) => {
    const newBullets = entry.bullets.filter((_, i) => i !== bIndex);
    onChange({ ...entry, bullets: newBullets });
  };

  const handleMoveBullet = (bIndex: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? bIndex - 1 : bIndex + 1;
    if (target < 0 || target >= entry.bullets.length) return;
    const newBullets = [...entry.bullets];
    const temp = newBullets[bIndex];
    newBullets[bIndex] = newBullets[target];
    newBullets[target] = temp;
    onChange({ ...entry, bullets: newBullets });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-3 shadow-xs">
      {/* Top Entry Actions */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Entry #{index + 1}
          </span>
          {/* Add or Remove Bottom Line Border for this entry */}
          <button
            type="button"
            onClick={() => onChange({ ...entry, hideBottomBorder: !entry.hideBottomBorder })}
            className={`px-1.5 py-0.5 text-[9px] font-semibold rounded border flex items-center gap-1 transition-colors cursor-pointer ${
              entry.hideBottomBorder
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={entry.hideBottomBorder ? "Bottom line border is removed. Click to add line border." : "Bottom line border is active. Click to remove line border."}
          >
            <span>Line Border:</span>
            <b>{entry.hideBottomBorder ? '— Removed (Click to Add)' : '✓ Active (Click to Remove)'}</b>
          </button>
        </div>
        <div className="flex items-center gap-1">
          {index > 0 && (
            <button
              type="button"
              onClick={onMoveUp}
              title="Move Entry Up"
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}
          {index < totalEntries - 1 && (
            <button
              type="button"
              onClick={onMoveDown}
              title="Move Entry Down"
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate Entry"
            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-indigo-50"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete Entry"
            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Field Layouts based on section type */}
      {sectionType === 'education' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Degree / Class</label>
            <input
              type="text"
              value={entry.degree || ''}
              onChange={(e) => onChange({ ...entry, degree: e.target.value })}
              placeholder="M.B.A."
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Institution</label>
            <input
              type="text"
              value={entry.institution || ''}
              onChange={(e) => onChange({ ...entry, institution: e.target.value })}
              placeholder="Indian Institute of Management, Bodh Gaya"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Score / %</label>
            <input
              type="text"
              value={entry.score || ''}
              onChange={(e) => onChange({ ...entry, score: e.target.value })}
              placeholder="73.7 %"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Year</label>
            <input
              type="text"
              value={entry.dateOrYear || ''}
              onChange={(e) => onChange({ ...entry, dateOrYear: e.target.value })}
              placeholder="2027"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      ) : sectionType === 'internships' ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Organization</label>
              <input
                type="text"
                value={entry.organization || ''}
                onChange={(e) => onChange({ ...entry, organization: e.target.value })}
                placeholder="Niranjana River Recharge Mission"
                className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Role / Title</label>
              <input
                type="text"
                value={entry.roleOrTitle || ''}
                onChange={(e) => onChange({ ...entry, roleOrTitle: e.target.value })}
                placeholder="Social Intern"
                className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Duration / Dates</label>
              <input
                type="text"
                value={entry.dateOrYear || ''}
                onChange={(e) => onChange({ ...entry, dateOrYear: e.target.value })}
                placeholder="Mar'24 – Apr'24"
                className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
              Left Subtitle Label
            </label>
            <input
              type="text"
              value={entry.subtitle || ''}
              onChange={(e) => onChange({ ...entry, subtitle: e.target.value })}
              placeholder="Roles and Responsibilities"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      ) : sectionType === 'other_interests' ? (
        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Category Name</label>
            <input
              type="text"
              value={entry.category || ''}
              onChange={(e) => onChange({ ...entry, category: e.target.value })}
              placeholder="Hobbies"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
              Items (comma separated)
            </label>
            <input
              type="text"
              value={(entry.inlineItems || []).join(', ')}
              onChange={(e) =>
                onChange({
                  ...entry,
                  inlineItems: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="Badminton, Volleyball, Football"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      ) : (
        /* Standard Section (POR, Academic Achievements, Extracurricular, Certifications, Custom) */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
              Category / Domain / Organization
            </label>
            <input
              type="text"
              value={entry.category || entry.organization || ''}
              onChange={(e) => onChange({ ...entry, category: e.target.value, organization: e.target.value })}
              placeholder="e.g. Research Papers, Sports Committee, Badminton"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Year / Date</label>
            <input
              type="text"
              value={entry.dateOrYear || ''}
              onChange={(e) => onChange({ ...entry, dateOrYear: e.target.value })}
              placeholder="2025"
              className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Bullets List (for non-education, non-interests) */}
      {sectionType !== 'education' && sectionType !== 'other_interests' && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-700">
              Achievement Bullets ({entry.bullets.length})
            </label>
            <span className="text-[10px] text-slate-400">Aim for 120–180 characters per bullet</span>
          </div>

          <div className="space-y-2">
            {entry.bullets.map((bullet, bIdx) => (
              <BulletEditor
                key={bullet.id}
                text={bullet.text}
                year={bullet.year}
                onChange={(text) => handleBulletChange(bIdx, text)}
                onYearChange={
                  sectionType === 'extracurricular' ? (year) => handleBulletYearChange(bIdx, year) : undefined
                }
                onDelete={() => handleDeleteBullet(bIdx)}
                onMoveUp={bIdx > 0 ? () => handleMoveBullet(bIdx, 'up') : undefined}
                onMoveDown={bIdx < entry.bullets.length - 1 ? () => handleMoveBullet(bIdx, 'down') : undefined}
                onOpenAi={onOpenAi}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddBullet}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 py-1 px-2 rounded hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Bullet Point
          </button>
        </div>
      )}
    </div>
  );
};
