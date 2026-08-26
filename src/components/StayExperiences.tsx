"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { PropertyCard } from "@/components/PropertyCard";
import { properties, stayTypes, type StayType } from "@/lib/data";

export function StayExperiences() {
  const [active, setActive] = useState<StayType>("all");

  const filtered = useMemo(
    () => (active === "all" ? properties : properties.filter((item) => item.type === active)),
    [active],
  );

  return (
    <section className="px-container-margin-mobile md:px-container-margin-desktop">
      <h2 className="mb-5 text-xl text-on-surface md:text-2xl">Stay experiences</h2>
      <div className="mb-6 flex gap-3 overflow-x-auto hide-scrollbar">
        {stayTypes.map((type) => {
          const selected = type.id === active;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setActive(type.id)}
              className={`flex min-w-[88px] flex-col items-center gap-2 rounded-xl border px-4 py-3 transition-colors ${
                selected
                  ? "border-primary bg-primary-container text-primary"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary"
              }`}
            >
              <Icon name={type.icon} className="text-[26px] text-primary" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl text-on-surface md:text-2xl">All properties</h2>
        <span className="text-sm text-on-surface-variant">{filtered.length} stays</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {filtered.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
