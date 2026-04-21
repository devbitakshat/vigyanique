export type Profile = {
  id: string;
  full_name: string;
  clinic_name: string | null;
  contact_number: string | null;
  specialization: string | null;
  created_at: string;
  updated_at: string;
};

export type Patient = {
  id: string;
  doctor_id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  occupation: string | null;
  created_at: string;
  updated_at: string;
};

export type Visit = {
  id: string;
  patient_id: string;
  doctor_id: string;
  complaints: string | null;
  examination: string | null;
  history: string | null;
  investigation: string | null;
  advice: string | null;
  follow_up_date: string | null;
  created_at: string;
};

export type Vitals = {
  visit_id: string;
  bp: string | null;
  pulse: number | null;
  spo2: number | null;
  temperature: number | null;
  rr: number | null;
};

export type Medicine = {
  id: string;
  visit_id: string;
  name: string;
  dose_morning: string;
  dose_afternoon: string;
  dose_night: string;
  timing: 'khali_pet_subah' | 'khali_pet_shaam' | 'raat_mein' | 'khane_ke_baad' | 'subah_khane_ke_baad';
  duration: number | null;
  remarks: string | null;
  created_at: string;
};

export type CompleteVisit = Visit & {
  vitals: Vitals | null;
  medicines: Medicine[];
  patient: Patient;
};
