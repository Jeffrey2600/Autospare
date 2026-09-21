import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-ink-900">Terms of Service</h1>
      <div className="mt-6 space-y-5 text-ink-600">
        <p>
          These Terms of Service govern your use of the {settings.storeName} website and your purchase of
          products listed on it. By placing an order with us, you agree to these terms.
        </p>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Orders &amp; Pricing</h2>
          <p>
            All prices are listed in Indian Rupees (₹) and are subject to change without notice. We reserve the
            right to refuse or cancel any order, including in cases of pricing errors or stock unavailability.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Product Fitment</h2>
          <p>
            While we make every effort to describe compatibility accurately, it is the buyer&apos;s responsibility
            to confirm a part fits their specific vehicle make, model and year before fitting. Contact us if you
            are unsure.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Payments</h2>
          <p>
            We accept Cash on Delivery / Pay at Store and bank transfer. Online payment options will be added in
            the future.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Limitation of Liability</h2>
          <p>
            We are not liable for any indirect or consequential loss arising from the use or installation of
            products purchased from this site.
          </p>
        </section>
        <p className="text-sm text-ink-400">
          This is a general template. Please review with a legal professional before publishing.
        </p>
      </div>
    </div>
  );
}
