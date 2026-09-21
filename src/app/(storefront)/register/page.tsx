import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/storefront/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-ink-200/60">
        <h1 className="text-2xl font-bold tracking-tight text-ink-950">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">Track orders and save your details for next time.</p>
        <div className="mt-7">
          <RegisterForm />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
