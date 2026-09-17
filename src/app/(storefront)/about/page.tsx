import type { Metadata } from "next";
import { ShieldCheck, Wrench, Users, Truck } from "lucide-react";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900">About {settings.storeName}</h1>
      <p className="mt-4 text-slate-600">
        {settings.storeName} has been supplying genuine and high-quality compatible spare parts for cars and
        bikes to workshops, mechanics, and everyday drivers and riders. We stock a wide range of components —
        from engine and brake parts to electricals and body panels — so you can find the right fit without the
        wait.
      </p>
      <p className="mt-4 text-slate-600">
        Every part listed on our site is checked for quality before it reaches you. Our team is on hand to help
        you match the right part to your vehicle&apos;s make, model and year.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Feature icon={<ShieldCheck className="h-6 w-6" />} title="Quality Assured" desc="Every part is checked before dispatch." />
        <Feature icon={<Wrench className="h-6 w-6" />} title="Wide Range" desc="Parts for cars and bikes across major brands." />
        <Feature icon={<Truck className="h-6 w-6" />} title="Fast Delivery" desc="Quick local dispatch and reliable shipping." />
        <Feature icon={<Users className="h-6 w-6" />} title="Expert Team" desc="We help you find the exact fit for your vehicle." />
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
