"use client";

import { useState } from "react";
import { BookNowButton } from "@/components/BookNowButton";
import { Icon } from "@/components/Icon";
import { propertyImages } from "@/lib/data";

export function CheckoutForm() {
  const [meal, setMeal] = useState<"veg" | "nonveg">("veg");
  const [pay, setPay] = useState<"full" | "advance">("full");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="rounded-xl border border-outline-variant bg-surface p-4">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <Icon name="calendar_month" className="text-primary text-[18px]" />
              Date
            </span>
            <input
              type="text"
              defaultValue="15 Nov 2024 – 20 Nov 2024"
              className="w-full border-none bg-transparent p-0 text-base font-medium text-on-surface outline-none"
            />
          </label>
          <label className="rounded-xl border border-outline-variant bg-surface p-4">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <Icon name="group" className="text-primary text-[18px]" />
              Add guest
            </span>
            <input
              type="text"
              defaultValue="2 guests, 1 room"
              className="w-full border-none bg-transparent p-0 text-base font-medium text-on-surface outline-none"
            />
          </label>
        </div>

        <h1 className="pt-2 text-2xl md:text-3xl">Confirm and pay</h1>

        <section className="space-y-4 rounded-xl border border-outline-variant bg-surface p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              A. Property name
            </p>
            <p className="mt-1 text-lg font-semibold">Neon Peak Villa</p>
          </div>
          <div className="grid gap-4 border-t border-outline-variant pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                B. Date
              </p>
              <p className="mt-1 font-medium">15 Nov – 20 Nov 2024</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                C. Guest room
              </p>
              <p className="mt-1 font-medium">1 villa · 2 guests</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-outline-variant bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            D. Name, email & number
          </p>
          <div className="grid gap-3">
            <input
              className="rounded-lg border border-outline-variant bg-background px-4 py-3 outline-none focus:border-primary"
              placeholder="Full name"
              defaultValue="Aarav Mehta"
            />
            <input
              className="rounded-lg border border-outline-variant bg-background px-4 py-3 outline-none focus:border-primary"
              placeholder="Email"
              type="email"
              defaultValue="aarav@email.com"
            />
            <input
              className="rounded-lg border border-outline-variant bg-background px-4 py-3 outline-none focus:border-primary"
              placeholder="Phone number"
              defaultValue="+91 98765 43210"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            E. Meal preference
          </p>
          <p className="text-sm text-on-surface-variant">Depends on the property</p>
          <div className="flex gap-3">
            {(["veg", "nonveg"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMeal(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                  meal === option
                    ? "bg-primary text-on-primary"
                    : "bg-primary-container text-primary"
                }`}
              >
                {option === "nonveg" ? "Non-veg" : "Veg"}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-outline-variant bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            F. Pay advance / full
          </p>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant p-4 has-[:checked]:border-primary">
            <input
              type="radio"
              name="pay"
              checked={pay === "full"}
              onChange={() => setPay("full")}
              className="mt-1 accent-primary"
            />
            <div>
              <div className="font-semibold">Pay in full</div>
              <div className="text-sm text-on-surface-variant">
                Pay the total amount now for a hassle-free stay.
              </div>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant p-4 has-[:checked]:border-primary">
            <input
              type="radio"
              name="pay"
              checked={pay === "advance"}
              onChange={() => setPay("advance")}
              className="mt-1 accent-primary"
            />
            <div>
              <div className="font-semibold">Pay advance</div>
              <div className="text-sm text-on-surface-variant">
                Pay ₹5,000 now, rest at the property.
              </div>
            </div>
          </label>
        </section>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            G. Book now
          </p>
          <BookNowButton />
        </div>
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-28 rounded-xl border border-outline-variant bg-surface p-5 card-shadow">
          <div className="mb-5 flex gap-4 border-b border-outline-variant pb-5">
            <img
              src={propertyImages.checkout}
              alt="Neon Peak Villa"
              className="h-24 w-24 rounded-lg object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Villa</p>
              <h3 className="mt-1 font-semibold">Neon Peak Villa</h3>
              <p className="mt-1 flex items-center text-sm text-on-surface-variant">
                <Icon name="location_on" className="mr-1 text-[16px] text-primary" />
                Lonavala, Maharashtra
              </p>
            </div>
          </div>
          <h3 className="mb-3 font-semibold">Price details</h3>
          <div className="space-y-3 border-b border-outline-variant pb-5 text-sm text-on-surface-variant">
            <div className="flex justify-between">
              <span>₹18,500 × 5 nights</span>
              <span>₹92,500</span>
            </div>
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>₹1,200</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>₹2,400</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-lg font-semibold text-primary">
            <span>Total</span>
            <span>{pay === "advance" ? "₹5,000 due now" : "₹96,100"}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
