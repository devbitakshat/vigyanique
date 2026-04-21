'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Calendar, 
  FileText, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  Printer,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { getPatientHistory } from '@/app/actions/patients';
import { CompleteVisit, Patient } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const [history, setHistory] = useState<CompleteVisit[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getPatientHistory(params.id as string);
      setHistory(data as any[]);
      if (data.length > 0) {
        setPatient((data[0] as any).patient);
        setExpandedVisitId(data[0].id);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-20">Loading history...</div>;
  if (!patient && !loading) return <div className="text-center py-20 text-slate-500">Patient not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 bg-white/50"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{patient?.name}</h1>
          <p className="text-sm text-slate-500">{patient?.gender}, {patient?.age} yrs • {patient?.phone}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => router.push(`/prescription?patientId=${patient?.id}`)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            New Prescription
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 -z-10"></div>

        {history.map((visit) => {
          const isExpanded = expandedVisitId === visit.id;
          
          return (
            <div key={visit.id} className="relative pl-14">
              {/* Timeline Dot */}
              <div className={cn(
                "absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-white ring-4 ring-slate-50 shadow-sm",
                isExpanded ? "bg-blue-600 ring-blue-50" : "bg-slate-300 ring-slate-50"
              )}></div>

              <div className={cn(
                "bg-white border rounded-xl overflow-hidden transition-all duration-300",
                isExpanded ? "border-blue-200 shadow-lg shadow-blue-50/50" : "border-slate-200 hover:border-slate-300"
              )}>
                {/* Visit Header */}
                <button 
                  onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{format(new Date(visit.created_at), 'dd MMM yyyy')}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{visit.complaints?.slice(0, 50) || 'Routine checkup'}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Visit Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 space-y-6 border-t border-slate-50 pt-6 animate-in slide-in-from-top-2 duration-300">
                    {/* Vitals Grid */}
                    {visit.vitals && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">BP</p>
                          <p className="text-sm font-semibold">{visit.vitals.bp || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pulse</p>
                          <p className="text-sm font-semibold">{visit.vitals.pulse || '-'} bpm</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SpO2</p>
                          <p className="text-sm font-semibold">{visit.vitals.spo2 || '-'} %</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temp</p>
                          <p className="text-sm font-semibold">{visit.vitals.temperature || '-'} °F</p>
                        </div>
                      </div>
                    )}

                    {/* Clinical Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <section>
                          <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            Complaints
                          </h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{visit.complaints || 'No complaints recorded.'}</p>
                        </section>
                        <section>
                          <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            Examination
                          </h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{visit.examination || 'No examination notes.'}</p>
                        </section>
                      </div>

                      {/* Medicines Table */}
                      <section className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Prescription (Rx)</h4>
                        <div className="space-y-3">
                          {visit.medicines?.map((med, i) => (
                            <div key={med.id} className="flex justify-between items-start text-sm">
                              <div>
                                <p className="font-bold text-slate-800">{med.name}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tight">{med.timing.replace(/_/g, ' ')} • {med.duration} days</p>
                              </div>
                              <div className="text-right">
                                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold">
                                  {med.dose_morning}-{med.dose_afternoon}-{med.dose_night}
                                </span>
                              </div>
                            </div>
                          ))}
                          {(!visit.medicines || visit.medicines.length === 0) && (
                            <p className="text-xs text-slate-400 italic">No medicines prescribed.</p>
                          )}
                        </div>
                      </section>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => router.push(`/prescription?patientId=${patient?.id}&visitId=${visit.id}&reprint=true`)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                      >
                        <Printer className="w-3 h-3" />
                        Reprint
                      </button>
                      <button 
                        onClick={() => router.push(`/prescription?patientId=${patient?.id}&visitId=${visit.id}`)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                      >
                        Clone Previous
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">No past visits recorded for this patient.</p>
          </div>
        )}
      </div>
    </div>
  );
}
