'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdmissions, ProviderCallback, PaymentGatewayProvider } from '@tau/admissions';
import { Button } from '@tau/ui/button';
import { Card } from '@tau/ui/card';
import { PageHeader } from '@/components/console/page-header';
import { Stat } from '@/components/console/stat';

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
    <div className="space-y-6">
      <Link href="/admissions" className="inline-flex text-xs font-medium text-muted-foreground hover:text-primary">
        ← Admissions Overview
      </Link>
      <PageHeader
        eyebrow="ADM-05 · Admissions finance"
        title="Application Fee Payment & Reconciliation"
        description="Automated payment reconciliation via verified provider webhooks with HMAC signatures and idempotent receipts."
        actions={<span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Zero Browser-Redirect Trust</span>}
      />

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
        <Stat label="Total Billed" value={`₦${totalBilled.toLocaleString()}`} hint={`${invoices.length} invoices generated`} />
        <Stat label="Total Collected" value={`₦${totalCollected.toLocaleString()}`} hint={`${verifiedCount} reconciled receipts`} tone="good" />
        <Stat label="Pending / Unpaid" value={pendingCount} hint="Awaiting webhook callback" tone={pendingCount ? "warning" : "good"} />
        <Stat label="Reconciliation Rate" value={`${invoices.length > 0 ? Math.round((verifiedCount / invoices.length) * 100) : 0}%`} hint="Automated ledger accuracy" />
      </div>

      {/* Invoices Ledger Table */}
      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-display text-base font-bold text-foreground">Fee Invoices & Ledger Status</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Reconciliation occurs strictly upon cryptographic verification of payment gateway webhook callbacks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/70 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice Ref</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="whitespace-nowrap px-4 py-3 font-medium tabular text-slate-900 dark:text-white">
                    {inv.invoiceReference}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admissions/applications/${inv.applicationId}`}
                      className="text-[11px] tabular text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {inv.applicationId}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold tabular text-slate-900 dark:text-white">
                    ₦{inv.amount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
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
                  <td className="whitespace-nowrap px-4 py-3 text-[11px] tabular text-slate-600 dark:text-slate-400">
                    {inv.receiptNumber ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[11px] tabular text-slate-500 dark:text-slate-400">
                    {new Date(inv.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {inv.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => simulateWebhookReconciliation(inv.applicationId, 'Paystack')}
                          disabled={reconcilingId === inv.applicationId}
                          className="h-8 text-[11px]"
                        >
                          Simulate Paystack Webhook
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => simulateWebhookReconciliation(inv.applicationId, 'BankBranch_Remita')}
                          disabled={reconcilingId === inv.applicationId}
                          className="h-8 text-[11px]"
                        >
                          Remita
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        Reconciled ✓
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
