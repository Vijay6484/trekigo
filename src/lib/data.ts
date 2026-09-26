export const PHONE = "+919876543210";
export const PHONE_DISPLAY = "+91 98765 43210";
export const WHATSAPP_LINK = "https://wa.me/919876543210";

export const destinations = [
  {
    name: "Lonavala",
    icon: "landscape",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCymd4KrUQfi--qHcVqH8fCscQfZB96cYd8DY4hpWgkRLi5pfo4fUmrKyeh2qbtMWSUX4Jsb0AW2TCVEmjws-GrYDMQoIriLv7B4ffSsry6F_DlaUdIO4fNdSmkJfVIYkHc3pK0PoSo2mtwxMYCCfuvOc3QuiFp3G1u1KPrJch2ki2YBx_o7BP3mXrfOC5rFbe-D6OB7l47AB3anGMcr4zP8vB2h6Mm6C0NpelQ_g-1UQJ5JLT2GVVe1w",
  },
  {
    name: "Karjat",
    icon: "forest",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlF-XYRUtIwHh2ddbyGxyrN1Rn4snENUawh68Tc0ydXCTr5zlQ9hPxns9CPIYQqcqPqeH-aijkVRdEse7EoOi6O3yKAg65Px8UpEnlxBmuy9iO_9hl2tqxDnP2A5Rtx_eAoQuAHirF1A-QfRgTvBDMswt2o6hJ6zu6e8pRVQDD9rTsy1413aN_KIwbPKKxvaGwZaaXSmcBceNC9i0YF6MK_tltWC6QK2h-XVa0H2TsNAuogiIRBkGOww",
  },
  {
    name: "Mulshi",
    icon: "water",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9bj6Y3ZgBSwalVmTnEU77AclenY0Otl_tnyNXgCDX3XSRANXSDiO1ILdu1957pkuNAgaybPWnjeWNCju0M3_GZy-YgMU9MartjgOnvkfEv8e4E1vP2J_rAEvj0t0M7TYYUf8WQRMPlOMZ-Yg0Rw94qIaiUkULmELOC4y6IgcKqly45slNvXAPPW1-9DcC7hwrzwu-pYnD8oLc4v0eIRKYBQVo_C9q9weBiE94pxU-gUzIf_UoA7vzmw",
  },
];

export const stayTypes = [
  { id: "all", label: "All", icon: "location_on" },
  { id: "cottage", label: "Cottage", icon: "cottage" },
  { id: "camping", label: "Camping", icon: "camping" },
  { id: "villa", label: "Villa", icon: "villa" },
] as const;

export type StayType = (typeof stayTypes)[number]["id"];

export const properties = [
  {
    id: "1",
    name: "Neon Peak Villa",
    code: "VIL-404",
    loc: "Lonavala",
    price: "12,000",
    type: "villa" as StayType,
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjqVhYz0UWIUTogChV8SvQAoIAXU20rEd03wSPWnxb1uIE9WSqWNjpFYQcsO3Ws-AqcQcNu7NcPsxti-7kPFzy-38Nc2HKnpVnQTHuIE--ME9rL1hVfreY78HWNhkvoxPJk0JIk_xShLRdSrvLQheVRNTe78UIDq9hJexSbMsgLjAw366bSo9Ty-WrwSiuyhO6AtRsebrsvdXnDAXftKJuIyHlrCkjHVAxEEu8a6pbSB5gQ6mBpJP8Mg",
  },
  {
    id: "2",
    name: "Cyber Cabin",
    code: "COT-218",
    loc: "Karjat",
    price: "8,500",
    type: "cottage" as StayType,
    rating: "4.8",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlx6YwXBTL_qeMBaCDX_x-TMjFEmol9IZwElNVid3Ggz1j71m6GGa1sTFiqVNLyccwB1SAvksaJEur_UCXZUqTxtN_cFTexT7hzRglJlUQID3rlHXf2Sb0C_7HMVHjuUdQn4RsHoaprvLLni-j6Qt6XPOV-FCSjQ04_QkO3w7fRXrk3YYbpzNraG03A6tmx3lMk5_ju0pGQ-qHmhA3AQ0NeIQfKbzlzcug1pOCe0Rwy6mHWHT-ttXQGg",
  },
  {
    id: "3",
    name: "Mulshi Glass Pods",
    code: "CAM-112",
    loc: "Mulshi",
    price: "15,000",
    type: "camping" as StayType,
    rating: "4.9",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCC0cYK-uqVaSWVfvEFDCXZrJXot1AcfsPdSp0sRNwY-LxkQxVh_yF3VGerDRvTvlCmn5oCicBCuHO2h0zTJlyJxI1ojGT8gE4KKbbh1QxtVHV43sU4nJUeX5J6rKSpFcL0SqN23hh47TQu83dfktMsWYymp-8pN8iti3hVCH-YWPajOV1ITc1KfIUKpsjV9WTabO8KpdoAmN1EK5zewzhkboDrJ2qJECfZ_Ppg033Iv9IYSY35PHihgg",
  },
  {
    id: "4",
    name: "Valley Edge Cottage",
    code: "COT-091",
    loc: "Lonavala",
    price: "9,800",
    type: "cottage" as StayType,
    rating: "4.7",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOGCtrPixi_yKstoQ8ARI3bGkJWEkA0y_570DBCdA0MVtowHUvm4NpdhLrIrR2YBeoN925m4k2IISqqDh8Pug24e6esjWDYHvuSaYuQfkAV4KUm0KsGtbWNQhBkJTcGK6r_wgu5YDJIrt2xynEJhgAT3Xt8HfJ50XgpXqkv2t21caFHKZ6ikxGTOkzIsF5BoK7GLjp4FFD3v1E9P81H4vpCnw313UK753H9GaF2CemADOsTzeh0JjVoA",
  },
];

