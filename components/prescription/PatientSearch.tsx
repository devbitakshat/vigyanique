'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Patient } from '@/lib/types';
import { searchPatients } from '@/app/actions/prescription';

interface PatientSearchProps {
  onSelect: (patient: Patient) => void;
}

export default function PatientSearch({ onSelect }: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Real search logic
  useEffect(() => {
    const fetchPatients = async () => {
      if (query.length > 2) {
        const data = await searchPatients(query);
        setResults(data as Patient[]);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    };

    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Name or Phone..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 shadow-sm transition-all"
          onFocus={() => query.length > 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((patient) => (
            <button
              key={patient.id}
              onClick={() => {
                onSelect(patient);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                <p className="text-xs text-slate-500">{patient.gender}, {patient.age} yrs • {patient.phone}</p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase">Returning</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 2 && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center">
          <p className="text-sm text-slate-500 mb-2">No patient found with "{query}"</p>
          <button className="text-sm text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline">
            <UserPlus className="w-4 h-4" />
            Add New Patient
          </button>
        </div>
      )}
    </div>
  );
}
