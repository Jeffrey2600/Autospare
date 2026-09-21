import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [session, settings] = await Promise.all([getSession(), getSiteSettings()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Checkout</h1>
      <CheckoutForm
        defaultName={session?.name}
        defaultEmail={session?.email}
        shippingFee={settings.shippingFee}
        freeShippingThreshold={settings.freeShippingThreshold}
      />
    </div>
  );
}
