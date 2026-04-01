import { useState, useEffect } from 'react';

interface PriceData {
  price: string;
  price_raw: number;
  offer_id: string;
  name: string;
}

interface PricesResponse {
  success: boolean;
  prices: Record<string, PriceData>;
  min_price: string;
  min_price_raw: number;
  models_found: number;
  last_update?: string;
  source?: string;
}

// URL функции get-prices (читает из БД)
const GET_PRICES_URL = 'https://functions.poehali.dev/c6510ea1-7161-4524-92dd-3e968ea97533';

// Фоллбэк: прямой URL update-prices (парсит XML напрямую)
const UPDATE_PRICES_URL = 'https://functions.poehali.dev/c5dcf94d-754c-4745-b50e-37b437be727a';

const CACHE_KEY = 'prices_cache_v2';
const CACHE_DURATION = 60 * 60 * 1000; // 1 час — данные в БД обновляются раз в сутки, поэтому кешируем на 1 час

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [minPrice, setMinPrice] = useState<string>('300 000');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Проверяем локальный кеш
        const cached = localStorage.getItem(CACHE_KEY);
        const now = Date.now();

        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (now - timestamp < CACHE_DURATION) {
            console.log('Using cached prices (from DB):', data.prices);
            setPrices(data.prices);
            setMinPrice(data.min_price);
            setLoading(false);
            return;
          }
        }

        // Пытаемся получить из БД (быстрый endpoint)
        let result: PricesResponse | null = null;

        try {
          const response = await fetch(GET_PRICES_URL);
          if (response.ok) {
            const data: PricesResponse = await response.json();
            if (data.success && data.prices && Object.keys(data.prices).length > 0) {
              result = data;
              console.log('Prices loaded from DB:', data.source, 'Last update:', data.last_update);
            }
          }
        } catch (dbErr) {
          console.warn('Failed to fetch prices from DB, falling back to XML:', dbErr);
        }

        // Фоллбэк: если БД пуста или недоступна — берём из XML напрямую
        if (!result) {
          console.log('Falling back to XML feed...');
          const response = await fetch(UPDATE_PRICES_URL);
          if (!response.ok) {
            throw new Error('Failed to fetch prices from XML feed');
          }
          result = await response.json();
        }

        if (result && result.success) {
          const pricesMap: Record<string, string> = {};
          Object.entries(result.prices).forEach(([model, data]) => {
            pricesMap[model] = data.price;
          });

          console.log('Loaded prices:', pricesMap);
          console.log('Min price:', result.min_price);

          setPrices(pricesMap);
          setMinPrice(result.min_price);

          // Сохраняем в локальный кеш
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: { prices: pricesMap, min_price: result.min_price },
            timestamp: now
          }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  return { prices, minPrice, loading, error };
}
