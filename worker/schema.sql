-- Belive D1 Database Schema
-- Run: wrangler d1 execute belive-db --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('user', 'business_owner', 'admin')) DEFAULT 'user',
  full_name TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  description TEXT,
  description_ar TEXT,
  description_ku TEXT,
  category TEXT,
  governorate TEXT,
  city TEXT,
  neighborhood TEXT,
  address TEXT,
  phone TEXT,
  phone_1 TEXT,
  phone_2 TEXT,
  website TEXT,
  image_url TEXT,
  social_links TEXT DEFAULT '{}',
  opening_hours TEXT DEFAULT '{}',
  lat REAL,
  lng REAL,
  is_featured INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  status TEXT DEFAULT 'approved',
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_businesses_governorate ON businesses(governorate);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active, status);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  title TEXT,
  content TEXT,
  caption TEXT,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_business ON posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_active ON posts(is_active, status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

CREATE TABLE IF NOT EXISTS post_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_name TEXT,
  comment_text TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating REAL NOT NULL,
  comment TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);

CREATE TABLE IF NOT EXISTS claim_requests (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_claims_status ON claim_requests(status);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  icon_name TEXT DEFAULT 'LayoutGrid',
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_hot INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  title_en TEXT,
  title_ar TEXT,
  title_ku TEXT,
  description_en TEXT,
  description_ar TEXT,
  description_ku TEXT,
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_slides (
  id TEXT PRIMARY KEY,
  title_en TEXT,
  title_ar TEXT,
  title_ku TEXT,
  subtitle_en TEXT,
  subtitle_ar TEXT,
  subtitle_ku TEXT,
  slogan_en TEXT,
  slogan_ar TEXT,
  slogan_ku TEXT,
  image_url TEXT,
  cta_text_en TEXT,
  cta_text_ar TEXT,
  cta_text_ku TEXT,
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS governorates (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT
);

CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  governorate_id TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  FOREIGN KEY (governorate_id) REFERENCES governorates(id)
);

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