export const offers = [
  {
    label: "Limited time",
    title: "Wild Weekend Getaways",
    subtitle: "Up to 26% off on hill stays this weekend.",
    cta: "Claim offer",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvQXX-m1YAw4awxbx4GONUbuQPeZdhrFEQOwzU91kJQXOn6YqeNqMJRHJT4frOheZxt7dB2eW6dFZaB9sxqIECV0KEGkx0RubqDqgXRyaC8lES3AswDmFtrN4D_ovSVtPhIfDDaNmDl4sGz48rzgZIaflsDN3isZWaIQJWm8-RPRf3px40vmBpisc5gnrNtlvGLW1bRAjaLw6aeNDSEkegFemTjuL0etM-l_s6jCN9xEiwQ2J6HCzftg",
  },
  {
    label: "New addition",
    title: "Glamping in the Clouds",
    subtitle: "Newly launched pods with valley views.",
    cta: "Explore now",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCV22_c2YpGWR9siDuzZI9rWAWSQgzsRWyEeOkv3gRioW6pw5zFmz1FOTA0aEzQkQCbMDajhZGMROW8QFiy2XnffUe836nDxO5OTvopOHFqVBGFfXE8Xw4WqIYL5n6IJtoQip498_zY2lh1rqxOe6wPh54dLRhyW9Y4LZ6aW2jrQikCOWo0IqLaZNrM2NdKLXqkbQwTlPybEH7jKebcCR2awq_NitpXJe-m4aqXysdxt2blGl3gfai6Dg",
  },
  {
    label: "Weekday sale",
    title: "Midweek Reset",
    subtitle: "Up to ₹10,000 off on weekday bookings.",
    cta: "View stays",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjqVhYz0UWIUTogChV8SvQAoIAXU20rEd03wSPWnxb1uIE9WSqWNjpFYQcsO3Ws-AqcQcNu7NcPsxti-7kPFzy-38Nc2HKnpVnQTHuIE--ME9rL1hVfreY78HWNhkvoxPJk0JIk_xShLRdSrvLQheVRNTe78UIDq9hJexSbMsgLjAw366bSo9Ty-WrwSiuyhO6AtRsebrsvdXnDAXftKJuIyHlrCkjHVAxEEu8a6pbSB5gQ6mBpJP8Mg",
  },
  {
    label: "Newly launched",
    title: "Pay for 2, stay for 3",
    subtitle: "Extra night free at select villas.",
    cta: "Book now",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAOGCtrPixi_yKstoQ8ARI3bGkJWEkA0y_570DBCdA0MVtowHUvm4NpdhLrIrR2YBeoN925m4k2IISqqDh8Pug24e6esjWDYHvuSaYuQfkAV4KUm0KsGtbWNQhBkJTcGK6r_wgu5YDJIrt2xynEJhgAT3Xt8HfJ50XgpXqkv2t21caFHKZ6ikxGTOkzIsF5BoK7GLjp4FFD3v1E9P81H4vpCnw313UK753H9GaF2CemADOsTzeh0JjVoA",
  },
];

