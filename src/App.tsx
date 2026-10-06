import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  SlidersHorizontal,
  Sparkles,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { ResumeData, ResumeSection } from './types/resume';
import { initialResumeData } from './data/initialResume';
import { ResumePreview } from './components/ResumePreview';
import { PersonalHeaderEditor } from './components/Editor/PersonalHeaderEditor';
import { SectionEditor } from './components/Editor/SectionEditor';
import { AddSectionModal } from './components/Editor/AddSectionModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ResumeQualityChecker } from './components/ResumeQualityChecker';
import { ExportModal } from './components/ExportModal';
import { TopNavbar } from './components/TopNavbar';
import { WordDocumentRibbon } from './components/WordDocumentRibbon';
import { analyzeResumeDensity } from './utils/densityCalculator';

const LOCAL_STORAGE_KEY = 'iim_canonical_resume_v1';

export default function App() {
  // State initialization with localStorage fallback
  const [resume, setResume] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.header && parsed.sections) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved resume from localStorage', e);
    }
    return initialResumeData;
  });

  // Undo / Redo history stacks
  const [historyPast, setHistoryPast] = useState<ResumeData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<ResumeData[]>([]);

  // Preview & UI controls
  const [previewZoom, setPreviewZoom] = useState(0.85);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'quality'>('editor');
  const [showSettingsBar, setShowSettingsBar] = useState(false);

  // Modals state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isQualityCheckerOpen, setIsQualityCheckerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // AI Modal state
  const [aiModalState, setAiModalState] = useState<{
    isOpen: boolean;
    text: string;
    onApply: (revised: string) => void;
  }>({
    isOpen: false,
    text: '',
    onApply: () => {},
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resume));
    } catch (e) {
      console.error(e);
    }
  }, [resume]);

  // Push state to undo history
  const updateResumeWithHistory = useCallback((newResume: ResumeData) => {
    setResume((current) => {
      setHistoryPast((past) => [...past.slice(-25), current]);
      setHistoryFuture([]);
      return newResume;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, historyPast.length - 1);
    setHistoryFuture((future) => [resume, ...future]);
    setHistoryPast(newPast);
    setResume(previous);
  }, [historyPast, resume]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);
    setHistoryPast((past) => [...past, resume]);
    setHistoryFuture(newFuture);
    setResume(next);
  }, [historyFuture, resume]);

  // Keyboard shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Reset to original uploaded template
  const handleResetToTemplate = () => {
    if (window.confirm('Reset all content back to the default canonical IIM Bodh Gaya template? This will overwrite existing edits.')) {
      updateResumeWithHistory(initialResumeData);
    }
  };

  // Section operations
  const handleSectionChange = (index: number, updated: ResumeSection) => {
    const newSections = [...resume.sections];
    newSections[index] = updated;
    updateResumeWithHistory({ ...resume, sections: newSections });
  };

  const handleSectionDelete = (index: number) => {
    const secName = resume.sections[index].title;
    if (window.confirm(`Are you sure you want to delete the "${secName}" section?`)) {
      const newSections = resume.sections.filter((_, i) => i !== index);
      updateResumeWithHistory({ ...resume, sections: newSections });
    }
  };

  const handleSectionMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= resume.sections.length) return;
    const newSections = [...resume.sections];
    const temp = newSections[index];
    newSections[index] = newSections[target];
    newSections[target] = temp;
    updateResumeWithHistory({ ...resume, sections: newSections });
  };

  const handleAddSection = (newSection: ResumeSection) => {
    updateResumeWithHistory({
      ...resume,
      sections: [...resume.sections, newSection],
    });
  };

  // Intelligent White-Space Optimizer
  const handleAutoFitSpacing = () => {
    const analysis = analyzeResumeDensity(resume);
    let newDensity = resume.settings.spacingDensity;
    let newSize = resume.settings.fontSize;

    if (analysis.status === 'Too Dense' || analysis.densityPercentage > 102) {
      newDensity = 'ultra-compact';
      newSize = 'compact';
    } else if (analysis.status === 'Dense') {
      newDensity = 'compact';
      newSize = 'compact';
    } else if (analysis.status === 'Too Sparse') {
      newDensity = 'compact';
      newSize = 'normal';
    } else {
      newDensity = 'compact';
      newSize = 'compact';
    }

    updateResumeWithHistory({
      ...resume,
      settings: {
        ...resume.settings,
        spacingDensity: newDensity,
        fontSize: newSize,
      },
    });
  };

  const handleOpenAi = (text: string, onApply: (revised: string) => void) => {
    setAiModalState({
      isOpen: true,
      text,
      onApply: (revised) => {
        onApply(revised);
        // Record undo history
        updateResumeWithHistory({ ...resume });
      },
    });
  };

  const density = analyzeResumeDensity(resume);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. TOP APPLICATION NAVIGATION */}
      <TopNavbar
        resume={resume}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleResetToTemplate}
        onAutoFitSpacing={handleAutoFitSpacing}
        zoom={previewZoom}
        onZoomChange={setPreviewZoom}
        onOpenQualityChecker={() => setIsQualityCheckerOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        activeMobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
      />

      {/* 2. MAIN WORKSPACE AREA */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-2 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: RESUME EDITOR PANEL */}
        <div
          className={`md:col-span-6 lg:col-span-5 xl:col-span-5 space-y-3 ${
            mobileTab === 'editor' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Quick Formatting & Spacing Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Layout & Spacing Tuning</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsBar(!showSettingsBar)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {showSettingsBar ? 'Hide' : 'Configure'}
              </button>
            </div>

            {showSettingsBar && (
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Spacing Density
                  </label>
                  <select
                    value={resume.settings.spacingDensity}
                    onChange={(e) =>
                      updateResumeWithHistory({
                        ...resume,
                        settings: {
                          ...resume.settings,
                          spacingDensity: e.target.value as any,
                        },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded p-1.5 bg-slate-50"
                  >
                    <option value="ultra-compact">Ultra-Compact (Tightest)</option>
                    <option value="compact">Compact (Standard IIM)</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Font Scale
                  </label>
                  <select
                    value={resume.settings.fontSize}
                    onChange={(e) =>
                      updateResumeWithHistory({
                        ...resume,
                        settings: {
                          ...resume.settings,
                          fontSize: e.target.value as any,
                        },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded p-1.5 bg-slate-50"
                  >
                    <option value="compact">Compact (9.5pt)</option>
                    <option value="normal">Normal (10pt)</option>
                    <option value="relaxed">Relaxed (10.5pt)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Typography Font
                  </label>
                  <select
                    value={resume.settings.fontFamily}
                    onChange={(e) =>
                      updateResumeWithHistory({
                        ...resume,
                        settings: {
                          ...resume.settings,
                          fontFamily: e.target.value as any,
                        },
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded p-1.5 bg-slate-50"
                  >
                    <option value="serif">Times / Tinos (Canonical)</option>
                    <option value="cambria">Merriweather / Cambria</option>
                    <option value="garamond">Lora / Garamond</option>
                    <option value="sans">Inter (Modern Sans)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleAutoFitSpacing}
                    className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-xs flex items-center justify-center gap-1 border border-indigo-200"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Fit 1 Page
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Candidate Personal Header */}
          <PersonalHeaderEditor
            header={resume.header}
            onChange={(updatedHeader) =>
              updateResumeWithHistory({ ...resume, header: updatedHeader })
            }
          />

          {/* Section Editors List */}
          <div className="space-y-2">
            {resume.sections.map((section, idx) => (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(updated) => handleSectionChange(idx, updated)}
                onDelete={() => handleSectionDelete(idx)}
                onMoveUp={idx > 0 ? () => handleSectionMove(idx, 'up') : undefined}
                onMoveDown={idx < resume.sections.length - 1 ? () => handleSectionMove(idx, 'down') : undefined}
                onOpenAi={handleOpenAi}
              />
            ))}
          </div>

          {/* Add Section Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAddSectionOpen(true)}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 flex items-center justify-center gap-2 transition-all shadow-2xs group"
            >
              <Plus className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>+ Add New Section (Skills, Projects, Awards, Custom...)</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME A4 RESUME PREVIEW PANEL */}
        <div
          className={`md:col-span-6 lg:col-span-7 xl:col-span-7 ${
            mobileTab === 'preview' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Word Document Toolbar Ribbon */}
          <WordDocumentRibbon
            resume={resume}
            onUpdateSettings={(newSettings) =>
              updateResumeWithHistory({
                ...resume,
                settings: {
                  ...resume.settings,
                  ...newSettings,
                },
              })
            }
            onAutoFitSpacing={handleAutoFitSpacing}
          />

          {/* Preview Container Bar */}
          <div className="sticky top-18 bg-white border border-slate-200 rounded-xl shadow-xs p-3 sm:p-4 flex flex-col items-center">
            {/* Top Toolbar in Preview Card */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">A4 Live Document View</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    density.status === 'Balanced'
                      ? 'bg-emerald-100 text-emerald-800'
                      : density.status === 'Dense'
                      ? 'bg-blue-100 text-blue-800'
                      : density.status === 'Too Sparse'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {density.pageCountEstimate} Page{density.pageCountEstimate > 1 ? 's' : ''} • {density.status}
                </span>
              </div>

              {/* Zoom Buttons in Preview Header */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(Math.max(0.4, previewZoom - 0.1))}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-slate-500 font-mono text-[11px] min-w-8 text-center">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(Math.min(1.4, previewZoom + 0.1))}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(0.8)}
                  className="text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
                >
                  Fit Page
                </button>
              </div>
            </div>

            {/* Scrollable A4 Viewport */}
            <div className="w-full overflow-x-auto overflow-y-auto flex justify-center bg-slate-200/60 p-2 sm:p-6 rounded-lg min-h-[600px] max-h-[calc(100vh-140px)]">
              <ResumePreview
                resume={resume}
                scale={previewZoom}
                onUpdateResume={updateResumeWithHistory}
                onOpenAi={handleOpenAi}
              />
            </div>
          </div>
        </div>

        {/* MOBILE QUALITY TAB */}
        {mobileTab === 'quality' && (
          <div className="md:hidden col-span-12">
            <ResumeQualityChecker
              isOpen={true}
              onClose={() => setMobileTab('preview')}
              resume={resume}
              onAutoFitSpacing={handleAutoFitSpacing}
            />
          </div>
        )}
      </main>

      {/* 3. MODALS */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onAddSection={handleAddSection}
      />

      <AiAssistantModal
        isOpen={aiModalState.isOpen}
        onClose={() => setAiModalState({ ...aiModalState, isOpen: false })}
        originalText={aiModalState.text}
        onApply={aiModalState.onApply}
      />

      <ResumeQualityChecker
        isOpen={isQualityCheckerOpen}
        onClose={() => setIsQualityCheckerOpen(false)}
        resume={resume}
        onAutoFitSpacing={handleAutoFitSpacing}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        resume={resume}
        onImportJson={(imported) => updateResumeWithHistory(imported)}
      />
    </div>
  );
}
