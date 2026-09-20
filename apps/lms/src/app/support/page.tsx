import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-black">LMS Support</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-lms-muted">
        For platform issues — a video or reading that won&apos;t load, a missing course shell, or trouble signing
        in — reach the LMS support desk and we&apos;ll respond within one working day.
      </p>
      <a href="mailto:lms@unizik.edu.ng" className="mt-6 inline-block font-semibold text-lms-blue hover:underline">
        lms@unizik.edu.ng
      </a>
    </div>
  );
}
