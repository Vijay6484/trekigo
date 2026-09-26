export type StayType = "all" | "cottage" | "camping" | "villa";

export type WebsiteProperty = {
  id: string;
  name: string;
  code: string;
  loc: string;
  price: string;
  nightly?: number;
  type: StayType;
  rating: string;
  img: string;
  description?: string;
  images?: string[];
  amenities?: { name: string; icon: string }[];
  rooms?: number;
  capacity?: number;
  address?: string;
  available?: boolean;
};

export type WebsiteReview = {
  id?: number;
  name: string;
  text: string;
  image?: string;
  rating?: number;
  location?: string;
};

export type WebsiteExperience = {
  id?: number;
  name: string;
  icon: string;
  img: string;
  description?: string;
};

export type WebsitePackage = {
  id?: number;
  name: string;
  nights: string;
  price: string;
  img: string;
  propertyId?: string;
  description?: string;
};

export type WebsiteVideo = {
  id?: number;
  title: string;
  videoUrl?: string;
  posterUrl?: string;
  img?: string;
};

export type CalendarDay = {
  date: string;
  rooms: number | null;
  adult_price: number | null;
  child_price: number | null;
  blocked: boolean;
  reason?: string;
};
