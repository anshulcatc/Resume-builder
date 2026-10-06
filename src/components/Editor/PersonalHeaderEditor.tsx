import React from 'react';
import { User, Phone, Mail, MapPin, Building, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { PersonalHeader } from '../../types/resume';
import { evaluateCharCount } from '../../utils/densityCalculator';

interface PersonalHeaderEditorProps {
  header: PersonalHeader;
  onChange: (updated: PersonalHeader) => void;
}

export const PersonalHeaderEditor: React.FC<PersonalHeaderEditorProps> = ({ header, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleFieldChange = (field: keyof PersonalHeader, value: any) => {
    onChange({
      ...header,
      [field]: value,
    });
  };

  const nameCount = evaluateCharCount(header.fullName, 'title');

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden mb-3">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800 text-xs sm:text-sm">
            Header & Personal Information
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono">
            {header.fullName || 'Unnamed'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3.5 border-t border-slate-200">
          {/* Candidate Name & Degree */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Full Name *</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {nameCount.count}/45 chars
                </span>
              </div>
              <input
                type="text"
                value={header.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="e.g. Anshul Singh Chauhan"
                className="w-full text-xs border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Cohort / Degree Header
              </label>
              <input
                type="text"
                value={header.cohortOrDegree}
                onChange={(e) => handleFieldChange('cohortOrDegree', e.target.value)}
                placeholder="e.g. MBA 2025-2027"
                className="w-full text-xs border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Institute Name & Motto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                <Building className="w-3 h-3 text-slate-400" />
                Institute Name
              </label>
              <input
                type="text"
                value={header.instituteName}
                onChange={(e) => handleFieldChange('instituteName', e.target.value)}
                placeholder="e.g. IIM BODH GAYA"
                className="w-full text-xs border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Institute Motto / Subtext
              </label>
              <input
                type="text"
                value={header.instituteSubtext}
                onChange={(e) => handleFieldChange('instituteSubtext', e.target.value)}
                placeholder="e.g. विद्यया विन्दतेऽमृतम्"
                className="w-full text-xs border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="showEmblem"
              checked={header.showEmblem}
              onChange={(e) => handleFieldChange('showEmblem', e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="showEmblem" className="text-xs text-slate-700 cursor-pointer">
              Display Institute Insignia / Seal in Header
            </label>
          </div>

          {/* Contact Details (Footer banner fields) */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-800">
              Contact Information (Displayed in Footer Bar)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-600 flex items-center gap-1 mb-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" /> Address
                </label>
                <input
                  type="text"
                  value={header.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Indian Institute of Management Bodh Gaya, Bihar"
                  className="w-full text-xs border border-slate-200 rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 flex items-center gap-1 mb-0.5">
                  <Phone className="w-3 h-3 text-slate-400" /> Contact Phone
                </label>
                <input
                  type="text"
                  value={header.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="+91 9140775332"
                  className="w-full text-xs border border-slate-200 rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-600 flex items-center gap-1 mb-0.5">
                  <Mail className="w-3 h-3 text-slate-400" /> Email
                </label>
                <input
                  type="email"
                  value={header.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="anshulsc2027i@iimbg.ac.in"
                  className="w-full text-xs border border-slate-200 rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-600 flex items-center gap-1 mb-0.5">
                <Globe className="w-3 h-3 text-slate-400" /> Optional LinkedIn / Profile
              </label>
              <input
                type="text"
                value={header.linkedin || ''}
                onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username (optional)"
                className="w-full text-xs border border-slate-200 rounded-md p-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
