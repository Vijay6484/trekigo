import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { experiences } from "@/lib/data";

export default function ExperiencesPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-container-margin-mobile py-8 pb-24 md:px-container-margin-desktop">
        <h1 className="mb-6 text-2xl md:text-3xl">Experiences</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {experiences.map((item) => (
            <Link
              key={item.name}
              href="/properties"
              className="overflow-hidden rounded-xl border border-outline-variant bg-surface"
            >
              <img src={item.img} alt={item.name} className="h-44 w-full object-cover" />
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">Add to your stay</p>
                </div>
                <Icon name="chevron_right" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
