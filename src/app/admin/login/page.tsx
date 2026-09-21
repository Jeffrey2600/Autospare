"use client";

import { useActionState } from "react";
import { adminLoginAction, type AuthFormState } from "@/lib/actions/auth";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-ink-950">Admin Login</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to manage your store.</p>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {state.error ? <FieldError>{state.error}</FieldError> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
