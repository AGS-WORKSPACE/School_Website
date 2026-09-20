"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { reconcileStock, useGraduation, type CertificateStock, type Collector } from "@tau/graduation";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { StatusBadge } from "@/components/console/status-badge";
import { GraduationActorSwitcher, useGraduationActor } from "@/features/graduation/acting-as";
import { formatDateTime, statusKey } from "@/lib/format";

export default function CertificatesPage() {
  const grad = useGraduation();
  const { notice, announce } = useNotice();
  const reconciliation = reconcileStock(grad.stockReceipts, grad.certificateStock);
  const [showBlank, setShowBlank] = useState(false);
  const rows = grad.certificateStock.filter((item) => showBlank || item.state !== "Blank" || item.serial === grad.certificateStock.find((entry) => entry.state === "Blank")?.serial);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-18 · GRD-06"
        title="Certificate custody"
        description="Track certificate printing and collection."
        actions={<GraduationActorSwitcher />}
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Received" value={reconciliation.expected} hint={grad.stockReceipts.map((item) => `${item.firstSerial}–${item.lastSerial}`).join(", ")} />
        <Stat label="Blank" value={reconciliation.counts.Blank} />
        <Stat label="Printed" value={reconciliation.counts.Printed} hint="Awaiting collection" />
        <Stat label="Void" value={reconciliation.counts.Void} />
        <Stat label="Issued" value={reconciliation.counts.Issued} tone="good" />
      </div>
      <p className="flex items-center gap-1.5 text-sm">
        {reconciliation.balanced ? <><CheckCircle2 className="size-4 text-success" aria-hidden />Stock reconciles: every serial in the received range is accounted for once.</> : <><ShieldAlert className="size-4 text-destructive" aria-hidden />Missing {reconciliation.missingSerials.join(", ") || "none"}; duplicated {reconciliation.duplicateSerials.join(", ") || "none"}; unexpected {reconciliation.unexpectedSerials.join(", ") || "none"}.</>}
      </p>

      <Section title="Serials" description="The next blank serial is shown for printing. Replacements require the original to be voided first." actions={<Button size="sm" variant="outline" onClick={() => setShowBlank(!showBlank)}>{showBlank ? "Hide" : "Show all"} blank stock</Button>}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Serial</TableHead><TableHead>State</TableHead><TableHead>Graduate</TableHead><TableHead>Custody</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((item) => <StockRow key={item.serial} item={item} announce={announce} />)}</TableBody>
          </Table>
        </div>
      </Section>
    </div>
  );
}

function StockRow({ item, announce }: { item: CertificateStock; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const [studentId, setStudentId] = useState(grad.graduands[0]?.studentId ?? "");
  const [reason, setReason] = useState("");
  const [collector, setCollector] = useState<Collector>({ name: "", idType: "NIN", idNumber: "", relationship: "Self", authorityDocument: "" });
  const graduate = grad.graduands.find((entry) => entry.studentId === item.studentId);

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{item.serial}</TableCell>
      <TableCell><StatusBadge status={statusKey(item.state)} /></TableCell>
      <TableCell className="text-sm">{graduate?.name ?? "—"}{item.verificationCode && <div className="font-mono text-xs text-muted-foreground">{item.verificationCode}</div>}</TableCell>
      <TableCell className="max-w-xs text-xs text-muted-foreground">
        {item.printedByName && <div>Printed by {item.printedByName}, {formatDateTime(item.printedAt)}</div>}
        {item.voidReason && <div>Void: {item.voidReason} ({item.voidedByName})</div>}
        {item.collector && <div>Released {formatDateTime(item.issuedAt)} to {item.collector.name} ({item.collector.relationship.toLowerCase()}, {item.collector.idType.replaceAll("_", " ")} {item.collector.idNumber}){item.collector.authorityDocument && ` · ${item.collector.authorityDocument}`}</div>}
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-end gap-2">
          {item.state === "Blank" && <div className="flex flex-wrap justify-end gap-2">
            <NativeSelect value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-label={`Graduate for serial ${item.serial}`} className="w-52">{grad.graduands.map((entry) => <option key={entry.studentId} value={entry.studentId}>{entry.name}</option>)}</NativeSelect>
            <Button size="sm" onClick={() => announce(grad.mutations.printCertificate(item.serial, studentId, actor), `Serial ${item.serial} printed.`)}>Print</Button>
          </div>}
          {item.state === "Printed" && <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
            <Input placeholder="Collector name" value={collector.name} onChange={(e) => setCollector({ ...collector, name: e.target.value })} aria-label={`Collector name for ${item.serial}`} />
            <Input placeholder="ID number" value={collector.idNumber} onChange={(e) => setCollector({ ...collector, idNumber: e.target.value })} aria-label={`Collector ID for ${item.serial}`} />
            <NativeSelect value={collector.relationship} onChange={(e) => setCollector({ ...collector, relationship: e.target.value as Collector["relationship"] })} aria-label={`Collector relationship for ${item.serial}`}><option>Self</option><option>Proxy</option></NativeSelect>
            <Input placeholder="Proxy authority document" value={collector.authorityDocument ?? ""} onChange={(e) => setCollector({ ...collector, authorityDocument: e.target.value })} aria-label={`Proxy authority for ${item.serial}`} />
            <Button size="sm" className="sm:col-span-2" onClick={() => announce(grad.mutations.issueCertificate(item.serial, collector, actor), `Serial ${item.serial} released to ${collector.name}.`)}>Release to collector</Button>
          </div>}
          {(item.state === "Blank" || item.state === "Printed") && <div className="flex gap-2">
            <Input className="w-48" placeholder="Reason to void" value={reason} onChange={(e) => setReason(e.target.value)} aria-label={`Void reason for ${item.serial}`} />
            <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.voidCertificate(item.serial, reason, actor), `Serial ${item.serial} voided.`)}>Void</Button>
          </div>}
        </div>
      </TableCell>
    </TableRow>
  );
}
