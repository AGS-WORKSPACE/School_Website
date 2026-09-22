import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-20">
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">LMS Support</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-lms-muted">
        Get help with sign in, missing courses and learning materials.
      </p>
      <a href="mailto:lms@unizik.edu.ng" className="mt-6 inline-block font-semibold text-lms-blue hover:underline">
        lms@unizik.edu.ng
      </a>
    </div>
  );
}
