'use client';

import { useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RxTableProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: any;
}

export default function RxTable({ control, register, errors }: RxTableProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines"
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10 text-center">#</th>
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">Medicine Name</th>
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32 text-center">Dose (M-A-N)</th>
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[160px]">Timing</th>
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Dur (Days)</th>
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks</th>
              <th className="py-3 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {fields.map((field, index) => (
              <tr key={field.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-2 text-sm text-slate-400 text-center font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-2">
                  <input
                    {...register(`medicines.${index}.name` as const)}
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm outline-none text-slate-900"
                    placeholder="Search medicine..."
                  />
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      {...register(`medicines.${index}.dose_morning` as const)}
                      className="w-8 text-center bg-white border border-slate-200 rounded py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="text-slate-300">-</span>
                    <input
                      {...register(`medicines.${index}.dose_afternoon` as const)}
                      className="w-8 text-center bg-white border border-slate-200 rounded py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <span className="text-slate-300">-</span>
                    <input
                      {...register(`medicines.${index}.dose_night` as const)}
                      className="w-8 text-center bg-white border border-slate-200 rounded py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </td>
                <td className="py-3 px-2">
                  <select
                    {...register(`medicines.${index}.timing` as const)}
                    className="w-full bg-white border border-slate-200 rounded py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 px-1"
                  >
                    <option value="khane_ke_baad">Khane ke baad (खाने के बाद)</option>
                    <option value="khali_pet_subah">Khali pet - Subah (खाली पेट - सुबह)</option>
                    <option value="khali_pet_shaam">Khali pet - Shaam (खाली पेट - शाम)</option>
                    <option value="subah_khane_ke_baad">Subah khane ke baad (सुबह खाने के बाद)</option>
                    <option value="raat_mein">Raat mein (रात में)</option>
                  </select>
                </td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    {...register(`medicines.${index}.duration` as const, { valueAsNumber: true })}
                    className="w-full bg-white border border-slate-200 rounded py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500 px-2 text-center"
                    placeholder="5"
                  />
                </td>
                <td className="py-3 px-2">
                  <input
                    {...register(`medicines.${index}.remarks` as const)}
                    className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm outline-none"
                    placeholder="Additional notes..."
                  />
                </td>
                <td className="py-3 px-2">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => append({ 
          name: '', 
          dose_morning: '1', 
          dose_afternoon: '0', 
          dose_night: '1', 
          timing: 'khane_ke_baad',
          duration: 5,
          remarks: ''
        })}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-2 py-1 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Medicine
      </button>
    </div>
  );
}
