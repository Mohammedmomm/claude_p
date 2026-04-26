-- Run this once to create all tables
-- psql -U postgres -d jumla_db -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer','seller','admin')),
  phone       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id                          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name_en                     TEXT NOT NULL,
  name_ar                     TEXT NOT NULL,
  desc_en                     TEXT DEFAULT '',
  desc_ar                     TEXT DEFAULT '',
  category                    TEXT DEFAULT 'Other',
  price                       NUMERIC(10,2) NOT NULL,
  stock                       INT DEFAULT 0,
  image                       TEXT DEFAULT '',
  seller_id                   TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_wholesale                BOOLEAN DEFAULT FALSE,
  wholesale_price             NUMERIC(10,2),
  wholesale_min_participants  INT DEFAULT 2,
  wholesale_deadline          TIMESTAMPTZ,
  is_featured                 BOOLEAN DEFAULT FALSE,
  tags                        TEXT[] DEFAULT '{}',
  rating                      NUMERIC(3,2) DEFAULT 0,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id   TEXT REFERENCES products(id) ON DELETE CASCADE,
  quantity     INT DEFAULT 1,
  is_wholesale BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  items      JSONB NOT NULL DEFAULT '[]',
  total      NUMERIC(10,2) DEFAULT 0,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  message        TEXT NOT NULL,
  is_voice       BOOLEAN DEFAULT FALSE,
  voice_duration INT DEFAULT 0,
  read           BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  user_name  TEXT NOT NULL,
  rating     INT CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id)
);
