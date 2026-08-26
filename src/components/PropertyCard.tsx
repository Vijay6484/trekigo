import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { properties } from "@/lib/data";

type Property = (typeof properties)[number];

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/property/${property.id}`}
      className="card-shadow group flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface transition-shadow"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high">
        <img
          src={property.img}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-on-surface md:top-3 md:right-3 md:text-xs">
          <Icon name="star" filled className="text-[13px] text-primary md:text-sm" />
          {property.rating}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 p-2.5 md:gap-1 md:p-4">
        <h3 className="truncate text-sm font-semibold text-on-surface md:text-base">
          {property.name}
        </h3>
        <p className="flex min-w-0 items-center gap-1 text-xs text-on-surface-variant md:text-sm">
          <Icon name="location_on" className="shrink-0 text-sm text-primary" />
          <span className="truncate">{property.loc}</span>
        </p>
        <p className="mt-auto pt-1 text-sm font-semibold text-primary md:text-base">
          ₹{property.price}{" "}
          <span className="text-[11px] font-normal text-on-surface-variant md:text-sm">
            /night
          </span>
        </p>
      </div>
    </Link>
  );
}