export const blogs = [
  {
    slug: "monsoon-lonavala",
    title: "How to plan a monsoon weekend in Lonavala",
    excerpt: "Misty valleys, private pools, and the best time to leave Pune traffic behind.",
    date: "12 Aug 2026",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvQXX-m1YAw4awxbx4GONUbuQPeZdhrFEQOwzU91kJQXOn6YqeNqMJRHJT4frOheZxt7dB2eW6dFZaB9sxqIECV0KEGkx0RubqDqgXRyaC8lES3AswDmFtrN4D_ovSVtPhIfDDaNmDl4sGz48rzgZIaflsDN3isZWaIQJWm8-RPRf3px40vmBpisc5gnrNtlvGLW1bRAjaLw6aeNDSEkegFemTjuL0etM-l_s6jCN9xEiwQ2J6HCzftg",
  },
  {
    slug: "villa-vs-cottage",
    title: "Villa, cottage, or camping — what should you book?",
    excerpt: "A simple guide to picking the stay that matches your group and mood.",
    date: "28 Jul 2026",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlx6YwXBTL_qeMBaCDX_x-TMjFEmol9IZwElNVid3Ggz1j71m6GGa1sTFiqVNLyccwB1SAvksaJEur_UCXZUqTxtN_cFTexT7hzRglJlUQID3rlHXf2Sb0C_7HMVHjuUdQn4RsHoaprvLLni-j6Qt6XPOV-FCSjQ04_QkO3w7fRXrk3YYbpzNraG03A6tmx3lMk5_ju0pGQ-qHmhA3AQ0NeIQfKbzlzcug1pOCe0Rwy6mHWHT-ttXQGg",
  },
  {
    slug: "pawna-day-trips",
    title: "Day trips around Pawna and Mulshi",
    excerpt: "Lakes, viewpoints, and cafes worth the extra drive from your stay.",
    date: "9 Jul 2026",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9bj6Y3ZgBSwalVmTnEU77AclenY0Otl_tnyNXgCDX3XSRANXSDiO1ILdu1957pkuNAgaybPWnjeWNCju0M3_GZy-YgMU9MartjgOnvkfEv8e4E1vP2J_rAEvj0t0M7TYYUf8WQRMPlOMZ-Yg0Rw94qIaiUkULmELOC4y6IgcKqly45slNvXAPPW1-9DcC7hwrzwu-pYnD8oLc4v0eIRKYBQVo_C9q9weBiE94pxU-gUzIf_UoA7vzmw",
  },
];

export const mostLoved = [
  {
    title: "Monsoon in Lonavala",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAvQXX-m1YAw4awxbx4GONUbuQPeZdhrFEQOwzU91kJQXOn6YqeNqMJRHJT4frOheZxt7dB2eW6dFZaB9sxqIECV0KEGkx0RubqDqgXRyaC8lES3AswDmFtrN4D_ovSVtPhIfDDaNmDl4sGz48rzgZIaflsDN3isZWaIQJWm8-RPRf3px40vmBpisc5gnrNtlvGLW1bRAjaLw6aeNDSEkegFemTjuL0etM-l_s6jCN9xEiwQ2J6HCzftg",
  },
  {
    title: "Campfire nights",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlx6YwXBTL_qeMBaCDX_x-TMjFEmol9IZwElNVid3Ggz1j71m6GGa1sTFiqVNLyccwB1SAvksaJEur_UCXZUqTxtN_cFTexT7hzRglJlUQID3rlHXf2Sb0C_7HMVHjuUdQn4RsHoaprvLLni-j6Qt6XPOV-FCSjQ04_QkO3w7fRXrk3YYbpzNraG03A6tmx3lMk5_ju0pGQ-qHmhA3AQ0NeIQfKbzlzcug1pOCe0Rwy6mHWHT-ttXQGg",
  },
  {
    title: "Valley sunrise",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9bj6Y3ZgBSwalVmTnEU77AclenY0Otl_tnyNXgCDX3XSRANXSDiO1ILdu1957pkuNAgaybPWnjeWNCju0M3_GZy-YgMU9MartjgOnvkfEv8e4E1vP2J_rAEvj0t0M7TYYUf8WQRMPlOMZ-Yg0Rw94qIaiUkULmELOC4y6IgcKqly45slNvXAPPW1-9DcC7hwrzwu-pYnD8oLc4v0eIRKYBQVo_C9q9weBiE94pxU-gUzIf_UoA7vzmw",
  },
  {
    title: "Poolside reels",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOGCtrPixi_yKstoQ8ARI3bGkJWEkA0y_570DBCdA0MVtowHUvm4NpdhLrIrR2YBeoN925m4k2IISqqDh8Pug24e6esjWDYHvuSaYuQfkAV4KUm0KsGtbWNQhBkJTcGK6r_wgu5YDJIrt2xynEJhgAT3Xt8HfJ50XgpXqkv2t21caFHKZ6ikxGTOkzIsF5BoK7GLjp4FFD3v1E9P81H4vpCnw313UK753H9GaF2CemADOsTzeh0JjVoA",
  },
];

