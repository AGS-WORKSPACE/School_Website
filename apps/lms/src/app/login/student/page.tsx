import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInCard } from "@/components/auth/sign-in-card";

export const metadata: Metadata = { title: "Student Login" };

export default function StudentLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-lms-mist px-6 py-16">
      <Suspense>
        <SignInCard role="student" identifierLabel="Matriculation number" identifierPlaceholder="TAU/26/SCI/0101" />
      </Suspense>
    </div>
  );
}
