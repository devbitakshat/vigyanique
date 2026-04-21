'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function seedSampleData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, message: 'Please login first to seed data for your account.' };
  }

  // 1. Ensure profile exists
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const guestId = '00000000-0000-0000-0000-000000000000';
  const targetId = user?.id || guestId;

  await adminClient.from('profiles').upsert({
    id: guestId,
    full_name: 'Guest Doctor',
    clinic_name: 'Vigyanique Demo Clinic',
    specialization: 'Demo Mode',
  });

  const { error: profileError } = await adminClient.from('profiles').upsert({
    id: targetId,
    full_name: user?.user_metadata?.full_name || 'Dr. Sample',
    clinic_name: 'Vigyanique Demo Clinic',
    specialization: 'General Physician',
    contact_number: '+91 98765 43210'
  });

  if (profileError) {
    return { success: false, message: 'Failed to create profile: ' + profileError.message };
  }

  // 2. Sample Patients
  const patients = [
    { name: 'Amit Sharma', age: 35, gender: 'male', phone: '9000011111', occupation: 'Software Engineer', doctor_id: user.id },
    { name: 'Priya Singh', age: 28, gender: 'female', phone: '9000022222', occupation: 'Teacher', doctor_id: user.id },
    { name: 'Rajesh Gupta', age: 52, gender: 'male', phone: '9000033333', occupation: 'Shopkeeper', doctor_id: user.id },
  ];

  const { data: createdPatients, error: pError } = await supabase
    .from('patients')
    .upsert(patients, { onConflict: 'phone,doctor_id' })
    .select();

  if (pError) return { success: false, message: pError.message };

  // 3. Sample Visits, Vitals, and Medicines
  for (const patient of createdPatients) {
    // Visit 1
    const { data: visit, error: vError } = await supabase
      .from('visits')
      .insert({
        patient_id: patient.id,
        doctor_id: user.id,
        complaints: 'Mild fever and cough since 2 days',
        examination: 'Chest clear, throat slightly congested',
        advice: 'Drink plenty of warm fluids. Rest for 2 days.',
        follow_up_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
      .select()
      .single();

    if (visit) {
      await supabase.from('vitals').insert({
        visit_id: visit.id,
        bp: '110/70',
        pulse: 82,
        spo2: 98,
        temperature: 100.2,
        rr: 18
      });

      await supabase.from('medicines').insert([
        {
          visit_id: visit.id,
          name: 'Paracetamol 650mg',
          dose_morning: '1', dose_afternoon: '1', dose_night: '1',
          timing: 'khane_ke_baad',
          duration: 3,
          remarks: 'Only if fever > 100F'
        },
        {
          visit_id: visit.id,
          name: 'Cough Syrup',
          dose_morning: '0', dose_afternoon: '1', dose_night: '1',
          timing: 'raat_mein',
          duration: 5,
          remarks: '10ml each time'
        }
      ]);
    }
  }

  revalidatePath('/patients');
  revalidatePath('/follow-ups');

  return { success: true, message: 'Sample data seeded successfully!' };
}
