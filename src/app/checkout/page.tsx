import { CheckoutForm } from "@/components/CheckoutForm";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-container-margin-mobile py-8 pb-16 md:px-container-margin-desktop">
        <CheckoutForm />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
