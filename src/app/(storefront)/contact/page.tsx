import type { Metadata } from "next";
import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/storefront/ContactForm";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Contact Us</h1>
      <p className="mt-2 max-w-xl text-slate-500">
        Have a question about a part or your order? Reach out and our team will help you find exactly what you need.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {settings.phone ? (
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium text-slate-800">Phone</p>
                <a href={`tel:${settings.phone}`} className="text-slate-600 hover:text-brand-700">
                  {settings.phone}
                </a>
              </div>
            </div>
          ) : null}
          {settings.email ? (
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium text-slate-800">Email</p>
                <a href={`mailto:${settings.email}`} className="text-slate-600 hover:text-brand-700">
                  {settings.email}
                </a>
              </div>
            </div>
          ) : null}
          {settings.address ? (
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium text-slate-800">Address</p>
                <p className="text-slate-600">{settings.address}</p>
              </div>
            </div>
          ) : null}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
