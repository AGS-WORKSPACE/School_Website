import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInCard } from "@/components/auth/sign-in-card";

export const metadata: Metadata = { title: "Lecturer Login" };

export default function LecturerLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-lms-mist px-6 py-16">
      <Suspense>
        <SignInCard role="lecturer" identifierLabel="Staff ID" identifierPlaceholder="usr-lect-okonkwo" />
      </Suspense>
    </div>
  );
}