export const packages = [
  {
    name: "Weekend Valley Escape",
    nights: "2N / 3D",
    price: "24,000",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjqVhYz0UWIUTogChV8SvQAoIAXU20rEd03wSPWnxb1uIE9WSqWNjpFYQcsO3Ws-AqcQcNu7NcPsxti-7kPFzy-38Nc2HKnpVnQTHuIE--ME9rL1hVfreY78HWNhkvoxPJk0JIk_xShLRdSrvLQheVRNTe78UIDq9hJexSbMsgLjAw366bSo9Ty-WrwSiuyhO6AtRsebrsvdXnDAXftKJuIyHlrCkjHVAxEEu8a6pbSB5gQ6mBpJP8Mg",
  },
  {
    name: "Monsoon Villa Party",
    nights: "1N / 2D",
    price: "18,500",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV22_c2YpGWR9siDuzZI9rWAWSQgzsRWyEeOkv3gRioW6pw5zFmz1FOTA0aEzQkQCbMDajhZGMROW8QFiy2XnffUe836nDxO5OTvopOHFqVBGFfXE8Xw4WqIYL5n6IJtoQip498_zY2lh1rqxOe6wPh54dLRhyW9Y4LZ6aW2jrQikCOWo0IqLaZNrM2NdKLXqkbQwTlPybEH7jKebcCR2awq_NitpXJe-m4aqXysdxt2blGl3gfai6Dg",
  },
];

export const experiences = [
  {
    name: "Paragliding",
    icon: "paragliding",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCymd4KrUQfi--qHcVqH8fCscQfZB96cYd8DY4hpWgkRLi5pfo4fUmrKyeh2qbtMWSUX4Jsb0AW2TCVEmjws-GrYDMQoIriLv7B4ffSsry6F_DlaUdIO4fNdSmkJfVIYkHc3pK0PoSo2mtwxMYCCfuvOc3QuiFp3G1u1KPrJch2ki2YBx_o7BP3mXrfOC5rFbe-D6OB7l47AB3anGMcr4zP8vB2h6Mm6C0NpelQ_g-1UQJ5JLT2GVVe1w",
  },
  {
    name: "Live music",
    icon: "music_note",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDr45_JJmTQaLWLzad7MqcOmpncBg0fj5I0ysIdL-GZjqWrkVGguaVXcPNiUP8T8NcQOrmSQ6Qd2lefA-KQbHJbFgGj8xwjJDx9HKOpmcRoOEtbhVL9rCRAbBufkyRsBRiNidjYspOwfS5fvYgFQ255Il-ZwviFINIPwXSyIhrQV7vBTFWjYd1sSY0vn87_LBtdZNUS1Z4DcHHCT8Blp4QwOk3cAn4YtnMnICB1IvSmowfNITDZuzNjLg",
  },
  {
    name: "Boating",
    icon: "sailing",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCatKsmpOGmqKRKD8cGcfBGwSNp1fLXZIQTb_GjOseHuy1t7Xept4IBu2qUq_Brn9JvV0lJzCXbN80HaPPMAlnJIgoJQW1SFMUfKmSRkCBr4VZ6ptxVs7h405p6LpsQxzikKcXBb9y8UKFCG2kTO73mtTchIzr4w1ynmhUJxudN_uoU4ArZSqxxzU12OA4lTM-yqEhzKYjrnH1ANdMh_cjly5RZbzD_fllO-oWJrHpJ10mEvzYEvrFUBQ",
  },
];

