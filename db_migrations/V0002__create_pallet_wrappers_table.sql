CREATE TABLE IF NOT EXISTS pallet_wrappers (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(64) NOT NULL UNIQUE,
    category_id VARCHAR(32) NOT NULL,
    brand VARCHAR(255) NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    url TEXT,
    price NUMERIC(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'RUR',
    available BOOLEAN DEFAULT true,
    picture TEXT,
    description TEXT,
    video_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    params JSONB DEFAULT '{}'::jsonb,
    sort_order INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pallet_wrappers_brand ON pallet_wrappers(brand);
CREATE INDEX IF NOT EXISTS idx_pallet_wrappers_category ON pallet_wrappers(category_id);

CREATE TABLE IF NOT EXISTS pallet_wrappers_meta (
    id INT PRIMARY KEY DEFAULT 1,
    last_update TIMESTAMP DEFAULT NOW(),
    items_count INT DEFAULT 0,
    brands JSONB DEFAULT '[]'::jsonb
);

INSERT INTO pallet_wrappers_meta (id, last_update, items_count, brands)
VALUES (1, NOW(), 0, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;