'use server';

import { createClient } from '@/lib/supabase/server';
import { Patient, CompleteVisit } from '@/lib/types';
import { startOfDay, endOfDay } from 'date-fns';

export async function getPatients(query?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const doctorId = user?.id || '00000000-0000-0000-0000-000000000000';

  let builder = supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (query) {
    builder = builder.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
  }

  const { data, error } = await builder;
  if (error) return [];
  return data;
}

export async function getPatientHistory(patientId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      vitals (*),
      medicines (*),
      patient:patients (*)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('History Error:', error);
    return [];
  }
  return data;
}

export async function getFollowUps() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const doctorId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase
    .from('visits')
    .select(`
      id,
      follow_up_date,
      patient:patients (name, phone)
    `)
    .eq('doctor_id', doctorId)
    .not('follow_up_date', 'is', null)
    .order('follow_up_date', { ascending: true });

  if (error) return [];
  
  return data.map((v: any) => ({
    id: v.id,
    patient_name: v.patient.name,
    phone: v.patient.phone,
    date: v.follow_up_date,
    status: 'pending' // Default status
  }));
}
