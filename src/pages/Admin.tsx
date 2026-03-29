import React, { useEffect, useState } from 'react';
import { Database, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';

interface Business {
  id: string;
  name_en?: string;
  category: string;
  city: string;
  status?: string;
  verified?: boolean;
  created_at: string;
}

export default function Admin() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    supabase.from('businesses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (active) {
        setBusinesses((data ?? []) as Business[]);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading) return <div className="p-8">Loading auth...</div>;

  if (!user) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        <button onClick={() => login()} className="px-4 py-2 bg-indigo-600 text-white rounded">Sign in with Google</button>
      </div>
    );
  }

  const stats = {
    total: businesses.length,
    verified: businesses.filter((b) => b.status === 'approved' || b.verified).length,
    pending: businesses.filter((b) => b.status !== 'approved' && !b.verified).length,
    rejected: businesses.filter((b) => b.status === 'rejected').length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Directory Management</h1>
        <button onClick={() => logout()} className="px-4 py-2 border rounded">Sign out</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={<Database />} />
        <StatCard label="Verified" value={stats.verified} icon={<CheckCircle />} />
        <StatCard label="Pending" value={stats.pending} icon={<Clock />} />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle />} />
      </div>

      {loading ? <div>Loading businesses...</div> : (
        <table className="w-full text-left">
          <thead><tr><th>Name</th><th>Category</th><th>City</th><th>Status</th></tr></thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-t"><td>{b.name_en ?? 'Unnamed'}</td><td>{b.category}</td><td>{b.city}</td><td>{b.status ?? 'pending'}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="border rounded p-4"><div className="flex items-center justify-between"><span>{label}</span>{icon}</div><div className="text-2xl font-bold">{value}</div></div>;
}
