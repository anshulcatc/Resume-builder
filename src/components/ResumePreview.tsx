import React, { useState, useRef, useCallback } from 'react';
import { ResumeData, ResumeSection, ResumeEntry, ResumeBullet } from '../types/resume';
import { Plus, Trash2, GripVertical, Split, TableProperties, Sparkles, ChevronDown, Check, Minus } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  scale?: number;
  onUpdateResume?: (updated: ResumeData) => void;
  onOpenAi?: (text: string, onApply: (revised: string) => void) => void;
  isPrintMode?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  scale = 1,
  onUpdateResume,
  onOpenAi,
  isPrintMode = false,
}) => {
  const { header, sections, settings } = resume;

  // Dragging state for column borders (Label/Content, Content/Date, and Education dividers)
  const [isDraggingColumn, setIsDraggingColumn] = useState<{
    sectionId: string;
    handleType: 'left' | 'date' | 'edu-0' | 'edu-1' | 'edu-2';
  } | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [initialWidthPercent, setInitialWidthPercent] = useState<number>(14);
  const [dragLiveRatio, setDragLiveRatio] = useState<number | null>(null);
  const [dragLiveEduWidths, setDragLiveEduWidths] = useState<[number, number, number, number] | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [openSectionMenuId, setOpenSectionMenuId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Global or section-specific column widths from settings
  const globalLeftColWidth = settings.leftColWidth || 15;
  const globalDateColWidth = settings.dateColWidth || 12;
  const globalEduColWidths = settings.educationColWidths || [12, 60, 14, 14];

  // Font family resolution
  const fontClass =
    settings.fontFamily === 'serif'
      ? "font-['Tinos',_'Times_New_Roman',_Times,_serif]"
      : settings.fontFamily === 'cambria'
      ? "font-['Merriweather',_Georgia,_serif]"
      : settings.fontFamily === 'garamond'
      ? "font-['Lora',_Garamond,_serif]"
      : 'font-sans';

  // Spacing & padding densities
  const cellPaddingClass =
    settings.spacingDensity === 'ultra-compact'
      ? 'py-0.5 px-1.5'
      : settings.spacingDensity === 'compact'
      ? 'py-1 px-2'
      : 'py-1.5 px-2.5';

  const sectionMarginClass =
    settings.spacingDensity === 'ultra-compact'
      ? 'mb-1'
      : settings.spacingDensity === 'compact'
      ? 'mb-1.5'
      : 'mb-2.5';

  const baseTextSize =
    settings.fontSize === 'compact'
      ? 'text-[9.5px] leading-[1.28]'
      : settings.fontSize === 'normal'
      ? 'text-[10px] leading-[1.32]'
      : 'text-[10.5px] leading-[1.36]';

  const headerTextSize =
    settings.fontSize === 'compact'
      ? 'text-[10.5px]'
      : settings.fontSize === 'normal'
      ? 'text-[11px]'
      : 'text-[11.5px]';

  // Border classes based on settings
  const borderStyle = settings.borderStyle || 'all';
  const showBorders = settings.showBorders !== false && borderStyle !== 'none';
  const showVerticalBorders = showBorders && borderStyle !== 'no-vertical';
  const showHorizontalBorders = showBorders && borderStyle !== 'no-horizontal';

  const getOuterTableBorderClass = (section: ResumeSection) => {
    if (section.hideOuterBorder || !showBorders) {
      return 'border border-transparent';
    }
    return 'border border-black';
  };

  const getCellBorderClass = (section: ResumeSection) => {
    if (!showBorders) return 'border-transparent';
    const hideVert = section.hideVerticalBorders || !showVerticalBorders;
    const hideHoriz = section.hideHorizontalBorders || !showHorizontalBorders;
    if (!hideVert) return 'border border-black';
    if (!hideHoriz) return 'border-b border-black';
    return 'border-transparent';
  };

  // Helper to determine row bottom border class (with user per-row toggle!)
  const getRowBottomClass = (section: ResumeSection, entry: ResumeEntry) => {
    if (entry.hideBottomBorder || section.hideHorizontalBorders || !showHorizontalBorders) {
      return 'border-b-0 border-b-transparent';
    }
    return 'border-b border-black';
  };

  // Toggle horizontal line border for a specific entry/row
  const handleToggleRowLineBorder = (sectionId: string, entryId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        entries: sec.entries.map((entry) => {
          if (entry.id !== entryId) return entry;
          return {
            ...entry,
            hideBottomBorder: !entry.hideBottomBorder,
          };
        }),
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Toggle Section Horizontal Line Borders
  const handleToggleSectionHorizontalBorders = (sectionId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, hideHorizontalBorders: !sec.hideHorizontalBorders } : sec
    );
    onUpdateResume({ ...resume, sections: updated });
  };

  // Toggle Section Vertical Column Borders
  const handleToggleSectionVerticalBorders = (sectionId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, hideVerticalBorders: !sec.hideVerticalBorders } : sec
    );
    onUpdateResume({ ...resume, sections: updated });
  };

  // Toggle Section Outer Box Border
  const handleToggleSectionOuterBorder = (sectionId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, hideOuterBorder: !sec.hideOuterBorder } : sec
    );
    onUpdateResume({ ...resume, sections: updated });
  };

  // Add a new row/line to a section
  const handleAddNewRow = (sectionId: string, afterEntryId?: string) => {
    if (!onUpdateResume) return;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newEntry: ResumeEntry = {
      id: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      degree: section.type === 'education' ? 'Degree / Exam' : undefined,
      institution: section.type === 'education' ? 'Institution Name' : undefined,
      score: section.type === 'education' ? 'CGPA / %' : undefined,
      dateOrYear: '2025',
      organization: section.type === 'internships' ? 'New Company' : section.type === 'por' ? 'Organization' : undefined,
      roleOrTitle: section.type === 'internships' ? 'Intern' : undefined,
      category: section.type === 'education' ? '' : 'New Category',
      subtitle: section.type === 'internships' ? 'Roles and\nResponsibilities' : undefined,
      bullets: [
        {
          id: `b-${Date.now()}`,
          text: 'Key achievement or role responsibility.',
        },
      ],
      inlineItems: section.type === 'other_interests' ? ['New Item'] : undefined,
    };

    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const entries = [...sec.entries];
      if (afterEntryId) {
        const idx = entries.findIndex((e) => e.id === afterEntryId);
        if (idx !== -1) {
          entries.splice(idx + 1, 0, newEntry);
          return { ...sec, entries };
        }
      }
      return { ...sec, entries: [...entries, newEntry] };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Delete an entry row
  const handleDeleteRow = (sectionId: string, entryId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      if (sec.entries.length <= 1) return sec; // keep at least 1 entry
      return {
        ...sec,
        entries: sec.entries.filter((e) => e.id !== entryId),
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Reset Education column widths to default standard
  const handleResetEduWidths = (sectionId: string) => {
    if (!onUpdateResume) return;
    const defaultWidths: [number, number, number, number] = [12, 60, 14, 14];
    const updated = sections.map((sec) =>
      sec.id === sectionId ? { ...sec, educationColWidths: defaultWidths } : sec
    );
    onUpdateResume({
      ...resume,
      settings: { ...resume.settings, educationColWidths: defaultWidths },
      sections: updated,
    });
  };

  // Reset column widths for any section
  const handleResetSectionRatio = (sectionId: string) => {
    if (!onUpdateResume) return;
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const defaultLeft = sec.type === 'internships' ? 14 : sec.type === 'other_interests' ? 14 : 15;
    const defaultDate = 12;
    const defaultEdu: [number, number, number, number] = [12, 60, 14, 14];

    const updated = sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        columnRatioPercent: defaultLeft,
        dateColWidthPercent: defaultDate,
        educationColWidths: s.type === 'education' ? defaultEdu : s.educationColWidths,
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Set explicit column ratios for a section
  const handleSetSectionRatios = (sectionId: string, left?: number, date?: number) => {
    if (!onUpdateResume) return;
    const updated = sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        columnRatioPercent: left !== undefined ? left : s.columnRatioPercent,
        dateColWidthPercent: date !== undefined ? date : s.dateColWidthPercent,
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Bulk show/hide row separator line borders for an entire section
  const handleToggleAllSectionRowBorders = (sectionId: string, show: boolean) => {
    if (!onUpdateResume) return;
    const updated = sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        entries: s.entries.map((e) => ({ ...e, hideBottomBorder: !show })),
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Column Drag Handlers for Label & Date boundaries - Microsoft Word Table Style
  const handleStartDrag = (
    e: React.MouseEvent,
    sectionId: string,
    handleType: 'left' | 'date',
    currentRatio: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDraggingColumn({ sectionId, handleType });
    setDragStartX(e.clientX);
    setInitialWidthPercent(currentRatio);
    setDragLiveRatio(currentRatio);
    setActiveTooltip(`${currentRatio}%`);

    const currentScale = scale || 1;
    const tableEl = document.getElementById(`section-table-${sectionId}`) || tableRef.current;
    if (!tableEl) return;
    const rect = tableEl.getBoundingClientRect();
    const actualTableWidth = rect.width / currentScale;

    let finalRatio = currentRatio;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = (moveEvent.clientX - e.clientX) / currentScale;
      const deltaPercent = (deltaX / actualTableWidth) * 100;

      if (handleType === 'left') {
        const newWidth = Math.max(10, Math.min(32, Math.round(currentRatio + deltaPercent)));
        finalRatio = newWidth;
        setDragLiveRatio(newWidth);
        setActiveTooltip(`Label: ${newWidth}%`);
      } else {
        const newWidth = Math.max(8, Math.min(22, Math.round(currentRatio - deltaPercent)));
        finalRatio = newWidth;
        setDragLiveRatio(newWidth);
        setActiveTooltip(`Date: ${newWidth}%`);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingColumn(null);
      setActiveTooltip(null);
      setDragLiveRatio(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Save layout configuration directly to resume settings state!
      if (onUpdateResume) {
        if (handleType === 'left') {
          const updatedSections = resume.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, columnRatioPercent: finalRatio } : sec
          );
          onUpdateResume({
            ...resume,
            settings: {
              ...resume.settings,
              leftColWidth: finalRatio, // Persisted to settings
            },
            sections: updatedSections,
          });
        } else {
          const updatedSections = resume.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, dateColWidthPercent: finalRatio } : sec
          );
          onUpdateResume({
            ...resume,
            settings: {
              ...resume.settings,
              dateColWidth: finalRatio, // Persisted to settings
            },
            sections: updatedSections,
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Education 4-Column Drag Handlers - Microsoft Word Table Style
  const handleStartEducationDrag = (
    e: React.MouseEvent,
    sectionId: string,
    dividerIndex: 0 | 1 | 2,
    currentWidths: [number, number, number, number]
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const handleType = (dividerIndex === 0 ? 'edu-0' : dividerIndex === 1 ? 'edu-1' : 'edu-2') as 'edu-0' | 'edu-1' | 'edu-2';
    setIsDraggingColumn({ sectionId, handleType });
    setDragStartX(e.clientX);
    setDragLiveEduWidths(currentWidths);

    const currentScale = scale || 1;
    const tableEl = document.getElementById(`section-table-${sectionId}`) || tableRef.current;
    if (!tableEl) return;
    const rect = tableEl.getBoundingClientRect();
    const actualTableWidth = rect.width / currentScale;

    let finalWidths = [...currentWidths] as [number, number, number, number];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = (moveEvent.clientX - e.clientX) / currentScale;
      const deltaPercent = (deltaX / actualTableWidth) * 100;

      const updated = [...currentWidths] as [number, number, number, number];

      if (dividerIndex === 0) {
        // Divider 0: between Degree [0] and Institution [1]
        const newDegree = Math.max(6, Math.min(28, Math.round(currentWidths[0] + deltaPercent)));
        const delta = newDegree - currentWidths[0];
        const newInst = Math.max(25, currentWidths[1] - delta);
        updated[0] = newDegree;
        updated[1] = 100 - newDegree - updated[2] - updated[3];
        setActiveTooltip(`Deg: ${updated[0]}% | Inst: ${updated[1]}% | Score: ${updated[2]}% | Year: ${updated[3]}%`);
      } else if (dividerIndex === 1) {
        // Divider 1: between Institution [1] and Score [2]
        const delta = Math.round(deltaPercent);
        const newInst = Math.max(25, Math.min(75, currentWidths[1] + delta));
        const scoreDelta = newInst - currentWidths[1];
        const newScore = Math.max(6, currentWidths[2] - scoreDelta);
        updated[1] = newInst;
        updated[2] = 100 - updated[0] - newInst - updated[3];
        setActiveTooltip(`Deg: ${updated[0]}% | Inst: ${updated[1]}% | Score: ${updated[2]}% | Year: ${updated[3]}%`);
      } else if (dividerIndex === 2) {
        // Divider 2: between Score [2] and Year [3]
        const delta = Math.round(deltaPercent);
        const newYear = Math.max(6, Math.min(25, currentWidths[3] - delta));
        const yearDelta = newYear - currentWidths[3];
        const newScore = Math.max(6, currentWidths[2] - yearDelta);
        updated[3] = newYear;
        updated[2] = 100 - updated[0] - updated[1] - newYear;
        setActiveTooltip(`Deg: ${updated[0]}% | Inst: ${updated[1]}% | Score: ${updated[2]}% | Year: ${updated[3]}%`);
      }

      finalWidths = updated;
      setDragLiveEduWidths(updated);
    };

    const handleMouseUp = () => {
      setIsDraggingColumn(null);
      setActiveTooltip(null);
      setDragLiveEduWidths(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Save layout configuration to resume settings!
      if (onUpdateResume) {
        const updatedSections = resume.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, educationColWidths: finalWidths } : sec
        );
        onUpdateResume({
          ...resume,
          settings: {
            ...resume.settings,
            educationColWidths: finalWidths, // Persisted to settings!
          },
          sections: updatedSections,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Direct Inline Text Editing Handlers
  const handleUpdateHeader = (field: keyof typeof header, value: string) => {
    if (!onUpdateResume) return;
    onUpdateResume({
      ...resume,
      header: {
        ...resume.header,
        [field]: value,
      },
    });
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, title } : s));
    onUpdateResume({ ...resume, sections: updated });
  };

  const handleUpdateEntryField = (
    sectionId: string,
    entryId: string,
    field: keyof ResumeEntry,
    value: any
  ) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        entries: sec.entries.map((entry) =>
          entry.id === entryId ? { ...entry, [field]: value } : entry
        ),
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  const handleUpdateBullet = (
    sectionId: string,
    entryId: string,
    bulletId: string,
    text: string
  ) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        entries: sec.entries.map((entry) => {
          if (entry.id !== entryId) return entry;
          return {
            ...entry,
            bullets: entry.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
          };
        }),
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  // Keyboard shortcut handlers for bullets (Enter = New Bullet, Backspace = Delete if empty)
  const handleBulletKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    sectionId: string,
    entryId: string,
    bulletIndex: number,
    currentText: string
  ) => {
    if (!onUpdateResume) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Insert new bullet right below
      const updated = sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          entries: sec.entries.map((entry) => {
            if (entry.id !== entryId) return entry;
            const newBullets = [...entry.bullets];
            newBullets.splice(bulletIndex + 1, 0, {
              id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              text: '',
            });
            return { ...entry, bullets: newBullets };
          }),
        };
      });
      onUpdateResume({ ...resume, sections: updated });
    } else if (e.key === 'Backspace' && currentText.trim() === '') {
      // If bullet is completely empty, backspace removes it
      const entry = sections
        .find((s) => s.id === sectionId)
        ?.entries.find((e) => e.id === entryId);
      if (entry && entry.bullets.length > 1) {
        e.preventDefault();
        const updated = sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            entries: sec.entries.map((ent) => {
              if (ent.id !== entryId) return ent;
              const newBullets = ent.bullets.filter((_, idx) => idx !== bulletIndex);
              return { ...ent, bullets: newBullets };
            }),
          };
        });
        onUpdateResume({ ...resume, sections: updated });
      }
    }
  };

  const handleAddNewBullet = (sectionId: string, entryId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        entries: sec.entries.map((ent) => {
          if (ent.id !== entryId) return ent;
          return {
            ...ent,
            bullets: [
              ...ent.bullets,
              {
                id: `b-${Date.now()}`,
                text: 'New achievement bullet point.',
              },
            ],
          };
        }),
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  const handleToggleSectionBorders = (sectionId: string) => {
    if (!onUpdateResume) return;
    const updated = sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        hideVerticalBorders: !sec.hideVerticalBorders,
      };
    });
    onUpdateResume({ ...resume, sections: updated });
  };

  return (
    <div
      ref={tableRef}
      className="resume-sheet-container flex justify-center w-full transition-transform duration-150 origin-top select-text"
      style={{ transform: `scale(${scale})` }}
    >
      <div
        id="canonical-resume-a4"
        className={`resume-sheet w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl print:shadow-none p-[10mm] print:p-[8mm] box-border relative flex flex-col justify-between ${fontClass}`}
        style={{
          boxSizing: 'border-box',
          color: '#111827',
        }}
      >
        {/* Dragging Active Overlay Tooltip */}
        {isDraggingColumn && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full shadow-lg font-mono flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-indigo-400" />
            <span>Left Column: {activeTooltip}</span>
            <span className="text-slate-400">|</span>
            <span>Bullets Area: {100 - parseInt(activeTooltip || '14', 10)}%</span>
          </div>
        )}

        {/* Main Resume Content */}
        <div className="w-full flex-grow">
          {/* 1. TOP HEADER */}
          <div className="flex items-center justify-between border-b border-transparent pb-1.5 mb-1.5 group relative">
            <div className="flex items-baseline flex-wrap">
              <span
                contentEditable={!isPrintMode}
                suppressContentEditableWarning
                onBlur={(e) => handleUpdateHeader('fullName', e.currentTarget.textContent || '')}
                className="text-[21px] font-bold tracking-tight text-black inline hover:bg-indigo-50/50 outline-none rounded px-0.5 focus:ring-1 focus:ring-indigo-400"
              >
                {header.fullName}
              </span>
              <span className="text-[17px] font-bold text-black ml-1.5 inline">|</span>
              <span
                contentEditable={!isPrintMode}
                suppressContentEditableWarning
                onBlur={(e) => handleUpdateHeader('cohortOrDegree', e.currentTarget.textContent || '')}
                className="text-[17px] font-bold text-black ml-1 inline hover:bg-indigo-50/50 outline-none rounded px-0.5 focus:ring-1 focus:ring-indigo-400"
              >
                {header.cohortOrDegree}
              </span>
            </div>

            {header.showEmblem && (
              <div className="flex items-center gap-2 text-right">
                <div className="flex flex-col items-center">
                  <svg
                    className="w-8 h-8 text-slate-800"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="50" r="46" stroke="#1e293b" strokeWidth="3" />
                    <circle cx="50" cy="50" r="41" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 2" />
                    <path
                      d="M50 20 L58 36 L76 38 L62 50 L66 68 L50 58 L34 68 L38 50 L24 38 L42 36 Z"
                      fill="#334155"
                      opacity="0.9"
                    />
                    <circle cx="50" cy="46" r="8" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="text-right leading-none">
                  <div
                    contentEditable={!isPrintMode}
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateHeader('instituteName', e.currentTarget.textContent || '')}
                    className="text-[10px] font-extrabold tracking-wider text-slate-900 font-serif outline-none hover:bg-indigo-50/50 rounded"
                  >
                    {header.instituteName || 'IIM BODH GAYA'}
                  </div>
                  {header.instituteSubtext && (
                    <div
                      contentEditable={!isPrintMode}
                      suppressContentEditableWarning
                      onBlur={(e) => handleUpdateHeader('instituteSubtext', e.currentTarget.textContent || '')}
                      className="text-[7.5px] text-slate-700 font-medium tracking-tighter mt-0.5 outline-none hover:bg-indigo-50/50 rounded"
                    >
                      {header.instituteSubtext}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. DYNAMIC RESUME SECTIONS */}
          {sections
            .filter((sec) => sec.visible)
            .map((section) => {
              const isLeftDragging =
                isDraggingColumn?.sectionId === section.id && isDraggingColumn.handleType === 'left';
              const isDateDragging =
                isDraggingColumn?.sectionId === section.id && isDraggingColumn.handleType === 'date';
              const isEduDragging =
                isDraggingColumn?.sectionId === section.id && isDraggingColumn.handleType.startsWith('edu-');

              const currentLeftRatio =
                isLeftDragging && dragLiveRatio !== null
                  ? dragLiveRatio
                  : section.columnRatioPercent || globalLeftColWidth;

              const currentDateRatio =
                isDateDragging && dragLiveRatio !== null
                  ? dragLiveRatio
                  : section.dateColWidthPercent || globalDateColWidth;

              const currentEduWidths: [number, number, number, number] =
                isEduDragging && dragLiveEduWidths !== null
                  ? dragLiveEduWidths
                  : section.educationColWidths || globalEduColWidths;

              const hideSecVertical = section.hideVerticalBorders || !showVerticalBorders;
              const outerClass = getOuterTableBorderClass(section);
              const cellBorder = getCellBorderClass(section);

              // Calculate guide line X position for Education dragging
              let eduGuideLeft = 0;
              if (isEduDragging && isDraggingColumn) {
                if (isDraggingColumn.handleType === 'edu-0') {
                  eduGuideLeft = currentEduWidths[0];
                } else if (isDraggingColumn.handleType === 'edu-1') {
                  eduGuideLeft = currentEduWidths[0] + currentEduWidths[1];
                } else if (isDraggingColumn.handleType === 'edu-2') {
                  eduGuideLeft = currentEduWidths[0] + currentEduWidths[1] + currentEduWidths[2];
                }
              }

              return (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className={`${sectionMarginClass} w-full group/sec relative`}
                >
                  {/* Word-Style Section Column Ruler / Table Header Bar for ALL sections */}
                  {!isPrintMode && (
                    <div className="no-print mb-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-[9px] text-slate-700 font-mono select-none">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <TableProperties className="w-3 h-3 text-indigo-600" />
                        <span>{section.title} Columns (Drag Borders ⇄ to Resize):</span>
                      </div>

                      {section.type === 'education' ? (
                        <div className="flex items-center gap-1.5">
                          <span>Deg: <b className="text-indigo-700">{currentEduWidths[0]}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>College: <b className="text-indigo-700">{currentEduWidths[1]}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>Score: <b className="text-indigo-700">{currentEduWidths[2]}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>Year: <b className="text-indigo-700">{currentEduWidths[3]}%</b></span>
                          <button
                            type="button"
                            onClick={() => handleResetEduWidths(section.id)}
                            className="ml-1 px-1.5 py-0.2 bg-white border border-slate-200 hover:border-slate-300 rounded text-[8px] text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs"
                            title="Reset Education column widths to default (12% / 60% / 14% / 14%)"
                          >
                            Reset
                          </button>
                        </div>
                      ) : section.type === 'internships' ? (
                        <div className="flex items-center gap-1.5">
                          <span>Role: <b className="text-indigo-700">{currentLeftRatio}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>Bullets: <b className="text-indigo-700">{100 - currentLeftRatio}%</b></span>
                          <button
                            type="button"
                            onClick={() => handleSetSectionRatios(section.id, 12)}
                            className="ml-1 px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Compact (12%)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetSectionRatio(section.id)}
                            className="px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Reset (14%)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetSectionRatios(section.id, 18)}
                            className="px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Wide (18%)
                          </button>
                        </div>
                      ) : section.type === 'other_interests' ? (
                        <div className="flex items-center gap-1.5">
                          <span>Category: <b className="text-indigo-700">{currentLeftRatio}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>Items: <b className="text-indigo-700">{100 - currentLeftRatio}%</b></span>
                          <button
                            type="button"
                            onClick={() => handleSetSectionRatios(section.id, 12)}
                            className="ml-1 px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Compact (12%)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetSectionRatio(section.id)}
                            className="px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Reset (14%)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetSectionRatios(section.id, 18)}
                            className="px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Wide (18%)
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>Org/Category: <b className="text-indigo-700">{currentLeftRatio}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>Content: <b className="text-indigo-700">{100 - currentLeftRatio - currentDateRatio}%</b></span>
                          <span className="text-slate-300">|</span>
                          <span>Date: <b className="text-indigo-700">{currentDateRatio}%</b></span>
                          <button
                            type="button"
                            onClick={() => handleSetSectionRatios(section.id, 12, 12)}
                            className="ml-1 px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Compact
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetSectionRatio(section.id)}
                            className="px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Reset (15/73/12)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetSectionRatios(section.id, 18, 12)}
                            className="px-1 py-0.2 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[8px] text-slate-600 hover:text-indigo-700 cursor-pointer"
                          >
                            Wide Org
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Word-Style Full-Height Vertical Guide Line while dragging Left Boundary */}
                  {isLeftDragging && (
                    <div
                      className="no-print absolute top-0 bottom-0 pointer-events-none border-r-2 border-indigo-600 border-dashed z-40 transition-none"
                      style={{ left: `${currentLeftRatio}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-indigo-400">
                        <span>Label: {currentLeftRatio}%</span>
                        <span className="text-slate-400">|</span>
                        <span>
                          Content:{' '}
                          {100 - currentLeftRatio - (section.type === 'internships' ? 0 : currentDateRatio)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Word-Style Full-Height Vertical Guide Line while dragging Date Boundary */}
                  {isDateDragging && (
                    <div
                      className="no-print absolute top-0 bottom-0 pointer-events-none border-r-2 border-indigo-600 border-dashed z-40 transition-none"
                      style={{ left: `${100 - currentDateRatio}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-indigo-400">
                        <span>Content: {100 - currentLeftRatio - currentDateRatio}%</span>
                        <span className="text-slate-400">|</span>
                        <span>Date: {currentDateRatio}%</span>
                      </div>
                    </div>
                  )}

                  {/* Word-Style Full-Height Vertical Guide Line while dragging Education Dividers */}
                  {isEduDragging && (
                    <div
                      className="no-print absolute top-0 bottom-0 pointer-events-none border-r-2 border-indigo-600 border-dashed z-40 transition-none"
                      style={{ left: `${eduGuideLeft}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-indigo-400">
                        <span>{activeTooltip}</span>
                      </div>
                    </div>
                  )}

                  {/* Full-Height Column Drag Handles for ALL Sections (Word Table Editing) */}
                  {!isPrintMode && section.type === 'education' && (
                    <>
                      {/* Divider 0: between Degree and College */}
                      <div
                        onMouseDown={(e) => handleStartEducationDrag(e, section.id, 0, currentEduWidths)}
                        style={{ left: `${currentEduWidths[0]}%` }}
                        className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/eduh0 flex items-center justify-center select-none"
                        title="Click & drag to resize Degree / College column boundary (Word Table)"
                      >
                        <div className="w-0.5 h-full group-hover/eduh0:w-1 group-hover/eduh0:bg-indigo-600 transition-all flex items-center justify-center relative">
                          <div className="opacity-0 group-hover/eduh0:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                            ⇄ Degree: {currentEduWidths[0]}%
                          </div>
                        </div>
                      </div>

                      {/* Divider 1: between College and Score */}
                      <div
                        onMouseDown={(e) => handleStartEducationDrag(e, section.id, 1, currentEduWidths)}
                        style={{ left: `${currentEduWidths[0] + currentEduWidths[1]}%` }}
                        className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/eduh1 flex items-center justify-center select-none"
                        title="Click & drag to resize College / Score column boundary (Word Table)"
                      >
                        <div className="w-0.5 h-full group-hover/eduh1:w-1 group-hover/eduh1:bg-indigo-600 transition-all flex items-center justify-center relative">
                          <div className="opacity-0 group-hover/eduh1:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                            ⇄ College: {currentEduWidths[1]}%
                          </div>
                        </div>
                      </div>

                      {/* Divider 2: between Score and Year */}
                      <div
                        onMouseDown={(e) => handleStartEducationDrag(e, section.id, 2, currentEduWidths)}
                        style={{ left: `${currentEduWidths[0] + currentEduWidths[1] + currentEduWidths[2]}%` }}
                        className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/eduh2 flex items-center justify-center select-none"
                        title="Click & drag to resize Score / Year column boundary (Word Table)"
                      >
                        <div className="w-0.5 h-full group-hover/eduh2:w-1 group-hover/eduh2:bg-indigo-600 transition-all flex items-center justify-center relative">
                          <div className="opacity-0 group-hover/eduh2:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                            ⇄ Year: {currentEduWidths[3]}%
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!isPrintMode && section.type === 'internships' && (
                    <div
                      onMouseDown={(e) => handleStartDrag(e, section.id, 'left', currentLeftRatio)}
                      style={{ left: `${currentLeftRatio}%` }}
                      className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/internh flex items-center justify-center select-none"
                      title="Click & drag boundary between Role and Responsibilities to adjust column ratio"
                    >
                      <div className="w-0.5 h-full group-hover/internh:w-1 group-hover/internh:bg-indigo-600 transition-all flex items-center justify-center relative">
                        <div className="opacity-0 group-hover/internh:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                          ⇄ Role: {currentLeftRatio}% | Bullets: {100 - currentLeftRatio}%
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPrintMode && section.type === 'other_interests' && (
                    <div
                      onMouseDown={(e) => handleStartDrag(e, section.id, 'left', currentLeftRatio)}
                      style={{ left: `${currentLeftRatio}%` }}
                      className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/interesth flex items-center justify-center select-none"
                      title="Click & drag boundary between Category and Items to adjust column ratio"
                    >
                      <div className="w-0.5 h-full group-hover/interesth:w-1 group-hover/interesth:bg-indigo-600 transition-all flex items-center justify-center relative">
                        <div className="opacity-0 group-hover/interesth:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                          ⇄ Category: {currentLeftRatio}% | Items: {100 - currentLeftRatio}%
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPrintMode && section.type !== 'education' && section.type !== 'internships' && section.type !== 'other_interests' && (
                    <>
                      {/* Divider 1: between Category/Org and Bullets */}
                      <div
                        onMouseDown={(e) => handleStartDrag(e, section.id, 'left', currentLeftRatio)}
                        style={{ left: `${currentLeftRatio}%` }}
                        className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/stdh0 flex items-center justify-center select-none"
                        title="Click & drag boundary between Label and Content (Word Table Editing)"
                      >
                        <div className="w-0.5 h-full group-hover/stdh0:w-1 group-hover/stdh0:bg-indigo-600 transition-all flex items-center justify-center relative">
                          <div className="opacity-0 group-hover/stdh0:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                            ⇄ Org: {currentLeftRatio}%
                          </div>
                        </div>
                      </div>

                      {/* Divider 2: between Bullets and Date */}
                      <div
                        onMouseDown={(e) => handleStartDrag(e, section.id, 'date', currentDateRatio)}
                        style={{ left: `${100 - currentDateRatio}%` }}
                        className="no-print absolute top-6 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 group/stdh1 flex items-center justify-center select-none"
                        title="Click & drag boundary between Content and Date (Word Table Editing)"
                      >
                        <div className="w-0.5 h-full group-hover/stdh1:w-1 group-hover/stdh1:bg-indigo-600 transition-all flex items-center justify-center relative">
                          <div className="opacity-0 group-hover/stdh1:opacity-100 bg-indigo-600 text-white shadow-md rounded px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap pointer-events-none transition-opacity">
                            ⇄ Date: {currentDateRatio}%
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <table
                    id={`section-table-${section.id}`}
                    className={`resume-table w-full table-fixed ${outerClass} border-collapse text-left`}
                  >
                    {/* Fixed Width Colgroup Enforcing Exact Ratios */}
                    {section.type === 'education' ? (
                      <colgroup>
                        <col style={{ width: `${currentEduWidths[0]}%` }} />
                        <col style={{ width: `${currentEduWidths[1]}%` }} />
                        <col style={{ width: `${currentEduWidths[2]}%` }} />
                        <col style={{ width: `${currentEduWidths[3]}%` }} />
                      </colgroup>
                    ) : section.type === 'internships' ? (
                      <colgroup>
                        <col style={{ width: `${currentLeftRatio}%` }} />
                        <col style={{ width: `${100 - currentLeftRatio}%` }} />
                      </colgroup>
                    ) : section.type === 'other_interests' ? (
                      <colgroup>
                        <col style={{ width: `${currentLeftRatio}%` }} />
                        <col style={{ width: `${100 - currentLeftRatio}%` }} />
                      </colgroup>
                    ) : (
                      <colgroup>
                        <col style={{ width: `${currentLeftRatio}%` }} />
                        <col style={{ width: `${100 - currentLeftRatio - currentDateRatio}%` }} />
                        <col style={{ width: `${currentDateRatio}%` }} />
                      </colgroup>
                    )}

                    {/* Section Title Banner */}
                    <thead>
                      <tr className="bg-[#ebeef2] print:bg-[#ebeef2]">
                        <th
                          colSpan={section.type === 'education' ? 4 : section.type === 'internships' ? 2 : 3}
                          className={`${cellBorder} font-bold uppercase tracking-wider text-black ${cellPaddingClass} ${headerTextSize}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              contentEditable={!isPrintMode}
                              suppressContentEditableWarning
                              onBlur={(e) =>
                                handleUpdateSectionTitle(section.id, e.currentTarget.textContent || '')
                              }
                              className="outline-none hover:bg-white/60 px-1 rounded cursor-text"
                            >
                              {section.title}
                            </span>

                            <div className="flex items-center gap-2">
                              {section.badgeText && (
                                <span
                                  contentEditable={!isPrintMode}
                                  suppressContentEditableWarning
                                  onBlur={(e) => {
                                    if (onUpdateResume) {
                                      const updated = sections.map((s) =>
                                        s.id === section.id
                                          ? { ...s, badgeText: e.currentTarget.textContent || '' }
                                          : s
                                      );
                                      onUpdateResume({ ...resume, sections: updated });
                                    }
                                  }}
                                  className="text-[10px] font-bold lowercase first-letter:uppercase tracking-normal outline-none hover:bg-white/60 px-1 rounded"
                                >
                                  {section.badgeText}
                                </span>
                              )}

                              {/* Interactive Table Borders & Line Controls Popover */}
                              {!isPrintMode && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setOpenSectionMenuId(openSectionMenuId === section.id ? null : section.id)}
                                    className="no-print p-0.5 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-300 rounded text-[9px] font-sans font-medium px-1.5 flex items-center gap-1 shadow-2xs transition-colors"
                                    title="Add or remove borders and lines for this section"
                                  >
                                    <TableProperties className="w-3 h-3 text-slate-700" />
                                    <span>Borders & Lines</span>
                                    <ChevronDown className="w-2.5 h-2.5" />
                                  </button>

                                  {openSectionMenuId === section.id && (
                                    <div className="no-print absolute right-0 top-6 z-50 bg-white border border-slate-300 rounded-lg shadow-xl p-2 w-64 text-xs text-slate-800 font-sans space-y-1.5 text-left select-none">
                                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                                        <span>Section Table Borders</span>
                                        <button
                                          type="button"
                                          onClick={() => setOpenSectionMenuId(null)}
                                          className="text-slate-400 hover:text-slate-700"
                                        >
                                          ✕
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleSectionHorizontalBorders(section.id)}
                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-[11px]"
                                      >
                                        <span>Horizontal Line Borders</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${section.hideHorizontalBorders ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {section.hideHorizontalBorders ? 'Removed' : 'Active'}
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleSectionVerticalBorders(section.id)}
                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-[11px]"
                                      >
                                        <span>Vertical Column Borders</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${section.hideVerticalBorders ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {section.hideVerticalBorders ? 'Removed' : 'Active'}
                                        </span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleSectionOuterBorder(section.id)}
                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center justify-between text-[11px]"
                                      >
                                        <span>Outer Box Border</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${section.hideOuterBorder ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                          {section.hideOuterBorder ? 'Removed' : 'Active'}
                                        </span>
                                      </button>

                                      {/* Row Separator Line Borders */}
                                      <div className="pt-1.5 border-t border-slate-100 space-y-1">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Row Line Borders</div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleAllSectionRowBorders(section.id, true)}
                                            className="py-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium text-[9px] text-center cursor-pointer"
                                          >
                                            ✓ Show All Lines
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleAllSectionRowBorders(section.id, false)}
                                            className="py-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-medium text-[9px] text-center cursor-pointer"
                                          >
                                            — Hide All Lines
                                          </button>
                                        </div>
                                      </div>

                                      <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleAddNewRow(section.id);
                                            setOpenSectionMenuId(null);
                                          }}
                                          className="flex-1 py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" /> Add Blank Line/Row
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleResetSectionRatio(section.id);
                                            setOpenSectionMenuId(null);
                                          }}
                                          className="py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded text-[10px] cursor-pointer"
                                          title="Reset column ratios to default"
                                        >
                                          Reset Widths
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Section Renderer based on type */}
                      {section.type === 'education' ? (
                        renderEducationRows(
                          section,
                          currentEduWidths,
                          cellPaddingClass,
                          baseTextSize,
                          cellBorder,
                          hideSecVertical,
                          isPrintMode,
                          handleUpdateEntryField,
                          handleToggleRowLineBorder,
                          handleAddNewRow,
                          handleDeleteRow,
                          getRowBottomClass
                        )
                      ) : section.type === 'internships' ? (
                        renderInternshipRows(
                          section,
                          currentLeftRatio,
                          cellPaddingClass,
                          baseTextSize,
                          cellBorder,
                          hideSecVertical,
                          isPrintMode,
                          handleUpdateEntryField,
                          handleUpdateBullet,
                          handleBulletKeyDown,
                          handleAddNewBullet,
                          handleStartDrag,
                          onOpenAi,
                          handleToggleRowLineBorder,
                          handleAddNewRow,
                          handleDeleteRow,
                          getRowBottomClass
                        )
                      ) : section.type === 'other_interests' ? (
                        renderInterestsRows(
                          section,
                          currentLeftRatio,
                          cellPaddingClass,
                          baseTextSize,
                          cellBorder,
                          hideSecVertical,
                          isPrintMode,
                          handleUpdateEntryField,
                          handleStartDrag,
                          handleToggleRowLineBorder,
                          handleAddNewRow,
                          handleDeleteRow,
                          getRowBottomClass
                        )
                      ) : (
                        renderStandardRows(
                          section,
                          currentLeftRatio,
                          currentDateRatio,
                          cellPaddingClass,
                          baseTextSize,
                          cellBorder,
                          hideSecVertical,
                          isPrintMode,
                          handleUpdateEntryField,
                          handleUpdateBullet,
                          handleBulletKeyDown,
                          handleAddNewBullet,
                          handleStartDrag,
                          onOpenAi,
                          handleToggleRowLineBorder,
                          handleAddNewRow,
                          handleDeleteRow,
                          getRowBottomClass
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
        </div>

        {/* 3. FOOTER / CONTACT INFORMATION BANNER */}
        <div className="w-full mt-1">
          <div className="bg-[#f1f4f8] print:bg-[#f1f4f8] border border-black py-1 px-2 text-center text-[9px] text-slate-900 leading-tight">
            <span className="font-semibold">Address:</span>{' '}
            <span
              contentEditable={!isPrintMode}
              suppressContentEditableWarning
              onBlur={(e) => handleUpdateHeader('address', e.currentTarget.textContent || '')}
              className="outline-none hover:bg-indigo-50/50 rounded px-0.5"
            >
              {header.address}
            </span>
            <span className="mx-2.5 font-bold text-slate-400">|</span>
            <span className="font-semibold">Contact:</span>{' '}
            <span
              contentEditable={!isPrintMode}
              suppressContentEditableWarning
              onBlur={(e) => handleUpdateHeader('phone', e.currentTarget.textContent || '')}
              className="outline-none hover:bg-indigo-50/50 rounded px-0.5"
            >
              {header.phone}
            </span>
            <span className="mx-2.5 font-bold text-slate-400">|</span>
            <span className="font-semibold">E-mail:</span>{' '}
            <span
              contentEditable={!isPrintMode}
              suppressContentEditableWarning
              onBlur={(e) => handleUpdateHeader('email', e.currentTarget.textContent || '')}
              className="outline-none hover:bg-indigo-50/50 rounded px-0.5"
            >
              {header.email}
            </span>
            {header.linkedin && (
              <>
                <span className="mx-2.5 font-bold text-slate-400">|</span>
                <span className="font-semibold">LinkedIn:</span>{' '}
                <span
                  contentEditable={!isPrintMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdateHeader('linkedin', e.currentTarget.textContent || '')}
                  className="outline-none hover:bg-indigo-50/50 rounded px-0.5"
                >
                  {header.linkedin}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Renderers with Direct Editing and Word-like Column Dragging ---

function renderInternshipRows(
  section: ResumeSection,
  currentRatio: number,
  cellPadding: string,
  textSize: string,
  cellBorderClass: string,
  hideVertical: boolean,
  isPrintMode: boolean,
  handleUpdateEntryField: any,
  handleUpdateBullet: any,
  handleBulletKeyDown: any,
  handleAddNewBullet: any,
  handleStartDrag: any,
  onOpenAi: any,
  handleToggleRowLineBorder?: any,
  handleAddNewRow?: any,
  handleDeleteRow?: any,
  getRowBottomClass?: any
) {
  const verticalBorderClass = hideVertical ? '' : 'border-r border-black';

  return section.entries.map((entry) => {
    const rowBottomClass = getRowBottomClass ? getRowBottomClass(section, entry) : 'border-b border-black';

    return (
      <React.Fragment key={entry.id}>
        {/* 1. Full-Width Subheader Row (Company | Role | Duration) */}
        <tr className="border-b border-black font-bold">
          <td colSpan={2} className={`border border-black ${cellPadding} ${textSize}`}>
            <div className="flex items-baseline justify-between w-full">
              {/* Organization */}
              <span
                contentEditable={!isPrintMode}
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleUpdateEntryField(section.id, entry.id, 'organization', e.currentTarget.textContent || '')
                }
                className="font-bold text-black text-left outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
              >
                {entry.organization}
              </span>

              {/* Role Title */}
              <span
                contentEditable={!isPrintMode}
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleUpdateEntryField(section.id, entry.id, 'roleOrTitle', e.currentTarget.textContent || '')
                }
                className="font-bold text-black text-center outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
              >
                {entry.roleOrTitle}
              </span>

              {/* Date / Year */}
              <span
                contentEditable={!isPrintMode}
                suppressContentEditableWarning
                onBlur={(e) =>
                  handleUpdateEntryField(section.id, entry.id, 'dateOrYear', e.currentTarget.textContent || '')
                }
                className="font-bold text-black text-right outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
              >
                {entry.dateOrYear}
              </span>
            </div>
          </td>
        </tr>

        {/* 2. Responsibilities Label & Bullets */}
        <tr className={`${rowBottomClass} align-top group/row relative`}>
          {/* Left Column: Roles and Responsibilities */}
          <td
            className={`border-b border-black ${verticalBorderClass} text-center font-normal text-slate-800 ${cellPadding} text-[9px] leading-tight align-middle relative`}
            style={{ width: `${currentRatio}%` }}
          >
            <div
              contentEditable={!isPrintMode}
              suppressContentEditableWarning
              onBlur={(e) =>
                handleUpdateEntryField(section.id, entry.id, 'subtitle', e.currentTarget.innerText || '')
              }
              className="whitespace-pre-line py-1 outline-none hover:bg-indigo-50/50 rounded cursor-text"
            >
              {entry.subtitle || 'Roles and\nResponsibilities'}
            </div>

            {/* Microsoft Word Drag-and-Drop Column Boundary between role and bullets */}
            {!isPrintMode && (
              <div
                onMouseDown={(e) => handleStartDrag(e, section.id, 'left', currentRatio)}
                className="no-print absolute top-0 -right-2 w-4 h-full cursor-col-resize z-30 group/divider flex items-center justify-center select-none"
                title="Click & drag boundary to adjust column ratio (Word table editing)"
              >
                <div className="w-1 h-full group-hover/divider:bg-indigo-600 transition-colors flex items-center justify-center relative">
                  <div className="w-4 h-5 rounded bg-indigo-600 text-white shadow-xs opacity-0 group-hover/divider:opacity-100 flex items-center justify-center text-[8px] font-bold pointer-events-none transition-opacity">
                    ⇄
                  </div>
                </div>
              </div>
            )}
          </td>

          {/* Right Column: Bullets */}
          <td
            className={`border-b border-black ${cellPadding} ${textSize} align-top relative`}
            style={{ width: `${100 - currentRatio}%` }}
          >
            <ul className="space-y-0.5 list-none pl-0 m-0">
              {entry.bullets.map((bullet, bIdx) => (
                <li key={bullet.id} className="flex items-start text-justify group/bullet relative">
                  <span className="inline-block mr-1.5 text-[7px] select-none leading-[1.7] text-black">●</span>
                  <span
                    contentEditable={!isPrintMode}
                    suppressContentEditableWarning
                    onKeyDown={(e) =>
                      handleBulletKeyDown(e, section.id, entry.id, bIdx, bullet.text)
                    }
                    onBlur={(e) =>
                      handleUpdateBullet(section.id, entry.id, bullet.id, e.currentTarget.innerText || '')
                    }
                    className="flex-1 outline-none hover:bg-indigo-50/40 rounded px-0.5 cursor-text text-black"
                  >
                    {bullet.text}
                  </span>

                  {/* Quick AI button on hover */}
                  {!isPrintMode && onOpenAi && (
                    <span className="no-print opacity-0 group-hover/bullet:opacity-100 flex items-center gap-0.5 ml-1 self-center">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenAi(bullet.text, (revised: string) =>
                            handleUpdateBullet(section.id, entry.id, bullet.id, revised)
                          )
                        }
                        title="Improve bullet with AI"
                        className="p-0.5 text-indigo-600 hover:text-indigo-800 bg-white rounded shadow-2xs"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Inline Action Bar */}
            {!isPrintMode && (
              <div className="no-print opacity-0 group-hover/row:opacity-100 pt-0.5 transition-opacity flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleAddNewBullet(section.id, entry.id)}
                  className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" /> Add bullet point
                </button>

                <div className="flex items-center gap-1">
                  {handleToggleRowLineBorder && (
                    <button
                      type="button"
                      onClick={() => handleToggleRowLineBorder(section.id, entry.id)}
                      className={`px-1.5 py-0.5 text-[8px] font-semibold rounded flex items-center gap-0.5 cursor-pointer transition-colors ${
                        entry.hideBottomBorder
                          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                          : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                      }`}
                      title={entry.hideBottomBorder ? "Add bottom line border to this row" : "Remove bottom line border from this row"}
                    >
                      {entry.hideBottomBorder ? "+ Add Line Border" : "— Remove Line Border"}
                    </button>
                  )}
                  {handleAddNewRow && (
                    <button
                      type="button"
                      onClick={() => handleAddNewRow(section.id, entry.id)}
                      className="px-1.5 py-0.5 text-[8px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded cursor-pointer"
                      title="Add new internship entry"
                    >
                      + Entry
                    </button>
                  )}
                  {handleDeleteRow && section.entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(section.id, entry.id)}
                      className="px-1 py-0.5 text-[8px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded cursor-pointer"
                      title="Delete this internship"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
      </React.Fragment>
    );
  });
}

function renderEducationRows(
  section: ResumeSection,
  eduWidths: [number, number, number, number],
  cellPadding: string,
  textSize: string,
  cellBorderClass: string,
  hideVertical: boolean,
  isPrintMode: boolean,
  handleUpdateEntryField: any,
  handleToggleRowLineBorder: any,
  handleAddNewRow: any,
  handleDeleteRow: any,
  getRowBottomClass: any
) {
  const vertClass = hideVertical ? '' : 'border-r border-black';

  return section.entries.map((entry) => {
    const rowBottomClass = getRowBottomClass(section, entry);

    return (
      <tr key={entry.id} className={`${rowBottomClass} group/edu-row relative`}>
        {/* Col 0: Degree / Class */}
        <td
          className={`${vertClass} font-bold text-center ${cellPadding} ${textSize} relative`}
          style={{ width: `${eduWidths[0]}%` }}
        >
          <span
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleUpdateEntryField(section.id, entry.id, 'degree', e.currentTarget.textContent || '')
            }
            className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.degree}
          </span>
        </td>

        {/* Col 1: Institution */}
        <td
          className={`${vertClass} text-center ${cellPadding} ${textSize} relative`}
          style={{ width: `${eduWidths[1]}%` }}
        >
          <span
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleUpdateEntryField(section.id, entry.id, 'institution', e.currentTarget.textContent || '')
            }
            className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.institution}
          </span>
        </td>

        {/* Col 2: Score / % */}
        <td
          className={`${vertClass} text-center ${cellPadding} ${textSize} relative`}
          style={{ width: `${eduWidths[2]}%` }}
        >
          <span
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleUpdateEntryField(section.id, entry.id, 'score', e.currentTarget.textContent || '')
            }
            className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.score}
          </span>
        </td>

        {/* Col 3: Date / Year */}
        <td
          className={`text-center ${cellPadding} ${textSize} relative`}
          style={{ width: `${eduWidths[3]}%` }}
        >
          <span
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleUpdateEntryField(section.id, entry.id, 'dateOrYear', e.currentTarget.textContent || '')
            }
            className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.dateOrYear}
          </span>

          {/* Option to Add or Remove Line Border & Add Row */}
          {!isPrintMode && (
            <div className="no-print absolute -right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/edu-row:opacity-100 flex items-center gap-1 bg-white border border-slate-300 rounded shadow-md px-1.5 py-0.5 z-40 transition-opacity">
              <button
                type="button"
                onClick={() => handleToggleRowLineBorder(section.id, entry.id)}
                className={`px-1.5 py-0.5 text-[8px] font-semibold rounded flex items-center gap-0.5 cursor-pointer transition-colors ${
                  entry.hideBottomBorder
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                }`}
                title={entry.hideBottomBorder ? "Add bottom line border to this row" : "Remove bottom line border from this row"}
              >
                {entry.hideBottomBorder ? "+ Add Line Border" : "— Remove Line Border"}
              </button>
              <button
                type="button"
                onClick={() => handleAddNewRow(section.id, entry.id)}
                className="px-1.5 py-0.5 text-[8px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded cursor-pointer"
                title="Add new line / row below"
              >
                + Row
              </button>
              {section.entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteRow(section.id, entry.id)}
                  className="px-1 py-0.5 text-[8px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded cursor-pointer"
                  title="Delete this row"
                >
                  🗑
                </button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  });
}

function renderInterestsRows(
  section: ResumeSection,
  currentRatio: number,
  cellPadding: string,
  textSize: string,
  cellBorderClass: string,
  hideVertical: boolean,
  isPrintMode: boolean,
  handleUpdateEntryField: any,
  handleStartDrag: any,
  handleToggleRowLineBorder: any,
  handleAddNewRow: any,
  handleDeleteRow: any,
  getRowBottomClass: any
) {
  const vertClass = hideVertical ? '' : 'border-r border-black';

  return section.entries.map((entry) => {
    const rowBottomClass = getRowBottomClass(section, entry);

    return (
      <tr key={entry.id} className={`${rowBottomClass} group/interests-row relative`}>
        <td
          className={`${vertClass} font-bold text-center ${cellPadding} ${textSize} relative`}
          style={{ width: `${currentRatio}%` }}
        >
          <span
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleUpdateEntryField(section.id, entry.id, 'category', e.currentTarget.textContent || '')
            }
            className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.category || 'Hobbies'}
          </span>

          {!isPrintMode && (
            <div
              onMouseDown={(e) => handleStartDrag(e, section.id, 'left', currentRatio)}
              className="no-print absolute top-0 -right-2 w-4 h-full cursor-col-resize z-30 group/divider flex items-center justify-center select-none"
              title="Click & drag boundary to adjust column ratio"
            >
              <div className="w-1 h-full group-hover/divider:bg-indigo-600 transition-colors flex items-center justify-center relative">
                <div className="w-4 h-5 rounded bg-indigo-600 text-white shadow-xs opacity-0 group-hover/divider:opacity-100 flex items-center justify-center text-[8px] font-bold pointer-events-none transition-opacity">
                  ⇄
                </div>
              </div>
            </div>
          )}
        </td>
        <td className={`${cellPadding} ${textSize} relative`} style={{ width: `${100 - currentRatio}%` }}>
          <div className="flex items-center gap-6">
            {(entry.inlineItems || []).map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="text-[7px]">●</span>
                <span
                  contentEditable={!isPrintMode}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newItems = [...(entry.inlineItems || [])];
                    newItems[idx] = e.currentTarget.textContent || '';
                    handleUpdateEntryField(section.id, entry.id, 'inlineItems', newItems);
                  }}
                  className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
                >
                  {item}
                </span>
              </span>
            ))}
          </div>

          {/* Option to Add or Remove Line Border & Add Row */}
          {!isPrintMode && (
            <div className="no-print absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/interests-row:opacity-100 flex items-center gap-1 bg-white border border-slate-300 rounded shadow-md px-1.5 py-0.5 z-40 transition-opacity">
              <button
                type="button"
                onClick={() => handleToggleRowLineBorder(section.id, entry.id)}
                className={`px-1.5 py-0.5 text-[8px] font-semibold rounded flex items-center gap-0.5 cursor-pointer transition-colors ${
                  entry.hideBottomBorder
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                }`}
                title={entry.hideBottomBorder ? "Add bottom line border to this row" : "Remove bottom line border from this row"}
              >
                {entry.hideBottomBorder ? "+ Add Line Border" : "— Remove Line Border"}
              </button>
              <button
                type="button"
                onClick={() => handleAddNewRow(section.id, entry.id)}
                className="px-1.5 py-0.5 text-[8px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded cursor-pointer"
                title="Add new line / row below"
              >
                + Row
              </button>
              {section.entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteRow(section.id, entry.id)}
                  className="px-1 py-0.5 text-[8px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded cursor-pointer"
                  title="Delete this row"
                >
                  🗑
                </button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  });
}

function renderStandardRows(
  section: ResumeSection,
  currentLeftRatio: number,
  currentDateRatio: number,
  cellPadding: string,
  textSize: string,
  cellBorderClass: string,
  hideVertical: boolean,
  isPrintMode: boolean,
  handleUpdateEntryField: any,
  handleUpdateBullet: any,
  handleBulletKeyDown: any,
  handleAddNewBullet: any,
  handleStartDrag: any,
  onOpenAi: any,
  handleToggleRowLineBorder: any,
  handleAddNewRow: any,
  handleDeleteRow: any,
  getRowBottomClass: any
) {
  const vertClass = hideVertical ? '' : 'border-r border-black';
  const bulletsColWidth = 100 - currentLeftRatio - currentDateRatio;

  return section.entries.map((entry) => {
    const rowBottomClass = getRowBottomClass(section, entry);

    return (
      <tr key={entry.id} className={`${rowBottomClass} align-top group/std relative`}>
        {/* 1. Category / Left Column */}
        <td
          className={`${vertClass} font-bold text-center ${cellPadding} ${textSize} align-middle relative`}
          style={{ width: `${currentLeftRatio}%` }}
        >
          <div
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) => {
              const val = e.currentTarget.innerText || '';
              handleUpdateEntryField(section.id, entry.id, 'category', val);
              handleUpdateEntryField(section.id, entry.id, 'organization', val);
            }}
            className="whitespace-pre-line outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.category || entry.organization}
          </div>

          {/* Draggable Divider Handle 1: Between Label and Content */}
          {!isPrintMode && (
            <div
              onMouseDown={(e) => handleStartDrag(e, section.id, 'left', currentLeftRatio)}
              className="no-print absolute top-0 -right-2 w-4 h-full cursor-col-resize z-30 group/divider flex items-center justify-center select-none"
              title="Click & drag boundary to adjust label width (Word Table Style)"
            >
              <div className="w-1 h-full group-hover/divider:bg-indigo-600 transition-colors flex items-center justify-center relative">
                <div className="w-4 h-5 rounded bg-indigo-600 text-white shadow-xs opacity-0 group-hover/divider:opacity-100 flex items-center justify-center text-[8px] font-bold pointer-events-none transition-opacity">
                  ⇄
                </div>
              </div>
            </div>
          )}
        </td>

        {/* 2. Bullets / Content Column */}
        <td
          className={`${vertClass} ${cellPadding} ${textSize} relative`}
          style={{ width: `${bulletsColWidth}%` }}
        >
          <ul className="space-y-0.5 list-none pl-0 m-0">
            {entry.bullets.map((bullet, bIdx) => (
              <li key={bullet.id} className="flex items-start text-justify group/item relative">
                <span className="inline-block mr-1.5 text-[7px] select-none leading-[1.7] text-black">●</span>
                <span
                  contentEditable={!isPrintMode}
                  suppressContentEditableWarning
                  onKeyDown={(e) =>
                    handleBulletKeyDown(e, section.id, entry.id, bIdx, bullet.text)
                  }
                  onBlur={(e) =>
                    handleUpdateBullet(section.id, entry.id, bullet.id, e.currentTarget.innerText || '')
                  }
                  className="flex-1 outline-none hover:bg-indigo-50/40 rounded px-0.5 cursor-text text-black"
                >
                  {bullet.text}
                </span>

                {/* AI action button */}
                {!isPrintMode && onOpenAi && (
                  <span className="no-print opacity-0 group-hover/item:opacity-100 ml-1">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenAi(bullet.text, (revised: string) =>
                          handleUpdateBullet(section.id, entry.id, bullet.id, revised)
                        )
                      }
                      title="Improve with AI"
                      className="p-0.5 text-indigo-600 hover:text-indigo-800 bg-white rounded shadow-2xs"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Inline Action Bar: Add Bullet, Add/Remove Line Border, Add Row */}
          {!isPrintMode && (
            <div className="no-print opacity-0 group-hover/std:opacity-100 pt-0.5 transition-opacity flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAddNewBullet(section.id, entry.id)}
                className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" /> Add bullet point
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleRowLineBorder(section.id, entry.id)}
                  className={`px-1.5 py-0.5 text-[8px] font-semibold rounded flex items-center gap-0.5 cursor-pointer transition-colors ${
                    entry.hideBottomBorder
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                      : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                  }`}
                  title={entry.hideBottomBorder ? "Add bottom line border to this row" : "Remove bottom line border from this row"}
                >
                  {entry.hideBottomBorder ? "+ Add Line Border" : "— Remove Line Border"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNewRow(section.id, entry.id)}
                  className="px-1.5 py-0.5 text-[8px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded cursor-pointer"
                  title="Add new line / row below"
                >
                  + Row
                </button>
                {section.entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(section.id, entry.id)}
                    className="px-1 py-0.5 text-[8px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded cursor-pointer"
                    title="Delete this row"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          )}
        </td>

        {/* 3. Date / Year Column */}
        <td
          className={`text-center font-bold ${cellPadding} ${textSize} align-middle relative`}
          style={{ width: `${currentDateRatio}%` }}
        >
          {/* Draggable Divider Handle 2: Between Content and Date/Year */}
          {!isPrintMode && (
            <div
              onMouseDown={(e) => handleStartDrag(e, section.id, 'date', currentDateRatio)}
              className="no-print absolute top-0 -left-2 w-4 h-full cursor-col-resize z-30 group/divider flex items-center justify-center select-none"
              title="Click & drag boundary to adjust date width (Word Table Style)"
            >
              <div className="w-1 h-full group-hover/divider:bg-indigo-600 transition-colors flex items-center justify-center relative">
                <div className="w-4 h-5 rounded bg-indigo-600 text-white shadow-xs opacity-0 group-hover/divider:opacity-100 flex items-center justify-center text-[8px] font-bold pointer-events-none transition-opacity">
                  ⇄
                </div>
              </div>
            </div>
          )}

          <span
            contentEditable={!isPrintMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              handleUpdateEntryField(section.id, entry.id, 'dateOrYear', e.currentTarget.textContent || '')
            }
            className="outline-none hover:bg-indigo-50/50 rounded px-0.5 cursor-text"
          >
            {entry.dateOrYear}
          </span>
        </td>
      </tr>
    );
  });
}
