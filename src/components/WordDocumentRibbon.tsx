import React, { useState } from 'react';
import {
  Grid,
  Columns,
  Sparkles,
  Plus,
  Type,
  Maximize2,
  TableProperties,
  Sliders,
  AlignLeft,
  ChevronsLeftRight,
} from 'lucide-react';
import { ResumeData } from '../types/resume';

interface WordDocumentRibbonProps {
  resume: ResumeData;
  onUpdateSettings: (newSettings: Partial<ResumeData['settings']>) => void;
  onAutoFitSpacing: () => void;
  onAddBulletToActiveSection?: () => void;
  selectedSectionId?: string | null;
  onToggleSectionBorders?: (sectionId: string) => void;
}

export const WordDocumentRibbon: React.FC<WordDocumentRibbonProps> = ({
  resume,
  onUpdateSettings,
  onAutoFitSpacing,
  onAddBulletToActiveSection,
  selectedSectionId,
  onToggleSectionBorders,
}) => {
  const { settings } = resume;
  const [showEduPopup, setShowEduPopup] = useState(false);

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3 shadow-2xs text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Table & Border Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Border Mode Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
            <span className="text-[10px] font-semibold text-slate-500 px-1.5 flex items-center gap-1">
              <TableProperties className="w-3 h-3 text-slate-400" /> Borders:
            </span>

            <button
              type="button"
              onClick={() => onUpdateSettings({ borderStyle: 'all', showBorders: true })}
              title="All Table Borders (Standard IIM Grid)"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                settings.borderStyle === 'all' && settings.showBorders
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Borders
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ borderStyle: 'no-vertical', showBorders: true })}
              title="Remove Vertical Borders (Horizontal Lines Only)"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                settings.borderStyle === 'no-vertical' && settings.showBorders
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              No Vertical
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ borderStyle: 'no-horizontal', showBorders: true })}
              title="Remove Horizontal Borders (Vertical Lines Only)"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                settings.borderStyle === 'no-horizontal' && settings.showBorders
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              No Horizontal
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ borderStyle: 'minimal', showBorders: true })}
              title="Minimal Borders"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                settings.borderStyle === 'minimal' && settings.showBorders
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Minimal
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings({ showBorders: false, borderStyle: 'none' })}
              title="Hide All Borders"
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                !settings.showBorders || settings.borderStyle === 'none'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              No Borders
            </button>
          </div>

          {/* Education 4-Column Controls (Word Table Feature) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEduPopup(!showEduPopup)}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-400 rounded-md px-2 py-1 text-slate-700 hover:text-indigo-700 shadow-2xs transition-colors"
              title="Configure Education table column widths (Word table format)"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-semibold">Education Columns</span>
              <span className="font-mono text-[10px] text-indigo-700 font-bold">
                {(settings.educationColWidths || [12, 60, 14, 14])[0]}% / {(settings.educationColWidths || [12, 60, 14, 14])[1]}%
              </span>
            </button>

            {showEduPopup && (
              <div className="absolute left-0 top-8 z-50 bg-white border border-slate-300 rounded-lg shadow-xl p-3 w-80 text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Columns className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Education Table Columns</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEduPopup(false)}
                    className="text-slate-400 hover:text-slate-700 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-[10px]">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Degree / Class Width:</span>
                      <b className="font-mono text-indigo-700">{(settings.educationColWidths || [12, 60, 14, 14])[0]}%</b>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="28"
                      value={(settings.educationColWidths || [12, 60, 14, 14])[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = settings.educationColWidths || [12, 60, 14, 14];
                        const delta = val - cur[0];
                        const newInst = Math.max(25, cur[1] - delta);
                        onUpdateSettings({
                          educationColWidths: [val, 100 - val - cur[2] - cur[3], cur[2], cur[3]],
                        });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Institution Width:</span>
                      <b className="font-mono text-indigo-700">{(settings.educationColWidths || [12, 60, 14, 14])[1]}%</b>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      value={(settings.educationColWidths || [12, 60, 14, 14])[1]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = settings.educationColWidths || [12, 60, 14, 14];
                        const delta = val - cur[1];
                        const newScore = Math.max(6, cur[2] - delta);
                        onUpdateSettings({
                          educationColWidths: [cur[0], val, 100 - cur[0] - val - cur[3], cur[3]],
                        });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Score / % Width:</span>
                      <b className="font-mono text-indigo-700">{(settings.educationColWidths || [12, 60, 14, 14])[2]}%</b>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="25"
                      value={(settings.educationColWidths || [12, 60, 14, 14])[2]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = settings.educationColWidths || [12, 60, 14, 14];
                        onUpdateSettings({
                          educationColWidths: [cur[0], 100 - cur[0] - val - cur[3], val, cur[3]],
                        });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-0.5">
                      <span>Year Width:</span>
                      <b className="font-mono text-indigo-700">{(settings.educationColWidths || [12, 60, 14, 14])[3]}%</b>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="25"
                      value={(settings.educationColWidths || [12, 60, 14, 14])[3]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cur = settings.educationColWidths || [12, 60, 14, 14];
                        onUpdateSettings({
                          educationColWidths: [cur[0], cur[1], 100 - cur[0] - cur[1] - val, val],
                        });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-500 font-medium">Presets:</span>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ educationColWidths: [12, 60, 14, 14] })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px]"
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ educationColWidths: [10, 64, 13, 13] })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px]"
                  >
                    Compact Deg
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ educationColWidths: [15, 55, 15, 15] })}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px]"
                  >
                    Balanced
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column Ratio Quick Presets */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1">
            <ChevronsLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-600">Label Width:</span>
            <input
              type="range"
              min="10"
              max="28"
              value={settings.leftColWidth || 15}
              onChange={(e) => onUpdateSettings({ leftColWidth: Number(e.target.value) })}
              className="w-16 accent-indigo-600 cursor-pointer"
              title="Drag to resize label column ratio or drag column borders directly on resume!"
            />
            <span className="font-mono text-[11px] font-bold text-indigo-700 min-w-7">
              {settings.leftColWidth || 15}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1">
            <ChevronsLeftRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-600">Date Width:</span>
            <input
              type="range"
              min="8"
              max="22"
              value={settings.dateColWidth || 12}
              onChange={(e) => onUpdateSettings({ dateColWidth: Number(e.target.value) })}
              className="w-16 accent-indigo-600 cursor-pointer"
              title="Drag to resize date column ratio or drag date border directly on resume!"
            />
            <span className="font-mono text-[11px] font-bold text-indigo-700 min-w-7">
              {settings.dateColWidth || 12}%
            </span>
          </div>
        </div>

        {/* Right: Typography & Quick Action */}
        <div className="flex items-center gap-2">
          {/* Spacing Density */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
            <span className="text-[10px] font-semibold text-slate-500 px-1.5">Spacing:</span>
            {(['ultra-compact', 'compact', 'normal'] as const).map((density) => (
              <button
                key={density}
                type="button"
                onClick={() => onUpdateSettings({ spacingDensity: density })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                  settings.spacingDensity === density
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {density === 'ultra-compact' ? 'Tight' : density === 'compact' ? 'IIM' : 'Normal'}
              </button>
            ))}
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
            <span className="text-[10px] font-semibold text-slate-500 px-1">Font:</span>
            {(['compact', 'normal', 'relaxed'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onUpdateSettings({ fontSize: size })}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  settings.fontSize === size
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {size === 'compact' ? '9.5pt' : size === 'normal' ? '10pt' : '10.5pt'}
              </button>
            ))}
          </div>

          {/* One click optimize */}
          <button
            type="button"
            onClick={onAutoFitSpacing}
            title="Auto-Fit to 1 page"
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-md text-[11px] font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Auto-Fit</span>
          </button>
        </div>
      </div>

      {/* Helper hint for user */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-700">Word Direct Edit Mode Active:</span>
          <span>Click anywhere on the resume to type, edit, or press <kbd className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[9px] text-slate-800">Enter</kbd> to add a new line/bullet. Drag column borders to resize.</span>
        </div>
      </div>
    </div>
  );
};
