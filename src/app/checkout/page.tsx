import { CheckoutForm } from "@/components/CheckoutForm";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { properties } from "@/lib/data";

function firstString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = firstString(params.id);
  const property = properties.find((item) => item.id === id) ?? properties[0];

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-container-margin-mobile py-8 pb-24 md:px-container-margin-desktop">
        <CheckoutForm
          property={property}
          initialCheckIn={firstString(params.checkIn)}
          initialCheckOut={firstString(params.checkOut)}
          initialRooms={firstString(params.rooms)}
        />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
