CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phoneNumber TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'active',
  avatar TEXT,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS amenities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS accommodations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  schema_markup TEXT,
  canonical_url TEXT,
  breadcrumbs TEXT,
  description TEXT,
  type TEXT,
  capacity INTEGER DEFAULT 0,
  rooms INTEGER DEFAULT 1,
  price REAL DEFAULT 0,
  weekend_price REAL,
  features TEXT,
  images TEXT,
  available INTEGER DEFAULT 1,
  owner_id INTEGER,
  city_id INTEGER,
  address TEXT,
  latitude TEXT,
  longitude TEXT,
  amenity_ids TEXT,
  package_name TEXT,
  package_description TEXT,
  package_images TEXT,
  adult_price REAL DEFAULT 0,
  child_price REAL DEFAULT 0,
  weekend_adult_price REAL,
  weekend_child_price REAL,
  max_guests INTEGER DEFAULT 2,
  MaxPersonVilla INTEGER,
  RatePersonVilla REAL,
  displayOrder INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accommodation_images (
  imageId INTEGER PRIMARY KEY AUTOINCREMENT,
  accommodationId INTEGER NOT NULL,
  imgUrl TEXT NOT NULL,
  accommCategory TEXT,
  imgTitle TEXT,
  imgAltText TEXT,
  imgDescription TEXT,
  imgPosition INTEGER DEFAULT 0,
  isDeleted INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accommodation_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accommodation_id INTEGER NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video',
  thumbnail_url TEXT,
  title TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  accommodation_id INTEGER NOT NULL,
  package_id INTEGER,
  check_in TEXT,
  check_out TEXT,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  rooms INTEGER DEFAULT 1,
  food_veg INTEGER DEFAULT 0,
  food_nonveg INTEGER DEFAULT 0,
  food_jain INTEGER DEFAULT 0,
  total_amount REAL DEFAULT 0,
  advance_amount REAL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  payment_txn_id TEXT,
  coupon_used TEXT,
  Discount REAL DEFAULT 0,
  selected_dates TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocked_date TEXT NOT NULL,
  reason TEXT,
  accommodation_id INTEGER,
  rooms TEXT,
  adult_price REAL,
  child_price REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  src TEXT NOT NULL,
  alt TEXT,
  category TEXT,
  width INTEGER,
  height INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  date TEXT,
  read_time TEXT,
  image TEXT,
  category TEXT,
  tags TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  code TEXT NOT NULL UNIQUE,
  discount REAL NOT NULL,
  discountType TEXT NOT NULL,
  minAmount REAL,
  maxDiscount REAL,
  usageLimit INTEGER,
  active INTEGER DEFAULT 1,
  expiryDate TEXT,
  accommodationType INTEGER DEFAULT 0,
  accommodationId INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT,
  image TEXT,
  rating INTEGER DEFAULT 5,
  text TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero_section (
  heroId INTEGER PRIMARY KEY AUTOINCREMENT,
  accommodationId INTEGER NOT NULL,
  title TEXT NOT NULL,
  price TEXT,
  location TEXT,
  imgUrl TEXT,
  isActive INTEGER DEFAULT 1,
  startDate TEXT,
  endDate TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offers_promotional_banners (
  offerId INTEGER PRIMARY KEY AUTOINCREMENT,
  accommodationId INTEGER NOT NULL,
  title TEXT NOT NULL,
  subTitle TEXT,
  description TEXT,
  bannerUrl TEXT,
  type TEXT,
  badgeLabel TEXT,
  badgeColor TEXT,
  ctaText TEXT,
  ctaLink TEXT,
  sortOrder INTEGER,
  startDate TEXT,
  endDate TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS most_loved_videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  poster_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT,
  image TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stay_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nights TEXT,
  price REAL DEFAULT 0,
  image TEXT,
  property_id INTEGER,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO users (id, name, email, phoneNumber, role, status, avatar, password)
VALUES (
  1,
  'Trekigo Admin',
  'admin@trekigo.com',
  '9876543210',
  'admin',
  'active',
  NULL,
  '$2b$12$TMLeW94hc349smS06.6FWeDoisbPBGIWvMcWWEHHPGKhfDkemepbq'
);

INSERT OR IGNORE INTO cities (id, name, country, active) VALUES
  (1, 'Lonavala', 'India', 1),
  (2, 'Karjat', 'India', 1),
  (3, 'Mulshi', 'India', 1);

INSERT OR IGNORE INTO amenities (id, name, icon, active) VALUES
  (1, 'Private pool', 'pool', 1),
  (2, 'Wifi', 'wifi', 1),
  (3, 'Parking', 'local_parking', 1);
