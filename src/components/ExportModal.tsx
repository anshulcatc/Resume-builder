import React, { useRef, useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  FileText,
  Code,
  Upload,
  Check,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { ResumeData } from '../types/resume';
import { exportResumeToDocx } from '../utils/exportDocx';
import { exportResumeToTxt } from '../utils/exportTxt';
import { saveAs } from 'file-saver';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  onImportJson: (imported: ResumeData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  resume,
  onImportJson,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrintPdf = () => {
    window.print();
    onClose();
  };

  const handleExportDocx = async () => {
    try {
      setDocxLoading(true);
      await exportResumeToDocx(resume);
      setSuccessMsg('Microsoft Word (.docx) file generated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Error generating DOCX. Please try again.');
    } finally {
      setDocxLoading(false);
    }
  };

  const handleExportTxt = () => {
    exportResumeToTxt(resume);
    setSuccessMsg('Plain Text (.txt) exported successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(resume, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const cleanName = resume.header.fullName.replace(/\s+/g, '_') || 'Resume';
    saveAs(blob, `${cleanName}_data.json`);
    setSuccessMsg('Resume JSON backup exported!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.header && parsed.sections) {
          onImportJson(parsed);
          setSuccessMsg('Resume data imported successfully!');
          setTimeout(() => {
            setSuccessMsg(null);
            onClose();
          }, 1000);
        } else {
          alert('Invalid resume JSON structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Download & Export Resume</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. PDF via High-Res Print */}
            <button
              type="button"
              onClick={handlePrintPdf}
              className="flex flex-col items-start p-3.5 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl text-left transition-all group"
            >
              <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-700 rounded-lg mb-2">
                <Printer className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">
                Print / Save as PDF
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Pixel-perfect A4 vector PDF using browser print engine. Retains crisp borders & fonts.
              </div>
            </button>

            {/* 2. DOCX Word Document */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={docxLoading}
              className="flex flex-col items-start p-3.5 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl text-left transition-all group"
            >
              <div className="p-2 bg-blue-50 group-hover:bg-blue-100 text-blue-700 rounded-lg mb-2 flex items-center justify-center">
                {docxLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-900">
                Word Document (.docx)
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Fully editable Microsoft Word document with formatted tables, borders, and bullets.
              </div>
            </button>

            {/* 3. Plain Text (.txt) */}
            <button
              type="button"
              onClick={handleExportTxt}
              className="flex flex-col items-start p-3.5 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 rounded-xl text-left transition-all group"
            >
              <div className="p-2 bg-amber-50 group-hover:bg-amber-100 text-amber-700 rounded-lg mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-900">
                Plain Text (.txt)
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Formatted text layout ideal for quick email drafting or raw ATS submission.
              </div>
            </button>

            {/* 4. JSON Backup */}
            <button
              type="button"
              onClick={handleExportJson}
              className="flex flex-col items-start p-3.5 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 rounded-xl text-left transition-all group"
            >
              <div className="p-2 bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 rounded-lg mb-2">
                <Code className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                JSON Data Backup
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Export raw resume data to back up your work or transfer to another device.
              </div>
            </button>
          </div>

          {/* Import JSON section */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-700">Restore / Import Data</div>
              <div className="text-[10px] text-slate-400">Load previously exported JSON resume file</div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              Import JSON
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
