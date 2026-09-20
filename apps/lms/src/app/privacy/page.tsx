import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-display text-3xl font-bold text-black">Privacy Policy</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-lms-muted">
        The LMS collects only the roster, coursework and activity data needed to deliver and assess your courses.
        Data is retained under the University&apos;s student record retention schedule and never shared with
        third-party integrations beyond what a signed data-processing agreement covers.
      </p>
    </div>
  );
}
