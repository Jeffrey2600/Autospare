import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";
import { CartHydrator } from "@/components/storefront/CartHydrator";
import { getSiteSettings } from "@/lib/queries";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <CartHydrator />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton number={settings.whatsapp} />
    </>
  );
}
