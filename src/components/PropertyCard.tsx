import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { properties } from "@/lib/data";

type Property = (typeof properties)[number];

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/property/${property.id}`}
      className="card-shadow group flex h-full w-[78vw] max-w-[340px] min-w-[260px] flex-none snap-start flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface md:w-auto md:max-w-none md:min-w-0"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
        <img
          src={property.img}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-semibold">
          <Icon name="star" filled className="text-sm text-accent" />
          {property.rating}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
        <h3 className="truncate text-base font-semibold">{property.name}</h3>
        <p className="flex min-w-0 items-center gap-1 text-sm text-on-surface-variant">
          <Icon name="location_on" className="shrink-0 text-sm" />
          <span className="truncate">{property.loc}</span>
        </p>
        <p className="mt-auto pt-1 text-base font-semibold">
          ₹{property.price}{" "}
          <span className="text-sm font-normal text-on-surface-variant">/night</span>
        </p>
      </div>
    </Link>
  );
}