export const reviews = [
  {
    name: "Alex M.",
    text: "Unreal experience booking our villa party. The host was amazing and the location was literally exactly as pictured. 10/10.",
  },
  {
    name: "Sarah K.",
    text: "The app is so slick and easy to use. Found a hidden gem of a cottage in the mountains within minutes. Peace of mind guaranteed.",
  },
  {
    name: "Rahul P.",
    text: "Clean stay, honest photos, and checkout was simpler than any other booking site we have used.",
  },
];

export const amenities = [
  { name: "Wifi", icon: "wifi" },
  { name: "Air conditioning", icon: "ac_unit" },
  { name: "Music system", icon: "music_note" },
  { name: "Room service", icon: "room_service" },
];

export const storyHighlights = [
  "Pool",
  "View",
  "Kitchen",
  "Bonfire",
  "Garden",
  "Deck",
  "Rain",
  "Sunrise",
  "Pets",
  "Parking",
];

export type StoryComment = {
  name: string;
  text: string;
};

export type ShortStory = {
  id: string;
  title: string;
  caption: string;
  location: string;
  propertyId: string;
  propertyName: string;
  price: string;
  likes: string;
  src: string;
  poster: string;
  comments: StoryComment[];
};

export const shortStories: ShortStory[] = [
  {
    id: "creek-light",
    title: "Creek light",
    caption: "Gold trees, cold water, and nowhere you need to be.",
    location: "Karjat",
    propertyId: properties[1].id,
    propertyName: properties[1].name,
    price: properties[1].price,
    likes: "1.8k",
    src: "https://videos.pexels.com/video-files/5896379/5896379-hd_1080_1920_24fps.mp4",
    poster: "/stories/creek.png",
    comments: [
      { name: "Sara", text: "The light in this one feels like late October." },
      { name: "Dev", text: "We walked this after breakfast. Shoes never recovered." },
    ],
  },
  {
    id: "drive-in",
    title: "The drive in",
    caption: "Windows down. The valley shows up before the villa does.",
    location: "Lonavala",
    propertyId: properties[0].id,
    propertyName: properties[0].name,
    price: properties[0].price,
    likes: "2.4k",
    src: "https://videos.pexels.com/video-files/4434242/4434242-hd_1080_1920_24fps.mp4",
    poster: "/stories/drive.png",
    comments: [
      { name: "Meera", text: "This is the road where we lose signal and find the weekend." },
      { name: "Arjun", text: "Saving this for the next Pune exit." },
    ],
  },
  {
    id: "above-clouds",
    title: "Above the clouds",
    caption: "Mist sits on the ridge like it booked the weekend too.",
    location: "Mulshi",
    propertyId: properties[2].id,
    propertyName: properties[2].name,
    price: properties[2].price,
    likes: "3.1k",
    src: "https://videos.pexels.com/video-files/4763824/4763824-hd_1280_720_24fps.mp4",
    poster: "/stories/clouds.png",
    comments: [
      { name: "Anika", text: "Woke up and the valley was gone. Just cloud." },
      { name: "Rohit", text: "This is the Mulshi morning they never put on the listing." },
    ],
  },
  {
    id: "last-light",
    title: "Last light",
    caption: "The rocks go warm right before the hills go quiet.",
    location: "Lonavala",
    propertyId: properties[3].id,
    propertyName: properties[3].name,
    price: properties[3].price,
    likes: "986",
    src: "https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4",
    poster: "/stories/light.png",
    comments: [
      { name: "Ishaan", text: "Stayed out for this and missed sunset dinner. Worth it." },
    ],
  },
  {
    id: "afterglow",
    title: "Afterglow",
    caption: "One tree, one hill, and the day finally exhaling.",
    location: "Mulshi",
    propertyId: properties[2].id,
    propertyName: properties[2].name,
    price: properties[2].price,
    likes: "1.2k",
    src: "https://videos.pexels.com/video-files/856973/856973-hd_1280_720_25fps.mp4",
    poster: "/stories/afterglow.png",
    comments: [
      { name: "Nia", text: "Put this on when the group chat asks why we left the city." },
      { name: "Kabir", text: "The quiet after the drive. That is the whole point." },
    ],
  },
];

