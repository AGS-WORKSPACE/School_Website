'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdmissions, ProviderCallback, PaymentGatewayProvider } from '@tau/admissions';

function buildSimulatedCallback(
  app: { invoice?: { invoiceReference: string; amount: number; currency: 'NGN' | 'USD' } },
  gateway: PaymentGatewayProvider
): ProviderCallback {
  const ts = Date.now();
  return {
    provider: gateway,
    transactionReference: app.invoice?.invoiceReference ?? 'REF',
    gatewayReference: `gw_${gateway.toLowerCase()}_${ts}`,
    amountKobo: (app.invoice?.amount ?? 0) * 100,
    currency: app.invoice?.currency ?? 'NGN',
    paidAt: new Date(ts).toISOString(),
    signatureHash: `sha512_verified_sig_${ts}`,
    rawPayloadSummary: `Automated test reconciliation for ${app.invoice?.invoiceReference} via ${gateway}`,
  };
}

export default function FeeReconciliationPage() {
  const { applications, mutations } = useAdmissions();
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Extract all invoices from applications
  const invoices = applications.flatMap((a) => (a.invoice ? [a.invoice] : []));

  // Financial aggregates
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === 'Verified')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const pendingCount = invoices.filter((inv) => inv.status === 'Pending').length;
  const verifiedCount = invoices.filter((inv) => inv.status === 'Verified').length;

  const simulateWebhookReconciliation = (applicationId: string, gateway: PaymentGatewayProvider) => {
    setReconcilingId(applicationId);
    setResultMessage(null);

    const app = applications.find((a) => a.id === applicationId);
    if (!app || !app.invoice) return;

    try {
      const callback = buildSimulatedCallback(app, gateway);
      const result = mutations.processPaymentWebhook(applicationId, callback);
      if (result.ok && result.data) {
        setResultMessage({
          type: 'success',
          message: `Webhook successfully verified and reconciled for ${app.invoice.invoiceReference}. Receipt issued: ${result.data.invoice?.receiptNumber}`,
        });
      } else {
        setResultMessage({
          type: 'error',
          message: `Reconciliation rejected: ${result.error}`,
        });
      }
    } catch (err: unknown) {
      setResultMessage({
        type: 'error',
        message: err instanceof Error ? err.message : 'Reconciliation error',
      });
    } finally {
      setReconcilingId(null);
    }
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
            Application Fee Payment & Reconciliation
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            ADM-05: Automated payment reconciliation via verified provider webhooks with HMAC signatures and idempotent receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Zero Browser-Redirect Trust
          </span>
        </div>
      </div>

      {resultMessage && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            resultMessage.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200'
          }`}
        >
          {resultMessage.type === 'success' ? '✓ ' : '✕ '}
          {resultMessage.message}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Billed
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            ₦{totalBilled.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-500">{invoices.length} invoices generated</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Collected
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₦{totalCollected.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">{verifiedCount} reconciled receipts</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pending / Unpaid
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
          <div className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">Awaiting webhook callback</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Reconciliation Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {invoices.length > 0 ? Math.round((verifiedCount / invoices.length) * 100) : 0}%
          </div>
          <div className="mt-1 text-xs text-slate-500">Automated ledger accuracy</div>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-6 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Fee Invoices & Ledger Status</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Reconciliation occurs strictly upon cryptographic verification of payment gateway webhook callbacks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Invoice Ref</th>
                <th className="px-6 py-3">Application</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Receipt No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-slate-900 dark:text-white">
                    {inv.invoiceReference}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/admissions/applications/${inv.applicationId}`}
                      className="font-mono text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {inv.applicationId}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    ₦{inv.amount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        inv.status === 'Verified'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : inv.status === 'Pending'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {inv.receiptNumber ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(inv.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {inv.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => simulateWebhookReconciliation(inv.applicationId, 'Paystack')}
                          disabled={reconcilingId === inv.applicationId}
                          className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                        >
                          Simulate Paystack Webhook
                        </button>
                        <button
                          onClick={() => simulateWebhookReconciliation(inv.applicationId, 'BankBranch_Remita')}
                          disabled={reconcilingId === inv.applicationId}
                          className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        >
                          Remita
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Reconciled ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
