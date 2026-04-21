'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { seedSampleData } from '@/app/actions/seed';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  FileText, 
  Users, 
  Calendar, 
  LogOut, 
  PlusCircle,
  Stethoscope,
  Database
} from 'lucide-react';

const navigation = [
  { name: 'Prescription', href: '/prescription', icon: FileText },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Follow-ups', href: '/follow-ups', icon: Calendar },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [seeding, setSeeding] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSeedData = async () => {
    setSeeding(true);
    toast.promise(seedSampleData(), {
      loading: 'Seeding sample data...',
      success: (data) => {
        setSeeding(false);
        setTimeout(() => window.location.reload(), 1000);
        return data.message;
      },
      error: (err) => {
        setSeeding(false);
        return err.message || 'Failed to seed data';
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Vigyanique</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <button 
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors uppercase tracking-widest disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout / Switch
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-800">
            {navigation.find(n => pathname.startsWith(n.href))?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/prescription" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              New Prescription
            </Link>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
