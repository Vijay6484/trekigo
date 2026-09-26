CREATE DATABASE IF NOT EXISTS trekigo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trekigo;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phoneNumber VARCHAR(32) NOT NULL UNIQUE,
  role ENUM('admin', 'manager', 'staff') NOT NULL DEFAULT 'admin',
  status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  avatar VARCHAR(500) NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(128) NOT NULL DEFAULT 'India',
  active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(255) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS accommodations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NULL,
  meta_title VARCHAR(500) NULL,
  meta_description TEXT NULL,
  meta_keywords TEXT NULL,
  schema_markup LONGTEXT NULL,
  canonical_url VARCHAR(500) NULL,
  breadcrumbs TEXT NULL,
  description LONGTEXT NULL,
  type VARCHAR(64) NULL,
  capacity INT DEFAULT 0,
  rooms INT DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  weekend_price DECIMAL(10,2) NULL,
  features JSON NULL,
  images JSON NULL,
  available TINYINT(1) DEFAULT 1,
  owner_id INT NULL,
  city_id INT NULL,
  address VARCHAR(500) NULL,
  latitude VARCHAR(64) NULL,
  longitude VARCHAR(64) NULL,
  amenity_ids JSON NULL,
  package_name VARCHAR(255) NULL,
  package_description TEXT NULL,
  package_images JSON NULL,
  adult_price DECIMAL(10,2) DEFAULT 0,
  child_price DECIMAL(10,2) DEFAULT 0,
  weekend_adult_price DECIMAL(10,2) NULL,
  weekend_child_price DECIMAL(10,2) NULL,
  max_guests INT DEFAULT 2,
  MaxPersonVilla INT NULL,
  RatePersonVilla DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accommodation_images (
  imageId INT AUTO_INCREMENT PRIMARY KEY,
  accommodationId INT NOT NULL,
  imgUrl VARCHAR(500) NOT NULL,
  accommCategory VARCHAR(128) NULL,
  imgTitle VARCHAR(255) NULL,
  imgAltText VARCHAR(255) NULL,
  imgDescription TEXT NULL,
  imgPosition INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accommodation_stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accommodation_id INT NOT NULL,
  media_url VARCHAR(500) NOT NULL,
  media_type ENUM('image', 'gif', 'video') NOT NULL DEFAULT 'video',
  thumbnail_url VARCHAR(500) NULL,
  title VARCHAR(255) NULL,
  position INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(64) NULL,
  accommodation_id INT NOT NULL,
  package_id INT NULL,
  check_in DATE NULL,
  check_out DATE NULL,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  rooms INT DEFAULT 1,
  food_veg INT DEFAULT 0,
  food_nonveg INT DEFAULT 0,
  food_jain INT DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  advance_amount DECIMAL(12,2) DEFAULT 0,
  payment_status VARCHAR(32) DEFAULT 'pending',
  payment_txn_id VARCHAR(128) NULL,
  coupon_used VARCHAR(64) NULL,
  Discount DECIMAL(12,2) DEFAULT 0,
  selected_dates JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blocked_date DATE NOT NULL,
  reason VARCHAR(255) NULL,
  accommodation_id INT NULL,
  rooms VARCHAR(64) NULL,
  adult_price DECIMAL(10,2) NULL,
  child_price DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  src VARCHAR(500) NOT NULL,
  alt VARCHAR(255) NULL,
  category VARCHAR(128) NULL,
  width INT NULL,
  height INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NULL,
  author VARCHAR(255) NULL,
  date VARCHAR(64) NULL,
  read_time VARCHAR(64) NULL,
  image VARCHAR(500) NULL,
  category VARCHAR(128) NULL,
  tags JSON NULL,
  content LONGTEXT NULL,
  status VARCHAR(32) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  discount DECIMAL(10,2) NOT NULL,
  discountType VARCHAR(32) NOT NULL,
  minAmount DECIMAL(10,2) NULL,
  maxDiscount DECIMAL(10,2) NULL,
  usageLimit INT NULL,
  active TINYINT(1) DEFAULT 1,
  expiryDate DATE NULL,
  accommodationType INT DEFAULT 0,
  accommodationId INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NULL,
  image VARCHAR(500) NULL,
  rating INT DEFAULT 5,
  text TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hero_section (
  heroId INT AUTO_INCREMENT PRIMARY KEY,
  accommodationId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  price VARCHAR(64) NULL,
  location VARCHAR(255) NULL,
  imgUrl VARCHAR(500) NULL,
  isActive TINYINT(1) DEFAULT 1,
  startDate DATE NULL,
  endDate DATE NULL
);

CREATE TABLE IF NOT EXISTS offers_promotional_banners (
  offerId INT AUTO_INCREMENT PRIMARY KEY,
  accommodationId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  subTitle VARCHAR(255) NULL,
  description TEXT NULL,
  bannerUrl VARCHAR(500) NULL,
  type VARCHAR(64) NULL,
  badgeLabel VARCHAR(64) NULL,
  badgeColor VARCHAR(64) NULL,
  ctaText VARCHAR(128) NULL,
  ctaLink VARCHAR(500) NULL,
  sortOrder INT NULL,
  startDate DATE NULL,
  endDate DATE NULL,
  isActive TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS most_loved_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(1000) NOT NULL,
  poster_url VARCHAR(1000) NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(64) NULL,
  image VARCHAR(1000) NULL,
  description TEXT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stay_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nights VARCHAR(64) NULL,
  price DECIMAL(10,2) DEFAULT 0,
  image VARCHAR(1000) NULL,
  property_id INT NULL,
  description TEXT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password is admin@1234
INSERT INTO users (name, email, phoneNumber, role, status, avatar, password)
VALUES (
  'Trekigo Admin',
  'admin@trekigo.com',
  '9876543210',
  'admin',
  'active',
  NULL,
  '$2b$12$TMLeW94hc349smS06.6FWeDoisbPBGIWvMcWWEHHPGKhfDkemepbq'
) ON DUPLICATE KEY UPDATE email = email;

INSERT INTO cities (name, country, active) VALUES
  ('Lonavala', 'India', 1),
  ('Karjat', 'India', 1),
  ('Mulshi', 'India', 1)
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO amenities (name, icon, active) VALUES
  ('Private pool', 'pool', 1),
  ('Wifi', 'wifi', 1),
  ('Parking', 'local_parking', 1)
ON DUPLICATE KEY UPDATE name = name;
