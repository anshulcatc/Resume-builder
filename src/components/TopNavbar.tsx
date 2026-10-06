import React from 'react';
import {
  Undo2,
  Redo2,
  Download,
  RotateCcw,
  Sparkles,
  FileCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ResumeData } from '../types/resume';
import { analyzeResumeDensity } from '../utils/densityCalculator';

interface TopNavbarProps {
  resume: ResumeData;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onAutoFitSpacing: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onOpenQualityChecker: () => void;
  onOpenExportModal: () => void;
  activeMobileTab: 'editor' | 'preview' | 'quality';
  onMobileTabChange: (tab: 'editor' | 'preview' | 'quality') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  resume,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onAutoFitSpacing,
  zoom,
  onZoomChange,
  onOpenQualityChecker,
  onOpenExportModal,
  activeMobileTab,
  onMobileTabChange,
}) => {
  const density = analyzeResumeDensity(resume);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand Identity & Undo/Redo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif font-black text-xs shadow-xs">
              IIM
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs font-bold text-slate-900 leading-tight">
                Resume Builder
              </h1>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                Canonical 1-Page Placement Format
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onReset}
              title="Reset to Original Template"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Live Density Meter & Auto-Fit */}
        <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <span>Density:</span>
            <span
              className={`font-mono px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                density.status === 'Balanced'
                  ? 'bg-emerald-100 text-emerald-800'
                  : density.status === 'Dense'
                  ? 'bg-blue-100 text-blue-800'
                  : density.status === 'Too Sparse'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {density.densityPercentage}% • {density.status}
            </span>
          </div>

          <button
            type="button"
            onClick={onAutoFitSpacing}
            title="Automatically adjust cell padding and typography to eliminate white space and fit exactly 1 page"
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 px-2 py-0.5 rounded-full transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Auto-Fit 1 Page
          </button>
        </div>

        {/* Right: Zoom controls, Audit & Export CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls (Desktop) */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
              className="p-1 hover:bg-slate-200 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-9 text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(1.4, zoom + 0.1))}
              className="p-1 hover:bg-slate-200 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(1.0)}
              className="p-1 hover:bg-slate-200 rounded text-[10px] font-semibold px-1.5"
              title="Reset to 100%"
            >
              100%
            </button>
          </div>

          {/* Quality check button */}
          <button
            type="button"
            onClick={onOpenQualityChecker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Quality Check</span>
          </button>

          {/* Primary Download CTA */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Resume</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Tab Switcher */}
      <div className="flex md:hidden border-t border-slate-200 bg-slate-50">
        <button
          onClick={() => onMobileTabChange('editor')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
            activeMobileTab === 'editor'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Edit Resume
        </button>
        <button
          onClick={() => onMobileTabChange('preview')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
            activeMobileTab === 'preview'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Preview
        </button>
        <button
          onClick={() => onMobileTabChange('quality')}
          className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
            activeMobileTab === 'quality'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit ({density.densityPercentage}%)
        </button>
      </div>
    </header>
  );
};
