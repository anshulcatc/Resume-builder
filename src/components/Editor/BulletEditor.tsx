import React from 'react';
import { Trash2, ArrowUp, ArrowDown, Sparkles, AlertCircle } from 'lucide-react';
import { evaluateCharCount } from '../../utils/densityCalculator';

interface BulletEditorProps {
  text: string;
  onChange: (newText: string) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onOpenAi: (text: string, onApply: (revised: string) => void) => void;
  placeholder?: string;
  year?: string;
  onYearChange?: (year: string) => void;
}

export const BulletEditor: React.FC<BulletEditorProps> = ({
  text,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenAi,
  placeholder = 'Describe your achievement or responsibility...',
  year,
  onYearChange,
}) => {
  const charStatus = evaluateCharCount(text, 'bullet');

  return (
    <div className="group relative bg-white border border-slate-200 rounded-md p-2 hover:border-slate-300 transition-colors shadow-xs">
      <div className="flex items-start gap-2">
        <span className="text-slate-400 mt-1 select-none text-xs">●</span>

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder={placeholder}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1 font-serif leading-relaxed"
          />

          {onYearChange && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">Year:</span>
              <input
                type="text"
                value={year || ''}
                onChange={(e) => onYearChange(e.target.value)}
                placeholder="2025"
                className="w-20 text-[10px] border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Character counter & length warnings */}
          <div className="flex items-center justify-between mt-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono font-medium px-1.5 py-0.2 rounded ${
                  charStatus.level === 'optimal'
                    ? 'text-emerald-700 bg-emerald-50'
                    : charStatus.level === 'warning'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-rose-700 bg-rose-50'
                }`}
              >
                {charStatus.count} / {charStatus.suggestedMax} chars
              </span>
              <span className="text-slate-400 text-[10px]">
                {charStatus.message}
              </span>
            </div>

            {charStatus.level === 'overflow' && (
              <span className="flex items-center gap-1 text-rose-600 text-[10px] font-medium">
                <AlertCircle className="w-3 h-3" />
                Risk of overflow
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onOpenAi(text, onChange)}
            title="Improve with AI (Fix grammar, shorten, or enhance)"
            className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              title="Move Up"
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          )}

          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              title="Move Down"
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            title="Delete Bullet"
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
