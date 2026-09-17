"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  clearSessionCookie,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export type AuthFormState = {
  error: string | null;
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  });

  await setSessionCookie({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect("/account");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;

type AuthenticateResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; error: string };

async function authenticate(formData: FormData): Promise<AuthenticateResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const message: string = parsed.error.issues[0]?.message ?? "Invalid details";
    return { ok: false, error: message };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid email or password" };
  }

  return { ok: true, user };
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = await authenticate(formData);
  if (!result.ok) return { error: result.error };

  await setSessionCookie({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
  });

  redirect("/account");
}

export async function adminLoginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const result = await authenticate(formData);
  if (!result.ok) return { error: result.error };

  if (result.user.role !== "ADMIN") {
    return { error: "This account does not have admin access" };
  }

  await setSessionCookie({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
  });

  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function adminLogoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
