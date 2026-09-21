import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold text-ink-900">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-ink-600">
        <p>
          {settings.storeName} collects the information you provide when creating an account, placing an order,
          or contacting us — such as your name, phone number, email address and delivery address. We use this
          information only to process orders, provide support, and improve our service.
        </p>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">How We Use Your Data</h2>
          <p>
            Your details are used to fulfil orders, contact you about your purchase, and respond to enquiries.
            We do not sell your personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Data Storage</h2>
          <p>
            Order and account information is stored securely and retained only as long as necessary to provide
            our services and meet legal requirements.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time by
            contacting us.
          </p>
        </section>
        <p className="text-sm text-ink-400">
          This is a general template. Please review with a legal professional before publishing.
        </p>
      </div>
    </div>
  );
}
