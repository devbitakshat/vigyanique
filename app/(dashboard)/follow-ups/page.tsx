'use client';

import { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2, Phone, User, ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { getFollowUps } from '@/app/actions/patients';
import { useEffect } from 'react';

export default function FollowUpsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'missed'>('today');
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      setLoading(true);
      const data = await getFollowUps();
      setFollowUps(data);
      setLoading(false);
    };
    fetchFollowUps();
  }, []);

  const filtered = followUps.filter(f => {
    const d = new Date(f.date);
    if (activeTab === 'today') return isToday(d);
    if (activeTab === 'upcoming') return isFuture(d) && !isToday(d);
    if (activeTab === 'missed') return isPast(d) && !isToday(d);
    return false;
  });

  const tabs = [
    { id: 'today', name: 'Today', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'upcoming', name: 'Upcoming', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'missed', name: 'Missed', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Top Header with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 bg-white/50"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Follow-up Tracker</h1>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "text-slate-400")} />
            {tab.name}
            <span className={cn(
              "ml-1 px-1.5 py-0.5 rounded-md text-[10px]",
              activeTab === tab.id ? tab.bg + " " + tab.color : "bg-slate-200 text-slate-500"
            )}>
              {followUps.filter(f => {
                const d = new Date(f.date);
                if (tab.id === 'today') return isToday(d);
                if (tab.id === 'upcoming') return isFuture(d) && !isToday(d);
                if (tab.id === 'missed') return isPast(d) && !isToday(d);
                return false;
              }).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading follow-ups...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
          {filtered.map((follow) => (
            <div key={follow.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  activeTab === 'missed' ? "bg-red-50" : "bg-blue-50"
                )}>
                  <User className={cn(
                    "w-6 h-6",
                    activeTab === 'missed' ? "text-red-500" : "text-blue-500"
                  )} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{follow.patient_name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {follow.phone}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(follow.date), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Call Patient
                </button>
                <button className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors">
                  New Visit
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-20 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">All caught up! No {activeTab} follow-ups.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
