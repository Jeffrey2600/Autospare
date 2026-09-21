import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/storefront/LoginForm";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-ink-200/60">
        <h1 className="text-2xl font-bold tracking-tight text-ink-950">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-500">Log in to track orders and check out faster.</p>
        <div className="mt-7">
          <LoginForm />
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
