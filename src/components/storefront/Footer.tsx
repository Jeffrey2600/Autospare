import Link from "next/link";
import { Phone, Mail, MapPin, Wrench } from "lucide-react";
import { getSiteSettings } from "@/lib/queries";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-20 bg-ink-950 text-ink-400">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Wrench className="h-[1.125rem] w-[1.125rem]" />
            </span>
            <h3 className="text-lg font-bold tracking-tight text-white">{settings.storeName}</h3>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{settings.tagline}</p>
          <div className="mt-6 flex gap-2">
            {settings.facebookUrl ? (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            ) : null}
            {settings.instagramUrl ? (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-brand-600 hover:text-white"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <FooterCol title="Shop">
          <FooterLink href="/products?vehicleType=CAR">Car Parts</FooterLink>
          <FooterLink href="/products?vehicleType=BIKE">Bike Parts</FooterLink>
          <FooterLink href="/products">All Products</FooterLink>
          <FooterLink href="/account/orders">Track Order</FooterLink>
        </FooterCol>

        <FooterCol title="Company">
          <FooterLink href="/about">About Us</FooterLink>
          <FooterLink href="/contact">Contact Us</FooterLink>
          <FooterLink href="/policies/shipping-returns">Shipping &amp; Returns</FooterLink>
          <FooterLink href="/policies/terms">Terms of Service</FooterLink>
          <FooterLink href="/policies/privacy">Privacy Policy</FooterLink>
        </FooterCol>

        <div className="col-span-2 lg:col-span-1">
          <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-white">
            Get in Touch
          </h4>
          <ul className="mt-4 space-y-3.5 text-sm">
            {settings.phone ? (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <a href={`tel:${settings.phone}`} className="transition-colors hover:text-white">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-white">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.address ? (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span className="leading-relaxed">{settings.address}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-ink-500">
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-white">{title}</h4>
      <ul className="mt-4 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
