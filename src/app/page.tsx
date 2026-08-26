import Link from "next/link";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { SectionHeading } from "@/components/SectionHeading";
import { StayExperiences } from "@/components/StayExperiences";
import { TrustBlock } from "@/components/TrustBlock";
import { destinations, experiences, mostLoved, offers, packages } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-12 py-8 pb-16 md:gap-16">
        <section
          id="offers"
          className="px-container-margin-mobile md:px-container-margin-desktop"
        >
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <h2 className="text-lg font-semibold tracking-wide text-primary">Offers</h2>
            <span className="h-px w-8 bg-primary" />
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
            {offers.map((offer) => (
              <article
                key={offer.title}
                className="relative h-48 w-full flex-none overflow-hidden rounded-xl snap-center md:w-[560px]"
              >
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent p-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                    {offer.label}
                  </p>
                  <h3 className="mb-4 max-w-[70%] text-2xl text-white">{offer.title}</h3>
                  <button
                    type="button"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                  >
                    {offer.cta}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="search"
          className="px-container-margin-mobile md:px-container-margin-desktop"
        >
          <div className="mx-auto flex w-full max-w-2xl items-center rounded-full border border-outline-variant bg-surface px-4 py-2 card-shadow">
            <input
              className="w-full border-none bg-transparent py-2 text-on-surface outline-none"
              placeholder="Search for a property / exp."
              type="search"
            />
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
              <Icon name="search" />
            </span>
          </div>
        </section>

        <section className="px-container-margin-mobile md:px-container-margin-desktop">
          <SectionHeading title="Pick a destination" icon="search" />
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {destinations.map((destination) => (
              <button
                key={destination.name}
                type="button"
                className="group flex flex-col items-center"
              >
                <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface">
                  <img
                    src={destination.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity group-hover:opacity-50"
                  />
                  <Icon name={destination.icon} className="z-10 text-4xl text-primary md:text-5xl" />
                </div>
                <span className="text-sm font-medium text-on-surface">{destination.name}</span>
              </button>
            ))}
          </div>
        </section>

        <StayExperiences />

        <section className="px-container-margin-mobile md:px-container-margin-desktop">
          <SectionHeading title="Most loved" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x">
            {mostLoved.map((item) => (
              <article
                key={item.title}
                className="relative h-64 w-36 flex-none overflow-hidden rounded-xl snap-start sm:h-80 sm:w-44"
              >
                <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary">
                  <Icon name="play_arrow" filled className="text-[28px]" />
                </span>
                <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white">
                  {item.title}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="packages"
          className="px-container-margin-mobile md:px-container-margin-desktop"
        >
          <SectionHeading title="Packages" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x md:grid md:grid-cols-2">
            {packages.map((item) => (
              <Link
                key={item.name}
                href="/property/1"
                className="relative min-w-[280px] flex-1 overflow-hidden rounded-xl snap-start md:min-w-0"
              >
                <img src={item.img} alt={item.name} className="h-44 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-white/80">
                      {item.nights} · ₹{item.price}
                    </p>
                  </div>
                  <Icon name="chevron_right" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-container-margin-mobile md:px-container-margin-desktop">
          <SectionHeading title="Experiences" />
          <div className="grid grid-cols-3 gap-3 md:gap-5">
            {experiences.map((item) => (
              <Link
                key={item.name}
                href="/trust"
                className="group relative overflow-hidden rounded-xl"
              >
                <img src={item.img} alt={item.name} className="aspect-square w-full object-cover" />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-3 text-white">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <Icon name="chevron_right" className="text-lg" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <TrustBlock />
      </main>
      <Footer />
      <FloatingActions />
      <MobileNav />
    </div>
  );
}
