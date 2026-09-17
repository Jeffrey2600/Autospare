import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/storefront/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
      <p className="mt-1 text-sm text-slate-500">Sign up to track orders and save your details.</p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
