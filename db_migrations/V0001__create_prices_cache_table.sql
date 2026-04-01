
CREATE TABLE prices_cache (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(50) NOT NULL UNIQUE,
    offer_id VARCHAR(20) NOT NULL,
    product_name TEXT NOT NULL,
    price_raw INTEGER NOT NULL DEFAULT 0,
    price_formatted VARCHAR(50) NOT NULL DEFAULT 'по запросу',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE prices_meta (
    id SERIAL PRIMARY KEY,
    min_price_raw INTEGER NOT NULL DEFAULT 0,
    min_price_formatted VARCHAR(50) NOT NULL DEFAULT 'по запросу',
    models_found INTEGER NOT NULL DEFAULT 0,
    last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Индекс для быстрого поиска по модели
CREATE INDEX idx_prices_cache_model ON prices_cache(model_name);