export const nearbyPlaces = [
  { name: "Trampoline Park", distance: "3.2 km", icon: "attractions" },
  { name: "Mapro Garden", distance: "6.1 km", icon: "park" },
  { name: "Wax Museum", distance: "8.4 km", icon: "museum" },
];

export const propertyRules = [
  "Check-in after 2:00 PM and check-out by 11:00 AM",
  "No loud music after 11:00 PM",
  "Pets allowed on request with prior confirmation",
];

export const propertyFaqs = [
  {
    q: "Is breakfast included?",
    a: "A complimentary continental breakfast is included for all villa bookings. Cottage and camping stays can add it at check-in.",
  },
  {
    q: "Can we host a small gathering?",
    a: "Yes, groups up to 12 guests are welcome. Please mention it while booking so the host can prepare.",
  },
  {
    q: "Is there parking on site?",
    a: "Complimentary parking is available for up to 4 cars at this property.",
  },
];

export const howToReach = [
  "Pune airport is 75 km away, about a 2 hour drive via the expressway.",
  "Lonavala station is 8 km from the villa. Cabs and self-drive cars are available.",
  "Private transfers can be arranged with the host 24 hours before arrival.",
];

export const socialLinks = [
  {
    name: "Facebook",
    short: "Facebook",
    icon: "thumb_up",
    href: "https://www.facebook.com/share/1Lwz1Jqi95/?mibextid=wwXIfr",
  },
  {
    name: "Instagram",
    short: "Insta",
    icon: "photo_camera",
    href: "https://www.instagram.com/trekigo.co?stkn=OGNseW1rOWNzdGg%3D&utm_source=qr",
  },
  {
    name: "Threads",
    short: "Threads",
    icon: "alternate_email",
    href: "https://www.threads.com/@trekigo.co?igshid=NTc4MTIwNjQ2YQ==",
  },
  {
    name: "X",
    short: "X",
    icon: "tag",
    href: "https://x.com/trekigo?s=11",
  },
  {
    name: "Reddit",
    short: "Reddit",
    icon: "forum",
    href: "https://www.reddit.com/u/trekiGo/s/3HhXbWzwNu",
  },
];

export const trustHighlights = [
  {
    title: "Trusted",
    icon: "verified_user",
    text: "Verified hosts and stays you can book with confidence.",
  },
  {
    title: "Secure Payment",
    icon: "lock",
    text: "Pay in full or part — your payment is protected.",
  },
  {
    title: "Authentic Reviews",
    icon: "star",
    text: "Real guest stories, not marketing copy.",
  },
];

export const userAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBseYI1OUfKho0q8owUvjCwVhy-BOIpXeo8GXbKPIH_UvcpHvCPPZ4BcS5b7e7eZgbNFvw-L8Is4feEMzUUAAdgJdCgPlcChvy-b1zJ7E27IVUVZ2szGvN6F6aW7ZVCW3yjscXSzWEwWEwTCHhUZUWlWD4wgwfKRqqdLp0-a6buq3GJmz5SgIj6s6g3mkGBKfgqKOE8LkAPtSj_sDn-hyi14Pidf-fa6yQADLCo2gJT-8dUgAzOzF2BGA";

export const reviewAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbAGe7e4GgFHWdp3wBirkYAmRCRfqk55tZfKF4K5PVxfUmRYtatlYlcdN3y6ybWIvj3FhtLK0eqObL9f7Qa8FaTSPQnGcu5w9aYz6moO4uX3gMFlKtZNAgmMcCrMVEA8QGHOZNppaqdUju3rRYdA-1BIOo_iWOnymqKFFSL0qsmGSWkwfDCItI60JPEVayDRkiOFKl3F6hidNM9qAXqaFcfVpSN7ZvbSRXpLThWhqSYJyY_NZt7Ghg1A";

