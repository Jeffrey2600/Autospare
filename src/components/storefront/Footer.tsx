import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/queries";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{settings.storeName}</h3>
          <p className="mt-2 text-sm text-slate-400">{settings.tagline}</p>
          <div className="mt-4 flex gap-3">
            {settings.facebookUrl ? (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 p-2 hover:bg-slate-700">
                <FacebookIcon className="h-4 w-4" />
              </a>
            ) : null}
            {settings.instagramUrl ? (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-slate-800 p-2 hover:bg-slate-700">
                <InstagramIcon className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/products?vehicleType=CAR" className="hover:text-white">Car Parts</Link></li>
            <li><Link href="/products?vehicleType=BIKE" className="hover:text-white">Bike Parts</Link></li>
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/account/orders" className="hover:text-white">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/policies/shipping-returns" className="hover:text-white">Shipping &amp; Returns</Link></li>
            <li><Link href="/policies/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Get in Touch</h4>
          <ul className="mt-3 space-y-3 text-sm">
            {settings.phone ? (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
              </li>
            ) : null}
            {settings.address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
