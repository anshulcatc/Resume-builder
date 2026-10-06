import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, Wand2, Scissors, Maximize2, CheckCheck, Loader2 } from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onApply: (improvedText: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  originalText,
  onApply,
}) => {
  const [currentText, setCurrentText] = useState(originalText);
  const [revisedText, setRevisedText] = useState('');
  const [activeAction, setActiveAction] = useState<'improve' | 'shorten' | 'expand' | 'grammar'>('improve');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when opened with new text
  React.useEffect(() => {
    setCurrentText(originalText);
    setRevisedText('');
    setErrorMsg(null);
  }, [originalText, isOpen]);

  if (!isOpen) return null;

  const handleExecuteAi = async (action: 'improve' | 'shorten' | 'expand' | 'grammar') => {
    setActiveAction(action);
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          text: currentText,
        }),
      });

      if (!response.ok) {
        throw new Error('AI enhancement request failed');
      }

      const data = await response.json();
      if (data.result) {
        setRevisedText(data.result);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not process AI enhancement. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (revisedText) {
      onApply(revisedText);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">AI Resume Assistant</h3>
              <p className="text-[11px] text-slate-500">
                Enhance bullets while strictly preserving all factual claims and numbers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="text-[11px] font-medium text-slate-600 mb-2">Select Optimization:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleExecuteAi('improve')}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                activeAction === 'improve' && !loading
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Make Impactful</span>
            </button>

            <button
              onClick={() => handleExecuteAi('shorten')}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                activeAction === 'shorten' && !loading
                  ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              <span>Shorten Bullet</span>
            </button>

            <button
              onClick={() => handleExecuteAi('expand')}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                activeAction === 'expand' && !loading
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Expand Clarity</span>
            </button>

            <button
              onClick={() => handleExecuteAi('grammar')}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                activeAction === 'grammar' && !loading
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fix Grammar</span>
            </button>
          </div>
        </div>

        {/* Comparison Body */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Original Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Current Bullet Point
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {currentText.length} characters
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-serif leading-relaxed">
              {currentText || <span className="italic text-slate-400">No content</span>}
            </div>
          </div>

          {/* AI Result */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI Suggested Revision
              </span>
              {revisedText && (
                <span className="text-[11px] font-mono text-slate-500">
                  {revisedText.length} characters (
                  {revisedText.length - currentText.length > 0 ? '+' : ''}
                  {revisedText.length - currentText.length})
                </span>
              )}
            </div>

            {loading ? (
              <div className="p-8 border border-indigo-200 bg-indigo-50/30 rounded-lg flex flex-col items-center justify-center text-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                <p className="text-xs text-slate-600 font-medium">Refining bullet point with Gemini AI...</p>
                <p className="text-[10px] text-slate-400 mt-1">Preserving your facts & achievements</p>
              </div>
            ) : revisedText ? (
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg text-xs text-slate-900 font-serif leading-relaxed focus-within:ring-2 focus-within:ring-indigo-400">
                <textarea
                  value={revisedText}
                  onChange={(e) => setRevisedText(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent resize-y focus:outline-none"
                />
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                Click one of the optimization buttons above to generate a professional revision.
              </div>
            )}

            {errorMsg && (
              <p className="text-rose-600 text-xs mt-2 bg-rose-50 p-2 rounded border border-rose-200">
                {errorMsg}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md font-medium transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {revisedText && (
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Revision
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
