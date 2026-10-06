import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Sparkles,
  Maximize2,
  ArrowRight,
} from 'lucide-react';
import { ResumeData } from '../types/resume';
import { analyzeResumeDensity } from '../utils/densityCalculator';

interface ResumeQualityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onAutoFitSpacing: () => void;
}

export const ResumeQualityChecker: React.FC<ResumeQualityCheckerProps> = ({
  isOpen,
  onClose,
  resume,
  onAutoFitSpacing,
}) => {
  if (!isOpen) return null;

  const analysis = analyzeResumeDensity(resume);

  // ATS & completeness metrics
  const missingContact = [];
  if (!resume.header.fullName.trim()) missingContact.push('Full Name');
  if (!resume.header.email.trim()) missingContact.push('Email');
  if (!resume.header.phone.trim()) missingContact.push('Phone');
  if (!resume.header.address.trim()) missingContact.push('Address');

  let atsScore = 100;
  if (missingContact.length > 0) atsScore -= missingContact.length * 10;
  if (analysis.status === 'Too Dense') atsScore -= 15;
  if (analysis.status === 'Too Sparse') atsScore -= 10;
  if (analysis.orphanRiskBullets.length > 0) atsScore -= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Resume Quality & ATS Audit</h3>
              <p className="text-[11px] text-slate-500">
                Automated whitespace, layout stability, and formatting inspector
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Top Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ATS Compatibility Score
              </div>
              <div
                className={`text-2xl font-extrabold mt-1 font-mono ${
                  atsScore >= 90 ? 'text-emerald-600' : atsScore >= 75 ? 'text-amber-600' : 'text-rose-600'
                }`}
              >
                {atsScore} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Standard tables & readable hierarchy
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Page Density (A4)
              </div>
              <div
                className={`text-2xl font-extrabold mt-1 font-mono ${
                  analysis.status === 'Balanced'
                    ? 'text-emerald-600'
                    : analysis.status === 'Dense'
                    ? 'text-blue-600'
                    : analysis.status === 'Too Sparse'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {analysis.densityPercentage}%
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                {analysis.status} ({analysis.pageCountEstimate} Page{analysis.pageCountEstimate > 1 ? 's' : ''})
              </div>
            </div>
          </div>

          {/* Density Bar */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Vertical Page Capacity:</span>
              <span>{analysis.densityPercentage}% Filled</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  analysis.densityPercentage <= 92
                    ? 'bg-emerald-500'
                    : analysis.densityPercentage <= 102
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, analysis.densityPercentage)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Target for 1-page IIM format: 80% – 95% without spilling onto page 2.
            </p>
          </div>

          {/* Auto-Fit Spacing Button */}
          {analysis.status !== 'Balanced' && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div>
                <div className="text-xs font-bold text-indigo-900">
                  Auto-Fit White Space & Margins
                </div>
                <div className="text-[11px] text-indigo-700">
                  Instantly tunes padding density and font scaling to lock exactly into 1 page.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAutoFitSpacing();
                  onClose();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fit Now
              </button>
            </div>
          )}

          {/* Findings & Recommendations */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Audit Findings & Suggestions
            </div>

            <div className="space-y-1.5">
              {missingContact.length > 0 ? (
                <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Missing Contact Fields: </span>
                    {missingContact.join(', ')}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All header and contact fields are complete.</span>
                </div>
              )}

              {analysis.orphanRiskBullets.length > 0 && (
                <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Potential Orphan Words Detected: </span>
                    {analysis.orphanRiskBullets.length} bullet(s) may end with a single short trailing word.
                  </div>
                </div>
              )}

              {analysis.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-200/80 hover:bg-slate-300 rounded-md font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
