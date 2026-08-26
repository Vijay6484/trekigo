import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PropertyCard } from "@/components/PropertyCard";
import {
  amenities,
  galleryImages,
  howToReach,
  nearbyPlaces,
  properties,
  propertyFaqs,
  propertyImages,
  propertyRules,
  storyHighlights,
} from "@/lib/data";

export default async function PropertyDetailsPage({
  params,
}: PageProps<"/property/[id]">) {
  const { id } = await params;
  const property = properties.find((item) => item.id === id) ?? properties[0];
  const related = properties.filter((item) => item.id !== property.id).slice(0, 4);

  return (
    <div className="pt-16 md:pt-20">
      <Navbar variant="property" />
      <main className="mx-auto max-w-[1280px] px-container-margin-mobile py-6 pb-16 md:px-container-margin-desktop">
        <div className="mb-5 flex items-center justify-between">
          <BackButton
            label="Back"
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
          />
          <div className="flex gap-2">
            <a
              href="tel:+919876543210"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-primary md:hidden"
              aria-label="Call"
            >
              <Icon name="call" className="text-[20px]" />
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-primary"
              aria-label="Share"
            >
              <Icon name="share" className="text-[20px]" />
            </button>
          </div>
        </div>

        <PhotoGallery images={galleryImages} alt={property.name} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <p className="text-sm font-medium text-primary">{property.code}</p>
              <h1 className="mt-1 text-3xl text-on-surface">{property.name}</h1>
              <p className="mt-2 flex items-center gap-1 text-on-surface-variant">
                <Icon name="location_on" className="text-primary text-[18px]" />
                {property.loc}, Maharashtra
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg">Story</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {storyHighlights.map((label) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary p-0.5">
                      <img
                        src={propertyImages.highlight}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-on-surface-variant">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {amenities.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-3"
                  >
                    <Icon name={item.icon} className="text-primary" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                Inclusion & timing
              </h2>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-2">
                  <Icon name="check_circle" className="text-primary" />
                  Check-in 2:00 PM · Check-out 11:00 AM
                </li>
                <li className="flex gap-2">
                  <Icon name="check_circle" className="text-primary" />
                  Breakfast for two guests
                </li>
                <li className="flex gap-2">
                  <Icon name="check_circle" className="text-primary" />
                  Private pool and bonfire setup
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                About property
              </h2>
              <p className="text-sm leading-7 text-on-surface-variant">
                A quiet hill stay with open views, a private pool, and interiors made for long
                weekends. Floor-to-ceiling windows look out to the valley, and every corner is
                set up for slow mornings and easy hosting.
              </p>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                Location
              </h2>
              <div className="relative h-52 overflow-hidden rounded-xl">
                <img
                  src={propertyImages.map}
                  alt="Map of Lonavala"
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm font-medium shadow-sm">
                  <Icon name="location_on" className="text-primary" />
                  Map
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                How to reach
              </h2>
              <ul className="space-y-3 text-sm leading-6 text-on-surface-variant">
                {howToReach.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Icon name="directions" className="text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                Nearby places
              </h2>
              <ul className="space-y-3">
                {nearbyPlaces.map((place) => (
                  <li
                    key={place.name}
                    className="flex items-center justify-between rounded-lg bg-background px-3 py-3"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Icon name={place.icon} className="text-primary" />
                      {place.name}
                    </span>
                    <span className="text-sm text-on-surface-variant">{place.distance}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                Property rules & policies
              </h2>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                {propertyRules.map((rule) => (
                  <li key={rule} className="flex gap-2">
                    <Icon name="gavel" className="text-primary" />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-outline-variant bg-surface p-5">
              <h2 className="mb-3 rounded-lg bg-primary-container px-3 py-2 text-base text-primary">
                Property FAQs
              </h2>
              <div className="space-y-2">
                {propertyFaqs.map((item) => (
                  <details
                    key={item.q}
                    className="rounded-lg border border-outline-variant px-4 py-3"
                  >
                    <summary className="cursor-pointer font-medium">{item.q}</summary>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-outline-variant bg-surface p-5 card-shadow">
              <p className="text-sm text-on-surface-variant line-through">₹25,000</p>
              <p className="text-3xl font-semibold text-primary">
                ₹{property.price}{" "}
                <span className="text-sm font-normal text-on-surface-variant">/ night</span>
              </p>
              <div className="my-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Dates</span>
                  <span className="font-medium">Select dates</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Guests</span>
                  <span className="font-medium">2 guests</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full rounded-xl bg-primary py-3.5 text-center font-semibold text-on-primary hover:bg-primary-fixed-dim"
              >
                Reserve now
              </Link>
              <p className="mt-3 text-center text-xs text-on-surface-variant">
                You won&apos;t be charged yet
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="mb-5 text-xl">Related properties</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
