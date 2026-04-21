'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Printer, History, User, Activity, FileText, ClipboardList, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import RxTable from '@/components/prescription/RxTable';
import PatientSearch from '@/components/prescription/PatientSearch';
import PrescriptionPrint from '@/components/prescription/PrescriptionPrint';
import { Patient } from '@/lib/types';
import { savePrescription } from '@/app/actions/prescription';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPatientHistory } from '@/app/actions/patients';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Validation Schema
const prescriptionSchema = z.object({
  patient: z.object({
    name: z.string().min(2, 'Name is required'),
    age: z.number().min(0).max(150),
    gender: z.enum(['male', 'female', 'other']),
    phone: z.string().min(10, 'Valid phone required'),
    occupation: z.string().optional(),
  }),
  vitals: z.object({
    bp: z.string().optional(),
    pulse: z.number().optional(),
    spo2: z.number().optional(),
    temp: z.number().optional(),
    rr: z.number().optional(),
  }),
  clinical: z.object({
    complaints: z.string().optional(),
    examination: z.string().optional(),
    history: z.string().optional(),
    investigation: z.string().optional(),
    advice: z.string().optional(),
  }),
  follow_up: z.string().optional(),
  medicines: z.array(z.object({
    name: z.string().min(1, 'Medicine name is required'),
    dose_morning: z.string().default('0'),
    dose_afternoon: z.string().default('0'),
    dose_night: z.string().default('0'),
    timing: z.enum(['khali_pet_subah', 'khali_pet_shaam', 'raat_mein', 'khane_ke_baad', 'subah_khane_ke_baad']).default('khane_ke_baad'),
    duration: z.number().optional(),
    remarks: z.string().optional(),
  })).default([]),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export default function PrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { register, control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema) as any,
    defaultValues: {
      patient: { gender: 'male' },
      medicines: [{ name: '', dose_morning: '1', dose_afternoon: '0', dose_night: '1', timing: 'khane_ke_baad', duration: 5 }],
    }
  });

  const onSubmit = async (data: PrescriptionFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await savePrescription({ ...data, selectedPatientId });
      if (result.success) {
        toast.success('Prescription saved successfully!');
        router.push('/patients');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save prescription');
      toast.error(err.message || 'Failed to save prescription');
    } finally {
      setIsSaving(false);
    }
  };

  const formData = watch();

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const visitId = searchParams.get('visitId');

    const loadData = async () => {
      if (visitId) {
        const history = await getPatientHistory(patientId || '');
        const visit = history.find((v: any) => v.id === visitId);
        if (visit) {
          handlePatientSelect((visit as any).patient);
          setValue('vitals.bp', visit.vitals?.bp || '');
          setValue('vitals.pulse', visit.vitals?.pulse || undefined);
          setValue('vitals.spo2', visit.vitals?.spo2 || undefined);
          setValue('vitals.temp', visit.vitals?.temperature || undefined);
          setValue('vitals.rr', visit.vitals?.rr || undefined);
          setValue('clinical.complaints', visit.complaints || '');
          setValue('clinical.examination', visit.examination || '');
          setValue('clinical.history', visit.history || '');
          setValue('clinical.investigation', visit.investigation || '');
          setValue('clinical.advice', visit.advice || '');
          setValue('medicines', visit.medicines.map((m: any) => ({
            name: m.name,
            dose_morning: m.dose_morning,
            dose_afternoon: m.dose_afternoon,
            dose_night: m.dose_night,
            timing: m.timing,
            duration: m.duration,
            remarks: m.remarks,
          })));
        }
        if (searchParams.get('reprint') === 'true') {
          setTimeout(() => window.print(), 1000);
        }
      } else if (patientId) {
        const history = await getPatientHistory(patientId);
        if (history.length > 0) {
          handlePatientSelect((history[0] as any).patient);
        }
      }
    };
    loadData();
  }, [searchParams]);

  const handlePrint = () => window.print();

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setValue('patient.name', patient.name);
    setValue('patient.age', patient.age);
    setValue('patient.gender', patient.gender);
    setValue('patient.phone', patient.phone);
    setValue('patient.occupation', patient.occupation || '');
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col p-4 bg-slate-50 gap-4">
      {/* Top Search Bar with Back Button */}
      <div className="flex-shrink-0 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 bg-white/50"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <PatientSearch onSelect={handlePatientSelect} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Sidebar: Patient & Vitals & Notes */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-1 pb-4 no-scrollbar">
          {/* Patient Info */}
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <User className="w-3 h-3" /> Patient Info
            </h2>
            <div className="space-y-3">
              <input {...register('patient.name')} placeholder="Name" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-1 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-2">
                <input 
                type="number"
                {...register('patient.age', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900" 
              />
                <select {...register('patient.gender')} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input {...register('patient.phone')} placeholder="Phone" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </section>

          {/* Vitals */}
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Vitals
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">BP</label>
                <input {...register('vitals.bp')} placeholder="120/80" className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Pulse</label>
                <input type="number" {...register('vitals.pulse', { valueAsNumber: true })} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">SpO2</label>
                <input type="number" {...register('vitals.spo2', { valueAsNumber: true })} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Temp</label>
                <input type="number" step="0.1" {...register('vitals.temp', { valueAsNumber: true })} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">RR</label>
                <input type="number" {...register('vitals.rr', { valueAsNumber: true })} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none" />
              </div>
            </div>
          </section>

          {/* Clinical Notes */}
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ClipboardList className="w-3 h-3" /> Clinical
            </h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Complaints</label>
                <textarea {...register('clinical.complaints')} rows={2} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Examination</label>
                <textarea {...register('clinical.examination')} rows={2} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">History / Comorbidities</label>
                <textarea {...register('clinical.history')} rows={2} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Investigation</label>
                <textarea {...register('clinical.investigation')} rows={2} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Advice</label>
                <textarea {...register('clinical.advice')} rows={2} className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none resize-none" />
              </div>
            </div>
          </section>
        </div>

        {/* Main Area: Rx Table */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Rx (Prescription)
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follow-up</label>
                  <input type="date" {...register('follow_up')} className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none text-slate-900 bg-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <RxTable control={control as any} register={register as any} errors={errors} />
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex-shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-xs text-slate-400 font-medium">
              Ready to print on A4 format
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Hidden Print Component */}
      <PrescriptionPrint 
        doctor={{ full_name: "Akshat Pal", specialization: "Senior Architect", clinic_name: "Vigyanique Clinic" }}
        patient={formData.patient || {}}
        vitals={formData.vitals || {}}
        clinical={formData.clinical || {}}
        medicines={formData.medicines as any || []}
        follow_up_date={formData.follow_up}
      />
    </div>
  );
}
