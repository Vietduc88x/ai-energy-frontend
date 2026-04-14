'use client';

import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { ProtectedRoute } from '@/components/protected-route';

function SettingsInner() {
  const { user, signOut } = useSession();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch('/api/v1/account/export', { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'energy-analyst-data.json'; a.click();
      URL.revokeObjectURL(url);
      setMsg('Export downloaded.');
    } catch {
      setMsg('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/v1/account', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      signOut();
    } catch {
      setMsg('Delete failed. Please contact support.');
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account info */}
      <section className="border border-gray-200 rounded-xl divide-y divide-gray-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Account</h2>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user?.name ?? '—'}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
          </div>
        </div>
      </section>

      {/* API Access */}
      <section className="border border-gray-200 rounded-xl divide-y divide-gray-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">API Access</h2>
        </div>
        <div className="px-5 py-4 space-y-2">
          <p className="text-sm text-gray-600">
            The Energy Analyst API is accessible at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">/api/v1</code>.
            Use your session cookie for authenticated requests. API key support coming soon.
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 font-mono">Base URL: {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1</p>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="border border-gray-200 rounded-xl divide-y divide-gray-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Your data</h2>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-900 font-medium">Export data</p>
            <p className="text-xs text-gray-400 mt-0.5">Download all your projects, assessments, and runs as JSON.</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {exportLoading ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="border border-red-200 rounded-xl divide-y divide-red-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-sm text-gray-900 font-medium">Delete account</p>
            <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <div className="space-y-2">
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder='Type DELETE to confirm'
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== 'DELETE' || deleteLoading}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
            >
              {deleteLoading ? 'Deleting…' : 'Delete account'}
            </button>
          </div>
        </div>
      </section>

      {msg && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">{msg}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const session = useSession();
  return (
    <ProtectedRoute session={session}>
      <SettingsInner />
    </ProtectedRoute>
  );
}
