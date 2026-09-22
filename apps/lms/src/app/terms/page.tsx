import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Terms &amp; Conditions</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-lms-muted">
        Use of the LMS is governed by the University&apos;s student and staff codes of conduct. Course content is
        for the personal study of enrolled users and may not be redistributed outside the platform.
      </p>
    </div>
  );
}
