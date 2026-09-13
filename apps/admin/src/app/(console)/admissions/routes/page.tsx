'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdmissions, AdmissionRouteConfig } from '@tau/admissions';

export default function AdmissionRoutesConfigPage() {
  const { routes, mutations } = useAdmissions();
  const [editingRoute, setEditingRoute] = useState<AdmissionRouteConfig | null>(null);
  const [feeNgn, setFeeNgn] = useState<number>(0);
  const [feeUsd, setFeeUsd] = useState<number>(0);
  const [minReferees, setMinReferees] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const startEdit = (route: AdmissionRouteConfig) => {
    setEditingRoute(route);
    setFeeNgn(route.applicationFeeNGN);
    setFeeUsd(route.applicationFeeUSD ?? 0);
    setMinReferees(route.minRefereeCount);
    setIsActive(route.active);
    setSaveSuccess(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    const updated: AdmissionRouteConfig = {
      ...editingRoute,
      active: isActive,
      applicationFeeNGN: feeNgn,
      applicationFeeUSD: feeUsd > 0 ? feeUsd : undefined,
      minRefereeCount: minReferees,
    };

    mutations.updateRouteConfig(updated);

    setSaveSuccess(`Updated route configuration for ${editingRoute.name} successfully.`);
    setEditingRoute(null);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admissions"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← Admissions Overview
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admission Routes & Requirements
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            ADM-02: Configurable route requirements, fees, document checklists, and referee rules without code deployments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            Active Cycle: 2026/2027
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
          ✓ {saveSuccess}
        </div>
      )}

      {/* Routes Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {routes.map((route) => (
          <div
            key={route.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {route.code}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      route.active
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {route.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => startEdit(route)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Configure
                </button>
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{route.name}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{route.description}</p>

              {/* Fee & Referees */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Application Fee:</span>
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    ₦{route.applicationFeeNGN.toLocaleString()}
                    {route.applicationFeeUSD && (
                      <span className="ml-1 text-slate-500 dark:text-slate-400">
                        / ${route.applicationFeeUSD.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Referees Required:</span>
                  <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                    {route.minRefereeCount} of max {route.maxRefereeCount}
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Required Document Types ({route.documentRequirements.length})
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {route.documentRequirements.map((docReq) => (
                    <span
                      key={docReq.id}
                      className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    >
                      {docReq.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
              Target Level: {route.targetLevel}L · JAMB Required: {route.requiresJambRegNumber ? 'Yes' : 'No'}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Drawer / Modal */}
      {editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {editingRoute.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingRoute.name}</h3>
              </div>
              <button
                onClick={() => setEditingRoute(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActiveToggle" className="font-medium text-slate-900 dark:text-white">
                  Route is Active & Open for Applications
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Application Fee (NGN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={feeNgn}
                  onChange={(e) => setFeeNgn(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Application Fee (USD - optional for international)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={feeUsd}
                  onChange={(e) => setFeeUsd(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Minimum Referees Required
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={minReferees}
                  onChange={(e) => setMinReferees(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
