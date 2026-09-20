import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icon";
import { InstagramStories } from "@/components/InstagramStories";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PropertyBookingCard } from "@/components/PropertyBookingCard";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyHeader } from "@/components/PropertyHeader";
import { StickyBookBar } from "@/components/StickyBookBar";
import {
  amenities,
  galleryImages,
  howToReach,
  nearbyPlaces,
  properties,
  propertyFaqs,
  propertyImages,
  propertyRules,
} from "@/lib/data";

export default async function PropertyDetailsPage({
  params,
}: PageProps<"/property/[id]">) {
  const { id } = await params;
  const property = properties.find((item) => item.id === id) ?? properties[0];
  const related = properties.filter((item) => item.id !== property.id).slice(0, 4);

  return (
    <div className="pt-16">
      <PropertyHeader />
      <main className="mx-auto max-w-[1280px] px-container-margin-mobile py-6 pb-28 md:px-container-margin-desktop">
        <PhotoGallery images={galleryImages} alt={property.name} />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
          <section>
            <p className="text-sm font-medium text-on-surface-variant">{property.code}</p>
            <h1 className="mt-1 text-3xl text-on-surface">{property.name}</h1>
            <p className="mt-2 flex items-center gap-1 text-on-surface-variant">
              <Icon name="location_on" className="text-[18px]" />
              {property.loc}, Maharashtra
            </p>
          </section>

          <InstagramStories />

          <section>
            <h2 className="mb-4 text-lg">Amenities</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {amenities.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-3"
                >
                  <Icon name={item.icon} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
              Inclusion & timing
            </h2>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex gap-2">
                <Icon name="check_circle" />
                Check-in 2:00 PM · Check-out 11:00 AM
              </li>
              <li className="flex gap-2">
                <Icon name="check_circle" />
                Breakfast for two guests
              </li>
              <li className="flex gap-2">
                <Icon name="check_circle" />
                Private pool and bonfire setup
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
              About property
            </h2>
            <p className="text-sm leading-7 text-on-surface-variant">
              A quiet hill stay with open views, a private pool, and interiors made for long
              weekends. Floor-to-ceiling windows look out to the valley, and every corner is
              set up for slow mornings and easy hosting.
            </p>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
              Location
            </h2>
            <div className="relative h-52 overflow-hidden rounded-xl">
              <img
                src={propertyImages.map}
                alt="Map of Lonavala"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm font-medium shadow-sm">
                <Icon name="location_on" />
                Map
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
              How to reach
            </h2>
            <ul className="space-y-3 text-sm leading-6 text-on-surface-variant">
              {howToReach.map((item) => (
                <li key={item} className="flex gap-2">
                  <Icon name="directions" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
              Nearby places
            </h2>
            <ul className="space-y-3">
              {nearbyPlaces.map((place) => (
                <li
                  key={place.name}
                  className="flex items-center justify-between rounded-lg bg-background px-3 py-3"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Icon name={place.icon} />
                    {place.name}
                  </span>
                  <span className="text-sm text-on-surface-variant">{place.distance}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
              Property rules & policies
            </h2>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              {propertyRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <Icon name="gavel" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface p-5">
            <h2 className="mb-3 rounded-lg bg-surface-container-high px-3 py-2 text-base">
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
          <aside className="hidden lg:block lg:col-span-5">
            <PropertyBookingCard property={property} />
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="mb-5 text-xl">Related properties</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {related.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <StickyBookBar price={property.price} href={`/checkout?id=${property.id}`} />
    </div>
  );
}
