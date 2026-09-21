import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-ink-900">Shipping &amp; Returns</h1>
      <div className="mt-6 space-y-5 text-ink-600">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Shipping</h2>
          <p>
            Orders are typically dispatched within 1–2 business days. Delivery times vary depending on your
            location. Shipping charges, if any, are shown at checkout before you place your order.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Returns &amp; Exchanges</h2>
          <p>
            If a part arrives damaged, incorrect, or does not fit your vehicle, contact us within 7 days of
            delivery for a replacement or refund. The part must be unused and in its original packaging.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Non-Returnable Items</h2>
          <p>
            Electrical parts and items marked as final sale cannot be returned once installed or used.
          </p>
        </section>
        <p className="text-sm text-ink-400">
          This is a general template. Please review and adjust to match your actual shipping and returns process.
        </p>
      </div>
    </div>
  );
}
