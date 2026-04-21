'use client';

import { useState } from 'react';
import { Search, Plus, Phone, User, Clock, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Patient } from '@/lib/types';
import { getPatients } from '@/app/actions/patients';
import { useEffect } from 'react';

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const data = await getPatients(searchQuery);
      setPatients(data as Patient[]);
      setLoading(false);
    };
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredPatients = patients;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 bg-white/50"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Patient Database</h1>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm transition-all"
          />
        </div>
        <Link 
          href="/prescription" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </Link>
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Fetching patients...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div 
            key={patient.id}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                ID: {patient.id.slice(0, 4)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">{patient.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{patient.gender}, {patient.age} years</p>

            <div className="space-y-2 border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-300" />
                {patient.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-300" />
                Last visit: {patient.created_at}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
              <Link 
                href={`/patients/${patient.id}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1"
              >
                View History
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link 
                href={`/prescription?patientId=${patient.id}`}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
              >
                New Rx
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}

      {!loading && filteredPatients.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-200" />
          </div>
          <p className="text-slate-500">No patients found matching your search.</p>
        </div>
      )}
    </div>
  );
}
