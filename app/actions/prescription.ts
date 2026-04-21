'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function savePrescription(data: any) {
  const supabase = await createClient();
  
  // 1. Get current doctor or use Guest ID
  const { data: { user } } = await supabase.auth.getUser();
  const doctorId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { patient: patientData, vitals: vitalsData, clinical, medicines, follow_up, selectedPatientId } = data;

  let patientId = selectedPatientId;

  // 2. Handle Patient if not already selected
  if (!patientId) {
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .upsert({
        name: patientData.name,
        age: patientData.age,
        gender: patientData.gender,
        phone: patientData.phone,
        occupation: patientData.occupation,
        doctor_id: doctorId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'phone,doctor_id' })
      .select()
      .single();

    if (patientError) {
      // Fallback search
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', patientData.phone)
        .eq('doctor_id', doctorId)
        .single();
      
      if (!existingPatient) throw new Error('Failed to create/find patient');
      patientId = existingPatient.id;
    } else {
      patientId = patient.id;
    }
  }

  // 3. Create Visit
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .insert({
      patient_id: patientId,
      doctor_id: user?.id,
      complaints: clinical.complaints,
      examination: clinical.examination,
      history: clinical.history,
      investigation: clinical.investigation,
      advice: clinical.advice,
      follow_up_date: follow_up || null,
    })
    .select()
    .single();

  if (visitError) throw new Error(visitError.message);

  // 4. Create Vitals
  if (vitalsData) {
    const { error: vitalsError } = await supabase
      .from('vitals')
      .insert({
        visit_id: visit.id,
        bp: vitalsData.bp,
        pulse: vitalsData.pulse,
        spo2: vitalsData.spo2,
        temperature: vitalsData.temp,
        rr: vitalsData.rr,
      });
    if (vitalsError) console.error('Vitals Error:', vitalsError);
  }

  // 5. Create Medicines
  if (medicines && medicines.length > 0) {
    const medicinesToInsert = medicines.map((m: any) => ({
      visit_id: visit.id,
      name: m.name,
      dose_morning: m.dose_morning,
      dose_afternoon: m.dose_afternoon,
      dose_night: m.dose_night,
      timing: m.timing,
      duration: m.duration,
      remarks: m.remarks,
    }));

    const { error: medError } = await supabase
      .from('medicines')
      .insert(medicinesToInsert);
    if (medError) throw new Error(medError.message);
  }

  revalidatePath('/patients');
  revalidatePath('/follow-ups');
  
  return { success: true, visitId: visit.id };
}

export async function searchPatients(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const doctorId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', user?.id)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(5);

  if (error) {
    console.error('Search Error:', error);
    return [];
  }
  return data;
}