export const propertyImages = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOGCtrPixi_yKstoQ8ARI3bGkJWEkA0y_570DBCdA0MVtowHUvm4NpdhLrIrR2YBeoN925m4k2IISqqDh8Pug24e6esjWDYHvuSaYuQfkAV4KUm0KsGtbWNQhBkJTcGK6r_wgu5YDJIrt2xynEJhgAT3Xt8HfJ50XgpXqkv2t21caFHKZ6ikxGTOkzIsF5BoK7GLjp4FFD3v1E9P81H4vpCnw313UK753H9GaF2CemADOsTzeh0JjVoA",
  sideTop:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDnGmi3ld7tqdpSjWbGrn4lpMLh3sx_4lbzAWlip35P8y3KKK0SJ-PfD36EzYYHPji8EWv2ihl4arhi8KpKwrnNWRvw32KjgIgb80XVt7dbSOoVwDILiO0_2i4BKlzdTyLvdjhGQnS3_tihdkSuQI7JcrgdayuENORmkYmdF8KWBMaFAz09VExQV7Kxs2zilz78rt_D9BJcsYarLe4ZgoJ-Fr085gcE1V82LL5_Ifm6kmD6RpFIVsCqgQ",
  sideBottom:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC5gKQeW20vf_h7Jz6ATxgJi1mymrvOq6LKxIlAfH0yQ7igneDFdqqF1_4gnSzDpIO1lqfWtV06dc5pcQBQVBNQ2W5XdG8jm3wPjvbfAkID9KWkNExHy1oUhkbDzeDuahLH5xOCUHiZQRgMoiSoYF_KRava9_2Cc3yylcadYruGjkGom1PibdRc0IWd9xGxUjMkmnsGiiM5HazSua1C_bmKO6ADgXDey32i45asvBMHg0n3xb5MuVqfkQ",
  highlight:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDr45_JJmTQaLWLzad7MqcOmpncBg0fj5I0ysIdL-GZjqWrkVGguaVXcPNiUP8T8NcQOrmSQ6Qd2lefA-KQbHJbFgGj8xwjJDx9HKOpmcRoOEtbhVL9rCRAbBufkyRsBRiNidjYspOwfS5fvYgFQ255Il-ZwviFINIPwXSyIhrQV7vBTFWjYd1sSY0vn87_LBtdZNUS1Z4DcHHCT8Blp4QwOk3cAn4YtnMnICB1IvSmowfNITDZuzNjLg",
  map: "https://lh3.googleusercontent.com/aida-public/AB6AXuCatKsmpOGmqKRKD8cGcfBGwSNp1fLXZIQTb_GjOseHuy1t7Xept4IBu2qUq_Brn9JvV0lJzCXbN80HaPPMAlnJIgoJQW1SFMUfKmSRkCBr4VZ6ptxVs7h405p6LpsQxzikKcXBb9y8UKFCG2kTO73mtTchIzr4w1ynmhUJxudN_uoU4ArZSqxxzU12OA4lTM-yqEhzKYjrnH1ANdMh_cjly5RZbzD_fllO-oWJrHpJ10mEvzYEvrFUBQ",
  checkout:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAqPOkYmACESp0Qvc-FdYZbroWrpXFLyw0ufsdFfVXJWTEq-JaB3lx21BRKzUTAvb7JLXiLXb85-uMhYGG6tMGSQ7d3y39l_M8CpPZLZWw05w_kvro3hXuFRnU8z8cPTnWAyam6dH8Obznz5vIMXommPa-3OfAQxBTjjE-C3SOF_WX_h9U_mpLVES45HjOWKga5VsZR_eTpgC23meLK4oUGdhpQtN_nDBhJwNEhIttP9geQUsZVjhRpCg",
};

export const galleryImages = [
  propertyImages.hero,
  propertyImages.sideTop,
  propertyImages.sideBottom,
  propertyImages.highlight,
  propertyImages.map,
  properties[0].img,
  properties[1].img,
  properties[2].img,
];

export const footerColumns = [
  {
    title: "Company",
    links: ["About us", "Careers", "Press", "Partner with us"],
  },
  {
    title: "Stays",
    links: ["Villas", "Cottages", "Camping", "Resorts"],
  },
  {
    title: "Destinations",
    links: ["Lonavala", "Karjat", "Mulshi", "Pawna"],
  },
  {
    title: "Support",
    links: ["Help centre", "Blogs", "Cancellation", "Contact"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Cookies", "Refunds"],
  },
];
