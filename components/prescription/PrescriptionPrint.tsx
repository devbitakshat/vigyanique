'use client';

import { Patient, Vitals, Medicine, Profile } from '@/lib/types';
import { format } from 'date-fns';

interface PrescriptionPrintProps {
  doctor: Partial<Profile>;
  patient: Partial<Patient>;
  vitals: Partial<Vitals>;
  clinical: {
    complaints?: string;
    examination?: string;
    history?: string;
    investigation?: string;
    advice?: string;
  };
  medicines: Partial<Medicine>[];
  follow_up_date?: string;
}

export default function PrescriptionPrint({
  doctor,
  patient,
  vitals,
  clinical,
  medicines,
  follow_up_date
}: PrescriptionPrintProps) {
  return (
    <div className="print-only hidden print:block bg-white p-12 text-slate-900 min-h-[297mm] w-[210mm] mx-auto border shadow-sm print:border-0 print:shadow-none font-sans leading-relaxed">
      {/* Header */}
      <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">Dr. {doctor.full_name || 'Doctor Name'}</h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">{doctor.specialization || 'MBBS, MD'}</p>
          <p className="text-sm text-slate-500 mt-0.5">{doctor.clinic_name || 'Clinic Name'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Contact: {doctor.contact_number || '+91 00000 00000'}</p>
          <p className="text-sm text-slate-500 mt-1">Date: {format(new Date(), 'dd MMM yyyy')}</p>
        </div>
      </header>

      {/* Patient Info Bar */}
      <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg mb-8 border border-slate-200">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Name</label>
          <p className="font-semibold text-sm">{patient.name || '-'}</p>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Age/Sex</label>
          <p className="font-semibold text-sm">{patient.age || '-'} / {patient.gender || '-'}</p>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Phone</label>
          <p className="font-semibold text-sm">{patient.phone || '-'}</p>
        </div>
        <div className="text-right">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ID</label>
          <p className="font-semibold text-sm">#RX-{Math.floor(Math.random() * 10000)}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar (Vitals & Notes) */}
        <div className="col-span-4 border-r border-slate-100 pr-6 space-y-6">
          {/* Vitals */}
          <section>
            <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-3">Vitals</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">BP:</span>
                <span className="font-semibold">{vitals.bp || '-'} mmHg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Pulse:</span>
                <span className="font-semibold">{vitals.pulse || '-'} bpm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">SpO2:</span>
                <span className="font-semibold">{vitals.spo2 || '-'} %</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Temp:</span>
                <span className="font-semibold">{vitals.temperature || '-'} °F</span>
              </div>
            </div>
          </section>

          {/* Clinical Notes */}
          {clinical.complaints && (
            <section>
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Complaints</h3>
              <p className="text-xs whitespace-pre-wrap">{clinical.complaints}</p>
            </section>
          )}

          {clinical.history && (
            <section>
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">History</h3>
              <p className="text-xs whitespace-pre-wrap">{clinical.history}</p>
            </section>
          )}

          {clinical.examination && (
            <section>
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Examination</h3>
              <p className="text-xs whitespace-pre-wrap">{clinical.examination}</p>
            </section>
          )}
        </div>

        {/* Right Main (Rx & Advice) */}
        <div className="col-span-8 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-serif italic font-bold">Rx</span>
              <div className="h-0.5 flex-1 bg-slate-100"></div>
            </div>
            
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2 text-left w-8">#</th>
                  <th className="py-2 text-left">Medicine</th>
                  <th className="py-2 text-center w-24">Dose (M-A-N)</th>
                  <th className="py-2 text-center w-24">Dur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med, i) => (
                  <tr key={i} className="align-top">
                    <td className="py-3 text-slate-400 font-medium">{i + 1}</td>
                    <td className="py-3">
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{med.timing?.replace(/_/g, ' ')}</p>
                      {med.remarks && <p className="text-[10px] text-blue-600 mt-1">Note: {med.remarks}</p>}
                    </td>
                    <td className="py-3 text-center">
                      <span className="bg-slate-50 px-2 py-1 rounded text-xs font-mono font-bold">
                        {med.dose_morning}-{med.dose_afternoon}-{med.dose_night}
                      </span>
                    </td>
                    <td className="py-3 text-center font-medium">
                      {med.duration} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {clinical.investigation && (
            <section className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">Investigations Advised</h3>
              <p className="text-xs whitespace-pre-wrap">{clinical.investigation}</p>
            </section>
          )}

          {clinical.advice && (
            <section>
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">General Advice</h3>
              <p className="text-xs whitespace-pre-wrap">{clinical.advice}</p>
            </section>
          )}
        </div>
      </div>

      {/* Footer / Signature */}
      <footer className="mt-auto pt-12">
        <div className="flex justify-between items-end border-t border-slate-100 pt-8">
          <div>
            {follow_up_date && (
              <p className="text-xs font-bold text-slate-900">
                FOLLOW-UP DATE: <span className="text-blue-600 ml-1">{format(new Date(follow_up_date), 'dd MMM yyyy')}</span>
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-4 italic">Generated by Vigyanique Medical System</p>
          </div>
          <div className="text-center w-48">
            <div className="h-px bg-slate-400 mb-2"></div>
            <p className="text-xs font-bold text-slate-900 uppercase">Doctor's Signature</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
