import {
  experiences as fallbackExperiences,
  mostLoved as fallbackMostLoved,
  packages as fallbackPackages,
  properties as fallbackProperties,
  reviews as fallbackReviews,
} from "@/lib/data";
import type {
  CalendarDay,
  WebsiteExperience,
  WebsitePackage,
  WebsiteProperty,
  WebsiteReview,
  WebsiteVideo,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProperties(): Promise<WebsiteProperty[]> {
  const payload = await getJson<{ data?: WebsiteProperty[] }>("/api/properties");
  return payload?.data?.length ? payload.data : fallbackProperties;
}

export async function fetchProperty(id: string): Promise<WebsiteProperty | null> {
  const payload = await getJson<{ data?: WebsiteProperty }>(`/api/properties/${id}`);
  if (payload?.data) return payload.data;
  return fallbackProperties.find((item) => item.id === id) ?? fallbackProperties[0] ?? null;
}

export async function fetchMostLoved(): Promise<WebsiteVideo[]> {
  const payload = await getJson<{ data?: WebsiteVideo[] }>("/api/most-loved");
  if (payload?.data?.length) return payload.data;
  return fallbackMostLoved.map((item) => ({ title: item.title, posterUrl: item.img, img: item.img }));
}

export async function fetchExperiences(): Promise<WebsiteExperience[]> {
  const payload = await getJson<{ data?: WebsiteExperience[] }>("/api/experiences");
  return payload?.data?.length ? payload.data : fallbackExperiences;
}

export async function fetchPackages(): Promise<WebsitePackage[]> {
  const payload = await getJson<{ data?: WebsitePackage[] }>("/api/packages");
  return payload?.data?.length ? payload.data : fallbackPackages;
}

export async function fetchReviews(): Promise<WebsiteReview[]> {
  const payload = await getJson<{ data?: WebsiteReview[] }>("/api/reviews");
  return payload?.data?.length ? payload.data : fallbackReviews;
}

export async function fetchPropertyCalendar(id: string): Promise<CalendarDay[]> {
  const payload = await getJson<{ data?: CalendarDay[] }>(`/api/properties/${id}/calendar`);
  return payload?.data || [];
}

export { API_URL };
